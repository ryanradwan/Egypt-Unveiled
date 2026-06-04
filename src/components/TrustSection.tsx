import { Star, Quote } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const reviews = [
  {
    name: "Sarah M.",
    location: "London, UK",
    text: "This was the highlight of our entire trip to Egypt. The storytelling brought the pyramids to life in a way no guidebook ever could.",
    rating: 5,
  },
  {
    name: "Ahmed K.",
    location: "Toronto, Canada",
    text: "The Grand Egyptian Museum was absolutely mind-blowing, and having a guide who could bring context to every artifact made all the difference. Truly special.",
    rating: 5,
  },
  {
    name: "Julia & Marco",
    location: "Berlin, Germany",
    text: "We've done tours all over the world. This felt different. Personal, unhurried, and genuinely insightful. Worth every penny.",
    rating: 5,
  },
];

const reasons = [
  "Intimate groups, never more than 5",
  "A host, not a guide. Real conversation",
  "Transportation included for convenience",
  "Designed for depth, not volume",
];

const TrustSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
        <div className="text-center mb-16">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">Travelers</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight">
            Why Travelers Choose <span className="italic">The Next Stamp</span>
          </h2>
        </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {reviews.map((r, i) => (
            <ScrollReveal key={r.name} delay={i * 0.12}>
            <div className="bg-background p-8 border border-border/50">
              <Quote className="w-5 h-5 text-accent/40 mb-4" />
              <p className="text-foreground font-body leading-relaxed mb-6 text-sm italic">
                "{r.text}"
              </p>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground font-body text-sm font-medium">{r.name}</p>
              <p className="text-muted-foreground font-body text-xs">{r.location}</p>
            </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
        <div className="max-w-xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            {reasons.map((r) => (
              <div key={r} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <p className="text-foreground font-body text-sm">{r}</p>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TrustSection;
