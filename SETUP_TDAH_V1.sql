-- ============================================================================
-- 🔧 SETUP RAISEDESK TDAH V1 - NOUVEAU PROJET
-- ============================================================================
-- Schéma de base de données adapté pour TDAH
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
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. COMPANY SETTINGS (Informations entreprise)
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
-- 3. CLIENTS (Table principale clients)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  secteur_activite TEXT,
  type_campagne TEXT[] DEFAULT ARRAY[]::TEXT[],
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived')),
  date_debut_contrat DATE,
  date_anniversaire_abonnement DATE,
  montant_mensuel DECIMAL(10,2) DEFAULT 0,
  liens_rapides JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
  -- Ajouter secteur_activite si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'secteur_activite') THEN
    ALTER TABLE public.clients ADD COLUMN secteur_activite TEXT;
  END IF;

  -- Ajouter type_campagne si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'type_campagne') THEN
    ALTER TABLE public.clients ADD COLUMN type_campagne TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Renommer status en statut si status existe et statut n'existe pas
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'clients' 
             AND column_name = 'status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'clients' 
                     AND column_name = 'statut') THEN
    ALTER TABLE public.clients RENAME COLUMN status TO statut;
    ALTER TABLE public.clients ALTER COLUMN statut SET DEFAULT 'actif';
    ALTER TABLE public.clients ADD CONSTRAINT clients_statut_check 
      CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived'));
  END IF;

  -- Ajouter statut si ni status ni statut n'existent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'statut')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'clients' 
                     AND column_name = 'status') THEN
    ALTER TABLE public.clients ADD COLUMN statut TEXT DEFAULT 'actif';
    ALTER TABLE public.clients ADD CONSTRAINT clients_statut_check 
      CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived'));
  END IF;

  -- Ajouter date_debut_contrat si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'date_debut_contrat') THEN
    ALTER TABLE public.clients ADD COLUMN date_debut_contrat DATE;
  END IF;

  -- Ajouter date_anniversaire_abonnement si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'date_anniversaire_abonnement') THEN
    ALTER TABLE public.clients ADD COLUMN date_anniversaire_abonnement DATE;
  END IF;

  -- Renommer monthly_amount en montant_mensuel si monthly_amount existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'clients' 
             AND column_name = 'monthly_amount')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'clients' 
                     AND column_name = 'montant_mensuel') THEN
    ALTER TABLE public.clients RENAME COLUMN monthly_amount TO montant_mensuel;
    ALTER TABLE public.clients ALTER COLUMN montant_mensuel SET DEFAULT 0;
  END IF;

  -- Ajouter montant_mensuel si ni monthly_amount ni montant_mensuel n'existent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'montant_mensuel')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'clients' 
                     AND column_name = 'monthly_amount') THEN
    ALTER TABLE public.clients ADD COLUMN montant_mensuel DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- Ajouter liens_rapides si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'clients' 
                 AND column_name = 'liens_rapides') THEN
    ALTER TABLE public.clients ADD COLUMN liens_rapides JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- 4. NOTES (Notes chronologiques liées aux clients)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'observation' CHECK (type IN ('observation', 'call', 'insight', 'alerte')),
  contenu TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  date_note TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. TASKS (Système de tâches avec priorisation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  deadline TIMESTAMPTZ,
  recurring BOOLEAN DEFAULT FALSE,
  cron_expression TEXT,
  created_from_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  calculated_priority_score INTEGER DEFAULT 0,
  is_blocking BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
  -- Renommer due_date en deadline si due_date existe et deadline n'existe pas
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND column_name = 'due_date')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'tasks' 
                     AND column_name = 'deadline') THEN
    ALTER TABLE public.tasks RENAME COLUMN due_date TO deadline;
  END IF;

  -- Ajouter deadline si ni due_date ni deadline n'existent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'deadline')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'tasks' 
                     AND column_name = 'due_date') THEN
    ALTER TABLE public.tasks ADD COLUMN deadline TIMESTAMPTZ;
  END IF;

  -- Ajouter recurring si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'recurring') THEN
    ALTER TABLE public.tasks ADD COLUMN recurring BOOLEAN DEFAULT FALSE;
  END IF;

  -- Ajouter cron_expression si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'cron_expression') THEN
    ALTER TABLE public.tasks ADD COLUMN cron_expression TEXT;
  END IF;

  -- Ajouter created_from_note_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'created_from_note_id') THEN
    ALTER TABLE public.tasks ADD COLUMN created_from_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL;
  END IF;

  -- Ajouter calculated_priority_score si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'calculated_priority_score') THEN
    ALTER TABLE public.tasks ADD COLUMN calculated_priority_score INTEGER DEFAULT 0;
  END IF;

  -- Ajouter is_blocking si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'is_blocking') THEN
    ALTER TABLE public.tasks ADD COLUMN is_blocking BOOLEAN DEFAULT FALSE;
  END IF;

  -- Mettre à jour le statut si nécessaire (completed -> done)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND column_name = 'status') THEN
    -- Mettre à jour les valeurs 'completed' en 'done'
    UPDATE public.tasks SET status = 'done' WHERE status = 'completed';
    -- Mettre à jour les valeurs 'cancelled' en 'archived'
    UPDATE public.tasks SET status = 'archived' WHERE status = 'cancelled';
  END IF;
