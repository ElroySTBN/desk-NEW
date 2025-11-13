-- ============================================================================
-- SCRIPT COMPLET POUR APPLIQUER TOUTES LES MIGRATIONS MANQUANTES
-- ============================================================================
-- Ce script crée toutes les tables et colonnes manquantes nécessaires
-- pour que l'application fonctionne correctement en local
-- ============================================================================
-- Date: 2025-01-08
-- Instructions: Exécutez ce script dans Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CRÉER LA FONCTION handle_updated_at (si elle n'existe pas)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CRÉER LA TABLE gbp_report_templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gbp_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nom du template
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template par défaut
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Type de template
  template_type TEXT DEFAULT 'gbp_report' CHECK (template_type IN ('gbp_report', 'audit_document', 'custom')),
  
  -- URL du template de base (PDF ou image uploadé dans Supabase Storage)
  template_base_url TEXT,
  
  -- Structure du template (JSONB)
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes pour gbp_report_templates
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_user_id ON public.gbp_report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_is_default ON public.gbp_report_templates(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_template_type ON public.gbp_report_templates(template_type);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS gbp_report_templates_updated_at ON public.gbp_report_templates;
CREATE TRIGGER gbp_report_templates_updated_at
  BEFORE UPDATE ON public.gbp_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies pour gbp_report_templates
ALTER TABLE public.gbp_report_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can view their own GBP report templates"
  ON public.gbp_report_templates
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can insert their own GBP report templates"
  ON public.gbp_report_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can update their own GBP report templates"
  ON public.gbp_report_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can delete their own GBP report templates"
  ON public.gbp_report_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. CRÉER LA TABLE rapports_gbp
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rapports_gbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Informations du rapport
  title TEXT NOT NULL,
  description TEXT,
  
  -- Période du rapport
  report_month INTEGER NOT NULL CHECK (report_month >= 1 AND report_month <= 12),
  report_year INTEGER NOT NULL CHECK (report_year >= 2020),
  
  -- Template utilisé
  template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
  
  -- Données du rapport (JSONB)
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- URL du PDF généré
  pdf_url TEXT,
  
  -- Statut
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  generated_at TIMESTAMPTZ,
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(user_id, client_id, report_month, report_year)
);

-- Indexes pour rapports_gbp
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON public.rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON public.rapports_gbp(client_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_template_id ON public.rapports_gbp(template_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_month_year ON public.rapports_gbp(report_month, report_year);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_status ON public.rapports_gbp(status);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS rapports_gbp_updated_at ON public.rapports_gbp;
CREATE TRIGGER rapports_gbp_updated_at
  BEFORE UPDATE ON public.rapports_gbp
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies pour rapports_gbp
ALTER TABLE public.rapports_gbp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can view their own GBP reports"
  ON public.rapports_gbp
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can insert their own GBP reports"
  ON public.rapports_gbp
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can update their own GBP reports"
  ON public.rapports_gbp
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can delete their own GBP reports"
  ON public.rapports_gbp
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. AJOUTER LA COLONNE template_type À gbp_report_templates (si elle n'existe pas)
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gbp_report_templates' 
    AND column_name = 'template_type'
  ) THEN
    ALTER TABLE public.gbp_report_templates
    ADD COLUMN template_type TEXT DEFAULT 'gbp_report' NOT NULL;
    
    -- Mettre à jour les templates existants
    UPDATE public.gbp_report_templates
    SET template_type = 'gbp_report'
    WHERE template_type IS NULL;
    
    -- Ajouter la contrainte CHECK
    ALTER TABLE public.gbp_report_templates
    ADD CONSTRAINT chk_template_type CHECK (template_type IN ('gbp_report', 'audit_document', 'custom'));
    
    -- Créer un index
    CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_template_type ON public.gbp_report_templates(template_type);
    
    RAISE NOTICE 'Colonne template_type ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne template_type existe déjà';
  END IF;
END $$;

-- ============================================================================
-- 5. VÉRIFIER ET CRÉER LES BUCKETS STORAGE (si nécessaire)
-- ============================================================================
-- Note: Les buckets doivent être créés manuellement dans Supabase Dashboard
-- Cette section vérifie seulement que les buckets existent

-- ============================================================================
-- 6. CRÉER LES FONCTIONS UTILES (si elles n'existent pas)
-- ============================================================================

-- Fonction pour vérifier si une table existe
CREATE OR REPLACE FUNCTION public.table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON public.gbp_report_templates TO authenticated;
GRANT ALL ON public.rapports_gbp TO authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- 8. FORCER LE RECHARGEMENT DU CACHE SCHEMA (pour PostgREST)
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Vérification: Afficher les tables créées
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('gbp_report_templates', 'rapports_gbp')
ORDER BY table_name;

