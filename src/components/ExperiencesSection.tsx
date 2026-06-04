import pyramidsImg from "@/assets/pyramids-experience.jpg";
import museumImg from "@/assets/museum-experience.jpg";
import mosqueImg from "@/assets/mosque-experience.jpg";
import muizzImg from "@/assets/muizz-experience.jpg";

const experiences = [
  {
    letter: "A",
    title: "The Pyramids of Giza Experience",
    hook: "Stand where 4,500 years of human ambition began.",
    description:
      "One of the Seven Wonders of the Ancient World, and the only one still standing. The Great Pyramids aren't just monuments; they're a testament to architectural brilliance, spiritual symbolism, and the power of ancient Egyptian civilization.",
    whatYouExperience:
      "A storytelling-driven walkthrough of the Giza Plateau. You'll explore the history, engineering marvels, and cultural symbolism behind these structures, not as tourists, but as students of one of humanity's greatest achievements.",
    image: pyramidsImg,
  },
  {
    letter: "B",
    title: "The Grand Egyptian Museum",
    hook: "Walk through 5,000 years of civilization, curated for meaning.",
    description:
      "One of the largest archaeological museums in the world, housing over 100,000 artifacts. From Tutankhamun's treasures to the Rosetta Stone's legacy, every piece tells a story of power, faith, and human ingenuity.",
    whatYouExperience:
      "A refined cultural walkthrough of key highlights, focused on narrative and context, not overwhelming detail. You'll leave with a deeper understanding of Egypt's place in the story of civilization.",
    image: museumImg,
  },
  {
    letter: "C",
    title: "The Mosque of Muhammad Ali",
    hook: "Above the city, where history and horizon converge.",
    description:
      "A masterpiece of Ottoman architecture perched atop the Citadel of Saladin. Built in the 19th century, the mosque holds profound political and religious significance, marking Egypt's transition into its modernization era under Muhammad Ali Pasha.",
    whatYouExperience:
      "Panoramic views over Cairo paired with historical storytelling about faith, power, and Egypt's evolution. An elevated, reflective experience far from the noise below.",
    image: mosqueImg,
  },
  {
    letter: "D",
    title: "Al-Muizz Street Experience",
    hook: "The beating heart of Islamic Cairo, preserved in stone.",
    description:
      "One of the oldest and most significant streets in Islamic Cairo, Al-Muizz Street is a living museum of medieval architecture, Mamluk heritage, and centuries-old street life. Its minarets, madrasas, and merchant quarters tell the story of a city that never stopped evolving.",
    whatYouExperience:
      "An immersive walk through architectural heritage, spiritual landmarks, and the atmospheric soul of a city layered in history. This is Cairo at its most authentic.",
    image: muizzImg,
  },
];

const ExperiencesSection = () => {
  return (
    <section className="py-24 md:py-32 px-6" style={{ backgroundColor: "#FAF3E6" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">
            Curated Journeys
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-4">
            The Four Signature <span className="italic">Experiences</span>
          </h2>
          <p className="text-muted-foreground font-body">Each experience is 90 minutes · Booked separately</p>
        </div>
        <div className="space-y-28">
          {experiences.map((exp, i) => (
            <div
              key={exp.letter}
              className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-10 md:gap-16 items-center`}
            >
              <div className="md:w-1/2">
                <div className="overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-80 md:h-[28rem] object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <span className="text-7xl font-heading font-light text-sand/80">{exp.letter}</span>
                <h3 className="text-2xl md:text-3xl font-heading font-medium text-foreground mt-1 mb-3">
                  {exp.title}
                </h3>
                <p className="text-accent font-heading text-lg italic mb-4">
                  {exp.hook}
                </p>
                <p className="text-muted-foreground font-body leading-relaxed mb-4">
                  {exp.description}
                </p>
                <div className="border-l-2 border-accent/30 pl-4">
                  <p className="text-xs tracking-[0.2em] uppercase font-body text-accent mb-2">What You'll Experience</p>
                  <p className="text-muted-foreground font-body leading-relaxed text-sm">
                    {exp.whatYouExperience}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
