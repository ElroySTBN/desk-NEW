-- Migration pour garantir l'existence du bucket gbp-reports
-- Date: 2025-01-05
-- Cette migration crée le bucket s'il n'existe pas et s'assure que les politiques RLS sont correctes

-- Créer le bucket gbp-reports s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gbp-reports',
  'gbp-reports',
  false, -- Privé par défaut
  52428800, -- 50 MB max par fichier
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON storage.objects;

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Users can upload their own GBP reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la lecture aux utilisateurs authentifiés (leurs propres fichiers)
CREATE POLICY "Users can view their own GBP reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Users can update their own GBP reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Users can delete their own GBP reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

