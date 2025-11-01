-- ============================================================================
-- NOUVEAU SYSTÈME CRM : ORGANISATIONS + CONTACTS
-- ============================================================================

-- Table des organisations (entreprises clientes ou prospects)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations légales
  legal_name TEXT NOT NULL,
  commercial_name TEXT,
  siret TEXT,
  tva_number TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Adresse de facturation
  billing_address TEXT,
  billing_postal_code TEXT,
  billing_city TEXT,
  billing_country TEXT DEFAULT 'France',
  
  -- Statut et type
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'client', 'archived')),
  type TEXT DEFAULT 'professional' CHECK (type IN ('professional')),
  
  -- Informations commerciales
  monthly_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  next_invoice_date DATE,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des contacts (personnes physiques)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  -- Informations personnelles
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Fonction
  job_title TEXT,
  department TEXT,
  
  -- Rôle
  is_main_contact BOOLEAN DEFAULT FALSE,
  is_billing_contact BOOLEAN DEFAULT FALSE,
  is_technical_contact BOOLEAN DEFAULT FALSE,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performances
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON public.organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON public.contacts(organization_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Organizations policies
DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
CREATE POLICY "Users can view own organizations" 
  ON public.organizations FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own organizations" ON public.organizations;
CREATE POLICY "Users can create own organizations" 
  ON public.organizations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own organizations" ON public.organizations;
CREATE POLICY "Users can update own organizations" 
  ON public.organizations FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own organizations" ON public.organizations;
CREATE POLICY "Users can delete own organizations" 
  ON public.organizations FOR DELETE 
  USING (auth.uid() = user_id);

-- Contacts policies
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
CREATE POLICY "Users can view own contacts" 
  ON public.contacts FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own contacts" ON public.contacts;
CREATE POLICY "Users can create own contacts" 
  ON public.contacts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
CREATE POLICY "Users can update own contacts" 
  ON public.contacts FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
CREATE POLICY "Users can delete own contacts" 
  ON public.contacts FOR DELETE 
  USING (auth.uid() = user_id);

-- Vue pour contacts avec informations de l'organisation
CREATE OR REPLACE VIEW public.contacts_with_organization AS
SELECT 
  c.*,
  o.legal_name as organization_name,
  o.commercial_name as organization_commercial_name,
  o.status as organization_status
FROM public.contacts c
LEFT JOIN public.organizations o ON c.organization_id = o.id;

-- Grant permissions
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.contacts TO authenticated;
GRANT SELECT ON public.contacts_with_organization TO authenticated;

