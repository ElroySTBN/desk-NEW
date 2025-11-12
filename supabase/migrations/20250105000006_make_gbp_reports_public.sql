-- Rendre le bucket gbp-reports public pour permettre l'accès aux rapports PDF
-- Les politiques RLS restent en place pour la sécurité (seuls les utilisateurs authentifiés peuvent uploader)
-- Cette migration met à jour uniquement le bucket pour le rendre public
-- 
-- IMPORTANT: Après l'exécution de cette migration, vous devez créer manuellement la politique publique
-- via l'interface Supabase Storage ou via le SQL Editor avec cette commande:
-- 
-- CREATE POLICY "Public can view GBP reports"
--   ON storage.objects
--   FOR SELECT
--   TO public
--   USING (bucket_id = 'gbp-reports');
--
-- Et supprimer l'ancienne politique privée (si elle existe):
-- DROP POLICY IF EXISTS "Users can view their own GBP reports" ON storage.objects;

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
