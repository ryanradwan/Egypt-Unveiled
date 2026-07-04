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
    const body = await req.json();
    const {
      form_type,
      name,
      email,
      phone,
      group_size,
      groupSize,
      company,
      number_of_clients,
      experience,
      preferred_date,
      preferredDate,
      message,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: insertError } = await supabase
      .from("interest_submissions")
      .insert({
        name,
        email,
        phone: phone || null,
        form_type: form_type || null,
        group_size: group_size || groupSize || null,
        company: company || null,
        number_of_clients: number_of_clients || null,
        experience: experience || null,
        preferred_date: preferred_date || preferredDate || null,
        message: message || null,
      });

    if (insertError) throw insertError;

    if (RESEND_API_KEY) {
      const displayGroupSize = group_size || groupSize || number_of_clients || "N/A";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [OWNER_EMAIL],
          subject: `New Application from ${name} 🇪🇬`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2d1f0f;">
              <h1 style="font-size: 24px; font-weight: 300;">New Application — Egypt Unveiled</h1>
              <p style="background: #f5f0e8; padding: 12px; border-left: 3px solid #c4a35a; margin: 16px 0; font-size: 14px;">
                ${form_type || "Application"} submitted on the Egypt Unveiled website.
              </p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>` : ""}
                ${company ? `<tr><td style="padding: 8px 0; font-weight: bold;">Company:</td><td>${company}</td></tr>` : ""}
                <tr><td style="padding: 8px 0; font-weight: bold;">Group Size:</td><td>${displayGroupSize}</td></tr>
                ${experience ? `<tr><td style="padding: 8px 0; font-weight: bold;">Experience:</td><td>${experience}</td></tr>` : ""}
                <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Dates:</td><td>${preferred_date || preferredDate || "Not specified"}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Message:</td><td>${message || "None"}</td></tr>
              </table>
              <p style="margin-top: 24px; font-size: 13px; color: #6b5e4f;">
                Reply to <a href="mailto:${email}">${email}</a> within 48 hours.
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
