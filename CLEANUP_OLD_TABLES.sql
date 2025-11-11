-- ============================================================================
-- 🧹 NETTOYAGE BASE DE DONNÉES - SUPPRESSION TABLES ANCIEN SYSTÈME
-- ============================================================================
-- Ce script supprime toutes les tables de l'ancien système
-- et garde uniquement celles nécessaires pour RaiseDesk TDAH
-- ============================================================================
-- ⚠️ ATTENTION : Ce script SUPPRIME DÉFINITIVEMENT des données !
-- Assurez-vous d'avoir fait une sauvegarde si nécessaire
-- ============================================================================

-- ============================================================================
-- TABLES À CONSERVER (système TDAH) :
-- ============================================================================
-- ✅ profiles
-- ✅ company_settings
-- ✅ clients
-- ✅ notes
-- ✅ tasks
-- ✅ monthly_reports
-- ✅ invoices
-- ✅ kpis
-- ✅ telegram_notifications
-- ✅ documents

-- ============================================================================
-- SUPPRESSION DES VUES (si elles existent)
-- ============================================================================
DROP VIEW IF EXISTS public.contacts_with_organization CASCADE;

-- ============================================================================
-- SUPPRESSION DES TABLES ANCIEN SYSTÈME
-- ============================================================================
-- Ordre de suppression : d'abord les tables qui référencent d'autres tables
-- Utilisation de CASCADE pour supprimer automatiquement les dépendances

-- 1. Tables qui dépendent de organizations (doivent être supprimées en premier)
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.review_campaigns CASCADE;

-- 2. Tables qui dépendent de clients (mais qui ne sont pas dans le nouveau schéma TDAH)
DROP TABLE IF EXISTS public.client_links CASCADE;
DROP TABLE IF EXISTS public.client_tasks CASCADE;
DROP TABLE IF EXISTS public.client_kpis CASCADE;
DROP TABLE IF EXISTS public.client_photos CASCADE;
DROP TABLE IF EXISTS public.client_calls CASCADE;
DROP TABLE IF EXISTS public.onboarding_checklists CASCADE;
DROP TABLE IF EXISTS public.brand_dna CASCADE;
DROP TABLE IF EXISTS public.review_settings CASCADE;
DROP TABLE IF EXISTS public.review_funnel_config CASCADE;
DROP TABLE IF EXISTS public.positive_review_redirects CASCADE;
DROP TABLE IF EXISTS public.negative_reviews CASCADE;
DROP TABLE IF EXISTS public.scan_reports CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.motivational_photos CASCADE;

-- 3. Tables indépendantes de l'ancien système (liste complète)
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.content_library CASCADE;
DROP TABLE IF EXISTS public.quick_notes CASCADE;
DROP TABLE IF EXISTS public.onboarding CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 4. Tables supplémentaires qui pourraient exister dans l'ancien système
DROP TABLE IF EXISTS public.review_responses CASCADE;
DROP TABLE IF EXISTS public.review_templates CASCADE;
DROP TABLE IF EXISTS public.campaign_analytics CASCADE;
DROP TABLE IF EXISTS public.client_segments CASCADE;
DROP TABLE IF EXISTS public.workflows CASCADE;
DROP TABLE IF EXISTS public.automation_rules CASCADE;

-- ============================================================================
-- NETTOYAGE DES INDEX ORPHELINS (optionnel, mais recommandé)
-- ============================================================================
-- Les index sont automatiquement supprimés avec les tables,
-- mais on peut nettoyer les index qui pourraient rester

-- ============================================================================
-- NETTOYAGE DES FONCTIONS/PROCÉDURES INUTILES (optionnel)
-- ============================================================================
-- Garder update_updated_at_column() et generate_invoice_number()
-- Supprimer les autres si elles existent et ne sont plus utilisées

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================
-- Après exécution, vous devriez avoir uniquement ces tables :
-- - profiles
-- - company_settings
-- - clients
-- - notes
-- - tasks
-- - monthly_reports
-- - invoices
-- - kpis
-- - telegram_notifications
-- - documents

-- ============================================================================
-- ✅ NETTOYAGE TERMINÉ
-- ============================================================================
-- Vérifiez dans Table Editor que seules les tables nécessaires sont présentes
-- ============================================================================

