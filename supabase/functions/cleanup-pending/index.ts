import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    // Clean up pending bookings older than 35 min (Stripe sessions expire in 30 min)
    const cutoff = new Date(Date.now() - 35 * 60 * 1000).toISOString();

    const { data: stale, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("status", "pending")
      .lt("created_at", cutoff)
      .select("id");

    if (error) throw error;

    const cleaned = stale?.length || 0;
    console.log(`Cleaned ${cleaned} stale pending bookings`);

    return new Response(
      JSON.stringify({ success: true, cleaned }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
