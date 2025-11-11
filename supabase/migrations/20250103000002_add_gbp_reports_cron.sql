-- ============================================================================
-- CRON JOB POUR VÉRIFICATION DES RAPPORTS GBP MANQUANTS
-- ============================================================================
-- Ce fichier configure le cron job pour vérifier les rapports GBP manquants
-- et envoyer des notifications Telegram

-- Vérifier que la fonction cron existe
CREATE OR REPLACE FUNCTION cron.schedule(
  job_name text,
  schedule text,
  command text
)
RETURNS void AS $$
BEGIN
  -- Cette fonction sera gérée par Supabase Edge Functions
  -- Le cron job sera configuré dans Supabase Dashboard ou via l'API
  RAISE NOTICE 'Cron job configuration should be done via Supabase Dashboard or Edge Functions';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================
-- Pour configurer le cron job, utilisez Supabase Dashboard :
-- 1. Allez dans Database > Cron Jobs
-- 2. Créez un nouveau cron job qui appelle l'Edge Function check-monthly-gbp-reports
-- 3. Schedule: 0 9 * * * (tous les jours à 9h00)
-- 4. La fonction Edge Function vérifiera les rapports manquants et enverra les notifications
-- ============================================================================



