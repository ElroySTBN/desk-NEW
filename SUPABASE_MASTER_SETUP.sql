-- ============================================================================
-- SUPABASE MASTER SETUP - COMPLETE SYSTEM
-- ============================================================================
-- This script creates the COMPLETE database structure for RaiseMed.IA
-- Combines existing system (11 tables) + Agency OS features (2 new tables)
-- 
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual Supabase auth user ID
-- Find it in: Authentication > Users > Copy UUID
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: USER & COMPANY CORE
-- ============================================================================

-- 1.1 PROFILES (User profile data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 COMPANY SETTINGS (Company information)
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

-- 1.3 PRODUCTS (Product/service catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_ht DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) DEFAULT 20,
  subscription_type TEXT CHECK (subscription_type IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel', 'installation', 'service')) DEFAULT 'mensuel',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reference)
);

-- ============================================================================
-- SECTION 2: CLIENTS (Main client table - COMPLETE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  
  -- Business Details
  secteur_activite TEXT,
  type_campagne TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status & Dates
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived')),
  date_debut_contrat DATE,
  date_anniversaire_abonnement DATE,
  montant_mensuel DECIMAL(10,2) DEFAULT 0,
  
  -- Quick Links (GMB, Facebook, etc.)
  liens_rapides JSONB DEFAULT '{}'::jsonb,
  
  -- Notes
  notes TEXT,
  
  -- Agency OS - New Fields
  magic_link_token UUID DEFAULT gen_random_uuid() UNIQUE,
  onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'sent_to_client', 'validated', 'completed')) DEFAULT 'pending',
  lifecycle_stage TEXT CHECK (lifecycle_stage IN ('lead', 'audit', 'onboarding', 'production', 'churn')) DEFAULT 'lead',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_magic_link_token ON public.clients(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_clients_lifecycle_stage ON public.clients(lifecycle_stage);

-- ============================================================================
-- SECTION 3: AGENCY OS EXTENSIONS
-- ============================================================================

-- 3.1 BRAND DNA (Brand identity for content generation)
CREATE TABLE IF NOT EXISTS public.brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- JSONB fields for flexibility
  visual_identity JSONB DEFAULT '{}'::jsonb,  -- Colors, logo, style
  tone_of_voice JSONB DEFAULT '{}'::jsonb,    -- Communication style
  target_avatar JSONB DEFAULT '{}'::jsonb,    -- Target audience
  services_focus JSONB DEFAULT '{}'::jsonb,   -- Main services
  key_info JSONB DEFAULT '{}'::jsonb,         -- Other important info
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_dna_client_id ON public.brand_dna(client_id);

-- 3.2 AUDITS (SEO/Website audits for leads)
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  url TEXT,
  status TEXT,
  overall_score NUMERIC,
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audits_client_id ON public.audits(client_id);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON public.audits(user_id);

-- ============================================================================
-- SECTION 4: WORKFLOW MANAGEMENT
-- ============================================================================

-- 4.1 NOTES (Quick notes system)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 TASKS (Task management)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  category TEXT,
  
  deadline TIMESTAMPTZ,
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  is_blocking BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);

-- 4.3 MONTHLY REPORTS (Performance tracking)
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  
  metrics JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id, month, year)
);

-- ============================================================================
-- SECTION 5: FINANCIAL MANAGEMENT
-- ============================================================================

-- 5.1 INVOICES (Invoice management)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  numero_facture TEXT UNIQUE,
  date DATE NOT NULL,
  date_echeance DATE,
  
  -- Amounts
  montant_ht DECIMAL(10,2) DEFAULT 0,
  montant_tva DECIMAL(10,2) DEFAULT 0,
  montant_ttc DECIMAL(10,2) NOT NULL,
  
  -- Line items
  items JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoyee', 'payee', 'annulee')),
  payment_method TEXT,
  payment_date DATE,
  
  -- Notes
  notes TEXT,
  conditions_paiement TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 5.2 KPIS (Key Performance Indicators)
CREATE TABLE IF NOT EXISTS public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, metric_name)
);

