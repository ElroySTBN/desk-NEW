-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║                                                                      ║
-- ║     🗄️  SCRIPT SQL COMPLET - RAISEDESK DATABASE                    ║
-- ║                                                                      ║
-- ║     Déployez cette base de données complète en UNE SEULE FOIS       ║
-- ║                                                                      ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ==========================================================================
-- 1. TABLES DE BASE
-- ==========================================================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'actif', 'inactif', 'churned')),
  contract_type TEXT,
  monthly_amount DECIMAL(10,2),
  start_date DATE,
  notes TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own clients" ON public.clients;
CREATE POLICY "Users can create own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ht DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  amount_ttc DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('payee', 'en_attente', 'en_retard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own invoices" ON public.invoices;
CREATE POLICY "Users can create own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Client KPIs
CREATE TABLE IF NOT EXISTS public.client_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  actions TEXT,
  results TEXT,
  kpis_data JSONB DEFAULT '{}',
  problems TEXT,
  improvements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, month, year)
);

ALTER TABLE public.client_kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own client KPIs" ON public.client_kpis;
CREATE POLICY "Users can view own client KPIs" ON public.client_kpis FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own client KPIs" ON public.client_kpis;
CREATE POLICY "Users can create own client KPIs" ON public.client_kpis FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own client KPIs" ON public.client_kpis;
CREATE POLICY "Users can update own client KPIs" ON public.client_kpis FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own client KPIs" ON public.client_kpis;
CREATE POLICY "Users can delete own client KPIs" ON public.client_kpis FOR DELETE USING (auth.uid() = user_id);

-- Client Documents
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own client documents" ON public.client_documents;
CREATE POLICY "Users can view own client documents" ON public.client_documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own client documents" ON public.client_documents;
CREATE POLICY "Users can create own client documents" ON public.client_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own client documents" ON public.client_documents;
CREATE POLICY "Users can delete own client documents" ON public.client_documents FOR DELETE USING (auth.uid() = user_id);

-- Client Communications
CREATE TABLE IF NOT EXISTS public.client_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('appel', 'email', 'reunion', 'note')),
  content TEXT NOT NULL,
  communication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.client_communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own client communications" ON public.client_communications;
