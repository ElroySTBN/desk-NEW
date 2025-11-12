-- Rendre le bucket gbp-reports public pour permettre l'accès aux rapports PDF
-- Les politiques RLS restent en place pour la sécurité (seuls les utilisateurs authentifiés peuvent uploader)

-- Mettre à jour le bucket pour le rendre public
UPDATE storage.buckets
SET public = true
WHERE id = 'gbp-reports';

-- Si le bucket n'existe pas, le créer comme public
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

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON storage.objects;
DROP POLICY IF EXISTS "Public can view GBP reports" ON storage.objects;

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Users can upload their own GBP reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la lecture publique des rapports (bucket public)
CREATE POLICY "Public can view GBP reports"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'gbp-reports'
);

-- Politique pour permettre la suppression aux utilisateurs authentifiés (leurs propres fichiers)
CREATE POLICY "Users can delete their own GBP reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés (leurs propres fichiers)
CREATE POLICY "Users can update their own GBP reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gbp-reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Public can view GBP reports" ON storage.objects IS 
'Permet l''accès public en lecture aux rapports GBP (bucket public)';

