import ScrollReveal from "./ScrollReveal";

const PricingSection = () => {
  const scrollToBooking = (type: "small_group" | "private") => {
    const el = document.getElementById("booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("select-experience", { detail: { type } }));
    }
  };

  return (
    <section className="py-24 md:py-32 px-6" style={{ backgroundColor: "#FAF3E6" }}>
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-foreground/60 text-sm tracking-[0.3em] uppercase font-body mb-4">
              Pricing
            </p>
            <h2 className="text-3xl md:text-5xl font-heading font-light leading-tight mb-4 text-foreground">
              Choose Your <span className="italic">Experience</span>
            </h2>
            <div className="w-16 h-px bg-foreground/20 mx-auto" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
            {/* Small Group */}
            <div className="border border-foreground/15 p-8 md:p-10 flex flex-col">
              <p className="text-xs tracking-[0.3em] uppercase font-body text-foreground/50 mb-2 text-center">
                Small Group Experience
              </p>
              <p className="text-center text-foreground/60 font-body text-xs italic mb-6">
                Best for solo travelers &amp; budget-conscious explorers
              </p>
              <p className="text-5xl md:text-6xl font-heading font-light mb-1 text-foreground text-center">$79</p>
              <p className="text-foreground/60 font-body text-sm mb-2 text-center">per guest</p>
              <div className="inline-block bg-accent/20 px-3 py-1 mb-2 mx-auto">
                <p className="text-accent-foreground text-xs font-body tracking-wide">Founders Rate: $59 · First 20 guests</p>
              </div>
              <p className="text-xs font-body text-accent font-medium mb-6 text-center animate-pulse">
                ⏳ Only 20 spots at this rate — then it's $79
              </p>
              <div className="w-10 h-px bg-foreground/20 mx-auto mb-6" />
              <ul className="space-y-2.5 text-sm font-body text-foreground/70 mb-4 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  6-hour guided experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  Transportation included (pickup & drop-off)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  Max 5 guests per tour
                </li>
              </ul>
              <p className="text-xs font-body text-foreground/50 italic mb-6 leading-relaxed">
                Requires a minimum of 3 guests to operate. If the minimum is not met, guests may reschedule or receive a full refund.
              </p>
              <button
                onClick={() => scrollToBooking("small_group")}
                className="w-full bg-accent text-accent-foreground py-4 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-accent/90 transition-colors duration-300"
              >
                Book Small Group
              </button>
            </div>

            {/* Private */}
            <div className="border border-accent/40 p-8 md:p-10 flex flex-col relative shadow-lg shadow-accent/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 text-xs tracking-[0.15em] uppercase font-body">
                Guaranteed Departure
              </div>
              <p className="text-xs tracking-[0.3em] uppercase font-body text-foreground/50 mb-2 text-center">
                Private Experience
              </p>
              <p className="text-center text-foreground/60 font-body text-xs italic mb-1">
                Perfect for couples, families &amp; small friend groups
              </p>
              <p className="text-center text-accent font-body text-xs font-medium mb-6">
                Best value for 4–5 guests
              </p>
              <p className="text-5xl md:text-6xl font-heading font-light mb-1 text-foreground text-center">$349</p>
              <p className="text-foreground/60 font-body text-sm mb-6 text-center">flat rate · up to 5 guests</p>
              <div className="w-10 h-px bg-foreground/20 mx-auto mb-6" />
              <ul className="space-y-2.5 text-sm font-body text-foreground/70 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  6-hour guided experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  Transportation included (pickup & drop-off)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  Exclusive access — no outside guests
                </li>
              </ul>
              <button
                onClick={() => scrollToBooking("private")}
                className="w-full bg-accent text-accent-foreground py-4 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-accent/90 transition-colors duration-300"
              >
                Book Private Experience
              </button>
            </div>
          </div>
        </ScrollReveal>

        <p className="text-center text-xs font-body text-foreground/40 tracking-wide mb-6">
          🔒 Secure payment processed via Stripe
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-sm font-body text-foreground/40 tracking-wide text-center">
          <span>✓ Transport included</span>
          <span className="hidden sm:inline">·</span>
          <span>Entry tickets not included</span>
          <span className="hidden sm:inline">·</span>
          <span>Lunch not included</span>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
