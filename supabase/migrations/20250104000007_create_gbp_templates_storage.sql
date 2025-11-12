-- Migration pour créer le bucket de stockage des templates GBP
-- Date: 2025-01-04

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

-- RLS Policies pour le bucket gbp-templates
CREATE POLICY "Users can upload their own templates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own templates"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own templates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own templates"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'gbp-templates' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

