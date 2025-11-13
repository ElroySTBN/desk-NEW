-- ============================================================================
-- SCRIPT DE VÉRIFICATION : Vérifier que toutes les tables et colonnes existent
-- ============================================================================
-- ⚠️ INSTRUCTIONS :
-- 1. Exécutez ce script dans Supabase SQL Editor après avoir exécuté COMPLETE_SETUP.sql
-- 2. Il vérifie que toutes les colonnes et tables nécessaires existent
-- 3. Il affiche un rapport clair de l'état de la base de données
-- ============================================================================

-- ============================================================================
-- VÉRIFICATION DES COLONNES DE LA TABLE clients
-- ============================================================================
DO $$ 
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  col TEXT;
  required_columns TEXT[] := ARRAY[
    'id', 'user_id', 'name', 'company', 'email', 'phone', 'notes',
    'statut', 'contract_type', 'montant_mensuel', 
    'date_debut_contrat', 'date_anniversaire_abonnement',
    'secteur_activite', 'type_campagne',
    'created_at', 'updated_at'
  ];
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DE LA TABLE clients';
  RAISE NOTICE '========================================';
  
  -- Vérifier chaque colonne requise
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'clients' 
      AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) IS NULL THEN
    RAISE NOTICE '✅ Toutes les colonnes nécessaires existent dans la table clients';
  ELSE
    RAISE NOTICE '❌ Colonnes manquantes dans la table clients : %', array_to_string(missing_columns, ', ');
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION DE LA TABLE gbp_report_templates
-- ============================================================================
DO $$ 
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  col TEXT;
  required_columns TEXT[] := ARRAY[
    'id', 'user_id', 'name', 'description', 'is_default',
    'template_type', 'template_base_url', 'template_config',
    'created_at', 'updated_at'
  ];
  table_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DE LA TABLE gbp_report_templates';
  RAISE NOTICE '========================================';
  
  -- Vérifier si la table existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'gbp_report_templates'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE '❌ La table gbp_report_templates n''existe pas !';
    RAISE NOTICE '';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ La table gbp_report_templates existe';
  
  -- Vérifier chaque colonne requise
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'gbp_report_templates' 
      AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) IS NULL THEN
    RAISE NOTICE '✅ Toutes les colonnes nécessaires existent dans la table gbp_report_templates';
  ELSE
    RAISE NOTICE '❌ Colonnes manquantes dans la table gbp_report_templates : %', array_to_string(missing_columns, ', ');
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION DE LA TABLE rapports_gbp
-- ============================================================================
DO $$ 
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  col TEXT;
  required_columns TEXT[] := ARRAY[
    'id', 'user_id', 'client_id', 'month', 'year', 'template_id',
    'report_data', 'status', 'kpis', 'pdf_url', 'screenshots',
    'date_envoi', 'email_envoye', 'destinataire_email',
    'created_by', 'notes', 'date_generation',
    'created_at', 'updated_at'
  ];
  table_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DE LA TABLE rapports_gbp';
  RAISE NOTICE '========================================';
  
  -- Vérifier si la table existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'rapports_gbp'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE '❌ La table rapports_gbp n''existe pas !';
    RAISE NOTICE '';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ La table rapports_gbp existe';
  
  -- Vérifier chaque colonne requise
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'rapports_gbp' 
      AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) IS NULL THEN
    RAISE NOTICE '✅ Toutes les colonnes nécessaires existent dans la table rapports_gbp';
  ELSE
    RAISE NOTICE '⚠️  Colonnes optionnelles manquantes dans la table rapports_gbp : %', array_to_string(missing_columns, ', ');
    RAISE NOTICE '   (Ces colonnes sont optionnelles et peuvent être ajoutées si nécessaire)';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================
DO $$ 
DECLARE
  missing_policies TEXT[] := ARRAY[]::TEXT[];
  policy_name TEXT;
  required_policies TEXT[] := ARRAY[
    'Users can view own clients',
    'Users can create own clients',
    'Users can update own clients',
    'Users can delete own clients',
    'Users can view their own GBP report templates',
    'Users can insert their own GBP report templates',
    'Users can update their own GBP report templates',
    'Users can delete their own GBP report templates',
    'Users can view their own GBP reports',
    'Users can insert their own GBP reports',
    'Users can update their own GBP reports',
    'Users can delete their own GBP reports'
  ];
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DES POLITIQUES RLS';
  RAISE NOTICE '========================================';
  
  -- Vérifier chaque politique requise
  FOREACH policy_name IN ARRAY required_policies
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND policyname = policy_name
    ) THEN
      missing_policies := array_append(missing_policies, policy_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_policies, 1) IS NULL THEN
    RAISE NOTICE '✅ Toutes les politiques RLS nécessaires existent';
  ELSE
    RAISE NOTICE '❌ Politiques RLS manquantes :';
    FOREACH policy_name IN ARRAY missing_policies
    LOOP
      RAISE NOTICE '   - %', policy_name;
    END LOOP;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VÉRIFICATION DES INDEX
-- ============================================================================
DO $$ 
DECLARE
  missing_indexes TEXT[] := ARRAY[]::TEXT[];
  idx_name TEXT;
  required_indexes TEXT[] := ARRAY[
    'idx_clients_user_id',
    'idx_clients_statut',
    'idx_gbp_report_templates_user_id',
    'idx_rapports_gbp_user_id',
    'idx_rapports_gbp_client_id'
  ];
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DES INDEX';
  RAISE NOTICE '========================================';
  
  -- Vérifier chaque index requis
  FOREACH idx_name IN ARRAY required_indexes
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = idx_name
    ) THEN
      missing_indexes := array_append(missing_indexes, idx_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_indexes, 1) IS NULL THEN
    RAISE NOTICE '✅ Tous les index principaux existent';
  ELSE
    RAISE NOTICE '⚠️  Index manquants (optionnels, pour optimiser les performances) :';
    FOREACH idx_name IN ARRAY missing_indexes
    LOOP
      RAISE NOTICE '   - %', idx_name;
    END LOOP;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VÉRIFICATION TERMINÉE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Si des erreurs ou des avertissements apparaissent ci-dessus,';
  RAISE NOTICE 'réexécutez le script COMPLETE_SETUP.sql pour corriger les problèmes.';
  RAISE NOTICE '';
END $$;

