-- ============================================================================
-- Fix review_settings table to match application code
-- ============================================================================

-- Drop old columns if they exist
ALTER TABLE public.review_settings
DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.review_settings
DROP COLUMN IF EXISTS positive_threshold;

ALTER TABLE public.review_settings
DROP COLUMN IF EXISTS selected_platform;

ALTER TABLE public.review_settings
DROP COLUMN IF EXISTS custom_message;

-- Add missing columns if they don't exist
ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS review_platforms JSONB;

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS threshold_score INTEGER;

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS redirect_platform VARCHAR(50);

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS email_notifications VARCHAR(255)[];

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS slack_webhook TEXT;

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS positive_message TEXT;

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS negative_message TEXT;

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS collect_customer_info BOOLEAN;

ALTER TABLE public.review_settings
ADD COLUMN IF NOT EXISTS require_email BOOLEAN;

-- Set defaults for new columns on existing rows
UPDATE public.review_settings
SET 
  review_platforms = '{
    "google": {"enabled": true, "url": ""},
    "pages_jaunes": {"enabled": false, "url": ""},
    "trustpilot": {"enabled": false, "url": ""},
    "tripadvisor": {"enabled": false, "url": ""},
    "custom": {"enabled": false, "url": "", "name": ""}
  }'::jsonb,
  threshold_score = 4,
  redirect_platform = 'google',
  email_notifications = '{}',
  slack_webhook = NULL,
  positive_message = 'Merci pour votre retour positif ! Pourriez-vous partager votre expérience ?',
  negative_message = 'Nous sommes désolés que votre expérience n''ait pas été à la hauteur. Aidez-nous à nous améliorer.',
  collect_customer_info = true,
  require_email = false
WHERE review_platforms IS NULL;

-- Add constraints
ALTER TABLE public.review_settings
ALTER COLUMN client_id SET NOT NULL;

-- Check if unique constraint exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'review_settings_client_id_unique'
    ) THEN
        ALTER TABLE public.review_settings
        ADD CONSTRAINT review_settings_client_id_unique UNIQUE (client_id);
    END IF;
END $$;

ALTER TABLE public.review_settings
ALTER COLUMN threshold_score SET DEFAULT 4;

ALTER TABLE public.review_settings
ALTER COLUMN redirect_platform SET DEFAULT 'google';

ALTER TABLE public.review_settings
ALTER COLUMN collect_customer_info SET DEFAULT true;

ALTER TABLE public.review_settings
ALTER COLUMN require_email SET DEFAULT false;

ALTER TABLE public.review_settings
ALTER COLUMN is_active SET DEFAULT TRUE;

ALTER TABLE public.review_settings
ALTER COLUMN positive_message SET DEFAULT 'Merci pour votre retour positif ! Pourriez-vous partager votre expérience ?';

ALTER TABLE public.review_settings
ALTER COLUMN negative_message SET DEFAULT 'Nous sommes désolés que votre expérience n''ait pas été à la hauteur. Aidez-nous à nous améliorer.';

-- Check if check constraint exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_threshold_score'
    ) THEN
        ALTER TABLE public.review_settings
        ADD CONSTRAINT check_threshold_score CHECK (threshold_score >= 1 AND threshold_score <= 5);
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

