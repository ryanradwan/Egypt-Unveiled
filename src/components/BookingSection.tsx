import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const experiences = [
  "The Pyramids of Giza Experience",
  "The Grand Egyptian Museum",
  "Mosque of Muhammad Ali",
  "Al-Muizz Street Experience",
];

const BookingSection = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    groupSize: "",
    experience: "",
    preferredDate: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-interest", {
        body: formData,
      });
      if (error) throw error;
      toast({
        title: "Reservation Received",
        description: "Thank you! We'll confirm your booking within 24 hours.",
      });
      setFormData({ name: "", email: "", groupSize: "", experience: "", preferredDate: "", message: "" });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">Reserve</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-4">
            Reserve Your <span className="italic">Spot</span>
          </h2>
          <p className="text-muted-foreground font-body">
            Secure your experience today. We'll confirm your booking within 24 hours.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={255}
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="groupSize" className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
                Group Size
              </label>
              <select
                id="groupSize"
                name="groupSize"
                required
                value={formData.groupSize}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors"
              >
                <option value="" className="bg-background">Select size</option>
                <option value="1" className="bg-background">1 Guest (Private only)</option>
                <option value="2" className="bg-background">2 Guests (Private only)</option>
                <option value="3" className="bg-background">3 Guests</option>
                <option value="4" className="bg-background">4 Guests</option>
              </select>
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
                Experience
              </label>
              <select
                id="experience"
                name="experience"
                required
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors"
              >
                <option value="" className="bg-background">Choose experience</option>
                {experiences.map((exp) => (
                  <option key={exp} value={exp} className="bg-background">{exp}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
              Preferred Date
            </label>
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              required
              value={formData.preferredDate}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
              Message (optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              maxLength={1000}
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-muted-foreground/50"
              placeholder="Anything we should know about your group or visit?"
            />
          </div>
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={submitting}
            className="bg-accent text-accent-foreground px-10 py-4 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-warm transition-colors duration-300 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Reserve & Pay"}
            </button>
            <p className="text-muted-foreground/60 font-body text-xs mt-4 tracking-wide">
              Spots are limited to 4 guests per experience.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookingSection;
