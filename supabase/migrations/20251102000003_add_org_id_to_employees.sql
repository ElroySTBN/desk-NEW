-- ============================================================================
-- Add organization_id to employees table (keep client_id for compatibility)
-- ============================================================================

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'both' CHECK (delivery_type IN ('physical', 'digital', 'both'));

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);

COMMENT ON COLUMN public.employees.client_id IS 'DEPRECATED: Use organization_id instead';
COMMENT ON COLUMN public.employees.organization_id IS 'Modern foreign key to organizations table';
COMMENT ON COLUMN public.employees.delivery_type IS 'Type de livraison: physical (NFC physique), digital (QR code), both';

