-- Script SQL pour créer le bucket gbp-templates dans Supabase Storage
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- Créer le bucket gbp-templates s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gbp-templates',
  'gbp-templates',
  true,
  52428800, -- 50 MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload their own templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own templates" ON storage.objects;

-- RLS Policies pour le bucket gbp-templates
CREATE POLICY "Users can upload their own templates"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own templates"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own templates"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own templates"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

