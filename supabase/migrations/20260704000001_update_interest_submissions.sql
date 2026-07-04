ALTER TABLE public.interest_submissions
  ALTER COLUMN experience DROP NOT NULL,
  ALTER COLUMN group_size DROP NOT NULL,
  ALTER COLUMN preferred_date DROP NOT NULL;

ALTER TABLE public.interest_submissions
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS form_type TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS number_of_clients TEXT;
