import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check, Calendar, Clock, Users, Shield, MessageCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionId && bookingId) {
      verifyPayment();
    } else {
      setError("Missing booking information");
      setLoading(false);
    }
  }, [sessionId, bookingId]);

  const verifyPayment = async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-payment", {
        body: { session_id: sessionId, booking_id: bookingId },
      });

      if (fnError) throw fnError;

      if (data?.success && data?.booking) {
        setBooking(data.booking);

        if (!data.booking.confirmation_email_sent) {
          await supabase.functions.invoke("send-booking-emails", {
            body: { booking_id: bookingId, type: "confirmation" },
          });
        }
        if (!data.booking.owner_notified) {
          await supabase.functions.invoke("send-booking-emails", {
            body: { booking_id: bookingId, type: "owner_notification" },
          });
        }
      } else {
        setError("Payment verification pending. Please check your email.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-body">Verifying your payment...</p>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <p className="text-foreground font-heading text-2xl mb-4">Payment Status</p>
          <p className="text-muted-foreground font-body mb-6">{error}</p>
          <Link to="/" className="text-accent font-body underline underline-offset-4">Return Home</Link>
        </div>
      </main>
    );
  }

  const tourDate = booking?.tour_dates?.tour_date
    ? format(parseISO(booking.tour_dates.tour_date), "EEEE, MMMM d, yyyy")
    : "";

  const isPrivate = booking?.experience_type === "private";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-accent-foreground" />
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-light text-foreground mb-2">
          You're <span className="italic">Confirmed</span>
        </h1>
        <p className="text-muted-foreground font-body mb-4">
          Your Iconic Giza &amp; Grand Egyptian Museum Experience has been booked successfully.
        </p>
        {!isPrivate && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm font-body p-4 mb-4 text-left rounded">
            <p className="font-medium mb-1">⏳ Confirmed – Pending Minimum Group Size</p>
            <p className="text-xs leading-relaxed">
              The Small Group Experience requires a minimum of 3 guests to operate. If the minimum is not met 24 hours before the tour, 
              you will be offered the option to reschedule or receive a full refund. We'll keep you updated!
            </p>
          </div>
        )}

        <div className="bg-card border border-border p-6 text-left space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Experience</p>
              <p className="text-foreground font-body">{isPrivate ? "Private (Guaranteed Departure)" : "Small Group"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Date</p>
              <p className="text-foreground font-body">{tourDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Pickup Time</p>
              <p className="text-foreground font-body">9:00 AM · 6-hour experience</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Guests</p>
              <p className="text-foreground font-body">{booking?.num_guests} {booking?.num_guests === 1 ? "guest" : "guests"}</p>
            </div>
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-body text-sm">Total Paid</span>
              <span className="text-foreground font-heading text-2xl">${(booking?.total_amount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-muted-foreground font-body text-sm">
            🚗 Transportation is included — pickup details will be shared via WhatsApp/email
          </p>
          <p className="text-muted-foreground font-body text-sm">
            A confirmation email has been sent to <span className="text-foreground">{booking?.email}</span>
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="https://wa.me/18458915546"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-accent/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp for Coordination
          </a>
          <div>
            <Link to="/" className="text-muted-foreground font-body text-sm underline underline-offset-4">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingSuccess;
