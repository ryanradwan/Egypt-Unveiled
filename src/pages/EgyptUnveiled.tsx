import { useState, useEffect } from "react";
import heroEgypt from "@/assets/hero-egypt.jpg";
import founderRyan from "@/assets/founder-ryan.jpg";
import operatorMohammed from "@/assets/operator-mohammed.jpg";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import clientDinner from "@/assets/client-dinner.jpg";
import clientPyramids from "@/assets/client-pyramids.jpg";
import clientGarden from "@/assets/client-garden.jpg";
import clientGroup from "@/assets/client-group.jpg";
import { supabase } from "@/integrations/supabase/client";

const MAKE_WEBHOOK_ENDPOINT = "https://hook.us2.make.com/grz2g1m9heva87nvychekzmmy34wyvtg";

const DARK = "#f3e8da"; // replaces all dark brown section backgrounds

const days = [
  {
    day: 1,
    location: "Cairo",
    image: "https://images.pexels.com/photos/12607742/pexels-photo-12607742.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Nile Dinner Cruise"],
  },
  {
    day: 2,
    location: "Giza",
    image: "https://images.pexels.com/photos/26708450/pexels-photo-26708450.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Grand Egyptian Museum", "Great Pyramids of Giza", "The Sphinx"],
  },
  {
    day: 3,
    location: "Alexandria",
    image: "https://images.pexels.com/photos/16714094/pexels-photo-16714094.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Bibliotheca Alexandrina", "Qaitbay Citadel", "Catacombs of Kom el-Shoqafa", "Pompey's Pillar", "The Corniche"],
  },
  {
    day: 4,
    location: "Cairo",
    image: "https://images.pexels.com/photos/13420332/pexels-photo-13420332.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Citadel of Saladin", "Muhammad Ali Mosque", "Sultan Hassan Mosque", "Al-Rifa'i Mosque", "Bab Zuweila", "Al-Muizz Street", "Khan el-Khalili Bazaar"],
  },
  {
    day: 5,
    location: "Cairo → Luxor",
    image: "https://images.pexels.com/photos/18934596/pexels-photo-18934596.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Morning flight to Luxor", "Luxor Museum", "Luxor Temple"],
  },
  {
    day: 6,
    location: "Luxor",
    image: "https://images.pexels.com/photos/15188082/pexels-photo-15188082.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Sunrise Hot Air Balloon Flight (weather permitting)", "Karnak Temple", "Valley of the Kings", "Temple of Hatshepsut", "Tombs of the Nobles", "Colossi of Memnon"],
  },
  {
    day: 7,
    location: "Luxor → Aswan",
    image: "https://images.pexels.com/photos/18934581/pexels-photo-18934581.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Scenic Drive Along the Nile", "Arrival in Aswan", "Nubian Museum", "Unfinished Obelisk", "Sunset Felucca Sail"],
  },
  {
    day: 8,
    location: "Aswan",
    image: "https://images.pexels.com/photos/20319058/pexels-photo-20319058.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Philae Temple", "Aswan High Dam", "Nubian Village", "Aswan Souk"],
  },
  {
    day: 9,
    location: "Aswan → Cairo → Home",
    image: "https://images.pexels.com/photos/18934704/pexels-photo-18934704.jpeg?auto=compress&cs=tinysrgb&w=800",
    sites: ["Return Flight to Cairo", "Tour Ends at Cairo Airport"],
  },
];

const included = [
  "All internal flights",
  "4-star hotel accommodations (8 nights)",
  "All meals — breakfast, lunch & dinner",
  "All entrance fees",
  "Private ground transportation",
  "Licensed Egyptologist Lead Guide — all 9 days",
  "Specialist guides at the Valley of the Kings, Karnak, Philae, the Grand Egyptian Museum, the Catacombs and the Citadel",
  "Nile Dinner Cruise in Cairo",
  "Sunrise hot air balloon flight over Luxor (weather permitting)",
  "Felucca sail on the Nile in Aswan",
  "Airport pickup — we meet you at Cairo airport and time your transfer",
];

const notIncluded = [
  "International flights",
  "Egypt visa (e-Visa or on arrival — depends on your nationality)",
  "Travel insurance",
  "Personal expenses & shopping",
  "Gratuities & tips",
];

