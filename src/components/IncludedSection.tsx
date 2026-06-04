import { Check, X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const included = [
  "6-hour guided experience",
  "Transportation (pickup & drop-off)",
  "Storytelling and cultural insights",
  "Photo moments at Giza & GEM",
  "Personalized interaction",
];

const notIncluded = [
  "Entrance tickets",
  "Lunch",
  "Personal expenses",
];

const IncludedSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-card">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">Details</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight">
            What's <span className="italic">Included</span>
          </h2>
        </div>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
        <div className="grid sm:grid-cols-2 gap-12 max-w-2xl mx-auto">
          <div>
            <h3 className="text-sm tracking-[0.2em] uppercase font-body text-foreground mb-6 font-medium">Included</h3>
            <ul className="space-y-4">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-foreground" />
                  </div>
                  <span className="text-foreground font-body">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm tracking-[0.2em] uppercase font-body text-foreground mb-6 font-medium">Not Included</h3>
            <ul className="space-y-4">
              {notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground font-body">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </ScrollReveal>
        <p className="text-center text-muted-foreground/60 font-body text-xs mt-10 tracking-wide">
          Need help with entrance tickets? Let us know and we can assist with coordination.
        </p>
      </div>
    </section>
  );
};

export default IncludedSection;
