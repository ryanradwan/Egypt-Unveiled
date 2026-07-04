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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, groupSize, experience, preferredDate, message } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: insertError } = await supabase
      .from("interest_submissions")
      .insert({
        name,
        email,
        group_size: groupSize,
        experience,
        preferred_date: preferredDate,
        message: message || null,
      });

    if (insertError) throw insertError;

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [OWNER_EMAIL],
          subject: `New Interest Submission from ${name} 🇪🇬`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
              <h1 style="font-size: 24px; font-weight: 300;">New Reservation Request</h1>
              <p style="background: #f5f0e8; padding: 12px; border-left: 3px solid #c4a35a; margin: 16px 0; font-size: 14px;">
                Someone just filled out the reservation form on Egypt Unveiled.
              </p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>${name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Group Size:</td><td>${groupSize} guests</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Experience:</td><td>${experience}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Date:</td><td>${preferredDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Message:</td><td>${message || "None"}</td></tr>
              </table>
              <p style="margin-top: 24px; font-size: 13px; color: #6b5e4f;">
                Reply to <a href="mailto:${email}">${email}</a> to follow up within 24 hours.
              </p>
              <p>— The Next Stamp</p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("submit-interest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
