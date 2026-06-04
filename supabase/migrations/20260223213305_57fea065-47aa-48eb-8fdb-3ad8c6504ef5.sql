
-- Add min_guests and tour_status to tour_dates
ALTER TABLE public.tour_dates 
  ADD COLUMN IF NOT EXISTS min_guests integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS tour_status text NOT NULL DEFAULT 'open';

-- Unique constraint: prevent duplicate active bookings per email/date/destination
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_email_date 
  ON public.bookings (email, tour_date_id, destination) 
  WHERE status NOT IN ('cancelled', 'refunded');

-- Update check_availability to block cancelled/minimum_not_reached dates
CREATE OR REPLACE FUNCTION public.check_availability(p_tour_date_id uuid, p_num_guests integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_max_guests INT;
  v_booked_guests INT;
  v_tour_status TEXT;
BEGIN
  SELECT max_guests, booked_guests, tour_status INTO v_max_guests, v_booked_guests, v_tour_status
  FROM public.tour_dates WHERE id = p_tour_date_id AND is_active = true;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_tour_status IN ('cancelled', 'minimum_not_reached') THEN RETURN false; END IF;
  RETURN (v_booked_guests + p_num_guests) <= v_max_guests;
END;
$$;

-- Updated trigger: auto-confirm tour when min_guests reached
CREATE OR REPLACE FUNCTION public.update_booked_guests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_total INT;
  v_min_guests INT;
  v_tour_status TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.tour_dates SET booked_guests = booked_guests + NEW.num_guests WHERE id = NEW.tour_date_id;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE public.tour_dates SET booked_guests = booked_guests + NEW.num_guests WHERE id = NEW.tour_date_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'refunded') THEN
      UPDATE public.tour_dates SET booked_guests = GREATEST(0, booked_guests - OLD.num_guests) WHERE id = NEW.tour_date_id;
    END IF;
  END IF;
  -- Auto-confirm tour when min reached
  IF NEW.status = 'confirmed' THEN
    SELECT booked_guests, min_guests, tour_status INTO v_new_total, v_min_guests, v_tour_status
    FROM public.tour_dates WHERE id = NEW.tour_date_id;
    IF v_tour_status = 'open' AND v_new_total >= v_min_guests THEN
      UPDATE public.tour_dates SET tour_status = 'confirmed' WHERE id = NEW.tour_date_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_booked_guests ON public.bookings;
CREATE TRIGGER trigger_update_booked_guests
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_booked_guests();
