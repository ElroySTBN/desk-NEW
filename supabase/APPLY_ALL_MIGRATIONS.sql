-- ============================================================================
-- SCRIPT SQL COMPLET : Créer toutes les tables nécessaires pour l'application
-- ============================================================================
-- ⚠️ INSTRUCTIONS IMPORTANTES :
-- 1. Copiez TOUT ce fichier dans le SQL Editor de Supabase
-- 2. Exécutez-le en une seule fois
-- 3. Ce script est idempotent et peut être exécuté plusieurs fois sans problème
-- ============================================================================

-- ============================================================================
-- 1. FONCTION handle_updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLE gbp_report_templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gbp_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  template_type TEXT DEFAULT 'gbp_report',
  template_base_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter template_type si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gbp_report_templates' 
    AND column_name = 'template_type'
  ) THEN
    ALTER TABLE public.gbp_report_templates 
    ADD COLUMN template_type TEXT DEFAULT 'gbp_report';
  END IF;
END $$;

-- Contrainte CHECK sur template_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gbp_report_templates_template_type_check'
  ) THEN
    ALTER TABLE public.gbp_report_templates
    ADD CONSTRAINT gbp_report_templates_template_type_check
    CHECK (template_type IN ('gbp_report', 'audit_document', 'custom'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_user_id ON public.gbp_report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_is_default ON public.gbp_report_templates(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_template_type ON public.gbp_report_templates(user_id, template_type);

-- Trigger
DROP TRIGGER IF EXISTS gbp_report_templates_updated_at ON public.gbp_report_templates;
CREATE TRIGGER gbp_report_templates_updated_at
  BEFORE UPDATE ON public.gbp_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.gbp_report_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can view their own GBP report templates"
  ON public.gbp_report_templates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can insert their own GBP report templates"
  ON public.gbp_report_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can update their own GBP report templates"
  ON public.gbp_report_templates FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can delete their own GBP report templates"
  ON public.gbp_report_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TABLE rapports_gbp
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rapports_gbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  -- Structure ancienne (pour compatibilité)
  type TEXT CHECK (type IN ('5_mois', 'mensuel', 'complet')),
  mois TEXT,
  annee INTEGER,
  date_generation TIMESTAMPTZ DEFAULT NOW(),
  
  -- Structure nouvelle
  month INTEGER CHECK (month >= 1 AND month <= 12),
  year INTEGER CHECK (year >= 2020 AND year <= 2100),
  template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
  report_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
  
  -- Données
  kpis JSONB DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  screenshots JSONB DEFAULT '{}'::jsonb,
  
  -- Email
  date_envoi TIMESTAMPTZ,
  email_envoye BOOLEAN DEFAULT FALSE,
  destinataire_email TEXT,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rapports_gbp') THEN
    ALTER TABLE public.rapports_gbp 
    ADD COLUMN IF NOT EXISTS month INTEGER,
    ADD COLUMN IF NOT EXISTS year INTEGER,
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS report_data JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON public.rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON public.rapports_gbp(client_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_month_year ON public.rapports_gbp(year, month) WHERE year IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_annee_mois ON public.rapports_gbp(annee, mois) WHERE annee IS NOT NULL;

-- Trigger
DROP TRIGGER IF EXISTS rapports_gbp_updated_at ON public.rapports_gbp;
CREATE TRIGGER rapports_gbp_updated_at
  BEFORE UPDATE ON public.rapports_gbp
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.rapports_gbp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can view their own GBP reports"
  ON public.rapports_gbp FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can insert their own GBP reports"
  ON public.rapports_gbp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can update their own GBP reports"
  ON public.rapports_gbp FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can delete their own GBP reports"
  ON public.rapports_gbp FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. NOTIFIER PostgREST POUR RECHARGER LE SCHÉMA
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- ✅ SCRIPT TERMINÉ
-- ============================================================================
-- Après avoir exécuté ce script, rechargez votre application dans le navigateur
-- Les erreurs devraient disparaître !
