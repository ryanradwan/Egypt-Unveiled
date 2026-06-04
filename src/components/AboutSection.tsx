const AboutSection = () => {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">About the Experience</p>
        <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground mb-8 leading-tight">
          This Is Not a <span className="italic">Bus Tour.</span>
        </h2>
        <div className="w-16 h-px bg-accent mx-auto mb-8" />
        <p className="text-muted-foreground font-body text-lg leading-relaxed mb-6">
          Not a rushed checklist. Not a mass tourist group. Not a megaphone and a flag.
        </p>
        <p className="text-muted-foreground font-body text-lg leading-relaxed mb-10">
          The Next Stamp Tours offers a curated 90-minute cultural immersion designed for
          travelers who want meaning, context, and conversation, not just photos. Each
          experience is intimate, story-driven, and limited to 5 guests maximum.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto text-left">
          {[
            "English-speaking, globally-minded host",
            "Small groups of 3–4 guests maximum",
            "Personal storytelling & cultural context",
            "Designed for curious, thoughtful travelers",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 flex-shrink-0" />
              <p className="text-foreground font-body text-base">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