CREATE POLICY "Users can view own client communications" ON public.client_communications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own client communications" ON public.client_communications;
CREATE POLICY "Users can create own client communications" ON public.client_communications FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own client communications" ON public.client_communications;
CREATE POLICY "Users can delete own client communications" ON public.client_communications FOR DELETE USING (auth.uid() = user_id);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT CHECK (category IN ('facture', 'outreach', 'reporting', 'autre')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own templates" ON public.email_templates;
CREATE POLICY "Users can view own templates" ON public.email_templates FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own templates" ON public.email_templates;
CREATE POLICY "Users can create own templates" ON public.email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own templates" ON public.email_templates;
CREATE POLICY "Users can update own templates" ON public.email_templates FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own templates" ON public.email_templates;
CREATE POLICY "Users can delete own templates" ON public.email_templates FOR DELETE USING (auth.uid() = user_id);

-- ==========================================================================
-- 2. COMPANY SETTINGS & PRODUCTS
-- ==========================================================================

-- Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  company_name TEXT NOT NULL DEFAULT 'RaiseMed.IA',
  legal_form TEXT DEFAULT 'Micro-entreprise',
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own company settings" ON public.company_settings;
CREATE POLICY "Users can view their own company settings" ON public.company_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own company settings" ON public.company_settings;
CREATE POLICY "Users can insert their own company settings" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own company settings" ON public.company_settings;
CREATE POLICY "Users can update their own company settings" ON public.company_settings FOR UPDATE USING (auth.uid() = user_id);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_ht DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) DEFAULT 20,
  subscription_type TEXT CHECK (subscription_type IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel')) DEFAULT 'mensuel',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reference)
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
CREATE POLICY "Users can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- ==========================================================================
-- 3. ONBOARDING SYSTEM
-- ==========================================================================

-- Onboarding
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  legal_info JSONB,
  brand_identity JSONB,
  target_audience JSONB,
  communication JSONB,
  history JSONB,
  google_business JSONB,
  visuals JSONB,
  nfc_team JSONB,
  follow_up JSONB,
  validation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.onboarding(user_id);
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own onboarding" ON public.onboarding;
CREATE POLICY "Users can view own onboarding" ON public.onboarding FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own onboarding" ON public.onboarding;
CREATE POLICY "Users can create own onboarding" ON public.onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding;
CREATE POLICY "Users can update own onboarding" ON public.onboarding FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own onboarding" ON public.onboarding;
CREATE POLICY "Users can delete own onboarding" ON public.onboarding FOR DELETE USING (auth.uid() = user_id);

-- ==========================================================================
-- 4. REVIEW SYSTEM
-- ==========================================================================

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  qr_code_url TEXT,
  unique_link TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_client_id ON public.employees(client_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own employees" ON public.employees;
CREATE POLICY "Users can view own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own employees" ON public.employees;
CREATE POLICY "Users can create own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own employees" ON public.employees;
CREATE POLICY "Users can update own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own employees" ON public.employees;
CREATE POLICY "Users can delete own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- Scan Tracking
CREATE TABLE IF NOT EXISTS public.scan_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_scan_tracking_employee_id ON public.scan_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_scan_tracking_client_id ON public.scan_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_scan_tracking_user_id ON public.scan_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_tracking_scanned_at ON public.scan_tracking(scanned_at);
ALTER TABLE public.scan_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scan tracking" ON public.scan_tracking;
CREATE POLICY "Users can view own scan tracking" ON public.scan_tracking FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own scan tracking" ON public.scan_tracking;
CREATE POLICY "Users can create own scan tracking" ON public.scan_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Review Settings
CREATE TABLE IF NOT EXISTS public.review_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  positive_threshold INTEGER DEFAULT 4,
  platforms JSONB DEFAULT '[]',
  custom_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_review_settings_client_id ON public.review_settings(client_id);
ALTER TABLE public.review_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own review settings" ON public.review_settings;
CREATE POLICY "Users can view own review settings" ON public.review_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own review settings" ON public.review_settings;
CREATE POLICY "Users can create own review settings" ON public.review_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own review settings" ON public.review_settings;
CREATE POLICY "Users can update own review settings" ON public.review_settings FOR UPDATE USING (auth.uid() = user_id);

-- Negative Reviews
CREATE TABLE IF NOT EXISTS public.negative_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES public.employees(id)
);

CREATE INDEX IF NOT EXISTS idx_negative_reviews_client_id ON public.negative_reviews(client_id);
ALTER TABLE public.negative_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own negative reviews" ON public.negative_reviews;
CREATE POLICY "Users can view own negative reviews" ON public.negative_reviews FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own negative reviews" ON public.negative_reviews;
CREATE POLICY "Users can create own negative reviews" ON public.negative_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Positive Review Redirects
CREATE TABLE IF NOT EXISTS public.positive_review_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  redirect_url TEXT NOT NULL,
  redirected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_positive_review_redirects_client_id ON public.positive_review_redirects(client_id);
ALTER TABLE public.positive_review_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own positive review redirects" ON public.positive_review_redirects;
CREATE POLICY "Users can view own positive review redirects" ON public.positive_review_redirects FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own positive review redirects" ON public.positive_review_redirects;
CREATE POLICY "Users can create own positive review redirects" ON public.positive_review_redirects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Review Funnel Config
CREATE TABLE IF NOT EXISTS public.review_funnel_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  rating_threshold INTEGER DEFAULT 4,
  show_logo BOOLEAN DEFAULT true,
  show_company_name BOOLEAN DEFAULT true,
  public_url_slug TEXT,
  initial_page_config JSONB DEFAULT '{"title": "Comment nous évalueriez-vous ?", "description": "Merci de prendre un moment pour évaluer votre expérience avec nous."}',
  negative_review_config JSONB DEFAULT '{}',
  positive_review_config JSONB DEFAULT '{}',
  multiplatform_config JSONB DEFAULT '{}',
  thank_you_page_config JSONB DEFAULT '{}',
  theme_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_review_funnel_config_client_id ON public.review_funnel_config(client_id);
ALTER TABLE public.review_funnel_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own funnel config" ON public.review_funnel_config;
CREATE POLICY "Users can view own funnel config" ON public.review_funnel_config FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own funnel config" ON public.review_funnel_config;
CREATE POLICY "Users can create own funnel config" ON public.review_funnel_config FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own funnel config" ON public.review_funnel_config;
CREATE POLICY "Users can update own funnel config" ON public.review_funnel_config FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================================================
-- 5. TASKS & CONTENT SYSTEM
-- ==========================================================================

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  urgency BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'todo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Quick Notes
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quick notes" ON public.quick_notes;
CREATE POLICY "Users can view own quick notes" ON public.quick_notes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own quick notes" ON public.quick_notes;
CREATE POLICY "Users can create own quick notes" ON public.quick_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own quick notes" ON public.quick_notes;
CREATE POLICY "Users can update own quick notes" ON public.quick_notes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own quick notes" ON public.quick_notes;
CREATE POLICY "Users can delete own quick notes" ON public.quick_notes FOR DELETE USING (auth.uid() = user_id);

-- Client Calls
CREATE TABLE IF NOT EXISTS public.client_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  call_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  call_type TEXT NOT NULL,
  notes TEXT,
  action_items TEXT[],
  follow_ups TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_calls_user_id ON public.client_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_client_calls_client_id ON public.client_calls(client_id);
ALTER TABLE public.client_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own client calls" ON public.client_calls;
CREATE POLICY "Users can view own client calls" ON public.client_calls FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own client calls" ON public.client_calls;
CREATE POLICY "Users can create own client calls" ON public.client_calls FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own client calls" ON public.client_calls;
CREATE POLICY "Users can update own client calls" ON public.client_calls FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own client calls" ON public.client_calls;
CREATE POLICY "Users can delete own client calls" ON public.client_calls FOR DELETE USING (auth.uid() = user_id);

-- Content Library
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  hashtags TEXT[],
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_library_user_id ON public.content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_client_id ON public.content_library(client_id);
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own content library" ON public.content_library;
CREATE POLICY "Users can view own content library" ON public.content_library FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own content library" ON public.content_library;
CREATE POLICY "Users can create own content library" ON public.content_library FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own content library" ON public.content_library;
CREATE POLICY "Users can update own content library" ON public.content_library FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own content library" ON public.content_library;
CREATE POLICY "Users can delete own content library" ON public.content_library FOR DELETE USING (auth.uid() = user_id);

-- Brand DNA
CREATE TABLE IF NOT EXISTS public.brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_dna_user_id ON public.brand_dna(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_dna_client_id ON public.brand_dna(client_id);
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own brand dna" ON public.brand_dna;
CREATE POLICY "Users can view own brand dna" ON public.brand_dna FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own brand dna" ON public.brand_dna;
CREATE POLICY "Users can create own brand dna" ON public.brand_dna FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own brand dna" ON public.brand_dna;
CREATE POLICY "Users can update own brand dna" ON public.brand_dna FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own brand dna" ON public.brand_dna;
CREATE POLICY "Users can delete own brand dna" ON public.brand_dna FOR DELETE USING (auth.uid() = user_id);

-- Client Photos
CREATE TABLE IF NOT EXISTS public.client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID,
  photo_name TEXT,
  photo_url TEXT NOT NULL,
  photo_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_photos_user_id ON public.client_photos(user_id);
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own photos" ON public.client_photos;
CREATE POLICY "Users can view own photos" ON public.client_photos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own photos" ON public.client_photos;
CREATE POLICY "Users can create own photos" ON public.client_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own photos" ON public.client_photos;
CREATE POLICY "Users can delete own photos" ON public.client_photos FOR DELETE USING (auth.uid() = user_id);

-- ==========================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ==========================================================================

-- Auto-update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_kpis_updated_at BEFORE UPDATE ON public.client_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON public.onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_settings_updated_at BEFORE UPDATE ON public.review_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_funnel_config_updated_at BEFORE UPDATE ON public.review_funnel_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON public.content_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_dna_updated_at BEFORE UPDATE ON public.brand_dna FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_calls_updated_at BEFORE UPDATE ON public.client_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================================
-- 7. STORAGE BUCKETS (Need to be created in Supabase Dashboard)
-- ==========================================================================

-- Note: Storage buckets must be created manually in Supabase Dashboard:
-- 1. onboarding-files (Private)
-- 2. client-logos (Private)

-- ==========================================================================
-- ✅ FIN DU SCRIPT
-- ==========================================================================


-- ============================================================================
-- PERMISSIONS POUR POSTGREST (API SUPABASE)
-- ============================================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure future tables have correct permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO anon;

