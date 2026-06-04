import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-accent font-body text-sm underline underline-offset-4 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-heading font-light text-foreground mb-8">
          Terms & Conditions
        </h1>

        <div className="prose prose-sm max-w-none font-body text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-heading font-light mb-3">Booking & Payment</h2>
            <p className="text-muted-foreground leading-relaxed">
              All bookings require full payment at the time of reservation. The Small Group Experience is priced at $79 USD per person (Founders Rate: $59 for the first 20 guests). The Private Experience is $349 USD flat rate for up to 5 guests. Payment is processed securely through Stripe. Your booking is only confirmed after successful payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-light mb-3">What's Included</h2>
            <p className="text-muted-foreground leading-relaxed">
              Transportation (hotel pickup and drop-off), a 6-hour guided experience covering the Pyramids of Giza and the Grand Egyptian Museum, storytelling and cultural insights, and personalized interaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-light mb-3">What's Not Included</h2>
            <p className="text-muted-foreground leading-relaxed">
              Entrance/admission tickets to any sites, lunch, and personal expenses are NOT included in the tour price. Guests may request assistance with ticket coordination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-light mb-3">Cancellation Policy</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-5">
              <li>Full refund if cancelled 48 or more hours before the scheduled tour</li>
              <li>No refund if cancelled within 48 hours of the tour</li>
              <li>No refund for no-shows</li>
              <li>The operator reserves the right to issue manual refunds at their discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-light mb-3">Group Size</h2>
            <p className="text-muted-foreground leading-relaxed">
              Each experience is limited to a maximum of 5 guests to ensure an intimate and personalized experience. Private tours have guaranteed departure. Small Group tours require a minimum of 3 guests to operate; if the minimum is not met, guests may reschedule or receive a full refund.
            </p>
          </section>

          <section id="liability">
            <h2 className="text-xl font-heading font-light mb-3">Liability Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Next Stamp Tours acts as a facilitator for cultural experiences. We are not liable for personal injury, loss, or damage to personal property during the tour. Guests participate at their own risk. We recommend travel insurance for all international travelers. By booking, you acknowledge and accept these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-light mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions or concerns, reach us via WhatsApp at +1 845-891-5546 or email at info@thenextstamptravelco.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Terms;
