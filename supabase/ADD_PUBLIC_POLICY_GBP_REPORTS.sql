-- Script SQL pour créer la politique publique pour le bucket gbp-reports
-- À exécuter MANUELLEMENT dans le SQL Editor de Supabase après la migration 20250105000006_make_gbp_reports_public.sql
-- 
-- Ce script :
-- 1. Supprime l'ancienne politique privée "Users can view their own GBP reports" (si elle existe)
-- 2. Crée la nouvelle politique publique "Public can view GBP reports"
--
-- IMPORTANT: Exécutez ce script dans le SQL Editor de Supabase avec les privilèges appropriés

-- Supprimer l'ancienne politique privée (si elle existe)
DROP POLICY IF EXISTS "Users can view their own GBP reports" ON storage.objects;

-- Créer la politique publique pour permettre la lecture des rapports à tous
CREATE POLICY "Public can view GBP reports"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gbp-reports');

-- Vérification: Vérifier que la politique a été créée
SELECT 
  policyname, 
  cmd, 
  qual,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname = 'Public can view GBP reports';

