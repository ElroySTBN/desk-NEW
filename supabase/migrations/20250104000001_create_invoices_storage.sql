-- ============================================================================
-- STORAGE BUCKET POUR FACTURES
-- ============================================================================
-- Ce fichier crée le bucket Supabase Storage pour les factures PDF
-- avec les politiques RLS appropriées

-- Créer le bucket si il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false, -- Privé par défaut
  5242880, -- 5MB max par fichier
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLITIQUES RLS POUR LE BUCKET
-- ============================================================================

-- Politique pour permettre l'upload aux utilisateurs authentifiés (leurs propres factures)
CREATE POLICY "Users can upload their own invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la lecture aux utilisateurs authentifiés (leurs propres fichiers)
CREATE POLICY "Users can view their own invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Users can update their own invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Users can delete their own invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- ✅ STORAGE CONFIGURÉ
-- ============================================================================