const faqs = [
  {
    q: "Is this tour suitable for all fitness levels?",
    a: "Be honest with yourself on this one. You'll cover roughly 3 to 5 miles across a full day, much of it on sand, gravel and uneven ancient stone. Tombs in the Valley of the Kings are entered down steep ramps and stairs, with low ceilings and no air conditioning. Expect sun exposure, long travel days and a fair amount of standing. None of this demands unusual fitness and guests of many ages and abilities love it — but if any of it gives you pause, tell us before you apply. There is usually a way to adapt something in advance, and we would far rather do that than watch you struggle at Karnak.",
  },
  {
    q: "Can solo travelers join?",
    a: "Absolutely, and plenty do. There are two rates. The sharing rate is for two travellers booking together into one twin or double room, each naming the other. The private-room rate gives you a room of your own for all eight nights. If you book alone you book the private room — we never place you in a room with someone you haven't named. The private-room rate is the sharing rate plus exactly what that extra hotel room costs us, with nothing added on top. For comparison, single supplements on comparable Egypt tours run 15 to 60 percent.",
  },
  {
    q: "What is the cancellation policy?",
    a: "A $500 per-person deposit secures your spot and is non-refundable — with one exception: cancel within 48 hours of booking and you get everything back, deposit included, provided your departure is still more than 60 days away. After that, cancel 60 or more days before departure and every payment except the deposit is refunded in full. Cancel 30-59 days out and you'll receive 50% of the remaining tour price back. Cancel 29 days or fewer before departure and no refund is available. The charges step up as departure approaches because we confirm your departure at 75 days and begin booking your hotel room and internal Egyptian flights in your name from that point, and we pay our local operator half shortly after balances fall due at 60 days and the rest on the day you arrive. Full terms are in your Tour Booking Agreement, which you review and sign before any payment.",
  },
  {
    q: "Do I need travel insurance?",
    a: "Yes — travel insurance is required for every guest, and you arrange it yourself before travel. At minimum your policy must cover emergency medical treatment abroad ($50,000) and emergency medical evacuation and repatriation ($100,000). We'll need your insurer, policy number and 24-hour assistance line no later than 75 days before departure, sent in with your registration form — ahead of your final balance, not alongside it. We also strongly recommend adding trip-cancellation coverage — not required, but it's what protects the money you've put toward the trip. One thing to be clear about: if something happens on tour, your medical treatment, hospital admission, emergency transport and replacement documents are your own financial responsibility, met by you, your emergency contact or your insurer. Your Lead Guide will get you to care, stay with you or arrange someone who can, and help you reach your insurer and your emergency contact — but that support is coordination, not payment.",
  },
  {
    q: "What should I pack and is there a dress code?",
    a: "Egypt has a respectful dress code, especially at religious sites like mosques and the Citadel. Shoulders and knees should be covered — light layers work well. Comfortable walking shoes, sunscreen, a hat, and a refillable water bottle are essentials. A full packing guide is sent to approved guests.",
  },
  {
    q: "What if the person I'm sharing with cancels?",
    a: "The hotel charges for the room whether one person sleeps in it or two, so the room still has to be paid for. You have two options: nominate a replacement traveller who books the same departure at the sharing rate, or pay the difference between the two published rates — $383.80 — and have the room to yourself. We'll write to you with the amount, and it's payable within 14 days of that notice or by your final payment date, whichever comes first. This is Section 2.5 of your Tour Booking Agreement, and it's worth reading before you book with a companion.",
  },
  {
    q: "What happens if the group doesn't fill?",
    a: "We confirm or cancel every departure 75 days before it leaves, and we need a minimum of 6 guests to run. That date sits ahead of your final balance, so if a departure doesn't fill, the only money you've paid is your deposit — and we refund it in full, or move it to a future departure if you'd rather. Once we confirm a departure at the 75-day mark it is guaranteed to run, and we will not cancel it afterwards for numbers.",
  },
  {
    q: "How does the approval process work?",
    a: "Submit your application — no payment needed. We personally review it and respond within 48 hours. If approved, we'll send you your Tour Booking Agreement and a secure payment link for the $500 deposit. Your spot is confirmed once the agreement is signed and the deposit is received. From there: we confirm the departure itself 75 days out, and your registration form, passport copy and travel insurance details are all due at that point; your final balance at 60 days; your flight details at 45; visa confirmation at 30; and we send your final documents 14 days before you fly.",
  },
];

const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <ScrollReveal key={i} delay={i * 0.05}>
          <div className="bg-background border border-foreground/10 hover:border-[#7b5e43]/40 transition-colors duration-300">
            <button
              className="w-full flex items-center justify-between px-7 py-5 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="font-body text-sm font-medium text-foreground pr-6">{faq.q}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 45 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-[#7b5e43] text-2xl font-light leading-none flex-shrink-0"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="px-7 pb-6 font-body text-sm text-foreground/60 leading-relaxed border-t border-foreground/8 pt-4">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
};

