import { User, Users, Laptop, Camera, Moon, Heart } from "lucide-react";

const personas = [
  { icon: User, label: "Solo travelers seeking depth" },
  { icon: Users, label: "Families wanting cultural context" },
  { icon: Laptop, label: "Digital nomads craving connection" },
  { icon: Camera, label: "Creators & storytellers" },
  { icon: Moon, label: "Muslim travelers" },
  { icon: Heart, label: "Travelers who prefer intimate experiences" },
];

const WhoSection = () => {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">Who This Is For</p>
        <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-8">
          For Travelers Who Want <span className="italic">More</span>
        </h2>
        <div className="w-16 h-px bg-accent mx-auto mb-12" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
          {personas.map((p) => (
            <div key={p.label} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                <p.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-foreground font-body text-sm">{p.label}</p>
            </div>
          ))}
        </div>
        <p className="text-foreground font-heading text-xl italic max-w-2xl mx-auto">
          "If you want depth, conversation, and a meaningful introduction to Cairo's history and culture, this is for you."
        </p>
      </div>
    </section>
  );
};

export default WhoSection;
