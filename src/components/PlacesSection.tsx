import pyramidsImg from "@/assets/pyramids-golden.jpg";
import museumImg from "@/assets/gem-interior.jpg";
import ScrollReveal from "./ScrollReveal";

const places = [
  {
    title: "The Pyramids of Giza",
    image: pyramidsImg,
    description:
      "Stand before the last remaining wonder of the ancient world. The Pyramids of Giza are more than monuments. They are symbols of ambition, mystery, and timeless power. During this experience, you won't just observe them. You'll understand the stories, the human effort behind them, and the cultural weight they still carry today.",
  },
  {
    title: "The Grand Egyptian Museum",
    image: museumImg,
    description:
      "Step into the world's largest archaeological museum, home to over 100,000 artifacts spanning 5,000 years of history. From the treasures of Tutankhamun to monumental statues and royal mummies, the Grand Egyptian Museum brings ancient Egypt's story to life under one extraordinary roof.",
  },
];

const PlacesSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20">
            <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">
              Curated Destinations
            </p>
            <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-4">
              The Places You'll <span className="italic">Experience</span>
            </h2>
            <div className="w-16 h-px bg-accent mx-auto" />
          </div>
        </ScrollReveal>

        <div className="space-y-24 md:space-y-32">
          {places.map((place, i) => (
            <ScrollReveal key={place.title} delay={i * 0.15}>
              <div
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-10 md:gap-16 items-center`}
              >
                <div className="md:w-3/5">
                  <div className="overflow-hidden relative rounded-2xl">
                    <div className="absolute inset-0 bg-accent/10 pointer-events-none z-10" />
                    <img
                      src={place.image}
                      alt={place.title}
                      className="w-full h-80 md:h-[30rem] object-cover hover:scale-105 transition-transform duration-700 rounded-2xl"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="md:w-2/5">
                  <div className="w-10 h-px bg-accent mb-6" />
                  <h3 className="text-2xl md:text-4xl font-heading font-light text-foreground mb-6 leading-snug">
                    {place.title}
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed text-base italic">
                    {place.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlacesSection;
