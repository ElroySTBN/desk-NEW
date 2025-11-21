-- ============================================================================
-- MIGRATION INCRÉMENTALE - Ajout des colonnes manquantes
-- ============================================================================
-- Ce script ajoute UNIQUEMENT les colonnes Agency OS à la table clients existante
-- À exécuter AVANT le SUPABASE_MASTER_SETUP.sql

-- Ajouter les colonnes manquantes à la table clients
DO $$ 
BEGIN
  -- Ajouter logo_url si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'logo_url') THEN
    ALTER TABLE public.clients ADD COLUMN logo_url TEXT;
    RAISE NOTICE 'Colonne logo_url ajoutée';
  END IF;

  -- Ajouter liens_rapides si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'liens_rapides') THEN
    ALTER TABLE public.clients ADD COLUMN liens_rapides JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Colonne liens_rapides ajoutée';
  END IF;

  -- Ajouter magic_link_token si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'magic_link_token') THEN
    ALTER TABLE public.clients ADD COLUMN magic_link_token UUID DEFAULT gen_random_uuid() UNIQUE;
    RAISE NOTICE 'Colonne magic_link_token ajoutée';
  END IF;

  -- Ajouter onboarding_status si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'onboarding_status') THEN
    ALTER TABLE public.clients ADD COLUMN onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'sent_to_client', 'validated', 'completed')) DEFAULT 'pending';
    RAISE NOTICE 'Colonne onboarding_status ajoutée';
  END IF;

  -- Ajouter lifecycle_stage si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'lifecycle_stage') THEN
    ALTER TABLE public.clients ADD COLUMN lifecycle_stage TEXT CHECK (lifecycle_stage IN ('lead', 'audit', 'onboarding', 'production', 'churn')) DEFAULT 'lead';
    RAISE NOTICE 'Colonne lifecycle_stage ajoutée';
  END IF;
END $$;

-- Créer les index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_clients_magic_link_token ON public.clients(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_clients_lifecycle_stage ON public.clients(lifecycle_stage);

-- Créer les nouvelles tables (brand_dna et audits)
CREATE TABLE IF NOT EXISTS public.brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  visual_identity JSONB DEFAULT '{}'::jsonb,
  tone_of_voice JSONB DEFAULT '{}'::jsonb,
  target_avatar JSONB DEFAULT '{}'::jsonb,
  services_focus JSONB DEFAULT '{}'::jsonb,
  key_info JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_dna_client_id ON public.brand_dna(client_id);

CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  url TEXT,
  status TEXT,
  overall_score NUMERIC,
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audits_client_id ON public.audits(client_id);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON public.audits(user_id);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Policies pour brand_dna
DROP POLICY IF EXISTS "Users can manage brand_dna via clients" ON public.brand_dna;
CREATE POLICY "Users can manage brand_dna via clients" ON public.brand_dna FOR ALL 
USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- Policies pour audits
DROP POLICY IF EXISTS "Users can manage own data" ON public.audits;
CREATE POLICY "Users can manage own data" ON public.audits FOR ALL USING (auth.uid() = user_id);

-- Trigger pour brand_dna
DROP TRIGGER IF EXISTS update_brand_dna_updated_at ON public.brand_dna;
CREATE TRIGGER update_brand_dna_updated_at BEFORE UPDATE ON public.brand_dna
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'clients'
  AND column_name IN ('logo_url', 'liens_rapides', 'magic_link_token', 'onboarding_status', 'lifecycle_stage')
ORDER BY column_name;

-- ============================================================================
-- ✅ MIGRATION TERMINÉE
-- ============================================================================
-- Maintenant tu peux exécuter SUPABASE_MASTER_SETUP.sql
-- ============================================================================
