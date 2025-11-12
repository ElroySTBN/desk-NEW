-- Script SQL pour créer le bucket client-logos dans Supabase Storage
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- Créer le bucket client-logos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-logos',
  'client-logos',
  true, -- Public pour permettre l'affichage dans les rapports
  2097152, -- 2MB max par fichier
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own client logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own client logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own client logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own client logos" ON storage.objects;

-- Politique pour permettre la lecture publique (pour afficher les logos dans les rapports)
CREATE POLICY "Public can view logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'client-logos');

-- Politique pour permettre l'upload aux utilisateurs authentifiés (leurs propres logos)
CREATE POLICY "Users can upload their own client logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'client-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Users can update their own client logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'client-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Users can delete their own client logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'client-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

