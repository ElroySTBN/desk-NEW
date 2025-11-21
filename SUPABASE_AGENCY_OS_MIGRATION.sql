-- MIGRATION: AGENCY OS TRANSFORMATION (FIXED)
-- Description: Updates clients, brand_dna, and audits tables.
-- Fixes: Explicitly creates 'audits' table if missing.

-- 1. Update 'clients' table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS magic_link_token UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'sent_to_client', 'validated', 'completed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT CHECK (lifecycle_stage IN ('lead', 'audit', 'onboarding', 'production', 'churn')) DEFAULT 'lead';

-- Create index for faster magic link lookup
CREATE INDEX IF NOT EXISTS idx_clients_magic_link_token ON clients(magic_link_token);

-- 2. Update 'brand_dna' table
CREATE TABLE IF NOT EXISTS brand_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    visual_identity JSONB DEFAULT '{}'::jsonb,
    tone_of_voice JSONB DEFAULT '{}'::jsonb,
    target_avatar JSONB DEFAULT '{}'::jsonb,
    services_focus JSONB DEFAULT '{}'::jsonb,
    key_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist in brand_dna (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_dna' AND column_name = 'visual_identity') THEN
        ALTER TABLE brand_dna ADD COLUMN visual_identity JSONB DEFAULT '{}'::jsonb;
    END IF;
    -- Add other checks if needed, but CREATE TABLE covers the main case
END $$;

-- 3. Update 'audits' table (FIXED: Create if not exists)
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    url TEXT,
    status TEXT,
    overall_score NUMERIC,
    details JSONB DEFAULT '{}'::jsonb
);

-- Ensure client_id exists in audits (if table existed but was old)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audits' AND column_name = 'client_id') THEN
        ALTER TABLE audits ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audits' AND column_name = 'overall_score') THEN
        ALTER TABLE audits ADD COLUMN overall_score NUMERIC;
    END IF;
END $$;

-- 4. Security Policies (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Note: You may need to add specific policies depending on your auth setup.
-- For now, we ensure RLS is on to prevent accidental public access.
