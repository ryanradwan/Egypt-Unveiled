import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "The Next Stamp <info@thenextstamptravelco.com>";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend error [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
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
    // Find confirmed bookings with tour dates ~24 hours from now that haven't received reminders
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDate = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*, tour_dates(*)")
      .eq("status", "confirmed")
      .eq("reminder_email_sent", false);

    if (error) throw error;

    const remindersToSend = (bookings || []).filter((b: any) => {
      return b.tour_dates?.tour_date === tomorrowDate;
    });

    console.log(`Found ${remindersToSend.length} reminders to send for ${tomorrowDate}`);

    let sent = 0;
    for (const booking of remindersToSend) {
      try {
        const tourDate = new Date(booking.tour_dates.tour_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const tourTime = booking.tour_dates.tour_time?.slice(0, 5);

        await sendEmail(
          booking.email,
          "Tomorrow's Cairo Story Walk — See You There! ✨",
          `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">Dear ${booking.full_name},</h1>
            <p>This is a friendly reminder that your <strong>Cairo Story Walk</strong> is tomorrow!</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0;">📅 <strong>Date:</strong></td><td>${tourDate}</td></tr>
              <tr><td style="padding: 8px 0;">🕐 <strong>Time:</strong></td><td>${tourTime}</td></tr>
              <tr><td style="padding: 8px 0;">👥 <strong>Guests:</strong></td><td>${booking.num_guests}</td></tr>
            </table>
            <p>📱 Contact: <a href="https://wa.me/18458915546">+1 845-891-5546</a></p>
            <p>Please arrive <strong>10 minutes early</strong>. We can't wait to show you the real Cairo!</p>
            <p>See you soon,<br><strong>The Next Stamp</strong></p>
          </div>
          `
        );

        await supabase
          .from("bookings")
          .update({ reminder_email_sent: true })
          .eq("id", booking.id);

        sent++;
      } catch (emailErr) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: sent, total_found: remindersToSend.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Reminder cron error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