END $$;

-- ============================================================================
-- 6. MONTHLY_REPORTS (Rapports mensuels)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  mois INTEGER NOT NULL CHECK (mois >= 1 AND mois <= 12),
  annee INTEGER NOT NULL,
  pdf_url TEXT,
  date_generation TIMESTAMPTZ,
  date_envoi TIMESTAMPTZ,
  kpis JSONB DEFAULT '{}'::jsonb,
  observations_incluses UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, mois, annee)
);

-- ============================================================================
-- 7. INVOICES (Facturation automatique)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  numero_facture TEXT NOT NULL UNIQUE,
  montant DECIMAL(10,2) NOT NULL,
  montant_ttc DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) DEFAULT 20,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE,
  pdf_url TEXT,
  statut TEXT DEFAULT 'envoyee' CHECK (statut IN ('envoyee', 'payee', 'en_retard', 'annulee')),
  date_envoi TIMESTAMPTZ,
  date_paiement DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
  -- Renommer invoice_number en numero_facture si invoice_number existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'invoice_number')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'invoices' 
                     AND column_name = 'numero_facture') THEN
    ALTER TABLE public.invoices RENAME COLUMN invoice_number TO numero_facture;
  END IF;

  -- Renommer date en date_emission si date existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'date')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'invoices' 
                     AND column_name = 'date_emission') THEN
    ALTER TABLE public.invoices RENAME COLUMN date TO date_emission;
  END IF;

  -- Renommer amount_ht en montant si amount_ht existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'amount_ht')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'invoices' 
                     AND column_name = 'montant') THEN
    ALTER TABLE public.invoices RENAME COLUMN amount_ht TO montant;
  END IF;

  -- Renommer amount_ttc en montant_ttc si amount_ttc existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'amount_ttc')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'invoices' 
                     AND column_name = 'montant_ttc') THEN
    ALTER TABLE public.invoices RENAME COLUMN amount_ttc TO montant_ttc;
  END IF;

  -- Renommer status en statut si status existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_schema = 'public' 
                     AND table_name = 'invoices' 
                     AND column_name = 'statut') THEN
    ALTER TABLE public.invoices RENAME COLUMN status TO statut;
    -- Mettre à jour les valeurs existantes
    UPDATE public.invoices SET statut = 'payee' WHERE statut = 'payee';
    UPDATE public.invoices SET statut = 'en_retard' WHERE statut = 'en_retard';
    UPDATE public.invoices SET statut = 'envoyee' WHERE statut = 'en_attente';
    -- Ajouter la contrainte CHECK
    ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_statut_check;
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_statut_check 
      CHECK (statut IN ('envoyee', 'payee', 'en_retard', 'annulee'));
  END IF;

  -- Ajouter date_echeance si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'invoices' 
                 AND column_name = 'date_echeance') THEN
    ALTER TABLE public.invoices ADD COLUMN date_echeance DATE;
  END IF;

  -- Ajouter pdf_url si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'invoices' 
                 AND column_name = 'pdf_url') THEN
    ALTER TABLE public.invoices ADD COLUMN pdf_url TEXT;
  END IF;

  -- Ajouter date_envoi si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'invoices' 
                 AND column_name = 'date_envoi') THEN
    ALTER TABLE public.invoices ADD COLUMN date_envoi TIMESTAMPTZ;
  END IF;

  -- Ajouter date_paiement si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'invoices' 
                 AND column_name = 'date_paiement') THEN
    ALTER TABLE public.invoices ADD COLUMN date_paiement DATE;
  END IF;
END $$;

-- ============================================================================
-- 8. KPIS (Métriques trackées par client)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  nom_kpi TEXT NOT NULL,
  valeur TEXT NOT NULL,
  date_mesure DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. TELEGRAM_NOTIFICATIONS (Historique notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.telegram_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- ============================================================================
-- 10. DOCUMENTS (Documents archivés par client)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('rapport', 'facture', 'onboarding', 'autre')),
  titre TEXT NOT NULL,
  fichier_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES pour performance
-- ============================================================================

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Créer index sur statut seulement si la colonne existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'clients' 
             AND column_name = 'statut') THEN
    CREATE INDEX IF NOT EXISTS idx_clients_statut ON public.clients(statut);
  END IF;
END $$;

