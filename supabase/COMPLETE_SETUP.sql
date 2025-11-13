-- ============================================================================
-- SCRIPT SQL COMPLET ET DÉFINITIF : Configuration complète de la base de données
-- ============================================================================
-- ⚠️ INSTRUCTIONS IMPORTANTES :
-- 1. Ce script doit être exécuté UNE SEULE FOIS dans Supabase SQL Editor
-- 2. Il vérifie et crée TOUTES les tables et colonnes nécessaires
-- 3. Il est IDEMPOTENT : peut être exécuté plusieurs fois sans problème
-- 4. Il gère intelligemment les cas où les colonnes/tables existent déjà
-- ============================================================================
-- Date: 2025-01-08
-- Description: Script complet pour initialiser toute la base de données
-- ============================================================================

-- ============================================================================
-- 1. FONCTION handle_updated_at (nécessaire pour tous les triggers)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLE clients (COMPLÈTE avec toutes les colonnes nécessaires)
-- ============================================================================
-- Créer la table clients si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter toutes les colonnes nécessaires (idempotent)
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'prospect',
  ADD COLUMN IF NOT EXISTS contract_type TEXT,
  ADD COLUMN IF NOT EXISTS montant_mensuel DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS date_debut_contrat DATE,
  ADD COLUMN IF NOT EXISTS date_anniversaire_abonnement DATE,
  ADD COLUMN IF NOT EXISTS secteur_activite TEXT,
  ADD COLUMN IF NOT EXISTS type_campagne TEXT[];

-- Renommer les colonnes anciennes si elles existent encore
DO $$ 
BEGIN
  -- Renommer status en statut si status existe et statut n'existe pas
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'statut'
  ) THEN
    ALTER TABLE public.clients RENAME COLUMN status TO statut;
    RAISE NOTICE 'Colonne status renommée en statut';
  END IF;

  -- Renommer monthly_amount en montant_mensuel si monthly_amount existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'monthly_amount'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'montant_mensuel'
  ) THEN
    -- Si les deux existent, copier les données puis supprimer monthly_amount
    UPDATE public.clients 
    SET montant_mensuel = monthly_amount 
    WHERE monthly_amount IS NOT NULL AND montant_mensuel IS NULL;
    ALTER TABLE public.clients DROP COLUMN monthly_amount;
    RAISE NOTICE 'Données de monthly_amount copiées vers montant_mensuel, monthly_amount supprimée';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'monthly_amount'
  ) THEN
    ALTER TABLE public.clients RENAME COLUMN monthly_amount TO montant_mensuel;
    RAISE NOTICE 'Colonne monthly_amount renommée en montant_mensuel';
  END IF;

  -- Renommer start_date en date_debut_contrat si start_date existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'start_date'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'date_debut_contrat'
  ) THEN
    UPDATE public.clients 
    SET date_debut_contrat = start_date 
    WHERE start_date IS NOT NULL AND date_debut_contrat IS NULL;
    ALTER TABLE public.clients DROP COLUMN start_date;
    RAISE NOTICE 'Données de start_date copiées vers date_debut_contrat, start_date supprimée';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.clients RENAME COLUMN start_date TO date_debut_contrat;
    RAISE NOTICE 'Colonne start_date renommée en date_debut_contrat';
  END IF;

  -- Renommer next_invoice_date en date_anniversaire_abonnement si next_invoice_date existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'next_invoice_date'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'date_anniversaire_abonnement'
  ) THEN
    UPDATE public.clients 
    SET date_anniversaire_abonnement = next_invoice_date 
    WHERE next_invoice_date IS NOT NULL AND date_anniversaire_abonnement IS NULL;
    ALTER TABLE public.clients DROP COLUMN next_invoice_date;
    RAISE NOTICE 'Données de next_invoice_date copiées vers date_anniversaire_abonnement, next_invoice_date supprimée';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'next_invoice_date'
  ) THEN
    ALTER TABLE public.clients RENAME COLUMN next_invoice_date TO date_anniversaire_abonnement;
    RAISE NOTICE 'Colonne next_invoice_date renommée en date_anniversaire_abonnement';
  END IF;
END $$;

-- Définir NOT NULL sur statut si ce n'est pas déjà fait
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'statut' 
    AND is_nullable = 'YES'
  ) THEN
    UPDATE public.clients SET statut = 'prospect' WHERE statut IS NULL;
    ALTER TABLE public.clients ALTER COLUMN statut SET NOT NULL;
    ALTER TABLE public.clients ALTER COLUMN statut SET DEFAULT 'prospect';
  END IF;
