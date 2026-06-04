

# Product Overhaul: Iconic Giza & Grand Egyptian Museum Experience

This is a comprehensive update that replaces the old two-destination, 1.5-hour "Cairo Story Walk" with a single 6-hour "Iconic Giza & Grand Egyptian Museum Experience." Every layer of the application is affected: frontend content, booking logic, pricing, backend functions, email templates, and database records.

---

## New Stripe Prices Required (Manual Step)

Before implementation, you need to create three new Stripe price objects in your Stripe dashboard:

| Product | Price | Type |
|---------|-------|------|
| Small Group — Regular | $79/person | One-time |
| Small Group — Founders Rate | $59/person | One-time |
| Private Experience | $349 flat | One-time |

You will need to provide the new Stripe Price IDs so they can be wired into the checkout function. The old $59/$39/$250 prices will be replaced.

---

## Database Changes

1. **Deactivate all mosque tour_dates** — set `is_active = false` for every row where `destination = 'mosque'`.
2. **Deactivate all 3:00 PM slots** — set `is_active = false` for rows where `tour_time = '15:00:00'`.
3. **Update remaining pyramids rows** — change `destination` to `'giza_gem'` (or keep `'pyramids'` and just update labels everywhere; keeping `'pyramids'` is simpler and avoids a migration). We will keep `'pyramids'` as the database value and update all display labels.
4. **Ensure daily availability** — the existing pyramids rows already cover Sat/Mon/Wed at 9 AM. New rows need to be inserted for the missing days (Sun/Tue/Thu/Fri) going forward. This can be done via the admin dashboard or a data insert.

No schema migration is needed — only data updates.

---

## Frontend Changes

### 1. HeroSection.tsx
- Change tour name from "Cairo Story Walk" to "Iconic Giza & Grand Egyptian Museum Experience"
- Update subtitle from "Small Group Experience" to reflect the new product
- Change duration from "1.5 Hours" to "6 Hours"
- Update pricing stats: $79/person (was $59), Founders Rate $59 (was $39), add "Transport Included" indicator
- Update tagline to emphasize Giza + GEM

