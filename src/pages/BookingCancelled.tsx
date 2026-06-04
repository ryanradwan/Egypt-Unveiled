import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

const BookingCancelled = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-light text-foreground mb-4">
          Booking <span className="italic">Cancelled</span>
        </h1>
        <p className="text-muted-foreground font-body mb-8">
          Your booking was not completed. No charges were made.
        </p>
        <Link
          to="/#booking"
          className="inline-block bg-accent text-accent-foreground px-8 py-3 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-accent/90 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </main>
  );
};

export default BookingCancelled;
