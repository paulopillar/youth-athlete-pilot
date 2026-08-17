CREATE TABLE public.athletes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  full_name TEXT NOT NULL,
  birth_date DATE,
  category TEXT,
  position TEXT,
  dominant_foot TEXT,
  height_cm INTEGER,
  weight_kg NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.athletes TO authenticated;
GRANT ALL ON public.athletes TO service_role;

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own athletes" ON public.athletes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX athletes_user_id_idx ON public.athletes (user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON public.athletes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();