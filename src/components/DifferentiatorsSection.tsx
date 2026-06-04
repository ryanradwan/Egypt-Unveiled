import { Globe, Users, MessageCircle, Compass } from "lucide-react";

const differentiators = [
  {
    icon: Globe,
    title: "English-Speaking Host",
    description: "A culturally connected guide who bridges worlds with fluency and insight.",
  },
  {
    icon: Users,
    title: "Small, Curated Groups",
    description: "Maximum four guests per experience. Intimate, never impersonal.",
  },
  {
    icon: MessageCircle,
    title: "Personal Insight & Context",
    description: "Not a script, a conversation. Real stories, real history, real connection.",
  },
  {
    icon: Compass,
    title: "Meaning Over Photos",
    description: "Designed for travelers who want depth, not just destinations.",
  },
];

const DifferentiatorsSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">Why Us</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight">
            What Makes This <span className="italic">Different</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {differentiators.map((item) => (
            <div key={item.title} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground font-body leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;
