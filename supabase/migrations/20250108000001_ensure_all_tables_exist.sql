-- ============================================================================
-- MIGRATION COMPLÈTE : S'assurer que toutes les tables nécessaires existent
-- ============================================================================
-- Date: 2025-01-08
-- Description: Crée toutes les tables manquantes pour que l'application fonctionne en local
-- Cette migration est idempotente et peut être exécutée plusieurs fois sans problème

-- ============================================================================
-- 1. FONCTION handle_updated_at (nécessaire pour les triggers)
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
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes pour gbp_report_templates
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_user_id ON public.gbp_report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_is_default ON public.gbp_report_templates(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_template_type ON public.gbp_report_templates(user_id, template_type);

-- Trigger pour updated_at sur gbp_report_templates
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
-- 3. TABLE rapports_gbp
-- ============================================================================
-- Vérifier d'abord si la table existe avec l'ancienne structure (mois, annee, type)
-- Si oui, la conserver et ajouter les colonnes manquantes si nécessaire
-- Sinon, créer la nouvelle structure (month, year, status)
DO $$ 
BEGIN
  -- Si la table n'existe pas du tout, la créer avec la nouvelle structure
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rapports_gbp'
  ) THEN
    CREATE TABLE public.rapports_gbp (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
      
      -- Informations du rapport (nouvelle structure)
      month INTEGER CHECK (month >= 1 AND month <= 12),
      year INTEGER CHECK (year >= 2020 AND year <= 2100),
      
      -- Ancienne structure pour compatibilité (mois, annee, type)
      mois TEXT,
      annee INTEGER,
      type TEXT CHECK (type IN ('5_mois', 'mensuel', 'complet')),
      
      -- Configuration du template utilisé
      template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
      
      -- Données du rapport (JSONB)
      report_data JSONB DEFAULT '{}'::jsonb,
      kpis JSONB DEFAULT '{}'::jsonb,
      
      -- URLs des fichiers
      pdf_url TEXT,
      screenshots JSONB DEFAULT '{}'::jsonb,
      
      -- Statut (nouvelle structure)
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
      
      -- Envoi email
      date_envoi TIMESTAMPTZ,
      email_envoye BOOLEAN DEFAULT FALSE,
      destinataire_email TEXT,
      
      -- Métadonnées
      created_by UUID REFERENCES auth.users(id),
      notes TEXT,
      date_generation TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    RAISE NOTICE 'Table rapports_gbp créée avec la nouvelle structure';
  ELSE
    -- Si la table existe, ajouter les colonnes manquantes
    ALTER TABLE public.rapports_gbp 
    ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month >= 1 AND month <= 12),
    ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year >= 2020 AND year <= 2100),
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS report_data JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived'));
    
    RAISE NOTICE 'Table rapports_gbp existe déjà, colonnes manquantes ajoutées';
  END IF;
END $$;

-- Indexes pour rapports_gbp
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON public.rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON public.rapports_gbp(client_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_month_year ON public.rapports_gbp(year, month);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_template_id ON public.rapports_gbp(template_id);

-- Trigger pour updated_at sur rapports_gbp
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
-- 4. VÉRIFIER ET CRÉER LA COLONNE template_type SI ELLE N'EXISTE PAS
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
    
    -- Ajouter la contrainte CHECK
    ALTER TABLE public.gbp_report_templates
    ADD CONSTRAINT gbp_report_templates_template_type_check
    CHECK (template_type IN ('gbp_report', 'audit_document', 'custom'));
    
    RAISE NOTICE 'Colonne template_type ajoutée à gbp_report_templates';
  END IF;
END $$;

-- ============================================================================
-- 5. NOTIFIER PostgREST POUR RECHARGER LE SCHÉMA
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

