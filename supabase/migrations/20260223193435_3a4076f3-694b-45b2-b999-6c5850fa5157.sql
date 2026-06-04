
ALTER TABLE public.bookings ADD COLUMN experience_type text NOT NULL DEFAULT 'small_group';
ALTER TABLE public.bookings ADD COLUMN destination text NOT NULL DEFAULT 'pyramids';
ALTER TABLE public.tour_dates ADD COLUMN destination text NOT NULL DEFAULT 'pyramids';
