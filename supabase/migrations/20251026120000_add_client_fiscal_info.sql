-- Add fiscal information fields to clients table
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS siret TEXT,
  ADD COLUMN IF NOT EXISTS tva_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS phone_mobile TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.clients.siret IS 'Numéro SIRET de l''entreprise cliente';
COMMENT ON COLUMN public.clients.tva_number IS 'Numéro de TVA intracommunautaire';
COMMENT ON COLUMN public.clients.billing_address IS 'Adresse de facturation (rue)';
COMMENT ON COLUMN public.clients.postal_code IS 'Code postal';
COMMENT ON COLUMN public.clients.city IS 'Ville';
COMMENT ON COLUMN public.clients.phone_mobile IS 'Numéro de téléphone portable';
COMMENT ON COLUMN public.clients.client_type IS 'Type de client (Professionnel/Particulier)';

