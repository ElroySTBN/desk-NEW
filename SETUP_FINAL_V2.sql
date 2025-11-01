-- ============================================================================
-- 🔧 SETUP FINAL SUPABASE V2 - NOUVEAU PROJET
-- ============================================================================
-- Projet ID: mnmvgtakjmboeubjtwhn
-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (User profile data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. COMPANY SETTINGS (Entreprise informations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'RaiseMed.IA',
  legal_form TEXT DEFAULT 'Auto-Entrepreneur',
  siret TEXT,
  siren TEXT,
  tva_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  bank_name TEXT,
  iban TEXT,
  bic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 3. PRODUCTS (Catalogue produits/services)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_ht DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) DEFAULT 20,
  subscription_type TEXT DEFAULT 'installation',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ORGANIZATIONS (CRM - Entreprises)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_name TEXT NOT NULL,
  commercial_name TEXT,
  siret TEXT,
  tva_number TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  billing_address TEXT,
  billing_postal_code TEXT,
  billing_city TEXT,
  billing_country TEXT DEFAULT 'France',
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'client', 'archived')),
  type TEXT DEFAULT 'professional',
  monthly_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  next_invoice_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. CONTACTS (CRM - Contacts personne physique)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  department TEXT,
  is_main_contact BOOLEAN DEFAULT FALSE,
  is_billing_contact BOOLEAN DEFAULT FALSE,
  is_technical_contact BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. CLIENTS (Legacy - à garder pour compatibilité)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  monthly_amount DECIMAL(10,2),
  start_date DATE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. INVOICES (Facturation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount_ht DECIMAL(10,2) NOT NULL,
  amount_ttc DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. ONBOARDING (Questionnaires clients)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  general_info JSONB DEFAULT '{}',
  brand_identity JSONB DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  google_business JSONB DEFAULT '{}',
  description_attributes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. EMPLOYEES (Système avis - Employés)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  unique_link_id UUID DEFAULT gen_random_uuid() UNIQUE,
  qr_code_data TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. SCAN TRACKING (Système avis - Traçabilité)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scan_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scan_date DATE DEFAULT CURRENT_DATE,
  scan_hour INTEGER,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  device_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. REVIEW SETTINGS (Configuration avis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  positive_threshold INTEGER DEFAULT 4,
  selected_platform TEXT,
  custom_message TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. NEGATIVE REVIEWS (Avis négatifs collectés)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.negative_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  reviewer_email TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 13. POSITIVE REVIEW REDIRECTS (Redirections avis positifs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.positive_review_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 14. REVIEW FUNNEL CONFIG (Config funnel personnalisé)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_funnel_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  funnel_enabled BOOLEAN DEFAULT TRUE,
  rating_threshold INTEGER DEFAULT 4 CHECK (rating_threshold >= 1 AND rating_threshold <= 5),
  show_logo BOOLEAN DEFAULT TRUE,
  show_company_name BOOLEAN DEFAULT TRUE,
  custom_url_slug VARCHAR(255) UNIQUE,
  initial_page_config JSONB DEFAULT '{}'::jsonb,
  negative_review_config JSONB DEFAULT '{}'::jsonb,
  positive_review_config JSONB DEFAULT '{}'::jsonb,
  multiplatform_config JSONB DEFAULT '{}'::jsonb,
  thank_you_page_config JSONB DEFAULT '{}'::jsonb,
  theme_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 15. TASKS (Gestion tâches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  urgency BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'todo',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 16. QUICK NOTES (Notes rapides)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 17. CLIENT CALLS (Historique appels)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  call_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  subject TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 18. CONTENT LIBRARY (Bibliothèque contenu)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'post',
  publish_date DATE,
  status TEXT DEFAULT 'draft',
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 19. BRAND DNA (ADN marque)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  company_info TEXT,
  brand_values TEXT,
  target_audience TEXT,
  key_messages TEXT,
  tone_of_voice TEXT,
  unique_selling_points TEXT,
  competition_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 20. CLIENT PHOTOS (Photos clients)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 21. REVIEW CAMPAIGNS (Campagnes d'avis)
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

-- ============================================================================
-- 22. MONTHLY REPORTS (Rapports mensuels avis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_scans INTEGER DEFAULT 0,
  total_positive_reviews INTEGER DEFAULT 0,
  total_negative_reviews INTEGER DEFAULT 0,
  scans_by_employee JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, month, year)
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON public.organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON public.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_client_id ON public.employees(client_id);
CREATE INDEX IF NOT EXISTS idx_employees_unique_link_id ON public.employees(unique_link_id);
CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_scan_tracking_employee_id ON public.scan_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_scan_tracking_client_id ON public.scan_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_scan_tracking_scan_date ON public.scan_tracking(scan_date);
CREATE INDEX IF NOT EXISTS idx_review_settings_client_id ON public.review_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_negative_reviews_client_id ON public.negative_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_client_id ON public.quick_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_review_funnel_config_client_id ON public.review_funnel_config(client_id);
CREATE INDEX IF NOT EXISTS idx_review_funnel_config_custom_url_slug ON public.review_funnel_config(custom_url_slug);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_user_id ON public.review_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_organization_id ON public.review_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_campaigns_client_id ON public.review_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_id ON public.monthly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_client_id ON public.monthly_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_year_month ON public.monthly_reports(year, month);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_onboarding_updated_at ON public.onboarding;
CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON public.onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_review_settings_updated_at ON public.review_settings;
CREATE TRIGGER update_review_settings_updated_at BEFORE UPDATE ON public.review_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_negative_reviews_updated_at ON public.negative_reviews;
CREATE TRIGGER update_negative_reviews_updated_at BEFORE UPDATE ON public.negative_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_positive_review_redirects_updated_at ON public.positive_review_redirects;
CREATE TRIGGER update_positive_review_redirects_updated_at BEFORE UPDATE ON public.positive_review_redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_review_funnel_config_updated_at ON public.review_funnel_config;
CREATE TRIGGER update_review_funnel_config_updated_at BEFORE UPDATE ON public.review_funnel_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON public.quick_notes;
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON public.quick_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_client_calls_updated_at ON public.client_calls;
CREATE TRIGGER update_client_calls_updated_at BEFORE UPDATE ON public.client_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_content_library_updated_at ON public.content_library;
CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON public.content_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_brand_dna_updated_at ON public.brand_dna;
CREATE TRIGGER update_brand_dna_updated_at BEFORE UPDATE ON public.brand_dna FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_review_campaigns_updated_at ON public.review_campaigns;
CREATE TRIGGER update_review_campaigns_updated_at BEFORE UPDATE ON public.review_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_monthly_reports_updated_at ON public.monthly_reports;
CREATE TRIGGER update_monthly_reports_updated_at BEFORE UPDATE ON public.monthly_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negative_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positive_review_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_funnel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (User can only access their own data)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own company settings" ON public.company_settings;
CREATE POLICY "Users can view own company settings" ON public.company_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own company settings" ON public.company_settings;
CREATE POLICY "Users can insert own company settings" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own company settings" ON public.company_settings;
CREATE POLICY "Users can update own company settings" ON public.company_settings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own products" ON public.products;
CREATE POLICY "Users can view own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
CREATE POLICY "Users can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
CREATE POLICY "Users can view own organizations" ON public.organizations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own organizations" ON public.organizations;
CREATE POLICY "Users can insert own organizations" ON public.organizations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own organizations" ON public.organizations;
CREATE POLICY "Users can update own organizations" ON public.organizations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own organizations" ON public.organizations;
CREATE POLICY "Users can delete own organizations" ON public.organizations FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
CREATE POLICY "Users can view own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
CREATE POLICY "Users can insert own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
CREATE POLICY "Users can delete own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own onboarding" ON public.onboarding;
CREATE POLICY "Users can view own onboarding" ON public.onboarding FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding;
CREATE POLICY "Users can insert own onboarding" ON public.onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding;
CREATE POLICY "Users can update own onboarding" ON public.onboarding FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own onboarding" ON public.onboarding;
CREATE POLICY "Users can delete own onboarding" ON public.onboarding FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own employees" ON public.employees;
CREATE POLICY "Users can view own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own employees" ON public.employees;
CREATE POLICY "Users can insert own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own employees" ON public.employees;
CREATE POLICY "Users can update own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own employees" ON public.employees;
CREATE POLICY "Users can delete own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own scan tracking" ON public.scan_tracking;
CREATE POLICY "Users can view own scan tracking" ON public.scan_tracking FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own scan tracking" ON public.scan_tracking;
CREATE POLICY "Users can insert own scan tracking" ON public.scan_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own review settings" ON public.review_settings;
CREATE POLICY "Users can view own review settings" ON public.review_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own review settings" ON public.review_settings;
CREATE POLICY "Users can insert own review settings" ON public.review_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own review settings" ON public.review_settings;
CREATE POLICY "Users can update own review settings" ON public.review_settings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own negative reviews" ON public.negative_reviews;
CREATE POLICY "Users can view own negative reviews" ON public.negative_reviews FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own negative reviews" ON public.negative_reviews;
CREATE POLICY "Users can insert own negative reviews" ON public.negative_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own positive review redirects" ON public.positive_review_redirects;
CREATE POLICY "Users can view own positive review redirects" ON public.positive_review_redirects FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own positive review redirects" ON public.positive_review_redirects;
CREATE POLICY "Users can insert own positive review redirects" ON public.positive_review_redirects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own funnel config" ON public.review_funnel_config;
CREATE POLICY "Users can view own funnel config" ON public.review_funnel_config FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own funnel config" ON public.review_funnel_config;
CREATE POLICY "Users can insert own funnel config" ON public.review_funnel_config FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own funnel config" ON public.review_funnel_config;
CREATE POLICY "Users can update own funnel config" ON public.review_funnel_config FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own quick notes" ON public.quick_notes;
CREATE POLICY "Users can view own quick notes" ON public.quick_notes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own quick notes" ON public.quick_notes;
CREATE POLICY "Users can insert own quick notes" ON public.quick_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own quick notes" ON public.quick_notes;
CREATE POLICY "Users can update own quick notes" ON public.quick_notes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own quick notes" ON public.quick_notes;
CREATE POLICY "Users can delete own quick notes" ON public.quick_notes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own client calls" ON public.client_calls;
CREATE POLICY "Users can view own client calls" ON public.client_calls FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own client calls" ON public.client_calls;
CREATE POLICY "Users can insert own client calls" ON public.client_calls FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own client calls" ON public.client_calls;
CREATE POLICY "Users can update own client calls" ON public.client_calls FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own client calls" ON public.client_calls;
CREATE POLICY "Users can delete own client calls" ON public.client_calls FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own content library" ON public.content_library;
CREATE POLICY "Users can view own content library" ON public.content_library FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own content library" ON public.content_library;
CREATE POLICY "Users can insert own content library" ON public.content_library FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own content library" ON public.content_library;
CREATE POLICY "Users can update own content library" ON public.content_library FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own content library" ON public.content_library;
CREATE POLICY "Users can delete own content library" ON public.content_library FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own brand dna" ON public.brand_dna;
CREATE POLICY "Users can view own brand dna" ON public.brand_dna FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own brand dna" ON public.brand_dna;
CREATE POLICY "Users can insert own brand dna" ON public.brand_dna FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own brand dna" ON public.brand_dna;
CREATE POLICY "Users can update own brand dna" ON public.brand_dna FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own brand dna" ON public.brand_dna;
CREATE POLICY "Users can delete own brand dna" ON public.brand_dna FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can view own review campaigns" ON public.review_campaigns FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can insert own review campaigns" ON public.review_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can update own review campaigns" ON public.review_campaigns FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own review campaigns" ON public.review_campaigns;
CREATE POLICY "Users can delete own review campaigns" ON public.review_campaigns FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own photos" ON public.client_photos;
CREATE POLICY "Users can view own photos" ON public.client_photos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own photos" ON public.client_photos;
CREATE POLICY "Users can insert own photos" ON public.client_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own photos" ON public.client_photos;
CREATE POLICY "Users can delete own photos" ON public.client_photos FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own monthly reports" ON public.monthly_reports;
CREATE POLICY "Users can view own monthly reports" ON public.monthly_reports FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own monthly reports" ON public.monthly_reports;
CREATE POLICY "Users can insert own monthly reports" ON public.monthly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own monthly reports" ON public.monthly_reports;
CREATE POLICY "Users can update own monthly reports" ON public.monthly_reports FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own monthly reports" ON public.monthly_reports;
CREATE POLICY "Users can delete own monthly reports" ON public.monthly_reports FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW public.contacts_with_organization AS
SELECT 
  c.*,
  o.legal_name as organization_name,
  o.commercial_name as organization_commercial_name,
  o.status as organization_status
FROM public.contacts c
LEFT JOIN public.organizations o ON c.organization_id = o.id;

-- ============================================================================
-- PERMISSIONS POSTGREST (CRITICAL!)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;

-- ============================================================================
-- REFRESH SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 
    'SUCCESS' as status,
    COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'company_settings', 
    'products', 
    'organizations', 
    'contacts', 
    'clients', 
    'invoices', 
    'onboarding',
    'employees',
    'review_campaigns',
    'tasks',
    'brand_dna',
    'monthly_reports',
    'motivational_photos'
);

