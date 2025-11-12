-- Migration pour renommer les colonnes de la table invoices
-- Cette migration renomme les colonnes avec les anciens noms vers les nouveaux noms
-- Date: 2025-01-04

-- Renommer les colonnes si elles existent avec les anciens noms
DO $$ 
BEGIN
  -- Renommer numero_facture -> invoice_number
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'numero_facture'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE public.invoices RENAME COLUMN numero_facture TO invoice_number;
  END IF;

  -- Renommer montant -> amount_ht
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'montant'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'amount_ht'
  ) THEN
    ALTER TABLE public.invoices RENAME COLUMN montant TO amount_ht;
  END IF;

  -- Renommer montant_ttc -> amount_ttc (si différent, sinon on le laisse)
  -- Note: montant_ttc et amount_ttc sont similaires, mais vérifions quand même
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'montant_ttc'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'amount_ttc'
  ) THEN
    ALTER TABLE public.invoices RENAME COLUMN montant_ttc TO amount_ttc;
  END IF;

  -- Renommer date_emission -> date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'date_emission'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE public.invoices RENAME COLUMN date_emission TO date;
  END IF;

  -- Renommer statut -> status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'statut'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.invoices RENAME COLUMN statut TO status;
    
    -- Mettre à jour les valeurs de status si nécessaire
    -- Les valeurs possibles sont: 'payee', 'en_attente', 'en_retard'
    UPDATE public.invoices 
    SET status = 'en_attente' 
    WHERE status = 'envoyee' OR status NOT IN ('payee', 'en_attente', 'en_retard');
  END IF;

  -- Supprimer les colonnes qui n'existent pas dans le nouveau schéma
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'date_echeance'
  ) THEN
    ALTER TABLE public.invoices DROP COLUMN date_echeance;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'date_envoi'
  ) THEN
    ALTER TABLE public.invoices DROP COLUMN date_envoi;
  END IF;
END $$;

-- Mettre à jour la contrainte CHECK sur status si elle existe encore avec l'ancien nom
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND constraint_name LIKE '%statut%check%'
  ) THEN
    ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_statut_check CASCADE;
  END IF;
END $$;

-- Recréer la contrainte CHECK sur status avec les bonnes valeurs
DO $$ 
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND constraint_name = 'invoices_status_check'
  ) THEN
    ALTER TABLE public.invoices DROP CONSTRAINT invoices_status_check;
  END IF;
END $$;

-- Ajouter la nouvelle contrainte CHECK sur status
ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('payee', 'en_attente', 'en_retard'));

-- Ajouter les colonnes manquantes si la table existe mais sans certaines colonnes
DO $$ 
BEGIN
  -- Ajouter invoice_number si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN invoice_number TEXT;
    
    -- Si numero_facture existe, copier les données
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices' 
      AND column_name = 'numero_facture'
    ) THEN
      UPDATE public.invoices SET invoice_number = numero_facture WHERE invoice_number IS NULL;
      ALTER TABLE public.invoices ALTER COLUMN invoice_number SET NOT NULL;
      ALTER TABLE public.invoices DROP COLUMN numero_facture;
    END IF;
  END IF;

  -- Ajouter amount_ht si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'amount_ht'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN amount_ht DECIMAL(10,2);
    
    -- Si montant existe, copier les données
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices' 
      AND column_name = 'montant'
    ) THEN
      UPDATE public.invoices SET amount_ht = montant WHERE amount_ht IS NULL;
      ALTER TABLE public.invoices ALTER COLUMN amount_ht SET NOT NULL;
      ALTER TABLE public.invoices DROP COLUMN montant;
    END IF;
  END IF;

  -- Ajouter amount_ttc si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'amount_ttc'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN amount_ttc DECIMAL(10,2);
    
    -- Si montant_ttc existe, copier les données
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices' 
      AND column_name = 'montant_ttc'
    ) THEN
      UPDATE public.invoices SET amount_ttc = montant_ttc WHERE amount_ttc IS NULL;
      ALTER TABLE public.invoices ALTER COLUMN amount_ttc SET NOT NULL;
      ALTER TABLE public.invoices DROP COLUMN montant_ttc;
    END IF;
  END IF;

  -- Ajouter date si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN date DATE DEFAULT CURRENT_DATE;
    
    -- Si date_emission existe, copier les données
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices' 
      AND column_name = 'date_emission'
    ) THEN
      UPDATE public.invoices SET date = date_emission WHERE date IS NULL;
      ALTER TABLE public.invoices ALTER COLUMN date SET NOT NULL;
      ALTER TABLE public.invoices DROP COLUMN date_emission;
    END IF;
  END IF;

  -- Ajouter status si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN status TEXT DEFAULT 'en_attente';
    
    -- Si statut existe, copier les données
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'invoices' 
      AND column_name = 'statut'
    ) THEN
      UPDATE public.invoices SET status = statut WHERE status IS NULL;
      -- Mettre à jour les valeurs invalides
      UPDATE public.invoices 
      SET status = 'en_attente' 
      WHERE status = 'envoyee' OR status NOT IN ('payee', 'en_attente', 'en_retard');
      ALTER TABLE public.invoices ALTER COLUMN status SET NOT NULL;
      ALTER TABLE public.invoices DROP COLUMN statut;
    END IF;
  END IF;
END $$;

