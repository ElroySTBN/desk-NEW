-- Migration pour corriger les politiques RLS du bucket gbp-reports
-- Date: 2025-01-07
-- Cette migration corrige les politiques RLS pour permettre l'upload de PDFs sans erreur
-- et rend le bucket public pour permettre l'accès aux rapports

-- ============================================================================
-- ÉTAPE 1 : CRÉER/METTRE À JOUR LE BUCKET
-- ============================================================================

-- Créer le bucket gbp-reports s'il n'existe pas, ou le mettre à jour pour le rendre public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gbp-reports',
  'gbp-reports',
  true, -- Public pour permettre l'accès aux rapports
  52428800, -- 50 MB max par fichier
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- ÉTAPE 2 : SUPPRIMER TOUTES LES ANCIENNES POLITIQUES
-- ============================================================================

-- Supprimer toutes les anciennes politiques RLS pour le bucket gbp-reports
DROP POLICY IF EXISTS "Users can upload their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Public can view GBP reports" ON storage.objects;

-- ============================================================================
-- ÉTAPE 3 : CRÉER LES NOUVELLES POLITIQUES RLS
-- ============================================================================

-- Politique pour permettre l'upload aux utilisateurs authentifiés
-- Le chemin doit commencer par {user_id}/ pour que la politique fonctionne
-- Utiliser une approche plus simple et robuste avec split_part
CREATE POLICY "Users can upload their own GBP reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gbp-reports' AND
  (
    -- Vérifier que le premier segment du chemin correspond à l'ID de l'utilisateur
    split_part(name, '/', 1) = auth.uid()::text
  )
);

-- Politique pour permettre la lecture publique (bucket public)
-- Tout le monde peut lire les fichiers dans le bucket gbp-reports
CREATE POLICY "Public can view GBP reports"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gbp-reports');

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
-- Seuls les utilisateurs qui ont uploadé le fichier peuvent le mettre à jour
CREATE POLICY "Users can update their own GBP reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'gbp-reports' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
-- Seuls les utilisateurs qui ont uploadé le fichier peuvent le supprimer
CREATE POLICY "Users can delete their own GBP reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- ============================================================================
-- ÉTAPE 4 : VÉRIFIER LES POLITIQUES RLS SUR LA TABLE rapports_gbp
-- ============================================================================

-- Les politiques RLS pour la table rapports_gbp sont déjà créées dans la migration
-- 20250104000003_ensure_rapports_gbp_table.sql
-- Cette section vérifie simplement qu'elles existent et sont correctes

-- Note: Les politiques suivantes doivent exister :
-- - "Users can view their own GBP reports" (SELECT)
-- - "Users can insert their own GBP reports" (INSERT)
-- - "Users can update their own GBP reports" (UPDATE)
-- - "Users can delete their own GBP reports" (DELETE)

-- Si ces politiques n'existent pas, elles seront créées par la migration
-- 20250104000003_ensure_rapports_gbp_table.sql

-- ============================================================================
-- VÉRIFICATION : Afficher les politiques créées
-- ============================================================================

-- Afficher les politiques RLS pour le bucket gbp-reports
SELECT 
  policyname, 
  cmd, 
  qual,
  with_check,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%GBP reports%'
ORDER BY policyname;

-- Afficher les politiques RLS pour la table rapports_gbp
SELECT 
  policyname, 
  cmd, 
  qual,
  with_check,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'rapports_gbp'
ORDER BY policyname;

