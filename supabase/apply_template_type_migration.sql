-- Script SQL pour ajouter la colonne template_type à gbp_report_templates
-- À exécuter manuellement dans Supabase Dashboard > SQL Editor
-- Date: 2025-01-06

-- Ajouter la colonne template_type si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gbp_report_templates' 
    AND column_name = 'template_type'
  ) THEN
    -- Ajouter la colonne avec une valeur par défaut
    ALTER TABLE public.gbp_report_templates 
    ADD COLUMN template_type TEXT NOT NULL DEFAULT 'gbp_report';
    
    -- Mettre à jour tous les enregistrements existants pour avoir template_type = 'gbp_report'
    UPDATE public.gbp_report_templates 
    SET template_type = 'gbp_report' 
    WHERE template_type IS NULL OR template_type = '';
    
    -- Ajouter une contrainte CHECK pour limiter les valeurs possibles
    ALTER TABLE public.gbp_report_templates
    ADD CONSTRAINT gbp_report_templates_template_type_check 
    CHECK (template_type IN ('gbp_report', 'audit_document', 'custom'));
    
    -- Ajouter un index pour améliorer les performances des requêtes filtrées par type
    CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_template_type 
    ON public.gbp_report_templates(user_id, template_type);
    
    -- Ajouter un commentaire pour documenter la colonne
    COMMENT ON COLUMN public.gbp_report_templates.template_type IS 
    'Type de template: gbp_report (rapports GBP), audit_document (documents d''audit), custom (template personnalisé)';
    
    RAISE NOTICE 'Colonne template_type ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne template_type existe déjà';
  END IF;
END $$;

