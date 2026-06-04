import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch all confirmed bookings with tour date info
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*, tour_dates(tour_date, tour_time, max_guests, booked_guests, destination)")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch all active tour dates for capacity overview
    const { data: tourDates } = await supabase
      .from("tour_dates")
      .select("*")
      .eq("is_active", true)
      .order("tour_date", { ascending: true });

    const totalBookings = bookings?.length || 0;
    const grossRevenue = (bookings || []).reduce((sum: number, b: any) => sum + b.total_amount, 0);
    const operatorShare = Math.round(grossRevenue * 0.75);
    const businessShare = grossRevenue - operatorShare;

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          total_bookings: totalBookings,
          total_guests: (bookings || []).reduce((sum: number, b: any) => sum + b.num_guests, 0),
          gross_revenue_cents: grossRevenue,
          operator_share_cents: operatorShare,
          business_share_cents: businessShare,
        },
        bookings: (bookings || []).map((b: any) => ({
          id: b.id,
          full_name: b.full_name,
          email: b.email,
          phone: b.phone,
          num_guests: b.num_guests,
          total_amount: b.total_amount,
          experience_type: b.experience_type,
          destination: b.destination,
          tour_date: b.tour_dates?.tour_date,
          tour_date_id: b.tour_date_id,
          tour_time: b.tour_dates?.tour_time,
          max_guests: b.tour_dates?.max_guests,
          booked_guests: b.tour_dates?.booked_guests,
          tour_status: b.tour_dates?.tour_status,
          created_at: b.created_at,
          confirmation_email_sent: b.confirmation_email_sent,
          reminder_email_sent: b.reminder_email_sent,
        })),
        tour_dates: tourDates || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
