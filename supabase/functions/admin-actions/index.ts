import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "The Next Stamp <info@thenextstamptravelco.com>";
const TOUR_NAME = "Iconic Giza & Grand Egyptian Museum Experience";

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM_EMAIL, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  if (!res.ok) console.error("Email send failed:", await res.text());
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
    const { password, action, tour_date_id, booking_id, seats } = await req.json();

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    switch (action) {
      case "confirm_date": {
        await supabase
          .from("tour_dates")
          .update({ tour_status: "confirmed" })
          .eq("id", tour_date_id);

        const { data: td } = await supabase.from("tour_dates").select("*").eq("id", tour_date_id).single();
        if (td) {
          const dateLabel = new Date(td.tour_date).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          });

          const { data: bookings } = await supabase
            .from("bookings")
            .select("*")
            .eq("tour_date_id", tour_date_id)
            .eq("status", "confirmed");

          for (const b of bookings || []) {
            try {
              await sendEmail(
                b.email,
                `Your ${TOUR_NAME} is Confirmed! ✅`,
                `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
                  <h1 style="font-size: 24px; font-weight: 300;">Great News, ${b.full_name}!</h1>
                  <p>Your <strong>${TOUR_NAME}</strong> on <strong>${dateLabel}</strong> is now <strong>confirmed</strong>!</p>
                  <p>🚗 Transportation is included — pickup details will be shared closer to your tour date.</p>
                  <p>📱 WhatsApp: <a href="https://wa.me/18458915546">+1 845-891-5546</a></p>
                  <p>See you there!<br><strong>The Next Stamp</strong></p>
                </div>`
              );
            } catch (e) {
              console.error(`Failed to email ${b.email}:`, e);
            }
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: "Date confirmed and guests notified" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      case "cancel_date": {
        await supabase
          .from("tour_dates")
          .update({ tour_status: "cancelled", is_active: false })
          .eq("id", tour_date_id);

        return new Response(
          JSON.stringify({ success: true, message: "Date cancelled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      case "adjust_seats": {
        if (typeof seats !== "number") throw new Error("seats must be a number");
        await supabase
          .from("tour_dates")
          .update({ booked_guests: seats })
          .eq("id", tour_date_id);

        return new Response(
          JSON.stringify({ success: true, message: `Seats adjusted to ${seats}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      case "refund_booking": {
        await supabase
          .from("bookings")
          .update({ status: "refunded" })
          .eq("id", booking_id);

        return new Response(
          JSON.stringify({ success: true, message: "Booking marked as refunded. Process Stripe refund manually." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
