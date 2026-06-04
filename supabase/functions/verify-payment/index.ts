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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id, booking_id } = await req.json();

    if (!session_id || !booking_id) throw new Error("Missing session_id or booking_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Fetch booking to check experience type
      const { data: pendingBooking } = await supabase
        .from("bookings")
        .select("*, tour_dates(max_guests, booked_guests, min_guests)")
        .eq("id", booking_id)
        .eq("status", "pending")
        .single();

      if (!pendingBooking) {
        // Booking already confirmed or doesn't exist - fetch current state
        const { data: booking } = await supabase
          .from("bookings")
          .select("*, tour_dates(*)")
          .eq("id", booking_id)
          .single();

        return new Response(
          JSON.stringify({ success: true, booking }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Server-side oversell protection for small group
      if (pendingBooking.experience_type === "small_group") {
        const td = pendingBooking.tour_dates;
        if (td && (td.booked_guests + pendingBooking.num_guests) > td.max_guests) {
          // Oversell detected - block confirmation
          await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", booking_id);

          return new Response(
            JSON.stringify({
              success: false,
              error: "This date is now fully booked. Your payment will be refunded automatically.",
              oversold: true,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }

      // Store pre-update guest count to detect minimum threshold crossing
      const tdBefore = pendingBooking.tour_dates;
      const guestsBefore = (tdBefore as any)?.booked_guests ?? 0;
      const minGuests = 3;

      // Confirm the booking
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", booking_id)
        .eq("status", "pending");

      if (error) console.error("Update error:", error);

      // Get booking details for confirmation
      const { data: booking } = await supabase
        .from("bookings")
        .select("*, tour_dates(*)")
        .eq("id", booking_id)
        .single();

      // Send confirmation & owner emails
      const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

      if (booking && !booking.confirmation_email_sent) {
        await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify({ booking_id, type: "confirmation" }),
        });
      }

      if (booking && !booking.owner_notified) {
        await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify({ booking_id, type: "owner_notification" }),
        });
      }

      // Check if this booking caused the minimum to be reached
      if (booking && booking.experience_type === "small_group") {
        const guestsAfter = guestsBefore + booking.num_guests;
        if (guestsBefore < minGuests && guestsAfter >= minGuests) {
          console.log(`Minimum reached for tour date — sending notifications to owner + guests`);
          await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
            body: JSON.stringify({ booking_id, type: "minimum_reached" }),
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, booking }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, status: session.payment_status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Verify error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
