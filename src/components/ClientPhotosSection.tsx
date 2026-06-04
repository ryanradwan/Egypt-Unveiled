import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import clientDinner from "@/assets/client-dinner.jpg";
import clientPyramids from "@/assets/client-pyramids.jpg";
import clientGarden from "@/assets/client-garden.jpg";
import clientGroup from "@/assets/client-group.jpg";

const photos = [
  { src: clientPyramids, alt: "Guests posing in front of the Great Pyramid of Giza", caption: "The Great Pyramid, Giza" },
  { src: clientGroup, alt: "Group of travelers at the Giza Plateau", caption: "Giza Plateau" },
  { src: clientGarden, alt: "Guests enjoying a traditional Egyptian breakfast at Al-Azhar Park", caption: "Breakfast at Al-Azhar Park" },
  { src: clientDinner, alt: "Guests dining at a local Egyptian restaurant with hieroglyphic walls", caption: "Dinner by the Pyramids" },
];

const ClientPhotosSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-card overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">
              Real Moments
            </p>
            <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight">
              Captured by <span className="italic">Our Guests</span>
            </h2>
            <p className="text-muted-foreground font-body text-sm mt-4 max-w-lg mx-auto">
              Every tour is personal. These are real, unfiltered moments from recent experiences.
            </p>
          </div>
        </ScrollReveal>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {photos.map((photo, i) => (
            <ScrollReveal key={photo.caption} delay={i * 0.1}>
              <motion.div
                className="relative group overflow-hidden rounded-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="aspect-[3/4]">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <p className="text-primary-foreground font-body text-xs md:text-sm tracking-wide">
                    {photo.caption}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientPhotosSection;
