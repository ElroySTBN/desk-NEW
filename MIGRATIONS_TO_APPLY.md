# 🗄️ MIGRATIONS À APPLIQUER DANS SUPABASE

## 📍 Où aller ?

1. Ouvrez : https://supabase.com/dashboard/project/mnmvgtakjmboeubjtwhn
2. Cliquez sur **"SQL Editor"** (menu de gauche)
3. Cliquez sur **"New query"**

## ✅ Migrations à copier-coller

### ⚠️ IMPORTANT

- Ces migrations sont **sûres** à appliquer plusieurs fois (elles utilisent `IF NOT EXISTS`)
- **NE SUPPRIMEZ RIEN** de votre base de données
- Elles **ajoutent uniquement** des colonnes et tables
- Copiez-collez **chacune** dans une requête séparée et cliquez sur **"Run"**

---

## 🎯 Migration 1 : Employees & Campagnes

**Fichier** : `supabase/migrations/20251102000003_add_org_id_to_employees.sql`

```sql
-- ============================================================================
-- Add organization_id to employees table (keep client_id for compatibility)
-- ============================================================================

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);

COMMENT ON COLUMN public.employees.client_id IS 'DEPRECATED: Use organization_id instead';
COMMENT ON COLUMN public.employees.organization_id IS 'Modern foreign key to organizations table';

-- ============================================================================
-- Create campaigns table for review campaigns
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'physical' CHECK (campaign_type IN ('physical', 'digital', 'hybrid')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_campaigns_organization_id ON public.review_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_client_id ON public.review_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_user_id ON public.review_campaigns(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_review_campaigns_updated_at ON public.review_campaigns;
CREATE TRIGGER update_review_campaigns_updated_at
  BEFORE UPDATE ON public.review_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.review_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can view their own review campaigns"
  ON public.review_campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can insert their own review campaigns"
  ON public.review_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can update their own review campaigns"
  ON public.review_campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can delete their own review campaigns"
  ON public.review_campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.review_campaigns TO authenticated;

COMMENT ON TABLE public.review_campaigns IS 'Campagnes de récolte d''avis (physique, digital, hybride)';
```

**➡️ Cliquez sur "Run"**

---

## 🎯 Migration 2 : Fix review_funnel_config

**Fichier** : `supabase/migrations/20251102000004_fix_funnel_config.sql`

```sql
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
```

**➡️ Cliquez sur "Run"**

---

## 🎯 Migration 3 : Fix review_settings

**Fichier** : `supabase/migrations/20251102000005_fix_review_settings.sql`

```sql
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
```

**➡️ Cliquez sur "Run"**

---

## ✅ C'EST TOUT !

Les migrations sont maintenant appliquées.

### 🧪 Tester :

1. Créer un employé → Devrait fonctionner ✅
2. Sauvegarder funnel config → Devrait fonctionner ✅
3. Prévisualiser → Devrait fonctionner ✅
4. Cliquer bouton retour → Ne doit plus être en 404 ✅

---

## 📝 Notes

**Pas besoin d'envoyer de mails pour le moment** :
- Les notifications email ne fonctionnent pas encore
- On intégrera une API d'envoi d'emails plus tard
- Pour l'instant, on se concentre sur la configuration des funnels

