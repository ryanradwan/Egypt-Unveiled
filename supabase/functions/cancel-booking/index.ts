import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cairo timezone offset: UTC+2
const CAIRO_OFFSET_MS = 2 * 60 * 60 * 1000;

function getCairoNow(): Date {
  const utcNow = new Date();
  return new Date(utcNow.getTime() + CAIRO_OFFSET_MS);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { booking_id, email } = await req.json();

    if (!booking_id || !email) {
      throw new Error("Missing booking_id or email");
    }

    // Fetch booking
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("*, tour_dates(*)")
      .eq("id", booking_id)
      .eq("email", email)
      .eq("status", "confirmed")
      .single();

    if (fetchErr || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found or already cancelled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check 48-hour cancellation window (Cairo time)
    const tourDateStr = booking.tour_dates.tour_date;
    const tourTimeStr = booking.tour_dates.tour_time || "09:00:00";
    const tourStart = new Date(`${tourDateStr}T${tourTimeStr}+02:00`); // Cairo timezone
    const cairoNow = getCairoNow();
    const hoursUntilTour = (tourStart.getTime() - cairoNow.getTime()) / (1000 * 60 * 60);

    if (hoursUntilTour < 48) {
      return new Response(
        JSON.stringify({
          error: "Cancellations must be made at least 48 hours before the tour. No refund within 48 hours.",
          refundable: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Cancel the booking - trigger will decrement booked_guests
    const { error: updateErr } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_requested_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    if (updateErr) throw new Error(`Cancel failed: ${updateErr.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        refundable: true,
        message: "Booking cancelled. You are eligible for a full refund. The admin will process it shortly.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Cancel booking error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
