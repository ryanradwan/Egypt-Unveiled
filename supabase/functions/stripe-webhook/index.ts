import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      console.error("No booking_id in session metadata");
      return new Response("No booking_id in metadata", { status: 400 });
    }

    console.log(`Webhook: processing checkout.session.completed for booking ${bookingId}`);

    try {
      // Check if booking is still pending
      const { data: pendingBooking } = await supabase
        .from("bookings")
        .select("*, tour_dates(max_guests, booked_guests, min_guests)")
        .eq("id", bookingId)
        .eq("status", "pending")
        .single();

      if (!pendingBooking) {
        console.log(`Booking ${bookingId} already processed (not pending), skipping`);
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Server-side oversell protection for small group
      if (pendingBooking.experience_type === "small_group") {
        const td = pendingBooking.tour_dates;
        if (td && (td.booked_guests + pendingBooking.num_guests) > td.max_guests) {
          await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", bookingId);
          console.error(`Booking ${bookingId} oversold — cancelled`);
          return new Response(JSON.stringify({ received: true, oversold: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      // Store pre-update guest count to detect minimum threshold crossing
      const tdBefore = pendingBooking.tour_dates;
      const guestsBefore = tdBefore?.booked_guests ?? 0;
      const minGuests = tdBefore?.min_guests ?? 3;

      // Confirm the booking
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", bookingId)
        .eq("status", "pending");

      if (updateError) {
        console.error("Webhook update error:", updateError);
      } else {
        console.log(`Booking ${bookingId} confirmed via webhook`);
      }

      // Send emails (respecting sent flags)
      const { data: booking } = await supabase
        .from("bookings")
        .select("confirmation_email_sent, owner_notified, num_guests, experience_type")
        .eq("id", bookingId)
        .single();

      const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

      if (booking && !booking.confirmation_email_sent) {
        await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ booking_id: bookingId, type: "confirmation" }),
        });
      }

      if (booking && !booking.owner_notified) {
        await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ booking_id: bookingId, type: "owner_notification" }),
        });
      }

      // Check if this booking caused the minimum to be reached for small group
      if (booking && booking.experience_type === "small_group") {
        const guestsAfter = guestsBefore + booking.num_guests;
        if (guestsBefore < minGuests && guestsAfter >= minGuests) {
          console.log(`Minimum reached for tour date — sending notification`);
          await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify({ booking_id: bookingId, type: "minimum_reached" }),
          });
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});