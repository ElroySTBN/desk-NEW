-- ============================================================================
-- Migration pour aligner les colonnes de la table clients avec le code français
-- ============================================================================
-- Date: 2025-01-08
-- Description: Renomme les colonnes anglaises en français et ajoute les colonnes manquantes

-- ============================================================================
-- 1. RENOMMER status EN statut
-- ============================================================================
DO $$ 
BEGIN
  -- Vérifier si la colonne status existe et la renommer en statut
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'status'
  ) THEN
    -- Renommer la colonne status en statut
    ALTER TABLE public.clients 
    RENAME COLUMN status TO statut;
    
    RAISE NOTICE 'Colonne status renommée en statut avec succès';
  ELSIF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'statut'
  ) THEN
    RAISE NOTICE 'Colonne statut existe déjà, aucune action nécessaire';
  ELSE
    -- Si aucune des deux colonnes n'existe, créer statut
    ALTER TABLE public.clients 
    ADD COLUMN statut TEXT NOT NULL DEFAULT 'actif';
    RAISE NOTICE 'Colonne statut créée';
  END IF;
END $$;

-- ============================================================================
-- 2. RENOMMER monthly_amount EN montant_mensuel
-- ============================================================================
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'monthly_amount'
  ) THEN
    ALTER TABLE public.clients 
    RENAME COLUMN monthly_amount TO montant_mensuel;
    RAISE NOTICE 'Colonne monthly_amount renommée en montant_mensuel';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'montant_mensuel'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN montant_mensuel DECIMAL(10,2);
    RAISE NOTICE 'Colonne montant_mensuel créée';
  END IF;
END $$;

-- ============================================================================
-- 3. RENOMMER start_date EN date_debut_contrat
-- ============================================================================
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.clients 
    RENAME COLUMN start_date TO date_debut_contrat;
    RAISE NOTICE 'Colonne start_date renommée en date_debut_contrat';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'date_debut_contrat'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN date_debut_contrat DATE;
    RAISE NOTICE 'Colonne date_debut_contrat créée';
  END IF;
END $$;

-- ============================================================================
-- 4. RENOMMER next_invoice_date EN date_anniversaire_abonnement
-- ============================================================================
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'next_invoice_date'
  ) THEN
    ALTER TABLE public.clients 
    RENAME COLUMN next_invoice_date TO date_anniversaire_abonnement;
    RAISE NOTICE 'Colonne next_invoice_date renommée en date_anniversaire_abonnement';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'date_anniversaire_abonnement'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN date_anniversaire_abonnement DATE;
    RAISE NOTICE 'Colonne date_anniversaire_abonnement créée';
  END IF;
END $$;

-- ============================================================================
-- 5. AJOUTER secteur_activite
-- ============================================================================
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS secteur_activite TEXT;

-- ============================================================================
-- 6. AJOUTER type_campagne (ARRAY de TEXT)
-- ============================================================================
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS type_campagne TEXT[];

-- ============================================================================
-- 7. SUPPRIMER LES ANCIENNES CONTRAINTES CHECK SUR status
-- ============================================================================
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND constraint_name LIKE '%status%check%'
  ) THEN
    ALTER TABLE public.clients 
    DROP CONSTRAINT IF EXISTS clients_status_check CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 8. RECRÉER LA CONTRAINTE CHECK SUR statut
-- ============================================================================
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte CHECK sur statut si elle existe
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND constraint_name LIKE '%statut%check%'
  ) THEN
    ALTER TABLE public.clients 
    DROP CONSTRAINT IF EXISTS clients_statut_check CASCADE;
  END IF;
END $$;

-- Recréer la bonne contrainte CHECK sur statut
ALTER TABLE public.clients 
  DROP CONSTRAINT IF EXISTS clients_statut_check,
  ADD CONSTRAINT clients_statut_check 
    CHECK (statut IN ('actif', 'pause', 'a_renouveler', 'archived', 'prospect', 'inactif', 'churned'));

-- ============================================================================
-- 9. METTRE À JOUR LES VALEURS EXISTANTES
-- ============================================================================
UPDATE public.clients 
SET statut = 'actif' 
WHERE statut IS NULL OR statut = 'prospect';

-- ============================================================================
-- 10. CRÉER DES INDEX POUR AMÉLIORER LES PERFORMANCES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_statut ON public.clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_user_id_statut ON public.clients(user_id, statut);

-- ============================================================================
-- 11. AJOUTER DES COMMENTAIRES POUR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN public.clients.statut IS 'Statut du client: actif, pause, a_renouveler, archived, prospect, inactif, churned';
COMMENT ON COLUMN public.clients.montant_mensuel IS 'Montant mensuel du contrat en euros';
COMMENT ON COLUMN public.clients.date_debut_contrat IS 'Date de début du contrat';
COMMENT ON COLUMN public.clients.date_anniversaire_abonnement IS 'Date anniversaire de l''abonnement (pour facturation mensuelle)';
COMMENT ON COLUMN public.clients.secteur_activite IS 'Secteur d''activité du client';
COMMENT ON COLUMN public.clients.type_campagne IS 'Types de campagnes proposées au client (array)';

