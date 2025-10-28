-- Table onboarding
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'validated')),
  legal_info JSONB DEFAULT '{}'::jsonb,
  brand_identity JSONB DEFAULT '{}'::jsonb,
  target_audience JSONB DEFAULT '{}'::jsonb,
  communication JSONB DEFAULT '{}'::jsonb,
  history JSONB DEFAULT '{}'::jsonb,
  google_business JSONB DEFAULT '{}'::jsonb,
  visuals JSONB DEFAULT '{}'::jsonb,
  nfc_team JSONB DEFAULT '{}'::jsonb,
  follow_up JSONB DEFAULT '{}'::jsonb,
  validation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_onboarding_client_id ON public.onboarding(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding(status);

-- RLS (Row Level Security)
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire et écrire (pour le moment)
CREATE POLICY "Allow all access to onboarding" ON public.onboarding
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