END $$;

-- Contrainte CHECK sur statut
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clients_statut_check'
  ) THEN
    ALTER TABLE public.clients DROP CONSTRAINT clients_statut_check;
  END IF;
END $$;

ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_statut_check,
  ADD CONSTRAINT clients_statut_check 
    CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived', 'prospect', 'inactif', 'churned'));

-- Mettre à jour les valeurs NULL
UPDATE public.clients 
SET statut = 'prospect' 
WHERE statut IS NULL;

-- Indexes pour clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON public.clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_user_id_statut ON public.clients(user_id, statut);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS clients_updated_at ON public.clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies pour clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own clients" ON public.clients;
CREATE POLICY "Users can create own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TABLE gbp_report_templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gbp_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  template_type TEXT DEFAULT 'gbp_report',
  template_base_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter template_type si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gbp_report_templates' 
    AND column_name = 'template_type'
  ) THEN
    ALTER TABLE public.gbp_report_templates 
    ADD COLUMN template_type TEXT DEFAULT 'gbp_report';
  END IF;
END $$;

-- Contrainte CHECK sur template_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'gbp_report_templates_template_type_check'
  ) THEN
    ALTER TABLE public.gbp_report_templates
    ADD CONSTRAINT gbp_report_templates_template_type_check
    CHECK (template_type IN ('gbp_report', 'audit_document', 'custom'));
  END IF;
END $$;

-- Indexes pour gbp_report_templates
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_user_id ON public.gbp_report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_is_default ON public.gbp_report_templates(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_gbp_report_templates_template_type ON public.gbp_report_templates(user_id, template_type);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS gbp_report_templates_updated_at ON public.gbp_report_templates;
CREATE TRIGGER gbp_report_templates_updated_at
  BEFORE UPDATE ON public.gbp_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies pour gbp_report_templates
ALTER TABLE public.gbp_report_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can view their own GBP report templates"
  ON public.gbp_report_templates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can insert their own GBP report templates"
  ON public.gbp_report_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can update their own GBP report templates"
  ON public.gbp_report_templates FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP report templates" ON public.gbp_report_templates;
CREATE POLICY "Users can delete their own GBP report templates"
  ON public.gbp_report_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TABLE rapports_gbp
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rapports_gbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  -- Structure ancienne (pour compatibilité)
  type TEXT CHECK (type IN ('5_mois', 'mensuel', 'complet')),
  mois TEXT,
  annee INTEGER,
  date_generation TIMESTAMPTZ DEFAULT NOW(),
  
  -- Structure nouvelle
  month INTEGER CHECK (month >= 1 AND month <= 12),
  year INTEGER CHECK (year >= 2020 AND year <= 2100),
  template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
  report_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'archived')),
  
  -- Données
  kpis JSONB DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  screenshots JSONB DEFAULT '{}'::jsonb,
  
  -- Email
  date_envoi TIMESTAMPTZ,
  email_envoye BOOLEAN DEFAULT FALSE,
  destinataire_email TEXT,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rapports_gbp') THEN
    ALTER TABLE public.rapports_gbp 
    ADD COLUMN IF NOT EXISTS month INTEGER,
    ADD COLUMN IF NOT EXISTS year INTEGER,
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.gbp_report_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS report_data JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS screenshots JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS date_envoi TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS email_envoye BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS destinataire_email TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS date_generation TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Indexes pour rapports_gbp
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON public.rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON public.rapports_gbp(client_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_month_year ON public.rapports_gbp(year, month) WHERE year IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_annee_mois ON public.rapports_gbp(annee, mois) WHERE annee IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_template_id ON public.rapports_gbp(template_id) WHERE template_id IS NOT NULL;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS rapports_gbp_updated_at ON public.rapports_gbp;
CREATE TRIGGER rapports_gbp_updated_at
  BEFORE UPDATE ON public.rapports_gbp
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies pour rapports_gbp
ALTER TABLE public.rapports_gbp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can view their own GBP reports"
  ON public.rapports_gbp FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can insert their own GBP reports"
  ON public.rapports_gbp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can update their own GBP reports"
  ON public.rapports_gbp FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP reports" ON public.rapports_gbp;
CREATE POLICY "Users can delete their own GBP reports"
  ON public.rapports_gbp FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. NOTIFIER PostgREST POUR RECHARGER LE SCHÉMA
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- ✅ SCRIPT TERMINÉ
-- ============================================================================
-- Toutes les tables et colonnes nécessaires ont été créées/vérifiées
-- Vous pouvez maintenant utiliser l'application sans problème !

