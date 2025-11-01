-- Force Supabase to refresh its schema cache
-- This is necessary when tables are created/modified outside migrations

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('company_settings', 'products', 'clients');

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
