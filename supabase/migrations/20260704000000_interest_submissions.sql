CREATE TABLE public.interest_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  group_size TEXT NOT NULL,
  experience TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.interest_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert interest submissions"
  ON public.interest_submissions FOR INSERT
  WITH CHECK (true);
