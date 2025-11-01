-- ============================================================================
-- FIX PERMISSIONS POUR LE NOUVEAU SYSTÈME CRM
-- ============================================================================

-- Grant permissions to PostgREST roles
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on ALL tables
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

-- Verify tables are accessible (optionnel - pour debug)
SELECT 
    schemaname,
    tablename,
    has_table_privilege('authenticated', schemaname || '.' || tablename, 'SELECT') as can_select,
    has_table_privilege('authenticated', schemaname || '.' || tablename, 'INSERT') as can_insert
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'contacts')
ORDER BY tablename;