-- Créer index sur date_anniversaire_abonnement seulement si la colonne existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'clients' 
             AND column_name = 'date_anniversaire_abonnement') THEN
    CREATE INDEX IF NOT EXISTS idx_clients_date_anniversaire ON public.clients(date_anniversaire_abonnement);
  END IF;
END $$;

-- Notes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON public.notes(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_date_note ON public.notes(date_note DESC);
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.notes(type);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Créer index sur deadline seulement si la colonne existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND column_name = 'deadline') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks' 
                AND column_name = 'due_date') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
  END IF;
END $$;

-- Créer index sur calculated_priority_score seulement si la colonne existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND column_name = 'calculated_priority_score') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_priority_score ON public.tasks(calculated_priority_score DESC);
  END IF;
END $$;

-- Monthly Reports
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_id ON public.monthly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_client_id ON public.monthly_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON public.monthly_reports(annee, mois);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);

-- Créer index sur statut seulement si la colonne existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'statut') THEN
    CREATE INDEX IF NOT EXISTS idx_invoices_statut ON public.invoices(statut);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'invoices' 
                AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
  END IF;
END $$;

-- Créer index sur date_emission seulement si la colonne existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'date_emission') THEN
    CREATE INDEX IF NOT EXISTS idx_invoices_date_emission ON public.invoices(date_emission);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'invoices' 
                AND column_name = 'date') THEN
    CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(date);
  END IF;
END $$;

-- KPIs
CREATE INDEX IF NOT EXISTS idx_kpis_user_id ON public.kpis(user_id);
CREATE INDEX IF NOT EXISTS idx_kpis_client_id ON public.kpis(client_id);
CREATE INDEX IF NOT EXISTS idx_kpis_date_mesure ON public.kpis(date_mesure DESC);

-- Telegram Notifications
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_user_id ON public.telegram_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_sent_at ON public.telegram_notifications(sent_at DESC);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);

-- ============================================================================
-- TRIGGERS pour updated_at automatique
-- ============================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_reports_updated_at ON public.monthly_reports;
CREATE TRIGGER update_monthly_reports_updated_at
  BEFORE UPDATE ON public.monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kpis_updated_at ON public.kpis;
CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION pour générer numéro facture auto-incrémenté
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
  column_name TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  month_part := TO_CHAR(CURRENT_DATE, 'MM');
  
  -- Vérifier quelle colonne existe (numero_facture ou invoice_number)
  SELECT column_name INTO column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'invoices'
    AND column_name IN ('numero_facture', 'invoice_number')
  LIMIT 1;
  
  IF column_name = 'numero_facture' THEN
    -- Récupérer le dernier numéro de facture du mois
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_facture FROM '\d+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE numero_facture LIKE 'FACT-' || year_part || '-' || month_part || '-%';
  ELSIF column_name = 'invoice_number' THEN
    -- Fallback pour l'ancienne structure
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE invoice_number LIKE 'FACT-' || year_part || '-' || month_part || '-%';
  ELSE
    -- Si aucune colonne n'existe, commencer à 1
    sequence_num := 1;
  END IF;
  
  invoice_num := 'FACT-' || year_part || '-' || month_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Isolation des données par utilisateur
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies pour company_settings
DROP POLICY IF EXISTS "Users can manage own company settings" ON public.company_settings;
CREATE POLICY "Users can manage own company settings"
  ON public.company_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour clients
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients"
  ON public.clients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour notes
DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
CREATE POLICY "Users can manage own notes"
  ON public.notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
  ON public.tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour monthly_reports
DROP POLICY IF EXISTS "Users can manage own monthly reports" ON public.monthly_reports;
CREATE POLICY "Users can manage own monthly reports"
  ON public.monthly_reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour invoices
DROP POLICY IF EXISTS "Users can manage own invoices" ON public.invoices;
CREATE POLICY "Users can manage own invoices"
  ON public.invoices
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour kpis
DROP POLICY IF EXISTS "Users can manage own kpis" ON public.kpis;
CREATE POLICY "Users can manage own kpis"
  ON public.kpis
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies pour telegram_notifications
DROP POLICY IF EXISTS "Users can view own telegram notifications" ON public.telegram_notifications;
CREATE POLICY "Users can view own telegram notifications"
  ON public.telegram_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own telegram notifications" ON public.telegram_notifications;
CREATE POLICY "Users can insert own telegram notifications"
  ON public.telegram_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour documents
DROP POLICY IF EXISTS "Users can manage own documents" ON public.documents;
CREATE POLICY "Users can manage own documents"
  ON public.documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GRANTS (Permissions PostgREST)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- ✅ SETUP TERMINÉ
-- ============================================================================
-- Vérifiez que toutes les tables sont créées dans Table Editor
-- ============================================================================

