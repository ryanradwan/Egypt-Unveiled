import { motion } from "framer-motion";

const differentiators = [
  {
    number: "01",
    title: "Founder-Led, Not Outsourced",
    description:
      "Every experience is guided by the person who built this brand, not a hired contractor reading a script. You get someone who lives and breathes this culture, with the depth to answer the questions no guidebook covers.",
  },
  {
    number: "02",
    title: "Intimacy by Design",
    description:
      "We cap every experience at five guests. Not because we can't scale, because we won't. Smaller groups mean real conversation, flexible pacing, and the kind of access that disappears the moment a crowd shows up.",
  },
  {
    number: "03",
    title: "Depth Over Distance",
    description:
      "We don't race through landmarks. We sit with them. Every stop is chosen for its story, not its photo-op. The goal isn't to see more. It's to understand more.",
  },
  {
    number: "04",
    title: "Authentic, Not Performed",
    description:
      "We walk real neighborhoods. We share real histories. The people you meet aren't staged. They're the fabric of the city. This is culture as it's lived, not as it's packaged.",
  },
  {
    number: "05",
    title: "Structure Meets Spontaneity",
    description:
      "Every experience is thoughtfully designed, but never rigid. If a conversation leads somewhere unexpected, we follow it. The best moments aren't planned. They're allowed.",
  },
  {
    number: "06",
    title: "Elevated, Never Excessive",
    description:
      "Premium doesn't mean pretentious. It means care in every detail: the pacing, the knowledge, the personal attention. Luxury is in the experience itself, not the price tag.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const WhatSetsUsApartSection = () => {
  return (
    <section
      className="py-24 md:py-36 px-6 bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm tracking-[0.35em] uppercase font-body mb-5 text-foreground/50">
            A Different Standard
          </p>
          <h2 className="text-4xl md:text-6xl font-heading font-light text-foreground leading-[1.15] mb-8">
            We Didn't Build a Tour Company.
            <br />
            <span className="italic">We Built a Practice.</span>
          </h2>
          <div className="w-20 h-px bg-foreground/25 mx-auto mb-8" />
          <p className="text-foreground/70 font-body text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            The Next Stamp isn't about moving faster, seeing more, or checking
            boxes. It's about slowing down long enough to actually feel where you
            are, and leaving with something a photograph can't carry.
          </p>
        </motion.div>

        {/* Differentiator Grid */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-14 mb-20">
          {differentiators.map((item, i) => (
            <motion.div
              key={item.number}
              className="group"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
            >
              <div className="flex items-start gap-5">
                <span className="text-xs font-body tracking-widest text-foreground/30 mt-1.5 select-none">
                  {item.number}
                </span>
                <div>
                  <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-foreground/60 font-body leading-relaxed text-[0.95rem]">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-20 h-px bg-foreground/25 mx-auto mb-10" />
          <p className="font-heading text-2xl md:text-3xl italic text-foreground/80 leading-relaxed max-w-2xl mx-auto mb-10">
            "We're not for everyone. We're for the ones who travel to be
            changed, not just entertained."
          </p>
          <a
            href="#booking"
          className="inline-block px-10 py-4 text-sm tracking-[0.18em] uppercase font-body font-medium text-foreground hover:opacity-85 transition-colors duration-300"
            style={{ backgroundColor: "#D8C2A7" }}
          >
            Claim Your Place
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatSetsUsApartSection;
