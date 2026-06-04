import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "The Next Stamp <info@thenextstamptravelco.com>";
const OWNER_EMAIL = "info@thenextstamptravelco.com";
const TOUR_NAME = "Iconic Giza & Grand Egyptian Museum Experience";

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM_EMAIL, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Resend error: ${JSON.stringify(data)}`);
  }
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
    const utcNow = new Date();
    const cairoNow = new Date(utcNow.getTime() + 2 * 60 * 60 * 1000);
    const tomorrow = new Date(cairoNow.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const { data: openDates, error } = await supabase
      .from("tour_dates")
      .select("*")
      .eq("tour_status", "open")
      .eq("is_active", true)
      .lte("tour_date", tomorrowDate);

    if (error) throw error;

    let marked = 0;
    for (const td of openDates || []) {
      if (td.booked_guests < td.min_guests) {
        await supabase
          .from("tour_dates")
          .update({ tour_status: "minimum_not_reached" })
          .eq("id", td.id);

        const dateLabel = new Date(td.tour_date).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });

        // Notify owner
        await sendEmail(
          OWNER_EMAIL,
          `⚠️ Minimum Not Reached: ${TOUR_NAME} — ${dateLabel}`,
          `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">Minimum Not Reached</h1>
            <p>The <strong>${TOUR_NAME}</strong> on <strong>${dateLabel}</strong> has only <strong>${td.booked_guests}/${td.min_guests}</strong> seats booked.</p>
            <p>Guests have been notified and offered the option to reschedule or receive a full refund.</p>
          </div>`
        );

        // Email each confirmed guest — offer reschedule or refund only (no private upgrade)
        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("tour_date_id", td.id)
          .eq("status", "confirmed");

        for (const b of bookings || []) {
          try {
            await sendEmail(
              b.email,
              `Important Update About Your ${TOUR_NAME}`,
              `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
                <h1 style="font-size: 24px; font-weight: 300;">Dear ${b.full_name},</h1>
                <p>Unfortunately, the minimum number of guests (3) was not reached for your <strong>${TOUR_NAME}</strong> on <strong>${dateLabel}</strong>.</p>
                <p>We'd like to offer you the following options:</p>
                <ul>
                  <li><strong>Reschedule</strong> to another available date at no extra cost</li>
                  <li><strong>Full refund</strong> of $${(b.total_amount / 100).toFixed(2)}</li>
                </ul>
                <p>Please reply to this email or reach out on WhatsApp to let us know your preference.</p>
                <p>📱 WhatsApp: <a href="https://wa.me/18458915546">+1 845-891-5546</a></p>
                <p>We sincerely apologize for the inconvenience.</p>
                <p>Warm regards,<br><strong>The Next Stamp</strong></p>
              </div>`
            );
          } catch (emailErr) {
            console.error(`Failed email for booking ${b.id}:`, emailErr);
          }
        }

        marked++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, dates_marked: marked }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Check tour status error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});