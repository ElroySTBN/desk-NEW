-- ============================================================================
-- Migration : Correction Complète de Toutes les Contraintes CHECK
-- ============================================================================
-- Cette migration corrige toutes les contraintes CHECK pour qu'elles correspondent
-- au frontend et au nouveau schéma TDAH
-- ============================================================================

-- ============================================================================
-- 1. TABLE TASKS - Corrections
-- ============================================================================

-- 1.1 Supprimer toutes les anciennes contraintes CHECK sur tasks.category
DO $$ 
BEGIN
  -- Supprimer toutes les variantes de contraintes CHECK sur category
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND constraint_name LIKE '%category%check%') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_category_check CASCADE;
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS task_category_check CASCADE;
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS task_catégoriy_check CASCADE;
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_catégoriy_check CASCADE;
  END IF;
END $$;

-- 1.2 Modifier category pour permettre TEXT libre (NULL ou texte)
DO $$ 
BEGIN
  -- Si category n'existe pas, l'ajouter
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'category') THEN
    ALTER TABLE public.tasks ADD COLUMN category TEXT;
  ELSE
    -- Si category existe, modifier pour permettre NULL et texte libre
    -- Vérifier si la colonne a NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'tasks' 
               AND column_name = 'category'
               AND is_nullable = 'NO') THEN
      ALTER TABLE public.tasks ALTER COLUMN category DROP NOT NULL;
    END IF;
    -- S'assurer que category est de type TEXT (au cas où ce serait un autre type)
    ALTER TABLE public.tasks ALTER COLUMN category TYPE TEXT;
  END IF;
END $$;

-- 1.3 Corriger la contrainte CHECK sur status
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur status
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND constraint_name LIKE '%status%check%') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check CASCADE;
  END IF;
  
  -- Migrer les données existantes
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND column_name = 'status') THEN
    -- Migrer 'completed' -> 'done'
    UPDATE public.tasks SET status = 'done' WHERE status = 'completed';
    -- Migrer 'cancelled' -> 'archived'
    UPDATE public.tasks SET status = 'archived' WHERE status = 'cancelled';
  END IF;
END $$;

-- 1.4 Recréer la bonne contrainte CHECK sur status
ALTER TABLE public.tasks 
  DROP CONSTRAINT IF EXISTS tasks_status_check,
  ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'in_progress', 'done', 'archived'));

-- 1.5 Corriger la contrainte CHECK sur priority
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur priority
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND constraint_name LIKE '%priority%check%') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur priority
ALTER TABLE public.tasks 
  DROP CONSTRAINT IF EXISTS tasks_priority_check,
  ADD CONSTRAINT tasks_priority_check 
    CHECK (priority IN ('urgent', 'high', 'medium', 'low'));

-- 1.6 S'assurer que deadline existe (et pas due_date)
DO $$ 
BEGIN
  -- Renommer due_date en deadline si due_date existe
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
  
  -- Ajouter deadline si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'deadline') THEN
    ALTER TABLE public.tasks ADD COLUMN deadline TIMESTAMPTZ;
  END IF;
END $$;

-- 1.7 Supprimer la colonne urgency si elle existe (remplacée par is_blocking)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'tasks' 
             AND column_name = 'urgency') THEN
    -- Migrer les données si nécessaire
    UPDATE public.tasks SET is_blocking = true WHERE urgency = true AND (is_blocking IS NULL OR is_blocking = false);
    -- Supprimer la colonne urgency
    ALTER TABLE public.tasks DROP COLUMN urgency;
  END IF;
END $$;

-- ============================================================================
-- 2. TABLE CLIENTS - Vérifier contrainte CHECK sur statut
-- ============================================================================

DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur statut si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'clients' 
             AND constraint_name LIKE '%statut%check%') THEN
    ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_statut_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur statut
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_statut_check,
  ADD CONSTRAINT clients_statut_check 
    CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived'));

-- ============================================================================
-- 3. TABLE NOTES - Vérifier contrainte CHECK sur type
-- ============================================================================

DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur type si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'notes' 
             AND constraint_name LIKE '%type%check%') THEN
    ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_type_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur type
ALTER TABLE public.notes 
  DROP CONSTRAINT IF EXISTS notes_type_check,
  ADD CONSTRAINT notes_type_check 
    CHECK (type IN ('observation', 'call', 'insight', 'alerte'));

-- ============================================================================
-- 4. TABLE INVOICES - Vérifier contrainte CHECK sur statut
-- ============================================================================

DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur statut si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND constraint_name LIKE '%statut%check%') THEN
    ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_statut_check CASCADE;
  END IF;
  
  -- Migrer les données si nécessaire
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'invoices' 
             AND column_name = 'statut') THEN
    -- Migrer 'en_attente' -> 'envoyee' si nécessaire
    UPDATE public.invoices SET statut = 'envoyee' WHERE statut = 'en_attente';
    -- Migrer 'payé' -> 'payee' si nécessaire
    UPDATE public.invoices SET statut = 'payee' WHERE statut = 'payé';
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur statut
ALTER TABLE public.invoices 
  DROP CONSTRAINT IF EXISTS invoices_statut_check,
  ADD CONSTRAINT invoices_statut_check 
    CHECK (statut IN ('envoyee', 'payee', 'en_retard', 'annulee'));

