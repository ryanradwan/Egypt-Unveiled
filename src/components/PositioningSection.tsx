import { Users, BookOpen, Compass } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Small Group Intimacy",
    description: "Max 5 guests per experience. Intimate enough for real conversation, flexible enough to follow your curiosity.",
  },
  {
    icon: BookOpen,
    title: "Story-Driven Depth",
    description: "Not a checklist of sites, a curated narrative through Cairo's history, architecture, and living culture.",
  },
  {
    icon: Compass,
    title: "Personal Connection",
    description: "An English-speaking host who adapts to your pace, answers your questions, and shares what guidebooks can't.",
  },
];

const PositioningSection = () => {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">The Difference</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-6">
            Not a Tour. <span className="italic">A Curated Experience.</span>
          </h2>
          <div className="w-16 h-px bg-accent mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {pillars.map((p) => (
            <div key={p.title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center mx-auto mb-5">
                <p.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PositioningSection;
