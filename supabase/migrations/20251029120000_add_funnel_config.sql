-- Migration: Configuration avancée du funnel d'avis et logos clients
-- Date: 2025-10-29

-- ============================================================================
-- Ajouter le support des logos clients
-- ============================================================================

-- Ajouter colonne logo_url à la table clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ============================================================================
-- TABLE: review_funnel_config
-- Description: Configuration complète du funnel d'avis personnalisable
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_funnel_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    
    -- ============================================================================
    -- ÉTAPE 1: SETUP
    -- ============================================================================
    
    -- Activation du funnel
    funnel_enabled BOOLEAN DEFAULT true,
    
    -- Seuil de filtrage (note sur 5)
    rating_threshold INTEGER DEFAULT 4 CHECK (rating_threshold >= 1 AND rating_threshold <= 5),
    -- Note ≤ threshold = feedback privé
    -- Note > threshold = redirection publique
    
    -- Affichage du logo
    show_logo BOOLEAN DEFAULT true,
    
    -- Affichage du nom de l'entreprise
    show_company_name BOOLEAN DEFAULT true,
    
    -- URL personnalisée (slug)
    custom_url_slug VARCHAR(255) UNIQUE,
    
    -- ============================================================================
    -- ÉTAPE 2: CONTENU ET FLUX
    -- ============================================================================
    
    -- Page d'évaluation initiale
    initial_page_config JSONB DEFAULT $${"title": "Comment nous évalueriez-vous ?", "description": "Merci de prendre un moment pour évaluer votre expérience avec nous. Votre retour nous aide non seulement, mais il aide aussi d'autres clients potentiels."}$$::jsonb,
    
    -- Configuration avis négatifs
    negative_review_config JSONB DEFAULT $${"title": "Aidez-nous à nous améliorer", "description": "Nous sommes désolés que votre expérience n'ait pas été à la hauteur. Pourriez-vous nous en dire plus ?", "comment_placeholder": "Décrivez votre expérience...", "submit_button_text": "Envoyer mon retour", "require_email": false, "require_name": false, "require_phone": false}$$::jsonb,
    
    -- Configuration avis positifs
    positive_review_config JSONB DEFAULT $${"redirect_mode": "single", "primary_platform": "google", "platforms": {"google": {"enabled": true, "url": "", "name": "Google"}, "pages_jaunes": {"enabled": false, "url": "", "name": "Pages Jaunes"}, "trustpilot": {"enabled": false, "url": "", "name": "Trustpilot"}, "tripadvisor": {"enabled": false, "url": "", "name": "TripAdvisor"}, "facebook": {"enabled": false, "url": "", "name": "Facebook"}, "yelp": {"enabled": false, "url": "", "name": "Yelp"}}}$$::jsonb,
    
    -- Page de sélection multi-plateformes
    multiplatform_config JSONB DEFAULT $${"enabled": false, "title": "Partagez votre expérience", "description": "Choisissez les plateformes sur lesquelles vous souhaitez laisser votre avis. Cela nous aide énormément !", "min_platforms": 1, "show_platform_icons": true}$$::jsonb,
    
    -- Page de remerciement (après avis négatif)
    thank_you_page_config JSONB DEFAULT $${"title": "Merci pour votre retour", "message": "Votre retour a été reçu et un membre de notre équipe support client vous contactera sous peu.", "show_logo": true, "show_company_name": true, "redirect_delay_seconds": 0, "redirect_url": ""}$$::jsonb,
    
    -- ============================================================================
    -- PERSONNALISATION VISUELLE
    -- ============================================================================
    
    -- Couleurs et thème
    theme_config JSONB DEFAULT $${"primary_color": "#3b82f6", "secondary_color": "#8b5cf6", "success_color": "#10b981", "error_color": "#ef4444", "text_color": "#1f2937", "background_color": "#ffffff", "star_color": "#fbbf24"}$$::jsonb,
    
    -- ============================================================================
    -- NOTIFICATIONS
    -- ============================================================================
    
    -- Emails pour recevoir les avis négatifs
    notification_emails TEXT[],
    
    -- Webhook pour notifications tierces (Slack, Make, Zapier, etc.)
    notification_webhook_url TEXT,
    
    -- Envoyer une notification immédiate
    instant_notification BOOLEAN DEFAULT true,
    
    -- ============================================================================
    -- MÉTADONNÉES
    -- ============================================================================
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX idx_review_funnel_config_client_id ON review_funnel_config(client_id);
CREATE INDEX idx_review_funnel_config_custom_url_slug ON review_funnel_config(custom_url_slug);
CREATE INDEX idx_review_funnel_config_is_active ON review_funnel_config(is_active);

-- ============================================================================
-- TRIGGER: Updated_at automatique
-- ============================================================================
CREATE TRIGGER update_review_funnel_config_updated_at
    BEFORE UPDATE ON review_funnel_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE review_funnel_config ENABLE ROW LEVEL SECURITY;

-- Lecture : Utilisateurs authentifiés
CREATE POLICY "Authenticated users can view funnel config"
    ON review_funnel_config FOR SELECT
    TO authenticated
    USING (true);

-- Lecture publique (pour le funnel) - seulement si actif
CREATE POLICY "Public can view active funnel config"
    ON review_funnel_config FOR SELECT
    TO anon
    USING (is_active = true);

-- Gestion complète pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can manage funnel config"
    ON review_funnel_config FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKET: client-logos
-- Description: Stockage des logos des clients
-- ============================================================================

-- Note: Cette commande doit être exécutée manuellement dans le dashboard Supabase
-- ou via l'API Supabase Storage

-- Instructions :
-- 1. Aller dans Storage > Create bucket
-- 2. Nom: "client-logos"
-- 3. Public: OUI
-- 4. Appliquer les policies ci-dessous via SQL Editor

-- RLS Policies pour le bucket client-logos
-- À exécuter après avoir créé le bucket manuellement :

-- SELECT policy (lecture publique)
-- CREATE POLICY "Public can view logos"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'client-logos');

-- INSERT policy (upload authentifié)
-- CREATE POLICY "Authenticated users can upload logos"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'client-logos');

-- UPDATE policy (modification authentifiée)
-- CREATE POLICY "Authenticated users can update logos"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'client-logos');

-- DELETE policy (suppression authentifiée)
-- CREATE POLICY "Authenticated users can delete logos"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'client-logos');

-- ============================================================================
-- FONCTION UTILITAIRE: Initialiser la config par défaut pour un client
-- ============================================================================

CREATE OR REPLACE FUNCTION init_default_funnel_config(p_client_id UUID)
RETURNS UUID AS $$
DECLARE
    v_config_id UUID;
    v_client_name TEXT;
    v_slug TEXT;
BEGIN
    -- Récupérer le nom du client pour générer un slug
    SELECT name INTO v_client_name FROM clients WHERE id = p_client_id;
    
    -- Générer un slug unique
    v_slug := LOWER(REGEXP_REPLACE(COALESCE(v_client_name, 'client'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
    
    -- Insérer la configuration par défaut
    INSERT INTO review_funnel_config (client_id, custom_url_slug)
    VALUES (p_client_id, v_slug)
    RETURNING id INTO v_config_id;
    
    RETURN v_config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE review_funnel_config IS 'Configuration complète et personnalisable du funnel d''avis par client';
COMMENT ON COLUMN clients.logo_url IS 'URL du logo du client (stocké dans Supabase Storage)';
COMMENT ON FUNCTION init_default_funnel_config IS 'Initialise une configuration par défaut pour un nouveau client';

