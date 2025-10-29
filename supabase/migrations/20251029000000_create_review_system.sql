-- Migration: Système de gestion des avis et tracking des employés
-- Date: 2025-10-29

-- ============================================================================
-- TABLE: employees
-- Description: Gestion des employés/commerciaux avec liens et QR codes uniques
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    unique_link_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    qr_code_data TEXT, -- Données du QR code (base64 ou URL)
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_employees_client_id ON employees(client_id);
CREATE INDEX idx_employees_unique_link_id ON employees(unique_link_id);
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- ============================================================================
-- TABLE: scan_tracking
-- Description: Tracking de tous les scans de QR codes/liens NFC
-- ============================================================================
CREATE TABLE IF NOT EXISTS scan_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_date DATE DEFAULT CURRENT_DATE,
    scan_hour INTEGER, -- Heure du scan (0-23)
    user_agent TEXT,
    ip_address INET,
    referer TEXT,
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les rapports
CREATE INDEX idx_scan_tracking_employee_id ON scan_tracking(employee_id);
CREATE INDEX idx_scan_tracking_client_id ON scan_tracking(client_id);
CREATE INDEX idx_scan_tracking_scanned_at ON scan_tracking(scanned_at);
CREATE INDEX idx_scan_tracking_scan_date ON scan_tracking(scan_date);
CREATE INDEX idx_scan_tracking_scan_hour ON scan_tracking(scan_hour);

-- ============================================================================
-- TABLE: review_settings
-- Description: Configuration des plateformes d'avis par client
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Plateformes d'avis
    review_platforms JSONB DEFAULT '{
        "google": {"enabled": true, "url": ""},
        "pages_jaunes": {"enabled": false, "url": ""},
        "trustpilot": {"enabled": false, "url": ""},
        "tripadvisor": {"enabled": false, "url": ""},
        "custom": {"enabled": false, "url": "", "name": ""}
    }'::jsonb,
    
    -- Configuration du funnel
    threshold_score INTEGER DEFAULT 4, -- Score minimum pour avis positif (1-5)
    redirect_platform VARCHAR(50) DEFAULT 'google', -- Plateforme par défaut pour redirection
    
    -- Notifications
    email_notifications VARCHAR(255)[], -- Emails pour recevoir les avis négatifs
    slack_webhook TEXT,
    
    -- Messages personnalisés
    positive_message TEXT DEFAULT 'Merci pour votre retour positif ! Pourriez-vous partager votre expérience ?',
    negative_message TEXT DEFAULT 'Nous sommes désolés que votre expérience n''ait pas été à la hauteur. Aidez-nous à nous améliorer.',
    
    -- Paramètres
    collect_customer_info BOOLEAN DEFAULT true,
    require_email BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_review_settings_client_id ON review_settings(client_id);

-- ============================================================================
-- TABLE: negative_reviews
-- Description: Collecte des avis négatifs en privé
-- ============================================================================
CREATE TABLE IF NOT EXISTS negative_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Évaluation
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Informations client (optionnelles)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Métadonnées
    source VARCHAR(50) DEFAULT 'web', -- 'web', 'qr', 'nfc'
    user_agent TEXT,
    ip_address INET,
    
    -- Gestion
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'in_progress', 'resolved', 'archived'
    assigned_to UUID REFERENCES auth.users(id),
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_negative_reviews_client_id ON negative_reviews(client_id);
CREATE INDEX idx_negative_reviews_employee_id ON negative_reviews(employee_id);
CREATE INDEX idx_negative_reviews_status ON negative_reviews(status);
CREATE INDEX idx_negative_reviews_created_at ON negative_reviews(created_at);

-- ============================================================================
-- TABLE: positive_review_redirects
-- Description: Tracking des redirections vers les plateformes d'avis
-- ============================================================================
CREATE TABLE IF NOT EXISTS positive_review_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    platform VARCHAR(50) NOT NULL, -- 'google', 'pages_jaunes', etc.
    redirected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métadonnées
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_positive_redirects_client_id ON positive_review_redirects(client_id);
CREATE INDEX idx_positive_redirects_employee_id ON positive_review_redirects(employee_id);
CREATE INDEX idx_positive_redirects_platform ON positive_review_redirects(platform);

-- ============================================================================
-- TRIGGERS: Updated_at automatique
-- ============================================================================

-- Employees
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Review settings
CREATE TRIGGER update_review_settings_updated_at
    BEFORE UPDATE ON review_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Negative reviews
CREATE TRIGGER update_negative_reviews_updated_at
    BEFORE UPDATE ON negative_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Auto-populate scan metadata
-- ============================================================================
CREATE OR REPLACE FUNCTION populate_scan_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract hour from timestamp
    NEW.scan_hour := EXTRACT(HOUR FROM NEW.scanned_at);
    NEW.scan_date := NEW.scanned_at::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_populate_scan_metadata
    BEFORE INSERT ON scan_tracking
    FOR EACH ROW
    EXECUTE FUNCTION populate_scan_metadata();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE negative_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE positive_review_redirects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: employees
-- ============================================================================

-- Lecture : Utilisateurs authentifiés peuvent voir les employés
CREATE POLICY "Authenticated users can view employees"
    ON employees FOR SELECT
    TO authenticated
    USING (true);

-- Insertion : Utilisateurs authentifiés peuvent créer des employés
CREATE POLICY "Authenticated users can create employees"
    ON employees FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Mise à jour : Utilisateurs authentifiés peuvent modifier les employés
CREATE POLICY "Authenticated users can update employees"
    ON employees FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Suppression : Utilisateurs authentifiés peuvent supprimer les employés
