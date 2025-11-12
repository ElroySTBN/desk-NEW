-- Migration pour s'assurer que la table rapport_text_templates existe
-- Cette migration vérifie et crée la table si elle n'existe pas
-- Date: 2025-01-04

-- Créer la table rapport_text_templates si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.rapport_text_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Catégorie du template
  category TEXT NOT NULL CHECK (category IN ('vue_ensemble', 'appels', 'clics_web', 'itineraire')),
  
  -- Contexte (évolution)
  context TEXT NOT NULL CHECK (context IN ('positive_high', 'positive_moderate', 'stable', 'negative')),
  
  -- Template de texte avec variables
  template TEXT NOT NULL,
  
  -- Indicateur de template par défaut
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rapport_templates_user_id ON public.rapport_text_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_rapport_templates_category_context ON public.rapport_text_templates(category, context);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS rapport_text_templates_updated_at ON public.rapport_text_templates;
CREATE TRIGGER rapport_text_templates_updated_at
  BEFORE UPDATE ON public.rapport_text_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.rapport_text_templates ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own report templates" ON public.rapport_text_templates;
DROP POLICY IF EXISTS "Users can insert their own report templates" ON public.rapport_text_templates;
DROP POLICY IF EXISTS "Users can update their own report templates" ON public.rapport_text_templates;
DROP POLICY IF EXISTS "Users can delete their own report templates" ON public.rapport_text_templates;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own report templates"
  ON public.rapport_text_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own report templates"
  ON public.rapport_text_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report templates"
  ON public.rapport_text_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report templates"
  ON public.rapport_text_templates
  FOR DELETE
  USING (auth.uid() = user_id);

