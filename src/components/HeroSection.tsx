import heroImage from "@/assets/hero-pyramids.jpg";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-foreground/55" />
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <p className="text-primary-foreground/70 font-body text-sm tracking-[0.3em] uppercase mb-6">
          The Next Stamp Tours
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-light text-primary-foreground leading-tight mb-6">
          Iconic Giza &amp; Grand
          <br />
          <span className="italic">Egyptian Museum</span>
        </h1>
        <p className="text-primary-foreground/80 font-body text-lg md:text-xl font-light max-w-2xl mx-auto mb-8">
          A 6-hour guided experience through the Pyramids of Giza and the Grand Egyptian Museum. Transportation included.
        </p>

        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="text-center">
            <p className="text-primary-foreground/50 font-body text-xs tracking-[0.2em] uppercase mb-1">Duration</p>
            <p className="text-primary-foreground font-heading text-2xl">6 Hours</p>
          </div>
          <div className="w-px h-12 bg-primary-foreground/20" />
          <div className="text-center">
            <p className="text-primary-foreground/50 font-body text-xs tracking-[0.2em] uppercase mb-1">Max Guests</p>
            <p className="text-primary-foreground font-heading text-2xl">5</p>
          </div>
          <div className="w-px h-12 bg-primary-foreground/20" />
          <div className="text-center">
            <p className="text-primary-foreground/50 font-body text-xs tracking-[0.2em] uppercase mb-1">Small Group</p>
            <p className="text-primary-foreground font-heading text-2xl">$79<span className="text-base font-body">/person</span></p>
          </div>
          <div className="w-px h-12 bg-primary-foreground/20" />
          <div className="text-center">
            <p className="text-primary-foreground/50 font-body text-xs tracking-[0.2em] uppercase mb-1">Founders Rate</p>
            <p className="text-primary-foreground font-heading text-2xl">$59<span className="text-base font-body">/person</span></p>
            <p className="text-accent text-xs font-body mt-0.5">First 20 guests only</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <a
            href="#booking"
            className="inline-block bg-accent text-accent-foreground px-10 py-4 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-warm transition-colors duration-300"
          >
            Reserve Your Spot
          </a>
          <p className="text-primary-foreground/40 font-body text-xs tracking-[0.15em] uppercase mt-4">
            Runs daily at 9:00 AM · Transport included
          </p>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <div className="w-px h-16 bg-primary-foreground/30 mx-auto mb-2" />
        <p className="text-primary-foreground/50 text-xs tracking-[0.2em] uppercase font-body">Scroll</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
