-- Migration pour créer le système de templates configurable pour les rapports GBP
-- Cette migration vérifie et crée la table si elle n'existe pas
-- Date: 2025-01-04

-- Table pour stocker les templates de rapports GBP
CREATE TABLE IF NOT EXISTS public.gbp_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nom du template
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template par défaut
  is_default BOOLEAN DEFAULT FALSE,
  
  -- URL du template de base (PDF ou image uploadé dans Supabase Storage)
  template_base_url TEXT,
  
  -- Structure du template (JSONB)
  -- Contient la configuration de placement des éléments :
  -- - pages: array de pages avec leurs éléments
  -- - variable_zones: zones définies sur le template avec position, taille, variable associée
  --   Ex: [{ "id": "client_name", "x": 100, "y": 50, "width": 200, "height": 30, "variable": "client.name" }]
  -- - kpi_placements: où placer chaque KPI
  -- - screenshot_placements: où placer chaque screenshot
  -- - text_sections: sections de texte avec variables
  -- - fixed_content: contenu fixe qui ne change pas entre clients
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Exemple de structure template_config:
  -- {
  --   "pages": [
  --     {
  --       "type": "cover",
  --       "elements": [
  --         {"type": "title", "value": "Rapport GBP"},
  --         {"type": "client_logo", "position": "top-right"},
  --         {"type": "client_name", "variable": "client.name"}
  --       ]
  --     },
  --     {
  --       "type": "kpi",
  --       "elements": [
  --         {"type": "kpi", "kpi_type": "vue_ensemble", "position": {"x": 0, "y": 0}},
  --         {"type": "screenshot", "screenshot_type": "vue_ensemble", "position": {"x": 0, "y": 200}}
  --       ]
  --     }
  --   ],
  --   "kpi_placements": {
  --     "vue_ensemble": {"page": 2, "position": {"x": 0, "y": 0}},
  --     "appels": {"page": 3, "position": {"x": 0, "y": 0}}
  --   },
  --   "screenshot_placements": {
  --     "vue_ensemble": {"page": 2, "position": {"x": 0, "y": 200}},
  --     "appels": {"page": 3, "position": {"x": 0, "y": 200}}
  --   }
  -- }
  
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

-- Insérer un template par défaut pour chaque utilisateur existant
-- (sera créé lors de la première utilisation via l'interface)

