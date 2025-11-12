-- Migration pour s'assurer que la table gbp_report_templates existe
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

-- Créer la table gbp_report_templates si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.gbp_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nom du template
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template par défaut
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Structure du template (JSONB)
  -- Contient la configuration de placement des éléments :
  -- - pages: array de pages avec leurs éléments
  -- - kpi_placements: où placer chaque KPI
  -- - screenshot_placements: où placer chaque screenshot
  -- - text_sections: sections de texte avec variables
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_user_id ON public.gbp_report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_is_default ON public.gbp_report_templates(user_id, is_default) WHERE is_default = TRUE;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS gbp_report_templates_updated_at ON public.gbp_report_templates;
CREATE TRIGGER gbp_report_templates_updated_at
  BEFORE UPDATE ON public.gbp_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.gbp_report_templates ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own GBP report templates" ON public.gbp_report_templates;
DROP POLICY IF EXISTS "Users can insert their own GBP report templates" ON public.gbp_report_templates;
DROP POLICY IF EXISTS "Users can update their own GBP report templates" ON public.gbp_report_templates;
DROP POLICY IF EXISTS "Users can delete their own GBP report templates" ON public.gbp_report_templates;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own GBP report templates"
  ON public.gbp_report_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GBP report templates"
  ON public.gbp_report_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GBP report templates"
  ON public.gbp_report_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GBP report templates"
  ON public.gbp_report_templates
  FOR DELETE
  USING (auth.uid() = user_id);

