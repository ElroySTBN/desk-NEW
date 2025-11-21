-- ========================================
-- AGENCY OS - SETUP COMPLET (MASTER)
-- ========================================
-- Ce script crée la structure EXACTE attendue par ton application
-- Il combine les champs existants (Clients.tsx) et les nouveaux (Agency OS)

-- ========================================
-- 0. NETTOYAGE (Optionnel mais recommandé)
-- ========================================
-- Décommente ces lignes si tu veux vraiment tout effacer
-- DROP TABLE IF EXISTS brand_dna CASCADE;
-- DROP TABLE IF EXISTS audits CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;
-- DROP TABLE IF EXISTS organizations CASCADE; -- Si tu veux supprimer l'ancienne table

-- ========================================
-- 1. TABLE CLIENTS (La base de tout)
-- ========================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Champs de base (utilisés dans Clients.tsx)
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    secteur_activite TEXT,
    type_campagne TEXT[], -- Tableau de textes pour les types de campagne
    statut TEXT DEFAULT 'actif', -- actif, pause, a_renouveler, archived
    date_debut_contrat DATE,
    date_anniversaire_abonnement DATE,
    montant_mensuel NUMERIC DEFAULT 0,
    notes TEXT,
    
    -- Agency OS - Nouveaux champs (Magic Link & Pipeline)
    magic_link_token UUID DEFAULT gen_random_uuid() UNIQUE,
    onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'sent_to_client', 'validated', 'completed')) DEFAULT 'pending',
    lifecycle_stage TEXT CHECK (lifecycle_stage IN ('lead', 'audit', 'onboarding', 'production', 'churn')) DEFAULT 'lead',
    
    user_id UUID -- Pour lier à l'utilisateur authentifié
);

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_clients_magic_link_token ON clients(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- ========================================
-- 2. TABLE BRAND_DNA (Identité de Marque)
-- ========================================
CREATE TABLE IF NOT EXISTS brand_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Données JSONB pour flexibilité maximale
    visual_identity JSONB DEFAULT '{}'::jsonb, -- Couleurs, Logo
    tone_of_voice JSONB DEFAULT '{}'::jsonb,   -- Style, Ton
    target_avatar JSONB DEFAULT '{}'::jsonb,   -- Cible, Persona
    services_focus JSONB DEFAULT '{}'::jsonb,  -- Services à mettre en avant
    key_info JSONB DEFAULT '{}'::jsonb,        -- Autres infos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_brand_dna_client_id ON brand_dna(client_id);

-- ========================================
-- 3. TABLE AUDITS (Pour les leads)
-- ========================================
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    url TEXT,
    status TEXT,
    overall_score NUMERIC,
    details JSONB DEFAULT '{}'::jsonb,
    user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_audits_client_id ON audits(client_id);

-- ========================================
-- 4. ROW LEVEL SECURITY (Sécurité)
-- ========================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Policies : Chaque utilisateur ne voit que SES données
-- (Note: Si tu es le seul admin, ces policies sont simples)

DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
CREATE POLICY "Users can manage their own clients"
ON clients FOR ALL
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage brand_dna via clients" ON brand_dna;
CREATE POLICY "Users can manage brand_dna via clients"
ON brand_dna FOR ALL
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can manage their own audits" ON audits;
CREATE POLICY "Users can manage their own audits"
ON audits FOR ALL
USING (auth.uid() = user_id);

-- ========================================
-- 5. DONNÉES DE TEST (SEED)
-- ========================================
-- ⚠️ IMPORTANT : Remplace 'YOUR_USER_ID' par ton vrai UUID
-- Tu peux le trouver dans Authentication > Users

INSERT INTO clients (
    name, company, email, phone, 
    secteur_activite, type_campagne, statut, montant_mensuel,
    lifecycle_stage, onboarding_status, user_id
)
VALUES 
(
    'Jean Dupont', 'Plomberie Dupont', 'jean@plomberie.fr', '0601020304',
    'BTP', ARRAY['SEO', 'Google Ads'], 'actif', 450.00,
    'production', 'completed', '0adcdc1d-02d2-4ac4-a532-e45a77263efd'
),
(
    'Marie Martin', 'Institut Beauté', 'marie@beaute.fr', '0605060708',
    'Esthétique', ARRAY['Instagram'], 'actif', 299.00,
    'onboarding', 'sent_to_client', '0adcdc1d-02d2-4ac4-a532-e45a77263efd'
);

-- Vérification
SELECT name, company, magic_link_token FROM clients;
