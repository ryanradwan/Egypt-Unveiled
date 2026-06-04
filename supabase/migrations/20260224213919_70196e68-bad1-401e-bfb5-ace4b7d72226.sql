
-- Change default min_guests from 5 to 3 for small group policy
ALTER TABLE public.tour_dates ALTER COLUMN min_guests SET DEFAULT 3;

-- Update all existing active open tour dates to use min_guests = 3
UPDATE public.tour_dates SET min_guests = 3 WHERE is_active = true;