-- ============================================================================
-- 5. TABLE PRODUCTS - Vérifier contrainte CHECK sur subscription_type
-- ============================================================================

DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur subscription_type si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'products' 
             AND constraint_name LIKE '%subscription_type%check%') THEN
    ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_subscription_type_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur subscription_type
ALTER TABLE public.products 
  DROP CONSTRAINT IF EXISTS products_subscription_type_check,
  ADD CONSTRAINT products_subscription_type_check 
    CHECK (subscription_type IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel', 'installation', 'service'));

-- ============================================================================
-- 6. TABLE DOCUMENTS - Vérifier contrainte CHECK sur type
-- ============================================================================

DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur type si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'documents' 
             AND constraint_name LIKE '%type%check%') THEN
    ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_type_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur type
ALTER TABLE public.documents 
  DROP CONSTRAINT IF EXISTS documents_type_check,
  ADD CONSTRAINT documents_type_check 
    CHECK (type IN ('rapport', 'facture', 'onboarding', 'autre'));

-- ============================================================================
-- 7. TABLE CONTENT_LIBRARY - Vérifier contraintes CHECK
-- ============================================================================

-- 7.1 Vérifier contrainte CHECK sur content_type
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur content_type si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'content_library' 
             AND constraint_name LIKE '%content_type%check%') THEN
    ALTER TABLE public.content_library DROP CONSTRAINT IF EXISTS content_library_content_type_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur content_type (si la table existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'content_library') THEN
    ALTER TABLE public.content_library 
      DROP CONSTRAINT IF EXISTS content_library_content_type_check,
      ADD CONSTRAINT content_library_content_type_check 
        CHECK (content_type IN ('post', 'photo', 'promotion', 'update', 'other'));
  END IF;
END $$;

-- 7.2 Vérifier contrainte CHECK sur status
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur status si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'content_library' 
             AND constraint_name LIKE '%status%check%') THEN
    ALTER TABLE public.content_library DROP CONSTRAINT IF EXISTS content_library_status_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur status (si la table existe)
-- Note: 'sent' est utilisé pour onboarding, pas pour content_library
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'content_library') THEN
    ALTER TABLE public.content_library 
      DROP CONSTRAINT IF EXISTS content_library_status_check,
      ADD CONSTRAINT content_library_status_check 
        CHECK (status IN ('draft', 'ready', 'scheduled', 'published'));
  END IF;
END $$;

-- ============================================================================
-- 8. TABLE MONTHLY_REPORTS - Vérifier contrainte CHECK sur mois
-- ============================================================================

DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur mois si elle existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_schema = 'public' 
             AND table_name = 'monthly_reports' 
             AND constraint_name LIKE '%mois%check%') THEN
    ALTER TABLE public.monthly_reports DROP CONSTRAINT IF EXISTS monthly_reports_mois_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur mois
ALTER TABLE public.monthly_reports 
  DROP CONSTRAINT IF EXISTS monthly_reports_mois_check,
  ADD CONSTRAINT monthly_reports_mois_check 
    CHECK (mois >= 1 AND mois <= 12);

-- ============================================================================
-- 9. VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que toutes les colonnes nécessaires existent dans tasks
DO $$ 
BEGIN
  -- Ajouter is_blocking si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'is_blocking') THEN
    ALTER TABLE public.tasks ADD COLUMN is_blocking BOOLEAN DEFAULT FALSE;
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
  
  -- Ajouter calculated_priority_score si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'calculated_priority_score') THEN
    ALTER TABLE public.tasks ADD COLUMN calculated_priority_score INTEGER DEFAULT 0;
  END IF;
  
  -- Ajouter created_from_note_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'tasks' 
                 AND column_name = 'created_from_note_id') THEN
    ALTER TABLE public.tasks ADD COLUMN created_from_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 10. COMMENTAIRES
-- ============================================================================

COMMENT ON COLUMN public.tasks.category IS 'Catégorie libre de la tâche (texte libre, pas de contrainte CHECK)';
COMMENT ON COLUMN public.tasks.status IS 'Statut de la tâche : todo, in_progress, done, archived';
COMMENT ON COLUMN public.tasks.priority IS 'Priorité de la tâche : urgent, high, medium, low';
COMMENT ON COLUMN public.tasks.deadline IS 'Date limite de la tâche (remplace due_date)';
COMMENT ON COLUMN public.tasks.is_blocking IS 'Indique si la tâche bloque d''autres tâches (remplace urgency)';

-- ============================================================================
-- ✅ MIGRATION TERMINÉE
-- ============================================================================
-- Toutes les contraintes CHECK ont été corrigées pour correspondre au frontend
-- ============================================================================

