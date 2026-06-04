import { Clock, Users, Shield, Car } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const ScarcitySection = () => {
  return (
    <section className="py-20 md:py-24 px-6">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-px bg-accent mx-auto mb-8" />
          <p className="text-foreground font-heading text-2xl md:text-3xl italic leading-relaxed mb-4">
            "Each experience is limited to 5 guests. Once a date is full, it closes."
          </p>
          <p className="text-muted-foreground font-body text-sm mb-8">
            Runs daily at 9:00 AM · Max 5 guests per tour
          </p>

          {/* Quick value recap */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 text-xs font-body text-foreground/60">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" /> 6-hour experience</span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> Max 5 guests</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-accent" /> 48h free cancellation</span>
            <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-accent" /> Transport included</span>
          </div>

          <div className="w-16 h-px bg-accent mx-auto mb-8" />
          <a
            href="#booking"
            className="inline-block bg-accent text-accent-foreground px-10 py-5 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-warm transition-colors duration-300"
          >
            Reserve Your Spot
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ScarcitySection;
