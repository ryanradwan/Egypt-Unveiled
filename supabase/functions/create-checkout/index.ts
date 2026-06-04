import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REGULAR_PRICE_ID = "price_1T4SMdC8AyTGcjLC4FqCaXQm"; // $79
const FOUNDERS_PRICE_ID = "price_1T4SNXC8AyTGcjLCJl6c1LYP"; // $59
const PRIVATE_PRICE_ID = "price_1T4SNoC8AyTGcjLCI8xaMDph"; // $349 flat
const FOUNDERS_GUEST_LIMIT = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const {
      tour_date_id,
      num_guests,
      full_name,
      email,
      phone,
      nationality,
      special_requests,
      experience_type = "small_group",
      destination = "pyramids",
    } = await req.json();

    // Validate inputs
    if (!tour_date_id || !num_guests || !full_name || !email || !phone) {
      throw new Error("Missing required fields");
    }
    if (num_guests < 1 || num_guests > 5) {
      throw new Error("Guest count must be between 1 and 5");
    }
    if (!["small_group", "private"].includes(experience_type)) {
      throw new Error("Invalid experience type");
    }

    const isPrivate = experience_type === "private";

    // Get tour date info
    const { data: tourDate } = await supabase
      .from("tour_dates")
      .select("*")
      .eq("id", tour_date_id)
      .single();

    if (!tourDate) throw new Error("Tour date not found");

    // Cairo timezone enforcement: 12-hour booking cutoff
    const tourStart = new Date(`${tourDate.tour_date}T${tourDate.tour_time || "09:00:00"}+02:00`);
    const utcNow = new Date();
    const hoursUntilTour = (tourStart.getTime() - utcNow.getTime()) / (1000 * 60 * 60);

    if (hoursUntilTour < 12) {
      return new Response(
        JSON.stringify({ error: "Bookings must be made at least 12 hours before the tour start time." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (hoursUntilTour < 0) {
      return new Response(
        JSON.stringify({ error: "This tour date has already passed." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (tourDate.tour_status === "cancelled" || tourDate.tour_status === "minimum_not_reached") {
      return new Response(
        JSON.stringify({ error: "This tour date is no longer available." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Duplicate booking protection
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("email", email)
      .eq("tour_date_id", tour_date_id)
      .not("status", "in", '("cancelled","refunded")')
      .maybeSingle();

    if (existingBooking) {
      if (existingBooking.status === "pending") {
        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", existingBooking.id);
        console.log(`Auto-cancelled stale pending booking ${existingBooking.id} for retry`);
      } else {
        return new Response(
          JSON.stringify({ error: "You already have a booking for this date. Check your email for details." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    // Check availability
    if (!isPrivate) {
      const { data: available } = await supabase.rpc("check_availability", {
        p_tour_date_id: tour_date_id,
        p_num_guests: num_guests,
      });

      if (!available) {
        return new Response(
          JSON.stringify({ error: "Not enough spots available for this date" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    let totalAmount: number;
    let priceId: string;
    let quantity: number;
    let isFoundersRate = false;

    if (isPrivate) {
      totalAmount = 34900; // $349 in cents
      priceId = PRIVATE_PRICE_ID;
      quantity = 1;
    } else {
      // Check total confirmed guests to determine founders rate eligibility
      const { data: totalData } = await supabase
        .from("bookings")
        .select("num_guests")
        .eq("status", "confirmed");

      const totalConfirmedGuests = (totalData || []).reduce((sum: number, b: any) => sum + b.num_guests, 0);
      isFoundersRate = (totalConfirmedGuests + num_guests) <= FOUNDERS_GUEST_LIMIT;

      const pricePerGuest = isFoundersRate ? 5900 : 7900;
      priceId = isFoundersRate ? FOUNDERS_PRICE_ID : REGULAR_PRICE_ID;
      totalAmount = pricePerGuest * num_guests;
      quantity = num_guests;
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        tour_date_id,
        full_name,
        email,
        phone,
        num_guests,
        nationality: nationality || null,
        special_requests: special_requests || null,
        total_amount: totalAmount,
        status: "pending",
        experience_type,
        destination: "pyramids",
      })
      .select()
      .single();

    if (bookingError) throw new Error(`Booking creation failed: ${bookingError.message}`);

    // Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${req.headers.get("origin")}/booking-cancelled`,
      metadata: {
        booking_id: booking.id,
        tour_date_id,
        num_guests: String(num_guests),
        experience_type,
        is_founders_rate: String(isFoundersRate),
      },
    });

    // Update booking with stripe session id
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({ url: session.url, booking_id: booking.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
