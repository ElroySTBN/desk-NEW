# Installation du Funnel d'Avis Personnalisable

## ✅ Checklist d'installation

- [ ] Migration SQL appliquée
- [ ] Bucket `client-logos` créé
- [ ] RLS policies configurées
- [ ] Application redémarrée
- [ ] Test d'upload de logo effectué
- [ ] Test de création de funnel effectué

---

## 📋 Étape 1 : Migration SQL

### Via Supabase Dashboard

1. Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Sélectionnez votre projet

3. Allez dans **SQL Editor** (menu latéral gauche)

4. Copiez le SQL ci-dessous et cliquez sur **Run** :

```sql
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
    
    -- ÉTAPE 1: SETUP
    funnel_enabled BOOLEAN DEFAULT true,
    rating_threshold INTEGER DEFAULT 4 CHECK (rating_threshold >= 1 AND rating_threshold <= 5),
    show_logo BOOLEAN DEFAULT true,
    show_company_name BOOLEAN DEFAULT true,
    custom_url_slug VARCHAR(255) UNIQUE,
    
    -- ÉTAPE 2: CONTENU ET FLUX
    initial_page_config JSONB DEFAULT '{
        "title": "Comment nous évalueriez-vous ?",
        "description": "Merci de prendre un moment pour évaluer votre expérience avec nous. Votre retour nous aide non seulement, mais il aide aussi d'\''autres clients potentiels."
    }'::jsonb,
    
    negative_review_config JSONB DEFAULT '{
        "title": "Aidez-nous à nous améliorer",
        "description": "Nous sommes désolés que votre expérience n'\''ait pas été à la hauteur. Pourriez-vous nous en dire plus ?",
        "comment_placeholder": "Décrivez votre expérience...",
        "submit_button_text": "Envoyer mon retour",
        "require_email": false,
        "require_name": false,
        "require_phone": false
    }'::jsonb,
    
    positive_review_config JSONB DEFAULT '{
        "redirect_mode": "single",
        "primary_platform": "google",
        "platforms": {
            "google": {"enabled": true, "url": "", "name": "Google"},
            "pages_jaunes": {"enabled": false, "url": "", "name": "Pages Jaunes"},
            "trustpilot": {"enabled": false, "url": "", "name": "Trustpilot"},
            "tripadvisor": {"enabled": false, "url": "", "name": "TripAdvisor"},
            "facebook": {"enabled": false, "url": "", "name": "Facebook"},
            "yelp": {"enabled": false, "url": "", "name": "Yelp"}
        }
    }'::jsonb,
    
    multiplatform_config JSONB DEFAULT '{
        "enabled": false,
        "title": "Partagez votre expérience",
        "description": "Choisissez les plateformes sur lesquelles vous souhaitez laisser votre avis. Cela nous aide énormément !",
        "min_platforms": 1,
        "show_platform_icons": true
    }'::jsonb,
    
    thank_you_page_config JSONB DEFAULT '{
        "title": "Merci pour votre retour",
        "message": "Votre retour a été reçu et un membre de notre équipe support client vous contactera sous peu.",
        "show_logo": true,
        "show_company_name": true,
        "redirect_delay_seconds": 0,
        "redirect_url": ""
    }'::jsonb,
    
    theme_config JSONB DEFAULT '{
        "primary_color": "#3b82f6",
        "secondary_color": "#8b5cf6",
        "success_color": "#10b981",
        "error_color": "#ef4444",
        "text_color": "#1f2937",
        "background_color": "#ffffff",
        "star_color": "#fbbf24"
    }'::jsonb,
    
    notification_emails TEXT[],
    notification_webhook_url TEXT,
    instant_notification BOOLEAN DEFAULT true,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX idx_review_funnel_config_client_id ON review_funnel_config(client_id);
CREATE INDEX idx_review_funnel_config_custom_url_slug ON review_funnel_config(custom_url_slug);
CREATE INDEX idx_review_funnel_config_is_active ON review_funnel_config(is_active);

-- TRIGGER: Updated_at automatique
CREATE TRIGGER update_review_funnel_config_updated_at
    BEFORE UPDATE ON review_funnel_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE review_funnel_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view funnel config"
    ON review_funnel_config FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public can view active funnel config"
    ON review_funnel_config FOR SELECT
    TO anon
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage funnel config"
    ON review_funnel_config FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Fonction utilitaire: Initialiser la config par défaut pour un client
CREATE OR REPLACE FUNCTION init_default_funnel_config(p_client_id UUID)
RETURNS UUID AS $$
DECLARE
    v_config_id UUID;
    v_client_name TEXT;
    v_slug TEXT;
BEGIN
    SELECT name INTO v_client_name FROM clients WHERE id = p_client_id;
    
    v_slug := LOWER(REGEXP_REPLACE(COALESCE(v_client_name, 'client'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
    
    INSERT INTO review_funnel_config (client_id, custom_url_slug)
    VALUES (p_client_id, v_slug)
    RETURNING id INTO v_config_id;
    
    RETURN v_config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE review_funnel_config IS 'Configuration complète et personnalisable du funnel d''avis par client';
COMMENT ON COLUMN clients.logo_url IS 'URL du logo du client (stocké dans Supabase Storage)';
COMMENT ON FUNCTION init_default_funnel_config IS 'Initialise une configuration par défaut pour un nouveau client';
```