const EgyptUnveiled = () => {
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [activeForm, setActiveForm] = useState<"tourist" | "operator">("tourist");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sendHeight = () => {
      window.parent.postMessage({ iframeHeight: document.body.scrollHeight }, "*");
    };
    sendHeight();
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const data = new FormData(form);

      // Send to Make for the automated follow-up email.
      await fetch(MAKE_WEBHOOK_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      // Save to Supabase
      await supabase.functions.invoke("submit-interest", {
        body: {
          form_type: data.get("form_type"),
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          group_size: data.get("group_size"),
          company: data.get("company"),
          number_of_clients: data.get("number_of_clients"),
          preferred_date: data.get("preferred_dates"),
          message: data.get("message"),
        },
      });

      setSubmitted(true);
    } catch {
      // fail silently — user can email directly
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden">



      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${heroEgypt})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <p className="text-white/80 font-body text-xs tracking-[0.4em] uppercase mb-6">
            The Next Stamp Tours
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-light text-white leading-[1.05] mb-6">
            Egypt<br />
            <span className="italic font-light">Unveiled</span>
          </h1>
          <p className="text-white/75 font-body text-sm tracking-[0.25em] uppercase mb-4">
            9 Days &nbsp;·&nbsp; 8 Nights &nbsp;·&nbsp; Cairo to Aswan
          </p>
          <p className="text-white/70 font-body text-xs tracking-[0.3em] uppercase mb-10">
            Next Departure: April 2027
          </p>
          <motion.a
            href="#apply"
            className="inline-block bg-[#7b5e43] text-primary-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-warm hover:text-warm-foreground transition-colors duration-300"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Apply for Your Spot
          </motion.a>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="w-px h-14 bg-white/30" />
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-body">Scroll</p>
        </motion.div>
      </section>

      {/* ── INTRO ────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6" style={{ backgroundColor: "hsl(var(--cream))" }}>
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">The Journey</p>
            <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-8">
              Ancient Wonders.<br />
              <span className="italic">Modern Comfort.</span>
            </h2>
            <p className="text-foreground/65 font-body text-base md:text-lg leading-relaxed mb-14 max-w-2xl mx-auto">
              From the iconic Pyramids of Giza to the tranquil waters of the Nile in Aswan, Egypt Unveiled is a carefully curated 9-day journey through one of the world's greatest civilizations — in a small, intimate group with every detail handled for you.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap justify-center gap-10 pt-10 border-t border-foreground/10">
              {[
                { number: "9", label: "Days" },
                { number: "5", label: "Cities" },
                { number: "6–15", label: "Guests" },
                { number: "4★", label: "Hotels" },
                { number: "Apr '27", label: "Next Departure" },
              ].map(({ number, label }) => (
                <div key={label} className="text-center">
                  <p className="font-heading text-4xl font-light text-[#7b5e43] mb-1">{number}</p>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-foreground/50">{label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── WHY APRIL ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Perfect Timing</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Why <span className="italic">April?</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🌤️",
                title: "Shoulder Season",
                description: "April sits between Egypt's winter peak and its summer heat — fewer people at every site, and rates below the December high season.",
              },
              {
                icon: "🎈",
                title: "Balloon Weather",
                description: "Your tour includes a sunrise balloon flight over the Valley of the Kings. April's calm, settled mornings are made for it.",
              },
              {
                icon: "🏛️",
                title: "Long, Clear Days",
                description: "More daylight than the winter months and dry, settled skies — full touring days and clean views across the Giza Plateau.",
              },
              {
                icon: "⛵",
                title: "Sailing Season",
                description: "Steady spring breezes on the Nile at Aswan, which is exactly what a felucca needs for an afternoon on the water.",
              },
            ].map(({ icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 0.1}>
                <div className="bg-background p-8 border border-foreground/10 text-center h-full">
                  <p className="text-3xl mb-5">{icon}</p>
                  <h3 className="font-heading text-xl text-foreground mb-3">{title}</h3>
                  <p className="font-body text-sm text-foreground/60 leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── IS THIS RIGHT FOR YOU ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Self Qualify</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Is This Tour <span className="italic">Right for You?</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="bg-[#f3e8da] p-8 border-t-2 border-[#7b5e43] h-full">
                <h3 className="font-heading text-2xl text-foreground mb-6">This tour is for you if...</h3>
                <ul className="space-y-4">
                  {[
                    "You want a fully managed, stress-free experience where every detail is handled",
                    "You prefer intimate small groups over crowded tour buses",
                    "You're curious about history, ancient civilizations, and world culture",
                    "You're comfortable with moderate walking at historical sites",
                    "You want premium 4-star comfort without the hassle of planning it yourself",
                    "You're open to sharing the experience with a curated group of like-minded travelers",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 font-body text-sm text-foreground/70">
                      <span className="text-[#7b5e43] mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-[#f3e8da] p-8 border-t-2 border-foreground/20 h-full">
                <h3 className="font-heading text-2xl text-foreground mb-6">This tour may not be for you if...</h3>
                <ul className="space-y-4">
                  {[
                    "You prefer fully independent, solo travel with no group structure",
                    "You have significant mobility limitations that prevent walking at historic sites",
                    "You're looking for a budget backpacker experience",
                    "You're uncomfortable sharing meals and transportation with others",
                    "You require a fully private, customized itinerary",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 font-body text-sm text-foreground/70">
                      <span className="text-foreground/35 mt-0.5 flex-shrink-0">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── ITINERARY ────────────────────────────────────────────────────── */}
      <section id="itinerary" className="py-24 md:py-32 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[#7b5e43] font-body text-xs tracking-[0.35em] uppercase mb-5">Day by Day</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Your 9-Day <span className="italic">Itinerary</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {days.map((day, i) => {
              const isOpen = openDay === day.day;
              return (
                <ScrollReveal key={day.day} delay={i * 0.05}>
                  <div
                    className="border border-foreground/15 hover:border-[#7b5e43] transition-colors duration-300 overflow-hidden bg-background cursor-pointer"
                    onClick={() => setOpenDay(isOpen ? null : day.day)}
                  >
                    {/* Image */}
                    <div
                      className="h-44 bg-cover bg-center relative"
                      style={{ backgroundImage: `url('${day.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <span className="absolute top-4 left-4 bg-[#7b5e43] text-primary-foreground font-body text-xs font-medium tracking-[0.15em] uppercase px-3 py-1">
                        Day {day.day}
                      </span>
                    </div>

                    {/* Title row — always visible */}
                    <div className="px-6 py-5 flex items-center justify-between">
                      <p className="font-heading text-xl text-foreground">{day.location}</p>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-[#7b5e43] text-2xl font-light leading-none select-none"
                      >
                        +
                      </motion.span>
                    </div>

                    {/* Expandable sites list */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <ul className="px-6 pb-6 space-y-2 border-t border-foreground/8 pt-4">
                            {day.sites.map((site) => (
                              <li key={site} className="flex items-center gap-2.5 font-body text-sm text-foreground/60">
                                <span className="w-1 h-1 rounded-full bg-[#7b5e43] flex-shrink-0" />
                                {site}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── JOURNEY MAP ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">The Route</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Your <span className="italic">Journey</span>
              </h2>
              <p className="text-foreground/55 font-body text-sm mt-4 max-w-lg mx-auto leading-relaxed">
                From the ancient capital to the gates of Nubia — a journey south along the Nile.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            {/* Desktop route */}
            <div className="hidden md:flex items-start justify-between relative mb-6">
              {/* Connecting line */}
              <div className="absolute top-4 left-[10%] right-[10%] h-px bg-[#7b5e43]/30" />
              {[
                { city: "Cairo", days: "Days 1–4", sub: "& Alexandria Day 3" },
                { city: "Luxor", days: "Days 5–6", sub: "East & West Banks" },
                { city: "Aswan", days: "Days 7–9", sub: "Nile to Nubia" },
              ].map(({ city, days, sub }, i) => (
                <div key={city} className="flex flex-col items-center relative z-10 w-1/3">
                  <div className="w-8 h-8 rounded-full bg-[#7b5e43] flex items-center justify-center mb-4">
                    <span className="text-white font-body text-xs font-medium">{i + 1}</span>
                  </div>
                  <p className="font-heading text-2xl text-foreground mb-1">{city}</p>
                  <p className="font-body text-xs text-[#7b5e43] tracking-wide uppercase mb-1">{days}</p>
                  <p className="font-body text-xs text-foreground/45 text-center">{sub}</p>
                </div>
              ))}
            </div>

            {/* Mobile route */}
            <div className="flex md:hidden flex-col items-start gap-0">
              {[
                { city: "Cairo", days: "Days 1–4", sub: "& Alexandria Day 3" },
                { city: "Luxor", days: "Days 5–6", sub: "East & West Banks" },
                { city: "Aswan", days: "Days 7–9", sub: "Nile to Nubia" },
              ].map(({ city, days, sub }, i, arr) => (
                <div key={city} className="flex items-start gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#7b5e43] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-body text-xs font-medium">{i + 1}</span>
                    </div>
                    {i < arr.length - 1 && <div className="w-px h-12 bg-[#7b5e43]/30 my-1" />}
                  </div>
                  <div className="pb-8">
                    <p className="font-heading text-2xl text-foreground">{city}</p>
                    <p className="font-body text-xs text-[#7b5e43] tracking-wide uppercase mt-1">{days}</p>
                    <p className="font-body text-xs text-foreground/45 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Flight indicators */}
            <div className="hidden md:flex justify-around mt-6">
              <div className="text-center">
                <p className="font-body text-xs text-foreground/35 tracking-wide">✈ Morning flight</p>
                <p className="font-body text-xs text-foreground/25">Cairo → Luxor, Day 5</p>
              </div>
              <div className="text-center">
                <p className="font-body text-xs text-foreground/35 tracking-wide">🚌 Scenic bus ride</p>
                <p className="font-body text-xs text-foreground/25">Luxor → Aswan, Day 7</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── INCLUDED / NOT INCLUDED ──────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6" style={{ backgroundColor: "hsl(var(--cream))" }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">What to Expect</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Included &amp; <span className="italic">Not Included</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="bg-background p-8 md:p-10 border-t-2 border-[#7b5e43] h-full">
                <h3 className="font-heading text-2xl font-light text-foreground mb-8">What's Included</h3>
                <ul className="space-y-4">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-body text-sm text-foreground/70 pb-4 border-b border-foreground/8 last:border-0 last:pb-0">
                      <span className="text-[#7b5e43] mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-background p-8 md:p-10 border-t-2 border-destructive/60 h-full">
                <h3 className="font-heading text-2xl font-light text-foreground mb-8">Not Included</h3>
                <ul className="space-y-4">
                  {notIncluded.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-body text-sm text-foreground/70 pb-4 border-b border-foreground/8 last:border-0 last:pb-0">
                      <span className="text-destructive mt-0.5 flex-shrink-0">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── IF SOMETHING GOES WRONG ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6" style={{ backgroundColor: "hsl(var(--cream))" }}>
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5 text-center">
              Looking After You
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-light text-foreground mb-10 text-center">
              If something <span className="italic">goes wrong</span>
            </h2>
            <div className="space-y-6 font-body text-sm md:text-base text-foreground/65 leading-relaxed">
              <p>
                A licensed Egyptologist Lead Guide is with the group for all nine days.
                You will have their name and mobile number two weeks before you fly.
              </p>
              <p>
                They work to our written emergency procedures — the same document that
                identifies the nearest hospital to each of your hotels before you leave
                home, and that your guide confirms in writing they have read.
              </p>
              <p>
                Egypt runs six to seven hours ahead of Connecticut. If something happens while the
                US is asleep, a named deputy holds the same authority, along with your
                insurance details and your emergency contacts. There is always someone awake.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Investment</p>
            <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground mb-5">
              Tour <span className="italic">Pricing</span>
            </h2>
            <p className="text-foreground/55 font-body text-sm leading-relaxed mb-14">
              All-inclusive per person pricing, in two room types. International flights not included.<br />Small groups of 6 to 15 guests.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="border border-foreground/10 text-center overflow-hidden" style={{ backgroundColor: DARK }}>
              {/* Founding member banner */}
              <div className="bg-[#7b5e43] py-3 px-6">
                <p className="text-white font-body text-xs tracking-[0.3em] uppercase">
                  ★ Founding Member Rate — First Group Only ★
                </p>
              </div>

              <div className="py-12 px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8 mb-8 text-center">
                  {/* Sharing a twin */}
                  <div>
                    <p className="text-foreground/50 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-3">
                      Sharing a Twin
                    </p>
                    <p className="text-foreground/35 font-body text-xs line-through mb-1 tracking-wide">
                      $2,453.63
                    </p>
                    <p className="font-heading font-light text-foreground leading-none mb-3">
                      <span className="text-2xl align-top mt-1 inline-block">$</span>
                      <span className="text-6xl">2,353</span>
                      <span className="text-2xl align-top mt-1 inline-block">.63</span>
                    </p>
                    <p className="font-body text-xs text-foreground/50 leading-relaxed">
                      Per person, for two travellers<br />booking together
                    </p>
                  </div>

                  {/* Private room */}
                  <div className="sm:border-l sm:border-foreground/10 sm:pl-8">
                    <p className="text-foreground/50 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-3">
                      Private Room
                    </p>
                    <p className="text-foreground/35 font-body text-xs line-through mb-1 tracking-wide">
                      $2,837.43
                    </p>
                    <p className="font-heading font-light text-foreground leading-none mb-3">
                      <span className="text-2xl align-top mt-1 inline-block">$</span>
                      <span className="text-6xl">2,737</span>
                      <span className="text-2xl align-top mt-1 inline-block">.43</span>
                    </p>
                    <p className="font-body text-xs text-foreground/50 leading-relaxed">
                      Per person, a room of your<br />own for all 8 nights
                    </p>
                  </div>
                </div>

                <p className="text-[#7b5e43] font-body text-xs font-medium mb-8">
                  Founding member rate — $100 off either room type
                </p>

                <div className="w-10 h-px bg-[#7b5e43] mx-auto mb-8" />

                <p className="text-foreground/60 font-body text-sm leading-relaxed mb-6">
                  Travelling alone? You book the private room — we never place you<br className="hidden sm:inline" />
                  with a stranger. It is priced at what the extra room costs us, nothing on top.
                </p>
                <p className="text-foreground/60 font-body text-sm leading-relaxed mb-6">
                  Upon approval, we'll send you a secure payment link.<br />No payment required to apply.
                </p>
                <p className="text-[#7b5e43] font-body text-xs tracking-[0.15em] uppercase mb-10">
                  ⚑ Limited to 15 guests — April 2027 departure
                </p>
                <a
                  href="#apply"
                  className="inline-block bg-[#7b5e43] text-primary-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-warm hover:text-warm-foreground transition-colors duration-300"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {["Small Group — 6 to 15 Guests", "Licensed Egyptologist Guides", "48-Hour Response", "Secure WeTravel Checkout"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 font-body text-xs text-foreground/50 tracking-wide">
                  <span className="text-[#7b5e43]">✓</span>
                  {badge}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-6 font-body text-sm text-foreground/45">
              Are you a tour operator?{" "}
              <a
                href="#apply"
                onClick={() => setActiveForm("operator")}
                className="text-[#7b5e43] underline underline-offset-4 hover:text-warm transition-colors"
              >
                Apply here
              </a>{" "}
              for operator rates.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">The Process</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                How It <span className="italic">Works</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Apply",
                description: "Fill out our short application — takes less than 3 minutes. No payment required at this stage.",
              },
              {
                step: "02",
                title: "Get Approved",
                description: "We personally review every application and respond within 48 hours to confirm your spot.",
              },
              {
                step: "03",
                title: "Secure Your Spot",
                description: "Once approved, we'll send you a secure payment link to confirm your place on the tour.",
              },
            ].map(({ step, title, description }, i) => (
              <ScrollReveal key={step} delay={i * 0.1}>
                <div className="text-center">
                  <p className="font-heading text-6xl font-light text-[#7b5e43]/25 mb-4">{step}</p>
                  <div className="w-8 h-px bg-[#7b5e43] mx-auto mb-5" />
                  <h3 className="font-heading text-2xl font-light text-foreground mb-4">{title}</h3>
                  <p className="font-body text-sm text-foreground/60 leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Common Questions</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Frequently Asked <span className="italic">Questions</span>
              </h2>
            </div>
          </ScrollReveal>

          <FaqAccordion />
        </div>
      </section>

      {/* ── PHOTO GALLERY ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Real Moments</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Life on <span className="italic">the Tour</span>
              </h2>
              <p className="text-foreground/55 font-body text-sm mt-4 max-w-lg mx-auto leading-relaxed">
                A glimpse into what awaits — real places, real experiences.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: clientPyramids, caption: "The Great Pyramid, Giza" },
              { src: clientGroup, caption: "Giza Plateau" },
              { src: clientGarden, caption: "Al-Azhar Park, Cairo" },
              { src: clientDinner, caption: "Dinner by the Pyramids" },
            ].map((photo, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <motion.div
                  className="relative group overflow-hidden rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4">
                    <p className="text-white font-body text-xs tracking-wide">{photo.caption}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      {/* Replace these with real guest reviews once collected */}
      <section className="py-24 md:py-32 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Guest Stories</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                What Our <span className="italic">Guests Say</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Egypt Unveiled exceeded every expectation. The small group meant we actually got to experience each site rather than rushing through with a crowd. The Nile cruise on night one set the tone perfectly.",
                name: "Marcus T.",
                location: "New York, USA",
              },
              {
                quote: "I've traveled extensively but Egypt with this group was something entirely different. Every detail was handled — hotels, meals, guides — all exceptional. I didn't have to think once. Just experience.",
                name: "Sarah S.",
                location: "London, UK",
              },
              {
                quote: "As a solo traveler I was nervous, but the group felt like family by day three. The Valley of the Kings alone was worth every penny. I'm already looking at what tour they run next.",
                name: "Michael M.",
                location: "Toronto, Canada",
              },
            ].map(({ quote, name, location }, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-background p-8 border border-foreground/10 flex flex-col h-full">
                  <p className="text-[#7b5e43] font-heading text-4xl font-light leading-none mb-4">"</p>
                  <p className="font-body text-sm text-foreground/70 leading-relaxed flex-1 mb-8">{quote}</p>
                  <div className="border-t border-foreground/10 pt-5">
                    <p className="font-heading text-base text-foreground">{name}</p>
                    <p className="font-body text-xs text-foreground/45 tracking-wide mt-1">{location}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL SHARE ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-background border-t border-foreground/8">
        <ScrollReveal>
          <div className="max-w-xl mx-auto text-center">
            <p className="font-heading text-2xl md:text-3xl font-light text-foreground mb-3">
              Know someone who'd love <span className="italic">Egypt?</span>
            </p>
            <p className="font-body text-sm text-foreground/55 mb-8 leading-relaxed">
              Share Egypt Unveiled with a friend who's been dreaming of this trip.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.facebook.com/Thenextstamptravelco/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-foreground/20 font-body text-xs tracking-[0.15em] uppercase text-foreground/60 hover:border-[#7b5e43] hover:text-[#7b5e43] transition-colors duration-300"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/thenextstamptravel/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-foreground/20 font-body text-xs tracking-[0.15em] uppercase text-foreground/60 hover:border-[#7b5e43] hover:text-[#7b5e43] transition-colors duration-300"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@thenextstamp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-foreground/20 font-body text-xs tracking-[0.15em] uppercase text-foreground/60 hover:border-[#7b5e43] hover:text-[#7b5e43] transition-colors duration-300"
              >
                TikTok
              </a>
              <button
                onClick={handleCopyLink}
                className="px-6 py-3 border border-foreground/20 font-body text-xs tracking-[0.15em] uppercase text-foreground/60 hover:border-[#7b5e43] hover:text-[#7b5e43] transition-colors duration-300"
              >
                {copied ? "✓ Link Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── ABOUT THE TEAM ───────────────────────────────────────────────── */}
      {/* Replace placeholder images and bios with real photos and text */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Who You'll Travel With</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground">
                Meet Your <span className="italic">Team</span>
              </h2>
              <p className="text-foreground/55 font-body text-sm mt-4 max-w-lg mx-auto leading-relaxed">
                Every great journey starts with the right people. Here's who will be by your side.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Person 1 — Tour Founder */}
            <ScrollReveal delay={0.1}>
              <div className="flex flex-col">
                <div className="aspect-[4/3] overflow-hidden mb-6">
                  <img
                    src={founderRyan}
                    alt="Ryan Radwan - Founder of The Next Stamp Tours"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="border-t-2 border-[#7b5e43] pt-6">
                  <p className="text-[#7b5e43] font-body text-xs tracking-[0.3em] uppercase mb-2">Founder & Host</p>
                  <h3 className="font-heading text-2xl text-foreground mb-4">Ryan Radwan</h3>
                  <p className="font-body text-sm text-foreground/65 leading-relaxed">
                    Egypt has always been more than a destination to me — it's where history becomes tangible. I created The Next Stamp Tours because I believe travel should be transformative, not transactional. Every detail of this journey is something I've personally experienced, vetted, and designed so that you can show up and simply be present. My goal is simple: to give you the Egypt I fell in love with.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Person 2 — Lead Tour Operator */}
            <ScrollReveal delay={0.2}>
              <div className="flex flex-col">
                <div className="aspect-[4/3] overflow-hidden mb-6">
                  <img
                    src={operatorMohammed}
                    alt="Mohammed Mustafa - Lead Tour Operator"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="border-t-2 border-[#7b5e43] pt-6">
                  <p className="text-[#7b5e43] font-body text-xs tracking-[0.3em] uppercase mb-2">Lead Tour Operator</p>
                  <h3 className="font-heading text-2xl text-foreground mb-4">Mohammed Mustafa</h3>
                  <p className="font-body text-sm text-foreground/65 leading-relaxed">
                    Mohammed was born and raised in the shadow of the Pyramids, and that upbringing shaped everything about how he leads a tour. With years of on-the-ground experience guiding travelers through Egypt's most iconic and hidden sites, he brings a depth of knowledge that no guidebook can replicate. Fluent in English and Arabic, Mohammed has a gift for making history feel alive — whether he's walking you through the Valley of the Kings or navigating the winding streets of Islamic Cairo. With Mohammed leading the way, you're not just seeing Egypt. You're understanding it.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── APPLY ────────────────────────────────────────────────────────── */}
      <section id="apply" className="py-24 md:py-32 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-foreground/50 font-body text-xs tracking-[0.35em] uppercase mb-5">Reserve Your Spot</p>
              <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground mb-5">
                Apply <span className="italic">Now</span>
              </h2>
              <p className="text-foreground/55 font-body text-sm leading-relaxed">
                We review every application personally and respond within 48 hours.
              </p>
            </div>
          </ScrollReveal>

          {/* Toggle */}
          <ScrollReveal delay={0.1}>
            <div className="flex justify-center mb-10">
              <button
                onClick={() => setActiveForm("tourist")}
                className={`px-8 py-3 font-body text-xs tracking-[0.15em] uppercase border transition-colors duration-300 ${
                  activeForm === "tourist"
                    ? "bg-[#7b5e43] text-primary-foreground border-[#7b5e43]"
                    : "bg-transparent text-foreground border-foreground/30 hover:border-foreground"
                }`}
              >
                I'm a Traveler
              </button>
              <button
                onClick={() => setActiveForm("operator")}
                className={`px-8 py-3 font-body text-xs tracking-[0.15em] uppercase border-t border-b border-r transition-colors duration-300 ${
                  activeForm === "operator"
                    ? "bg-[#7b5e43] text-primary-foreground border-[#7b5e43]"
                    : "bg-transparent text-foreground border-foreground/30 hover:border-foreground"
                }`}
              >
                I'm a Tour Operator
              </button>
            </div>
          </ScrollReveal>

          {submitted ? (
            <ScrollReveal>
              <div className="bg-background border border-[#7b5e43]/30 p-12 text-center">
                <p className="text-[#7b5e43] font-body text-xs tracking-[0.3em] uppercase mb-4">Application Received</p>
                <h3 className="font-heading text-3xl font-light text-foreground mb-4">Thank You</h3>
                <p className="font-body text-sm text-foreground/60 leading-relaxed">
                  We'll review your application and be in touch within 48 hours at the email you provided.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={0.15}>
              {activeForm === "operator" && (
                <div className="bg-[#7b5e43]/8 border border-[#7b5e43]/20 px-6 py-4 mb-0">
                  <p className="font-body text-sm text-foreground/70 leading-relaxed">
                    <span className="text-[#7b5e43] font-medium">Have a different Egypt tour in mind?</span> No problem — even if your idea doesn't match our Egypt Unveiled itinerary exactly, apply anyway and tell us what you're thinking. We'll do our best to make it work.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="bg-background p-8 md:p-10 space-y-6">
                <input type="hidden" name="form_type" value={activeForm === "tourist" ? "Tourist Application" : "Tour Operator Application"} />

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Your full name"
                      className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#7b5e43] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#7b5e43] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+1 (000) 000-0000"
                      className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#7b5e43] transition-colors"
                    />
                  </div>

                  {activeForm === "tourist" ? (
                    <div>
                      <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Group Size</label>
                      <select
                        name="group_size"
                        required
                        className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-[#7b5e43] transition-colors"
                      >
                        <option value="" disabled>Select group size</option>
                        {["1 person", "2 people", "3 people", "4 people", "5 people", "6 people", "7 people", "8 people", "9 people", "10 people", "11 people", "12 people", "13 people", "14 people", "15 people"].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Company Name</label>
                      <input
                        name="company"
                        type="text"
                        required
                        placeholder="Your company name"
                        className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#7b5e43] transition-colors"
                      />
                    </div>
                  )}
                </div>

                {activeForm === "operator" && (
                  <div>
                    <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Number of Clients</label>
                    <select
                      name="number_of_clients"
                      required
                      className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-[#7b5e43] transition-colors"
                    >
                      <option value="" disabled>Select number of clients</option>
                      {["1–2 clients", "3–4 clients", "5–6 clients", "7–8 clients", "9–10 clients", "11–12 clients"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">Preferred Travel Dates</label>
                  <input
                    name="preferred_dates"
                    type="text"
                    placeholder="e.g. November 2026 or flexible"
                    className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#7b5e43] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs tracking-[0.15em] uppercase text-foreground/60 mb-2">
                    {activeForm === "tourist" ? "Tell Us About Yourself" : "Tell Us About Your Clients"}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={
                      activeForm === "tourist"
                        ? "Tell us a little about yourself and why you'd like to join Egypt Unveiled..."
                        : "Tell us about your clients, their travel interests, and what you're looking for from this partnership..."
                    }
                    className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#7b5e43] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#7b5e43] text-primary-foreground py-4 font-body text-xs tracking-[0.2em] uppercase font-medium hover:bg-warm hover:text-warm-foreground transition-colors duration-300 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : activeForm === "tourist" ? "Submit Application" : "Submit Operator Application"}
                </button>

                <p className="text-center font-body text-xs text-foreground/40 pt-2">
                  Questions? Email us at{" "}
                  <a href="mailto:info@thenextstamptravelco.com" className="text-[#7b5e43] hover:text-warm transition-colors">
                    info@thenextstamptravelco.com
                  </a>
                </p>
              </form>
            </ScrollReveal>
          )}
        </div>
      </section>

    </div>
  );
};

export default EgyptUnveiled;
