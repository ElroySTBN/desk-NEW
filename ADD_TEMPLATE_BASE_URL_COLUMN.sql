-- Script SQL pour ajouter la colonne template_base_url à la table gbp_report_templates
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- Ajouter la colonne template_base_url si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'gbp_report_templates' 
        AND column_name = 'template_base_url'
    ) THEN
        ALTER TABLE public.gbp_report_templates 
        ADD COLUMN template_base_url TEXT;
    END IF;
END $$;