5. Vérifiez que le message de succès apparaît

---

## 📦 Étape 2 : Créer le bucket de stockage

### Via Supabase Dashboard

1. Dans le Supabase Dashboard, allez dans **Storage** (menu latéral gauche)

2. Cliquez sur **"New bucket"**

3. Remplissez les informations :
   - **Nom** : `client-logos`
   - **Public bucket** : ✅ **Activé** (cochez la case)

4. Cliquez sur **Create bucket**

---

## 🔒 Étape 3 : Configurer les RLS Policies du bucket

### Via SQL Editor

1. Retournez dans **SQL Editor**

2. Copiez et exécutez le SQL ci-dessous :

```sql
-- RLS Policies pour le bucket client-logos

-- SELECT policy (lecture publique)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'client-logos');

-- INSERT policy (upload authentifié)
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos');

-- UPDATE policy (modification authentifiée)
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-logos');

-- DELETE policy (suppression authentifiée)
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-logos');
```

3. Vérifiez le succès de l'exécution

---

## 🚀 Étape 4 : Redémarrer l'application

### En local

```bash
cd /Users/elroysitbon/raisedesk-io
npm run dev
```

### Sur Vercel (si déployé)

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **"Deployments"**
4. Cliquez sur **"Redeploy"** pour le dernier déploiement

---

## ✅ Étape 5 : Tests

### Test 1 : Upload de logo

1. Allez dans **Clients** → Sélectionnez un client
2. Cliquez sur **"Configuration Avis"**
3. Cliquez sur **"Funnel Personnalisé"** ✨
4. Dans la section **"Logo de l'Entreprise"**, uploadez une image
5. Vérifiez que le logo s'affiche

### Test 2 : Configuration du funnel

1. Continuez sur la page **"Setup"**
2. Ajustez le **seuil de filtrage** (ex: 4 étoiles)
3. Activez **"Afficher le logo"** et **"Afficher le nom de l'entreprise"**
4. Personnalisez le **slug de l'URL**
5. Cliquez sur **"Étape suivante"**

### Test 3 : Personnalisation du contenu

1. Sur la page **"Contenu et flux"**
2. Modifiez le **titre** et la **description** de la page initiale
3. Configurez les messages pour les **avis négatifs**
4. Ajoutez au moins une **plateforme d'avis** (ex: Google) avec son URL
5. Cliquez sur **"Sauvegarder"**

### Test 4 : Prévisualisation

1. Cliquez sur **"Prévisualiser"** 👁️
2. Une nouvelle fenêtre s'ouvre
3. Vérifiez :
   - ✅ Le logo s'affiche
   - ✅ Le nom de l'entreprise s'affiche
   - ✅ Le titre personnalisé s'affiche
   - ✅ Les 5 étoiles sont cliquables
4. Testez en cliquant sur 3 étoiles (avis négatif)
   - Vérifiez que le formulaire s'affiche
5. Retournez en arrière et testez 5 étoiles (avis positif)
   - Vérifiez la redirection ou la page multi-plateformes

---

## 🐛 Dépannage

### Erreur : `relation "review_funnel_config" does not exist`

**Solution** :  
La migration SQL n'a pas été appliquée correctement.  
→ Retournez à l'**Étape 1** et réexécutez le SQL.

### Erreur : `bucket "client-logos" does not exist`

**Solution** :  
Le bucket n'a pas été créé.  
→ Retournez à l'**Étape 2** et créez le bucket.

### Erreur : `Failed to upload logo`

**Solution** :  
Les RLS policies ne sont pas configurées.  
→ Retournez à l'**Étape 3** et exécutez les policies.

### Le logo ne s'affiche pas sur la page publique

**Solution** :  
Le bucket n'est pas public.  
→ Vérifiez dans **Storage** → `client-logos` → Settings que **"Public bucket"** est activé.

### Impossible d'accéder au funnel via l'URL

**Solution** :  
Vérifiez que :
- Le funnel est activé dans la configuration
- L'URL slug est correct
- La table `review_funnel_config` a bien une entrée pour ce client

---

## 📝 Notes importantes

1. **Les logos sont publics** : Assurez-vous que les logos uploadés peuvent être rendus publics.

2. **Slugs uniques** : Chaque client doit avoir un slug unique. Si vous obtenez une erreur, changez le slug.

3. **Sauvegarde** : Pensez à sauvegarder régulièrement vos configurations.

4. **Mode prévisualisation** : En mode prévisualisation (avec `?preview=true`), aucune donnée n'est enregistrée en base.

---

## ✨ Prochaines étapes

Une fois l'installation terminée, consultez le **[Guide du Funnel Personnalisable](GUIDE_FUNNEL_PERSONNALISE.md)** pour apprendre à :
- Personnaliser le contenu pour chaque client
- Configurer le multi-plateformes
- Gérer les avis négatifs
- Consulter les rapports

---

**Besoin d'aide ?** Consultez la section [Dépannage](#dépannage) ci-dessus ou contactez le support technique.


