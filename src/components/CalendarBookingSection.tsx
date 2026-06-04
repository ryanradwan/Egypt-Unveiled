import { useState, useEffect } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, AlertCircle, Shield, CheckCircle, Lock, Car, Camera, Ticket } from "lucide-react";

const PRICE_PER_PERSON = 79;
const FOUNDERS_PRICE_PER_PERSON = 59;
const FOUNDERS_GUEST_LIMIT = 20;
const PRIVATE_FLAT_PRICE = 349;

type ExperienceType = "small_group" | "private";

interface TourDate {
  id: string;
  tour_date: string;
  tour_time: string;
  max_guests: number;
  booked_guests: number;
  destination: string;
  tour_status?: string;
  min_guests?: number;
}

const CalendarBookingSection = () => {
  const { toast } = useToast();
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTourDate, setSelectedTourDate] = useState<TourDate | null>(null);
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalConfirmedGuests, setTotalConfirmedGuests] = useState(0);

  const [experienceType, setExperienceType] = useState<ExperienceType>("small_group");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    nationality: "",
    special_requests: "",
  });
  const [step, setStep] = useState<"calendar" | "details" | "processing">("calendar");
  const [checks, setChecks] = useState({ tickets: false, lunch: false, cancellation: false });

  // Listen for pricing section CTA clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type) {
        setExperienceType(detail.type);
        setSelectedDate(undefined);
        setSelectedTourDate(null);
        setStep("calendar");
      }
    };
    window.addEventListener("select-experience", handler);
    return () => window.removeEventListener("select-experience", handler);
  }, []);

  useEffect(() => {
    fetchTourDates();
    fetchTotalGuests();
  }, []);

  const fetchTotalGuests = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("num_guests")
      .eq("status", "confirmed");
    const total = (data || []).reduce((sum, b) => sum + b.num_guests, 0);
    setTotalConfirmedGuests(total);
  };

  const fetchTourDates = async () => {
    const { data, error } = await supabase
      .from("tour_dates")
      .select("*")
      .eq("is_active", true)
      .eq("destination", "pyramids")
      .gte("tour_date", new Date().toISOString().split("T")[0])
      .order("tour_date", { ascending: true });

    if (!error && data) {
      setTourDates(data as TourDate[]);
    }
    setLoading(false);
  };

  const filteredDates = tourDates.filter((d) => {
    if (d.tour_status === "cancelled" || d.tour_status === "minimum_not_reached") return false;
    const tourStart = new Date(`${d.tour_date}T${d.tour_time || "09:00:00"}+02:00`);
    const hoursUntil = (tourStart.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < 12) return false;
    return true;
  });

  const availableDateValues = (() => {
    const dateMap = new Map<string, Date>();
    for (const d of filteredDates) {
      if (d.booked_guests < d.max_guests) {
        dateMap.set(d.tour_date, parseISO(d.tour_date));
      }
    }
    return Array.from(dateMap.values());
  })();

  const isDateAvailable = (date: Date) =>
    availableDateValues.some((d) => isSameDay(d, date));

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setTickets(1);
    setStep("calendar");

    if (date) {
      const slot = filteredDates.find(
        (d) => isSameDay(parseISO(d.tour_date), date) && d.booked_guests < d.max_guests
      );
      setSelectedTourDate(slot || null);
    } else {
      setSelectedTourDate(null);
    }
  };

  const spotsLeft = selectedTourDate
    ? selectedTourDate.max_guests - selectedTourDate.booked_guests
    : 0;

  const isPrivate = experienceType === "private";
  const isFoundersRate = !isPrivate && (totalConfirmedGuests + tickets) <= FOUNDERS_GUEST_LIMIT;
  const pricePerPerson = isFoundersRate ? FOUNDERS_PRICE_PER_PERSON : PRICE_PER_PERSON;
  const total = isPrivate ? PRIVATE_FLAT_PRICE : tickets * pricePerPerson;
  const maxTickets = isPrivate ? 5 : Math.min(spotsLeft, 5);

  const allChecked = checks.tickets && checks.lunch && checks.cancellation;

  const handleProceedToDetails = () => {
    if (!selectedTourDate) return;
    setStep("details");
  };

  const handleSubmitBooking = async () => {
    if (!selectedTourDate || !allChecked) return;
    if (!form.full_name || !form.email || !form.phone) {
      toast({ title: "Please fill in all required fields" });
      return;
    }

    setSubmitting(true);
    setStep("processing");

    const safetyTimeout = setTimeout(() => {
      setSubmitting(false);
      setStep("details");
      toast({
        title: "Request Timed Out",
        description: "The server took too long to respond. Please try again.",
        variant: "destructive",
      });
    }, 30000);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          tour_date_id: selectedTourDate.id,
          num_guests: tickets,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          special_requests: form.special_requests,
          experience_type: experienceType,
          destination: "pyramids",
        },
      });

      clearTimeout(safetyTimeout);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      clearTimeout(safetyTimeout);
      toast({
        title: "Booking Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setStep("details");
      setSubmitting(false);
    }
  };

  const uniqueDates = (() => {
    const map = new Map<string, TourDate[]>();
    for (const d of filteredDates) {
      const key = d.tour_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return Array.from(map.entries());
  })();

  const visibleDates = (() => {
    const first2 = uniqueDates.slice(0, 2);
    if (!selectedDate) return first2;
    const selectedStr = selectedDate.toISOString().split("T")[0];
    const alreadyShown = first2.some(([d]) => d === selectedStr);
    if (alreadyShown) return first2;
    const selectedEntry = uniqueDates.find(([d]) => d === selectedStr);
    return selectedEntry ? [...first2, selectedEntry] : first2;
  })();

  return (
    <section id="booking" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-body mb-4">Reserve</p>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-foreground leading-tight mb-4">
            Reserve Your <span className="italic">Spot</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto mb-6">
            Select your experience type and date — then pay securely to confirm.
          </p>

          {/* Urgency & value bar */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm font-body text-foreground/70">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" /> Runs daily at 9:00 AM</span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> Limited to 5 guests</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-accent" /> 48h free cancellation</span>
            <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-accent" /> Transport included</span>
          </div>
        </div>

        {/* Experience Type Toggle — large, mobile-friendly */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => { setExperienceType("small_group"); setSelectedDate(undefined); setSelectedTourDate(null); setStep("calendar"); }}
            className={`flex-1 max-w-[220px] py-4 text-sm tracking-[0.1em] uppercase font-body font-medium border transition-colors duration-200 ${
              experienceType === "small_group"
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-transparent text-foreground border-border hover:border-accent/50"
            }`}
          >
            Small Group
            <span className="block text-xs normal-case tracking-normal mt-0.5 opacity-70">From ${isFoundersRate ? FOUNDERS_PRICE_PER_PERSON : PRICE_PER_PERSON}/person</span>
          </button>
          <button
            onClick={() => { setExperienceType("private"); setSelectedDate(undefined); setSelectedTourDate(null); setStep("calendar"); }}
            className={`flex-1 max-w-[220px] py-4 text-sm tracking-[0.1em] uppercase font-body font-medium border transition-colors duration-200 ${
              experienceType === "private"
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-transparent text-foreground border-border hover:border-accent/50"
            }`}
          >
            Private
            <span className="block text-xs normal-case tracking-normal mt-0.5 opacity-70">$349 flat · up to 5</span>
          </button>
        </div>

        {/* Experience info banner */}
        <div className="max-w-xl mx-auto mb-10 text-center">
          {isPrivate ? (
            <div className="flex items-center justify-center gap-2 text-sm font-body text-accent-foreground">
              <Shield className="w-4 h-4" />
              <span>Guaranteed departure · Up to 5 guests · $349 flat · Transport included</span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-body text-muted-foreground">
                $79/guest · Max 5 per tour · Transport included
                {isFoundersRate && (
                  <span className="text-accent font-medium ml-1">
                    · Founders Rate: $59 ({FOUNDERS_GUEST_LIMIT - totalConfirmedGuests} spots left)
                  </span>
                )}
              </p>
              <p className="text-xs font-body text-muted-foreground/60 mt-1 italic">
                Minimum 3 guests required to operate · Full refund if minimum not met
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Calendar + Date List */}
          <div>
            <h3 className="text-sm tracking-[0.2em] uppercase font-body text-foreground mb-4 font-medium">
              Available Dates — Daily at 9:00 AM
            </h3>
            <div className="border border-border p-2 inline-block">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => !isDateAvailable(date)}
                className="pointer-events-auto"
                modifiers={{ available: availableDateValues }}
                modifiersClassNames={{ available: "font-bold text-accent-foreground" }}
              />
            </div>

            {/* Date list */}
            <div className="mt-4 space-y-2">
              {visibleDates.map(([dateStr, slots]) => {
                const isSelected = selectedDate && isSameDay(parseISO(dateStr), selectedDate);
                const slot = slots[0];
                const slotSpots = slot.max_guests - slot.booked_guests;
                const isFull = slotSpots <= 0;
                return (
                  <div
                    key={dateStr}
                    className={`border transition-colors cursor-pointer ${
                      isSelected ? "border-accent/30 bg-accent/5" : "border-border hover:bg-muted/30"
                    } ${isFull ? "opacity-40 cursor-not-allowed" : ""}`}
                    onClick={() => !isFull && handleDateSelect(parseISO(dateStr))}
                  >
                    <div className="flex justify-between items-center px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-body font-medium">
                          {format(parseISO(dateStr), "EEE, MMM d")}
                        </span>
                        <span className="text-muted-foreground text-xs font-body flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 9:00 AM
                        </span>
                        {slot.tour_status === "confirmed" && (
                          <span className="text-[10px] text-green-600 font-medium px-1.5 py-0.5 bg-green-500/10 border border-green-500/20">
                            CONFIRMED
                          </span>
                        )}
                      </div>
                      <span className={`text-xs tracking-wide font-medium ${isFull ? "text-destructive" : slotSpots <= 2 ? "text-warm" : "text-muted-foreground"}`}>
                        {isFull ? "Sold Out" : `${slotSpots} ${slotSpots === 1 ? "spot" : "spots"} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
              {uniqueDates.length > 2 && !selectedDate && (
                <p className="text-muted-foreground/60 font-body text-xs py-2 text-center">
                  Select a date on the calendar to see more availability
                </p>
              )}
              {filteredDates.length === 0 && !loading && (
                <p className="text-muted-foreground font-body text-sm py-4 text-center">
                  No dates available yet.
                </p>
              )}
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div>
            {step === "calendar" && (
              <div>
                <h3 className="text-sm tracking-[0.2em] uppercase font-body text-foreground mb-6 font-medium">
                  Your Booking
                </h3>
                {selectedTourDate ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-muted-foreground font-body text-xs uppercase tracking-wide mb-1">Date & Time</p>
                      <p className="text-foreground font-heading text-xl">
                        {format(parseISO(selectedTourDate.tour_date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 9:00 AM · 6 hours</span>
                      </div>
                      {!isPrivate && (
                        <div className="mt-3 bg-muted/30 border border-border px-3 py-2">
                          <div className="flex justify-between text-xs font-body">
                            <span className="text-muted-foreground">{selectedTourDate.booked_guests} of {selectedTourDate.max_guests} seats booked</span>
                            <span className={`font-medium ${spotsLeft <= 2 ? "text-warm" : "text-accent"}`}>{spotsLeft} {spotsLeft === 1 ? "seat" : "seats"} remaining</span>
                          </div>
                          <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all duration-300"
                              style={{ width: `${(selectedTourDate.booked_guests / selectedTourDate.max_guests) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-muted-foreground font-body text-xs uppercase tracking-wide mb-1">Experience</p>
                      <p className="text-foreground font-body">
                        {isPrivate ? "Private (Guaranteed Departure)" : "Small Group (Min. 3 guests to operate)"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-body text-muted-foreground mb-2 tracking-wide uppercase">
                        {isPrivate ? "Number of Guests (1–5)" : `Seats (max ${spotsLeft} remaining)`}
                      </label>
                      {/* Large tap-friendly guest selector for mobile */}
                      <div className="flex gap-2">
                        {Array.from({ length: maxTickets }, (_, i) => i + 1).map((n) => (
                          <button
                            key={n}
                            onClick={() => setTickets(n)}
                            className={`flex-1 py-3 text-center font-body font-medium text-sm border transition-colors ${
                              tickets === n
                                ? "bg-accent text-accent-foreground border-accent"
                                : "bg-transparent text-foreground border-border hover:border-accent/50"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center mb-1">
                        {isPrivate ? (
                          <>
                            <span className="text-muted-foreground font-body text-sm">Flat rate</span>
                            <span className="text-foreground font-heading text-2xl">${PRIVATE_FLAT_PRICE}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground font-body text-sm">{tickets} × ${pricePerPerson}</span>
                            <span className="text-foreground font-heading text-2xl">${total}</span>
                          </>
                        )}
                      </div>
                      {!isPrivate && isFoundersRate && (
                        <p className="text-accent font-body text-xs font-medium mb-1">
                          Founders Rate applied! ({FOUNDERS_GUEST_LIMIT - totalConfirmedGuests} spots remaining)
                        </p>
                      )}
                      <p className="text-muted-foreground/60 font-body text-xs mt-1">Full payment required at booking</p>
                    </div>

                    {/* Value bullets above CTA */}
                    <div className="bg-card border border-border p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-body text-foreground/70">
                        <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>6-hour guided experience at Giza & Grand Egyptian Museum</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-body text-foreground/70">
                        <Car className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>Hotel pickup & drop-off included</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-body text-foreground/70">
                        <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>{isPrivate ? "Guaranteed departure — no cancellations" : "Min. 3 guests · Full refund if not met"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-body text-foreground/70">
                        <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>No hidden fees · Full refund if cancelled 48h+ before</span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToDetails}
                      className="w-full bg-accent text-accent-foreground py-5 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-accent/90 transition-colors duration-300"
                    >
                      Continue to Checkout
                    </button>
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-body">No available slots for this date.</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-body mb-2">Select an available date to begin.</p>
                    <p className="text-muted-foreground/60 font-body text-xs">Tours run daily · Instant confirmation</p>
                  </div>
                )}
              </div>
            )}

            {step === "details" && selectedTourDate && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm tracking-[0.2em] uppercase font-body text-foreground font-medium">
                    Guest Details
                  </h3>
                  <button onClick={() => setStep("calendar")} className="text-xs text-accent font-body underline underline-offset-4">
                    Back
                  </button>
                </div>

                {/* Compact summary */}
                <div className="bg-card p-4 space-y-1 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="text-foreground">{isPrivate ? "Private" : "Small Group"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{format(parseISO(selectedTourDate.tour_date), "MMM d, yyyy")} · 9 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="text-foreground">{tickets}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-foreground font-heading text-xl">${total}</span>
                  </div>
                </div>

                {/* Form Fields — required only */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-body text-muted-foreground mb-2 tracking-wide uppercase">Full Name *</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={form.full_name}
                      onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-muted-foreground mb-2 tracking-wide uppercase">Email Address *</label>
                    <input
                      type="email"
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-muted-foreground mb-2 tracking-wide uppercase">Phone (WhatsApp preferred) *</label>
                    <input
                      type="tel"
                      maxLength={20}
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-muted-foreground mb-2 tracking-wide uppercase">Special Requests (optional)</label>
                    <textarea
                      maxLength={500}
                      value={form.special_requests}
                      onChange={(e) => setForm((p) => ({ ...p, special_requests: e.target.value }))}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50 resize-none"
                      rows={2}
                      placeholder="Mobility needs, dietary preferences, nationality, etc."
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={checks.tickets} onChange={(e) => setChecks((p) => ({ ...p, tickets: e.target.checked }))} className="mt-1 accent-accent" />
                    <span className="text-sm font-body text-muted-foreground">I understand entrance tickets are not included</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={checks.lunch} onChange={(e) => setChecks((p) => ({ ...p, lunch: e.target.checked }))} className="mt-1 accent-accent" />
                    <span className="text-sm font-body text-muted-foreground">I understand lunch is not included (paid directly at restaurant)</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={checks.cancellation} onChange={(e) => setChecks((p) => ({ ...p, cancellation: e.target.checked }))} className="mt-1 accent-accent" />
                    <span className="text-sm font-body text-muted-foreground">I agree to the <a href="/terms" className="underline underline-offset-2">cancellation policy</a> (full refund 48+ hours before)</span>
                  </label>
                </div>

                <button
                  onClick={handleSubmitBooking}
                  disabled={!allChecked || submitting}
                  className={`w-full py-5 text-sm tracking-[0.15em] uppercase font-body font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                    allChecked && !submitting
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {submitting ? "Processing..." : `Proceed to Secure Payment — $${total}`}
                </button>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/50 font-body">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</span>
                  <span>·</span>
                  <span>Powered by Stripe</span>
                  <span>·</span>
                  <span>No hidden fees</span>
                  <span>·</span>
                  <span>48h free cancellation</span>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-foreground font-body">Redirecting to secure payment...</p>
                <p className="text-muted-foreground/60 font-body text-xs mt-2">Your booking is being prepared</p>
              </div>
            )}
          </div>
        </div>

        {/* Optional Add-Ons */}
        <div className="mt-16 max-w-2xl mx-auto">
          <p className="text-center text-xs tracking-[0.2em] uppercase font-body text-muted-foreground/60 mb-6">
            Optional Add-Ons
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border p-4 text-center hover:border-accent/30 transition-colors">
              <Ticket className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-sm font-body text-foreground font-medium mb-1">Ticket Coordination</p>
              <p className="text-xs font-body text-muted-foreground">We'll help arrange your entrance tickets in advance</p>
            </div>
            <div className="border border-border p-4 text-center hover:border-accent/30 transition-colors">
              <Car className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-sm font-body text-foreground font-medium mb-1">Airport Pickup</p>
              <p className="text-xs font-body text-muted-foreground">Seamless transfer from Cairo International Airport</p>
            </div>
            <div className="border border-border p-4 text-center hover:border-accent/30 transition-colors">
              <Camera className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-sm font-body text-foreground font-medium mb-1">Pro Photographer</p>
              <p className="text-xs font-body text-muted-foreground">Professional photos at the Pyramids & Museum</p>
            </div>
          </div>
          <p className="text-center text-xs font-body text-muted-foreground/50 mt-3">
            Mention any add-ons in special requests — we'll follow up with details
          </p>
        </div>

        {/* Cancellation Policy */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-body text-foreground font-medium">Cancellation Policy</p>
          </div>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Full refund if cancelled 48+ hours before the tour. No refund within 48 hours. No refund for no-shows.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalendarBookingSection;
