-- ============================================================================
-- 🔄 CONFIGURATION DES CRON JOBS POUR AUTOMATISATIONS
-- ============================================================================
-- Ce script configure les tâches planifiées pour :
-- 1. Vérification des deadlines (rapports, factures, tâches urgentes)
-- 2. Génération automatique des factures
-- ============================================================================
-- ⚠️ IMPORTANT : Remplacez [YOUR_PROJECT_REF] par votre Project Reference Supabase
-- Vous le trouvez dans Settings > API > Project URL
-- ============================================================================

-- Activer l'extension pg_cron (si disponible)
-- Note: pg_cron peut nécessiter des privilèges administrateur
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- FONCTION HELPER : Appeler une Edge Function Supabase
-- ============================================================================
CREATE OR REPLACE FUNCTION call_edge_function(
  function_name TEXT,
  project_ref TEXT DEFAULT current_setting('app.settings.project_ref', true)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  url TEXT;
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Construire l'URL de l'Edge Function
  url := format('https://%s.supabase.co/functions/v1/%s', project_ref, function_name);
  
  -- Appeler l'Edge Function via HTTP
  -- Note: Cela nécessite l'extension http (peut ne pas être disponible)
  -- Alternative: Utiliser Supabase Dashboard > Database > Cron Jobs (si disponible)
  
  RAISE NOTICE 'Would call Edge Function: %', url;
END;
$$;

-- ============================================================================
-- CRON JOB 1 : Vérification des deadlines (tous les jours à 9h00)
-- ============================================================================
-- Ce job vérifie :
-- - Rapports mensuels à générer (3 jours avant fin de mois)
-- - Factures à générer (3 jours avant anniversaire)
-- - Tâches urgentes en retard
-- - Rappels pour répondre aux avis Google

-- Option 1 : Si pg_cron est disponible et configuré
-- Décommentez et adaptez selon votre configuration Supabase

/*
SELECT cron.schedule(
  'check-deadlines-daily',
  '0 9 * * *',  -- Tous les jours à 9h00 UTC
  $$
  SELECT net.http_post(
    url := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/check-deadlines',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
*/

-- Option 2 : Utiliser Supabase Dashboard
-- Allez dans Database > Cron Jobs et créez un nouveau job avec :
-- - Schedule: 0 9 * * * (tous les jours à 9h00 UTC)
-- - Command: SELECT net.http_post(...) comme ci-dessus
-- OU utilisez l'interface web pour configurer

-- ============================================================================
-- CRON JOB 2 : Génération automatique des factures (tous les jours à 8h00)
-- ============================================================================
-- Ce job génère automatiquement les factures pour les clients
-- dont la date d'anniversaire d'abonnement est aujourd'hui

/*
SELECT cron.schedule(
  'auto-invoice-daily',
  '0 8 * * *',  -- Tous les jours à 8h00 UTC
  $$
  SELECT net.http_post(
    url := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/auto-invoice',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
*/

-- ============================================================================
-- ALTERNATIVE : Utiliser Supabase Database Webhooks + External Services
-- ============================================================================
-- Si pg_cron n'est pas disponible, vous pouvez :
-- 1. Utiliser un service externe (cron-job.org, EasyCron, etc.)
-- 2. Configurer des webhooks dans Supabase Dashboard
-- 3. Utiliser Vercel Cron Jobs (si votre app est sur Vercel)

-- ============================================================================
-- INSTRUCTIONS POUR CONFIGURATION MANUELLE
-- ============================================================================
-- 1. Récupérez votre Project Reference :
--    - Allez dans Supabase Dashboard > Settings > API
--    - Copiez le "Project URL" (ex: https://xxxxx.supabase.co)
--    - Le Project Reference est la partie "xxxxx"
--
-- 2. Récupérez votre Service Role Key :
--    - Toujours dans Settings > API
--    - Copiez la "service_role" key (⚠️ gardez-la secrète !)
--
-- 3. Configurez les cron jobs :
--    Option A - Via Supabase Dashboard (recommandé si disponible) :
--    - Database > Cron Jobs > New Cron Job
--    - Schedule: 0 9 * * * (pour check-deadlines)
--    - Command: Appelez votre Edge Function via HTTP
--
--    Option B - Via service externe (cron-job.org) :
--    - Créez un nouveau job
--    - URL: https://[PROJECT_REF].supabase.co/functions/v1/check-deadlines
--    - Headers: Authorization: Bearer [SERVICE_ROLE_KEY]
--    - Schedule: Tous les jours à 9h00
--
--    Option C - Via Vercel Cron (si app déployée sur Vercel) :
--    - Créez vercel.json avec configuration cron
--    - Les jobs appelleront vos Edge Functions

-- ============================================================================
-- VÉRIFICATION DES CRON JOBS
-- ============================================================================
-- Pour voir les cron jobs configurés (si pg_cron est disponible) :
-- SELECT * FROM cron.job;

-- Pour voir l'historique d'exécution :
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================================
-- ✅ CONFIGURATION TERMINÉE
-- ============================================================================
-- Suivez les instructions ci-dessus pour finaliser la configuration
-- ============================================================================

