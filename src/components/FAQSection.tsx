import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What does the itinerary look like?",
    answer: "Pickup at 9:00 AM → 3 hours at the Pyramids of Giza → 1 hour lunch break (you pay directly at the restaurant) → 2 hours at the Grand Egyptian Museum → drop-off around 3:00 PM.",
  },
  {
    question: "Is transport included?",
    answer: "Yes! Transportation is included. You'll be picked up and dropped off at your hotel or a convenient meeting point.",
  },
  {
    question: "Are entrance tickets included?",
    answer: "Entrance tickets to the Pyramids and the Grand Egyptian Museum are not included in the tour price. We can assist with ticket coordination if needed.",
  },
  {
    question: "Is lunch included?",
    answer: "Lunch is not included. There's a 1-hour break at a local restaurant where you pay directly. We'll recommend great options.",
  },
  {
    question: "Is this a private tour?",
    answer: "We offer both options. The Small Group Experience ($79/person, max 5 guests) and the Private Experience ($349 flat rate for up to 5 guests, guaranteed departure).",
  },
  {
    question: "Is this suitable for families?",
    answer: "Absolutely. Our experiences are designed to engage all ages. Children are welcome, and our storytelling approach resonates with younger travelers too.",
  },
  {
    question: "What should I wear?",
    answer: "Comfortable walking shoes are essential. Light, breathable clothing is recommended. Sun protection (hat, sunscreen) is highly advised for the outdoor portion at Giza.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-card">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight">
            Common <span className="italic">Questions</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/50 px-1">
              <AccordionTrigger className="font-body text-foreground text-left text-base hover:no-underline hover:text-accent transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
