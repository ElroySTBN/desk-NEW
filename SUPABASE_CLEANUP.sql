-- ============================================================================
-- DATABASE CLEANUP SCRIPT
-- ============================================================================
-- ⚠️ WARNING: This script will DELETE tables and data
-- Execute SUPABASE_INVESTIGATION.sql first to verify what will be deleted
-- Make a backup before running this script!
-- ============================================================================

-- ============================================================================
-- PHASE 1: DROP DEPRECATED TABLES (Marked DEPRECATED in DB)
-- ============================================================================

-- These tables are explicitly marked as deprecated and have replacements
DROP TABLE IF EXISTS negative_reviews CASCADE;
DROP TABLE IF EXISTS positive_review_redirects CASCADE;
DROP TABLE IF EXISTS review_settings CASCADE;

RAISE NOTICE 'Deprecated review tables deleted';

-- ============================================================================
-- PHASE 2: DROP REDUNDANT TABLES
-- ============================================================================

-- organizations is redundant with clients (clients is used everywhere)
DROP TABLE IF EXISTS organizations CASCADE;

-- This view depends on organizations
DROP VIEW IF EXISTS contacts_with_organization CASCADE;

RAISE NOTICE 'Redundant tables deleted (organizations, contacts_with_organization)';

-- ============================================================================
-- PHASE 3: DROP ORPHANED TABLES (No UI - OPTIONAL)
-- ============================================================================

-- ⚠️ UNCOMMENT ONLY IF YOU CONFIRMED THESE ARE UNUSED

-- DROP TABLE IF EXISTS contacts CASCADE;
-- DROP TABLE IF EXISTS client_calls CASCADE;
-- DROP TABLE IF EXISTS employee_cards CASCADE;
-- DROP TABLE IF EXISTS review_campaigns CASCADE;
-- DROP TABLE IF EXISTS monthly_review_reports CASCADE;
-- DROP TABLE IF EXISTS quick_notes CASCADE;

-- RAISE NOTICE 'Orphaned tables deleted';

-- ============================================================================
-- PHASE 4: CREATE MISSING TABLES (Referenced in code but don't exist)
-- ============================================================================

-- rapports_gbp (used by GBPReports.tsx)
CREATE TABLE IF NOT EXISTS rapports_gbp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    year INTEGER,
    
    -- Metrics
    total_views INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    total_calls INTEGER DEFAULT 0,
    total_directions INTEGER DEFAULT 0,
    total_website_clicks INTEGER DEFAULT 0,
    
    -- Additional data
    data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, client_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON rapports_gbp(client_id);

-- motivational_photos (used by Dashboard.tsx)
CREATE TABLE IF NOT EXISTS motivational_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    caption TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- client_photos (used by Dashboard.tsx)
CREATE TABLE IF NOT EXISTS client_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    caption TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

RAISE NOTICE 'Missing tables created (rapports_gbp, motivational_photos, client_photos)';

-- ============================================================================
-- PHASE 5: ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE rapports_gbp ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivational_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_photos ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage own data" ON rapports_gbp;
CREATE POLICY "Users can manage own data" ON rapports_gbp FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON motivational_photos;
CREATE POLICY "Users can manage own data" ON motivational_photos FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own data" ON client_photos;
CREATE POLICY "Users can manage own data" ON client_photos FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 6: VERIFICATION
-- ============================================================================

-- List all remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- ✅ CLEANUP COMPLETE
-- ============================================================================
-- Deprecated tables: DELETED
-- Redundant tables: DELETED
-- Missing tables: CREATED
-- Database is now clean and aligned with application code
-- ============================================================================
