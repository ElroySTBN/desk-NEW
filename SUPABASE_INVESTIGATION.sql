-- ============================================================================
-- INVESTIGATION SCRIPT - Check Table Data Before Cleanup
-- ============================================================================
-- Execute this script to see which tables have data
-- This will help us decide what to delete safely

-- ============================================================================
-- 1. CHECK REDUNDANT TABLES
-- ============================================================================

-- Check organizations table (potential duplicate of clients)
SELECT 'organizations' as table_name, COUNT(*) as row_count FROM organizations
UNION ALL
SELECT 'clients', COUNT(*) FROM clients;

-- If organizations has data, show sample to compare with clients
SELECT 'Sample from organizations:' as info;
SELECT id, name, email, created_at FROM organizations LIMIT 5;

SELECT 'Sample from clients:' as info;
SELECT id, name, company, email, created_at FROM clients LIMIT 5;

-- ============================================================================
-- 2. CHECK DEPRECATED REVIEW TABLES
-- ============================================================================

SELECT 'DEPRECATED REVIEW TABLES' as section;

SELECT 'negative_reviews' as table_name, COUNT(*) as row_count FROM negative_reviews
UNION ALL
SELECT 'positive_review_redirects', COUNT(*) FROM positive_review_redirects
UNION ALL
SELECT 'review_settings', COUNT(*) FROM review_settings
UNION ALL
SELECT 'review_submissions', COUNT(*) FROM review_submissions;

-- ============================================================================
-- 3. CHECK ORPHANED TABLES
-- ============================================================================

SELECT 'ORPHANED TABLES (No UI)' as section;

SELECT 'contacts' as table_name, COUNT(*) as row_count FROM contacts
UNION ALL
SELECT 'client_calls', COUNT(*) FROM client_calls
UNION ALL
SELECT 'employee_cards', COUNT(*) FROM employee_cards
UNION ALL
SELECT 'review_campaigns', COUNT(*) FROM review_campaigns
UNION ALL
SELECT 'monthly_review_reports', COUNT(*) FROM monthly_review_reports
UNION ALL
SELECT 'quick_notes', COUNT(*) FROM quick_notes;

-- ============================================================================
-- 4. CHECK ACTIVE TABLES (Should have data)
-- ============================================================================

SELECT 'ACTIVE TABLES' as section;

SELECT 'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'monthly_reports', COUNT(*) FROM monthly_reports
UNION ALL
SELECT 'onboarding', COUNT(*) FROM onboarding
UNION ALL
SELECT 'content_library', COUNT(*) FROM content_library
UNION ALL
SELECT 'scan_tracking', COUNT(*) FROM scan_tracking
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'review_funnel_config', COUNT(*) FROM review_funnel_config
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'company_settings', COUNT(*) FROM company_settings
UNION ALL
SELECT 'products', COUNT(*) FROM products;

-- ============================================================================
-- 5. CHECK NEW AGENCY OS TABLES
-- ============================================================================

SELECT 'AGENCY OS TABLES' as section;

SELECT 'brand_dna' as table_name, COUNT(*) as row_count FROM brand_dna
UNION ALL
SELECT 'audits', COUNT(*) FROM audits;

-- ============================================================================
-- 6. SUMMARY REPORT
-- ============================================================================

SELECT 
    'SUMMARY: Tables with data (>0 rows)' as report,
    COUNT(*) as tables_with_data
FROM (
    SELECT COUNT(*) as cnt FROM organizations WHERE EXISTS (SELECT 1 FROM organizations)
    UNION ALL SELECT COUNT(*) FROM clients WHERE EXISTS (SELECT 1 FROM clients)
    UNION ALL SELECT COUNT(*) FROM negative_reviews WHERE EXISTS (SELECT 1 FROM negative_reviews)
    UNION ALL SELECT COUNT(*) FROM positive_review_redirects WHERE EXISTS (SELECT 1 FROM positive_review_redirects)
    UNION ALL SELECT COUNT(*) FROM contacts WHERE EXISTS (SELECT 1 FROM contacts)
    UNION ALL SELECT COUNT(*) FROM client_calls WHERE EXISTS (SELECT 1 FROM client_calls)
) subq
WHERE cnt > 0;

-- ============================================================================
-- ✅ INVESTIGATION COMPLETE
-- ============================================================================
-- Review the results and share them with me
-- I will then generate the appropriate cleanup scripts
-- ============================================================================
