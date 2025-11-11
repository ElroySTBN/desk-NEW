-- Add pdf_url column to invoices table if it doesn't exist
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.invoices.pdf_url IS 'URL du PDF de la facture stocké dans Supabase Storage';