-- ============================================================================
-- SECTION 6: INTEGRATIONS
-- ============================================================================

-- 6.1 TELEGRAM NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.telegram_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed'))
);

-- 6.2 DOCUMENTS (File storage metadata)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 7: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for all user-scoped tables
DROP POLICY IF EXISTS "Users can manage own data" ON public.company_settings;
CREATE POLICY "Users can manage own data" ON public.company_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.products;
CREATE POLICY "Users can manage own data" ON public.products FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.clients;
CREATE POLICY "Users can manage own data" ON public.clients FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage brand_dna via clients" ON public.brand_dna;
CREATE POLICY "Users can manage brand_dna via clients" ON public.brand_dna FOR ALL 
USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own data" ON public.audits;
CREATE POLICY "Users can manage own data" ON public.audits FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.notes;
CREATE POLICY "Users can manage own data" ON public.notes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.tasks;
CREATE POLICY "Users can manage own data" ON public.tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.monthly_reports;
CREATE POLICY "Users can manage own data" ON public.monthly_reports FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.invoices;
CREATE POLICY "Users can manage own data" ON public.invoices FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.kpis;
CREATE POLICY "Users can manage own data" ON public.kpis FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.telegram_notifications;
CREATE POLICY "Users can manage own data" ON public.telegram_notifications FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON public.documents;
CREATE POLICY "Users can manage own data" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 8: TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_dna_updated_at ON public.brand_dna;
CREATE TRIGGER update_brand_dna_updated_at BEFORE UPDATE ON public.brand_dna
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_reports_updated_at ON public.monthly_reports;
CREATE TRIGGER update_monthly_reports_updated_at BEFORE UPDATE ON public.monthly_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kpis_updated_at ON public.kpis;
CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON public.kpis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 9: SEED DATA (Test data)
-- ============================================================================

-- ⚠️ IMPORTANT: Replace 'YOUR_USER_ID' with your actual UUID from Authentication > Users

INSERT INTO public.clients (
  user_id, name, company, email, phone,
  secteur_activite, type_campagne, statut, montant_mensuel,
  lifecycle_stage, onboarding_status,
  liens_rapides
)
VALUES 
(
  '0adcdc1d-02d2-4ac4-a532-e45a77263efd',
  'Jean Dupont',
  'Plomberie Dupont',
  'jean@plomberie-dupont.fr',
  '0601020304',
  'BTP',
  ARRAY['SEO Local', 'Google Ads'],
  'actif',
  450.00,
  'production',
  'completed',
  '{"gmb": "https://g.page/plomberie-dupont", "facebook": "https://facebook.com/plomberie.dupont"}'::jsonb
),
(
  '0adcdc1d-02d2-4ac4-a532-e45a77263efd',
  'Marie Martin',
  'Institut Beauté Zen',
  'contact@beaute-zen.fr',
  '0605060708',
  'Esthétique',
  ARRAY['Instagram', 'TikTok'],
  'actif',
  299.00,
  'onboarding',
  'sent_to_client',
  '{"instagram": "https://instagram.com/beaute.zen"}'::jsonb
),
(
  '0adcdc1d-02d2-4ac4-a532-e45a77263efd',
  'Pierre Dubois',
  'Chauffage Pro',
  'pierre@chauffage-pro.fr',
  '0609101112',
  'Chauffage',
  ARRAY['SEO Local'],
  'actif',
  350.00,
  'lead',
  'pending',
  '{}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 10: VERIFICATION QUERIES
-- ============================================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check clients table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- View test clients
SELECT name, company, lifecycle_stage, onboarding_status, magic_link_token
FROM public.clients
ORDER BY created_at DESC;

-- ============================================================================
-- ✅ SETUP COMPLETE
-- ============================================================================
-- You should now have 13 tables:
-- 1. profiles
-- 2. company_settings
-- 3. products
-- 4. clients (with ALL columns including Agency OS fields)
-- 5. brand_dna
-- 6. audits
-- 7. notes
-- 8. tasks
-- 9. monthly_reports
-- 10. invoices
-- 11. kpis
-- 12. telegram_notifications
-- 13. documents
-- ============================================================================