### 2. PlacesSection.tsx
- Replace the Mosque of Muhammad Ali entry with "The Grand Egyptian Museum"
- Update description to cover the GEM (world's largest archaeological museum, 100,000+ artifacts, Tutankhamun collection)
- Need a new image asset for the GEM (can use a placeholder or the existing museum-experience.jpg initially)

### 3. PricingSection.tsx
- Small Group: $79/person (was $59), Founders Rate $59 (was $39)
- Private: $349 flat (was $250)
- Add "Transportation included" to both cards
- Remove "Tour runs only when 5 guests are confirmed" — the new tour has guaranteed departure for both types
- Update bullet points to reflect 6-hour itinerary

### 4. CalendarBookingSection.tsx (major rewrite)
- **Remove destination toggle entirely** — there is only one tour now
- Remove `Destination` type, state, and all destination-related logic
- Remove `DESTINATION_LABELS` constant
- Update pricing constants: `PRICE_PER_PERSON = 79`, `FOUNDERS_PRICE_PER_PERSON = 59`, `PRIVATE_FLAT_PRICE = 349`
- Remove `TIME_LABELS` map (only 9:00 AM exists) — display "9:00 AM" directly
- Since there is only one time slot per day, auto-select it when a date is picked (skip the slot selection step)
- Update the info banner: "$79/guest" and "Guaranteed departure" for both types
- Update checkboxes: "transport is included" changes to acknowledge that entrance tickets and lunch are not included
- Remove "Tour runs only when 5 guests are confirmed" note — guaranteed departure
- Hardcode `destination: "pyramids"` when calling create-checkout (for backward compatibility)

### 5. IncludedSection.tsx
- Update included list: "6-hour guided experience", "Transportation (pickup & drop-off)", "Storytelling and cultural insights", "Photo moments at Giza & GEM", "Personalized interaction"
- Update not included: "Entrance tickets", "Lunch", "Personal expenses"
- Remove the "Guests arrange their own transportation" note

### 6. FAQSection.tsx
- Remove/update mosque-specific dress code answer
- Update "Is this a private tour?" answer to reflect both options
- Add FAQ about the itinerary/schedule (pickup, Pyramids, lunch, GEM, drop-off)
- Add FAQ about transportation details
- Update entrance tickets answer

### 7. TrustSection.tsx
- Update Ahmed K.'s review to reference the GEM instead of "Islamic Cairo"
- Minor copy adjustments

### 8. ScarcitySection.tsx
- No major changes needed, copy still applies

### 9. WhatSetsUsApartSection.tsx
- No changes needed — content is generic enough

### 10. BookingSuccess.tsx
- Remove `DESTINATION_LABELS` and destination display row
- Update "Cairo Story Walk" references to new tour name
- Remove "Tour runs once 5 seats are confirmed" note — guaranteed departure
- Update duration reference

### 11. Terms.tsx
- Update pricing from "$59 USD per person" to "$79 USD per person for Small Group, $349 flat for Private"
- Update "What's Not Included" to mention lunch and remove transport
- Add note that transportation is included

### 12. Footer.tsx
- Update tagline from "Intimate Cairo experiences" to reflect new product

### 13. Index.tsx
- No structural changes — same section order

---

## Backend (Edge Function) Changes

### 14. create-checkout/index.ts
- Update price IDs to new Stripe prices (user must provide these)
- Change `PRICE_PER_PERSON` logic: regular = $79 (7900 cents), founders = $59 (5900 cents), private = $349 (34900 cents)
- Remove destination validation — accept only `"pyramids"` or make it optional/default
- Hardcode destination to `"pyramids"` if not provided
- Remove the "minimum 5 guests required" concept — guaranteed departure for both types

### 15. send-booking-emails/index.ts
- Remove `DESTINATION_LABELS`
- Update tour name from "Cairo Story Walk" to "Iconic Giza & Grand Egyptian Museum Experience"
- Remove destination row from email templates
- Update duration from "1 hour" to "6 hours"
- Add "Transportation included" to confirmation email
- Add itinerary summary to confirmation email

### 16. admin-actions/index.ts
- Remove `DESTINATION_LABELS` (or update to single label)
- Update email copy from "Cairo Story Walk" to new name

### 17. check-tour-status/index.ts
- Remove `DESTINATION_LABELS`
- Update email copy
- Since guaranteed departure, this function's "minimum not reached" logic may need adjustment — but keeping it for small group edge cases is still valid

### 18. Admin.tsx
- Remove `DESTINATION_LABELS` or update to single entry
- Remove `TIME_LABELS` for 3:00 PM (only 9:00 AM exists)
- The admin dashboard structure remains the same

### 19. stripe-webhook/index.ts
- No changes needed (already generic)

### 20. verify-payment/index.ts
- No changes needed

---

## Data Operations (via insert tool)

1. Deactivate all mosque tour_dates:
   ```sql
   UPDATE tour_dates SET is_active = false WHERE destination = 'mosque';
   ```

2. Deactivate all 3:00 PM slots:
   ```sql
   UPDATE tour_dates SET is_active = false WHERE tour_time = '15:00:00';
   ```

3. Insert daily 9:00 AM slots for the next 30 days for days that don't already have a pyramids/9AM slot (to ensure daily availability).

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | New tour name, 6hr duration, updated pricing |
| `src/components/PlacesSection.tsx` | Replace Mosque with Grand Egyptian Museum |
| `src/components/PricingSection.tsx` | $79/$59 founders, $349 private, transport included |
| `src/components/CalendarBookingSection.tsx` | Remove destination toggle, single tour, new prices, auto-select slot |
| `src/components/IncludedSection.tsx` | Transport included, lunch not included |
| `src/components/FAQSection.tsx` | Updated answers for new tour structure |
| `src/components/TrustSection.tsx` | Updated review copy |
| `src/pages/BookingSuccess.tsx` | Remove destination, update tour name |
| `src/pages/Terms.tsx` | Updated pricing and inclusions |
| `src/pages/Admin.tsx` | Remove multi-destination labels |
| `src/components/Footer.tsx` | Updated tagline |
| `supabase/functions/create-checkout/index.ts` | New price IDs, new amounts, remove destination validation |
| `supabase/functions/send-booking-emails/index.ts` | New tour name, remove destination, updated emails |
| `supabase/functions/admin-actions/index.ts` | Remove destination labels, update copy |
| `supabase/functions/check-tour-status/index.ts` | Remove destination labels, update copy |
| Database (data update) | Deactivate mosque rows, deactivate 3PM slots, insert missing daily slots |

---

## Blocker: New Stripe Price IDs

Before implementation can begin on the checkout function, you will need to create the three new prices in Stripe and share the Price IDs. Everything else can proceed in parallel.

