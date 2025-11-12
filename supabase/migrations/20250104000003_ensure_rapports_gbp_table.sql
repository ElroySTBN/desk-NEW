-- Migration pour s'assurer que la table rapports_gbp existe
-- Cette migration vérifie et crée la table si elle n'existe pas
-- Date: 2025-01-04

-- Fonction handle_updated_at (si elle n'existe pas)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer la table rapports_gbp si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.rapports_gbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Type de rapport
  type TEXT NOT NULL CHECK (type IN ('5_mois', 'mensuel', 'complet')),
  
  -- Période
  mois TEXT NOT NULL, -- Ex: "Octobre" ou "Juin-Octobre"
  annee INTEGER NOT NULL,
  date_generation TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- KPIs stockés en JSONB
  kpis JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Fichiers
  pdf_url TEXT NOT NULL, -- Lien Supabase Storage ou URL externe
  screenshots JSONB DEFAULT '{}'::jsonb, -- URLs des 4 screenshots
  
  -- Envoi email
  date_envoi TIMESTAMPTZ,
  email_envoye BOOLEAN DEFAULT FALSE,
  destinataire_email TEXT,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON public.rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON public.rapports_gbp(client_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_annee_mois ON public.rapports_gbp(annee, mois);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_date_generation ON public.rapports_gbp(date_generation);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS rapports_gbp_updated_at ON public.rapports_gbp;
CREATE TRIGGER rapports_gbp_updated_at
  BEFORE UPDATE ON public.rapports_gbp
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.rapports_gbp ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own GBP reports" ON public.rapports_gbp;
DROP POLICY IF EXISTS "Users can insert their own GBP reports" ON public.rapports_gbp;
DROP POLICY IF EXISTS "Users can update their own GBP reports" ON public.rapports_gbp;
DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON public.rapports_gbp;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own GBP reports"
  ON public.rapports_gbp
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GBP reports"
  ON public.rapports_gbp
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GBP reports"
  ON public.rapports_gbp
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GBP reports"
  ON public.rapports_gbp
  FOR DELETE
  USING (auth.uid() = user_id);

