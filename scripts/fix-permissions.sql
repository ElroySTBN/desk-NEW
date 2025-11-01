-- ============================================================================
-- FIX RAPIDE : Permissions PostgREST pour company_settings et products
-- ============================================================================
-- Exécutez ce script si vous avez l'erreur "schema cache"

-- Grant permissions to PostgREST roles
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on ALL tables (including company_settings and products)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure future tables have correct permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO anon;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify tables are now accessible
SELECT 
    schemaname,
    tablename,
    has_table_privilege('authenticated', schemaname || '.' || tablename, 'SELECT') as can_select
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('company_settings', 'products', 'clients')
ORDER BY tablename;

