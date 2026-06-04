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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
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
    const { booking_id, type } = await req.json();

    const { data: booking } = await supabase
      .from("bookings")
      .select("*, tour_dates(*)")
      .eq("id", booking_id)
      .single();

    if (!booking) throw new Error("Booking not found");

    const tourDate = new Date(booking.tour_dates.tour_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const isPrivate = booking.experience_type === "private";
    const experienceLabel = isPrivate ? "Private Experience" : "Small Group";
    const td = booking.tour_dates;
    const minMet = isPrivate || td.booked_guests >= td.min_guests;
    let updateField = "";

    switch (type) {
      case "confirmation": {
        if (booking.confirmation_email_sent) {
          return new Response(
            JSON.stringify({ success: true, message: "Confirmation email already sent" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        const statusNote = isPrivate
          ? `<p style="background: #e8f5e9; padding: 12px; border-left: 3px solid #4caf50; margin: 16px 0; font-size: 14px;">
              ✅ <strong>Guaranteed Departure</strong> — Your private tour is confirmed and will operate regardless of group size.
            </p>`
          : minMet
            ? `<p style="background: #e8f5e9; padding: 12px; border-left: 3px solid #4caf50; margin: 16px 0; font-size: 14px;">
                ✅ <strong>Tour Confirmed</strong> — The minimum group size has been met. Your tour will operate as scheduled.
              </p>`
            : `<p style="background: #fff8e1; padding: 12px; border-left: 3px solid #ff9800; margin: 16px 0; font-size: 14px;">
                ⏳ <strong>Confirmed – Pending Minimum Group Size (3 Guests Required)</strong><br>
                Your booking is confirmed and your payment has been received. The Small Group Experience requires a minimum of 3 guests to operate. 
                If the minimum is not met 24 hours before the tour, you will be offered the option to reschedule or receive a full refund.
              </p>`;

        await sendEmail(
          booking.email,
          `Your ${TOUR_NAME} is Confirmed! 🎉`,
          `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">Dear ${booking.full_name},</h1>
            <p>Thank you for booking the <strong>${TOUR_NAME}</strong>!</p>
            ${statusNote}
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0;">🎫 <strong>Experience:</strong></td><td>${experienceLabel}</td></tr>
              <tr><td style="padding: 8px 0;">📅 <strong>Date:</strong></td><td>${tourDate}</td></tr>
              <tr><td style="padding: 8px 0;">🕐 <strong>Pickup:</strong></td><td>9:00 AM</td></tr>
              <tr><td style="padding: 8px 0;">⏱ <strong>Duration:</strong></td><td>6 hours (drop-off ~3:00 PM)</td></tr>
              <tr><td style="padding: 8px 0;">👥 <strong>Guests:</strong></td><td>${booking.num_guests}</td></tr>
              <tr><td style="padding: 8px 0;">💰 <strong>Total Paid:</strong></td><td>$${(booking.total_amount / 100).toFixed(2)}</td></tr>
            </table>
            <p style="font-size: 14px; color: #2d1f0f; background: #f5f0e8; padding: 12px; border-left: 3px solid #c4a35a; margin: 16px 0;">
              <strong>Itinerary:</strong><br>
              9:00 AM – 12:00 PM — Pyramids of Giza<br>
              12:00 – 1:00 PM — Lunch break (not included)<br>
              1:00 – 3:00 PM — Grand Egyptian Museum<br>
              ~3:00 PM — Drop-off
            </p>
            <p>🚗 <strong>Transportation:</strong> Included! Pickup details will be shared via WhatsApp/email closer to your tour date.</p>
            <p>🎟 <strong>Entrance tickets</strong> are NOT included. We can assist with coordination if needed.</p>
            <p>🍽 <strong>Lunch</strong> is NOT included (paid directly at restaurant).</p>
            <hr style="border: none; border-top: 1px solid #d4c4a8; margin: 20px 0;">
            <p style="font-size: 13px; color: #6b5e4f;"><strong>Cancellation Policy:</strong><br>
            • Full refund if cancelled 48+ hours before the tour<br>
            • No refund within 48 hours of the tour<br>
            • No refund for no-shows</p>
            <p>📱 WhatsApp Contact: <a href="https://wa.me/18458915546">+1 845-891-5546</a></p>
            <p style="margin-top: 30px;">We look forward to sharing Egypt's story with you!</p>
            <p>Warm regards,<br><strong>The Next Stamp</strong></p>
          </div>
          `
        );
        updateField = "confirmation_email_sent";
        break;
      }

      case "reminder": {
        await sendEmail(
          booking.email,
          `Tomorrow's ${TOUR_NAME} — See You There! ✨`,
          `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">Dear ${booking.full_name},</h1>
            <p>This is a friendly reminder that your <strong>${TOUR_NAME}</strong> is tomorrow!</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0;">🎫 <strong>Experience:</strong></td><td>${experienceLabel}</td></tr>
              <tr><td style="padding: 8px 0;">📅 <strong>Date:</strong></td><td>${tourDate}</td></tr>
              <tr><td style="padding: 8px 0;">🕐 <strong>Pickup:</strong></td><td>9:00 AM</td></tr>
              <tr><td style="padding: 8px 0;">👥 <strong>Guests:</strong></td><td>${booking.num_guests}</td></tr>
            </table>
            <p>🚗 Transportation is included — we'll pick you up at your hotel.</p>
            <p>🎟 Don't forget your entrance tickets!</p>
            <p>📱 Contact: <a href="https://wa.me/18458915546">+1 845-891-5546</a></p>
            <p>See you soon,<br><strong>The Next Stamp</strong></p>
          </div>
          `
        );
        updateField = "reminder_email_sent";
        break;
      }

      case "post_tour": {
        await sendEmail(
          booking.email,
          "Thank You for Joining Us! 🙏",
          `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">Dear ${booking.full_name},</h1>
            <p>Thank you for experiencing Giza and the Grand Egyptian Museum with us! We hope the stories and sights left a lasting impression.</p>
            <p>We'd love to hear about your experience:<br>
            ⭐ <a href="#">Leave a Google Review</a></p>
            <p>Until next time,<br><strong>The Next Stamp</strong></p>
          </div>
          `
        );
        updateField = "post_tour_email_sent";
        break;
      }

      case "owner_notification": {
        if (booking.owner_notified) {
          return new Response(
            JSON.stringify({ success: true, message: "Owner already notified" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        const statusLabel = isPrivate
          ? "✅ Guaranteed Departure (Private)"
          : minMet
            ? "✅ Minimum Met — Tour Confirmed"
            : `⏳ Pending Minimum (${td.booked_guests}/${td.min_guests} guests)`;

        await sendEmail(
          OWNER_EMAIL,
          "New Booking Received! 📋",
          `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">New Booking Confirmed</h1>
            <p><strong>${TOUR_NAME}</strong></p>
            <p style="background: ${minMet ? '#e8f5e9' : '#fff8e1'}; padding: 10px; border-left: 3px solid ${minMet ? '#4caf50' : '#ff9800'}; font-size: 14px;">
              ${statusLabel}
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0;"><strong>Experience:</strong></td><td>${experienceLabel}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Guest:</strong></td><td>${booking.full_name}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td>${booking.email}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Phone:</strong></td><td>${booking.phone}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Date:</strong></td><td>${tourDate}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Pickup:</strong></td><td>9:00 AM</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Guests:</strong></td><td>${booking.num_guests}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Nationality:</strong></td><td>${booking.nationality || "Not specified"}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Special Requests:</strong></td><td>${booking.special_requests || "None"}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Total:</strong></td><td>$${(booking.total_amount / 100).toFixed(2)}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Seats on Date:</strong></td><td>${td.booked_guests} of ${td.max_guests} (min: ${td.min_guests})</td></tr>
            </table>
          </div>
          `
        );
        updateField = "owner_notified";
        break;
      }

      case "minimum_reached": {
        // Notify owner when minimum group size is reached
        await sendEmail(
          OWNER_EMAIL,
          `✅ Minimum Reached: ${TOUR_NAME} — ${tourDate}`,
          `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
            <h1 style="font-size: 24px; font-weight: 300;">Minimum Group Size Reached! 🎉</h1>
            <p style="background: #e8f5e9; padding: 12px; border-left: 3px solid #4caf50; font-size: 14px;">
              The <strong>${TOUR_NAME}</strong> on <strong>${tourDate}</strong> now has <strong>${td.booked_guests}</strong> confirmed guests — the minimum of <strong>${td.min_guests}</strong> has been met.
            </p>
            <p>The tour is confirmed to operate. No further action required.</p>
          </div>
          `
        );

        // Also notify all previously-booked confirmed guests on this date
        const { data: confirmedBookings } = await supabase
          .from("bookings")
          .select("id, full_name, email")
          .eq("tour_date_id", booking.tour_date_id)
          .eq("status", "confirmed")
          .neq("id", booking_id);

        for (const guest of confirmedBookings || []) {
          try {
            await sendEmail(
              guest.email,
              `Great News — Your ${TOUR_NAME} is Confirmed! ✅`,
              `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
                <h1 style="font-size: 24px; font-weight: 300;">Dear ${guest.full_name},</h1>
                <p style="background: #e8f5e9; padding: 12px; border-left: 3px solid #4caf50; margin: 16px 0; font-size: 14px;">
                  ✅ <strong>Tour Confirmed!</strong> — The minimum group size has been reached for your <strong>${TOUR_NAME}</strong> on <strong>${tourDate}</strong>. Your tour will operate as scheduled!
                </p>
                <p style="font-size: 14px; color: #2d1f0f; background: #f5f0e8; padding: 12px; border-left: 3px solid #c4a35a; margin: 16px 0;">
                  <strong>Itinerary Reminder:</strong><br>
                  9:00 AM – 12:00 PM — Pyramids of Giza<br>
                  12:00 – 1:00 PM — Lunch break (not included)<br>
                  1:00 – 3:00 PM — Grand Egyptian Museum<br>
                  ~3:00 PM — Drop-off
                </p>
                <p>🚗 <strong>Transportation:</strong> Included! Pickup details will be shared via WhatsApp/email closer to your tour date.</p>
                <p>📱 WhatsApp Contact: <a href="https://wa.me/18458915546">+1 845-891-5546</a></p>
                <p>We look forward to seeing you!</p>
                <p>Warm regards,<br><strong>The Next Stamp</strong></p>
              </div>
              `
            );
          } catch (guestEmailErr) {
            console.error(`Failed to notify guest ${guest.id} about minimum reached:`, guestEmailErr);
          }
        }

        break;
      }
    }

    if (updateField) {
      await supabase
        .from("bookings")
        .update({ [updateField]: true })
        .eq("id", booking_id);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${type} email sent successfully` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
