-- Migration : Ajout des champs fiscaux et séparation téléphone/portable
-- À exécuter dans le SQL Editor de Supabase

ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS siret TEXT,
  ADD COLUMN IF NOT EXISTS tva_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS phone_mobile TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT;

-- Vérification (optionnel)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN ('siret', 'tva_number', 'billing_address', 'postal_code', 'city');