CREATE POLICY "Authenticated users can delete employees"
    ON employees FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- POLICIES: scan_tracking
-- ============================================================================

-- Lecture : Utilisateurs authentifiés
CREATE POLICY "Authenticated users can view scans"
    ON scan_tracking FOR SELECT
    TO authenticated
    USING (true);

-- Insertion : Public (pour permettre le tracking depuis les pages publiques)
CREATE POLICY "Public can create scans"
    ON scan_tracking FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ============================================================================
-- POLICIES: review_settings
-- ============================================================================

CREATE POLICY "Authenticated users can view review settings"
    ON review_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage review settings"
    ON review_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Lecture publique pour le funnel d'avis
CREATE POLICY "Public can view active review settings"
    ON review_settings FOR SELECT
    TO anon
    USING (is_active = true);

-- ============================================================================
-- POLICIES: negative_reviews
-- ============================================================================

CREATE POLICY "Authenticated users can view negative reviews"
    ON negative_reviews FOR SELECT
    TO authenticated
    USING (true);

-- Insertion publique pour le funnel
CREATE POLICY "Public can create negative reviews"
    ON negative_reviews FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Mise à jour : Authentifié seulement
CREATE POLICY "Authenticated users can update negative reviews"
    ON negative_reviews FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- POLICIES: positive_review_redirects
-- ============================================================================

CREATE POLICY "Authenticated users can view redirects"
    ON positive_review_redirects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public can create redirects"
    ON positive_review_redirects FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ============================================================================
-- VUES: Pour les rapports
-- ============================================================================

-- Vue des scans par employé par mois
CREATE OR REPLACE VIEW employee_scan_stats_monthly AS
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.client_id,
    DATE_TRUNC('month', s.scanned_at) as month,
    COUNT(*) as total_scans,
    COUNT(DISTINCT s.scan_date) as days_with_scans
FROM employees e
LEFT JOIN scan_tracking s ON e.id = s.employee_id
GROUP BY e.id, e.name, e.client_id, DATE_TRUNC('month', s.scanned_at);

-- Vue des scans par jour
CREATE OR REPLACE VIEW employee_scan_stats_daily AS
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.client_id,
    s.scan_date,
    COUNT(*) as total_scans,
    ARRAY_AGG(DISTINCT s.scan_hour ORDER BY s.scan_hour) as hours_with_scans
FROM employees e
LEFT JOIN scan_tracking s ON e.id = s.employee_id
WHERE s.scan_date IS NOT NULL
GROUP BY e.id, e.name, e.client_id, s.scan_date;

-- Vue des scans par heure
CREATE OR REPLACE VIEW employee_scan_stats_hourly AS
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.client_id,
    s.scan_date,
    s.scan_hour,
    COUNT(*) as total_scans
FROM employees e
LEFT JOIN scan_tracking s ON e.id = s.employee_id
WHERE s.scan_hour IS NOT NULL
GROUP BY e.id, e.name, e.client_id, s.scan_date, s.scan_hour;

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour générer un nouveau lien unique pour un employé
CREATE OR REPLACE FUNCTION regenerate_employee_link(employee_uuid UUID)
RETURNS UUID AS $$
DECLARE
    new_link_id UUID;
BEGIN
    new_link_id := gen_random_uuid();
    UPDATE employees 
    SET unique_link_id = new_link_id,
        updated_at = NOW()
    WHERE id = employee_uuid;
    RETURN new_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques d'un employé
CREATE OR REPLACE FUNCTION get_employee_stats(
    employee_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    total_scans BIGINT,
    scans_today BIGINT,
    scans_this_week BIGINT,
    scans_this_month BIGINT,
    average_scans_per_day NUMERIC,
    most_active_hour INTEGER,
    most_active_day DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Total scans
        COUNT(*) FILTER (
            WHERE (start_date IS NULL OR scan_date >= start_date)
            AND (end_date IS NULL OR scan_date <= end_date)
        ) as total_scans,
        
        -- Scans aujourd'hui
        COUNT(*) FILTER (WHERE scan_date = CURRENT_DATE) as scans_today,
        
        -- Scans cette semaine
        COUNT(*) FILTER (
            WHERE scan_date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
            AND scan_date <= CURRENT_DATE
        ) as scans_this_week,
        
        -- Scans ce mois
        COUNT(*) FILTER (
            WHERE scan_date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
            AND scan_date <= CURRENT_DATE
        ) as scans_this_month,
        
        -- Moyenne par jour
        CASE 
            WHEN COUNT(DISTINCT scan_date) > 0 
            THEN ROUND(COUNT(*)::NUMERIC / COUNT(DISTINCT scan_date), 2)
            ELSE 0
        END as average_scans_per_day,
        
        -- Heure la plus active
        MODE() WITHIN GROUP (ORDER BY scan_hour) as most_active_hour,
        
        -- Jour le plus actif
        MODE() WITHIN GROUP (ORDER BY scan_date) as most_active_day
        
    FROM scan_tracking
    WHERE employee_id = employee_uuid
    AND (start_date IS NULL OR scan_date >= start_date)
    AND (end_date IS NULL OR scan_date <= end_date);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE employees IS 'Gestion des employés avec liens et QR codes uniques pour tracking';
COMMENT ON TABLE scan_tracking IS 'Tracking de tous les scans de QR codes/NFC';
COMMENT ON TABLE review_settings IS 'Configuration des plateformes d''avis par client';
COMMENT ON TABLE negative_reviews IS 'Collecte des avis négatifs en privé';
COMMENT ON TABLE positive_review_redirects IS 'Tracking des redirections vers plateformes d''avis';

