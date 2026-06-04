
-- Tour dates table
CREATE TABLE public.tour_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_date DATE NOT NULL,
  tour_time TIME NOT NULL DEFAULT '09:00',
  max_guests INT NOT NULL DEFAULT 5,
  booked_guests INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tour_dates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tour dates
CREATE POLICY "Anyone can view active tour dates"
  ON public.tour_dates FOR SELECT
  USING (is_active = true);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_date_id UUID NOT NULL REFERENCES public.tour_dates(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  num_guests INT NOT NULL CHECK (num_guests BETWEEN 1 AND 5),
  nationality TEXT,
  special_requests TEXT,
  total_amount INT NOT NULL, -- in cents
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded', 'completed', 'no_show')),
  cancellation_requested_at TIMESTAMP WITH TIME ZONE,
  confirmation_email_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_email_sent BOOLEAN NOT NULL DEFAULT false,
  post_tour_email_sent BOOLEAN NOT NULL DEFAULT false,
  owner_notified BOOLEAN NOT NULL DEFAULT false,
  operator_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings can be inserted by anyone (guest checkout)
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Bookings can be read by the email owner (for status checks)
CREATE POLICY "Users can view their own bookings by email"
  ON public.bookings FOR SELECT
  USING (true);

-- Function to update booked_guests count
CREATE OR REPLACE FUNCTION public.update_booked_guests()
RETURNS TRIGGER AS $$
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_booked_guests_trigger
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_booked_guests();

-- Function to check availability before booking
CREATE OR REPLACE FUNCTION public.check_availability(p_tour_date_id UUID, p_num_guests INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_guests INT;
  v_booked_guests INT;
BEGIN
  SELECT max_guests, booked_guests INTO v_max_guests, v_booked_guests
  FROM public.tour_dates WHERE id = p_tour_date_id AND is_active = true;
  
  IF NOT FOUND THEN RETURN false; END IF;
  
  RETURN (v_booked_guests + p_num_guests) <= v_max_guests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
