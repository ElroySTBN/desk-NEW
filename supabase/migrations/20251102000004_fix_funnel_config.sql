-- ============================================================================
-- Fix review_funnel_config column names to match application code
-- ============================================================================

-- Add missing columns if they don't exist
ALTER TABLE public.review_funnel_config
ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT TRUE;

ALTER TABLE public.review_funnel_config
ADD COLUMN IF NOT EXISTS show_company_name BOOLEAN DEFAULT TRUE;

ALTER TABLE public.review_funnel_config
ADD COLUMN IF NOT EXISTS custom_url_slug VARCHAR(255);

-- Drop old columns if they exist
ALTER TABLE public.review_funnel_config
DROP COLUMN IF EXISTS display_logo;

ALTER TABLE public.review_funnel_config
DROP COLUMN IF EXISTS display_company_name;

ALTER TABLE public.review_funnel_config
DROP COLUMN IF EXISTS url_slug;

-- Create unique index on custom_url_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_funnel_config_custom_url_slug 
ON public.review_funnel_config(custom_url_slug) 
WHERE custom_url_slug IS NOT NULL;

-- Create index on client_id if missing
CREATE INDEX IF NOT EXISTS idx_review_funnel_config_client_id 
ON public.review_funnel_config(client_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

