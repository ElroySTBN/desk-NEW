-- ============================================================================
-- SYSTÈME DE RAPPORTS GOOGLE BUSINESS PROFILE
-- ============================================================================
-- Ce fichier crée les tables pour la génération de rapports mensuels GBP
-- avec KPIs, screenshots, et templates de textes

-- ============================================================================
-- 0. FONCTION handle_updated_at (si elle n'existe pas)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. TABLE : rapports_gbp (Rapports mensuels GBP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rapports_gbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Type de rapport
  type TEXT NOT NULL CHECK (type IN ('5_mois', 'mensuel', 'complet')),
  
  -- Période
  mois TEXT NOT NULL, -- Ex: "Octobre" ou "Juin-Octobre"
  annee INTEGER NOT NULL,
  date_generation TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- KPIs stockés en JSONB
  kpis JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Fichiers
  pdf_url TEXT NOT NULL, -- Lien Supabase Storage
  screenshots JSONB DEFAULT '{}'::jsonb, -- URLs des 4 screenshots
  
  -- Envoi email
  date_envoi TIMESTAMPTZ,
  email_envoye BOOLEAN DEFAULT FALSE,
  destinataire_email TEXT,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_user_id ON public.rapports_gbp(user_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_client_id ON public.rapports_gbp(client_id);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_annee_mois ON public.rapports_gbp(annee, mois);
CREATE INDEX IF NOT EXISTS idx_rapports_gbp_date_generation ON public.rapports_gbp(date_generation);

-- Trigger pour updated_at
CREATE TRIGGER rapports_gbp_updated_at
  BEFORE UPDATE ON public.rapports_gbp
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.rapports_gbp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GBP reports"
  ON public.rapports_gbp
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GBP reports"
  ON public.rapports_gbp
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GBP reports"
  ON public.rapports_gbp
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GBP reports"
  ON public.rapports_gbp
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. TABLE : rapport_text_templates (Templates de textes pour rapports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rapport_text_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Catégorie du template
  category TEXT NOT NULL CHECK (category IN ('vue_ensemble', 'appels', 'clics_web', 'itineraire')),
  
  -- Contexte (évolution)
  context TEXT NOT NULL CHECK (context IN ('positive_high', 'positive_moderate', 'stable', 'negative')),
  
  -- Template de texte avec variables
  template TEXT NOT NULL,
  
  -- Indicateur de template par défaut
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rapport_templates_user_id ON public.rapport_text_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_rapport_templates_category_context ON public.rapport_text_templates(category, context);

-- Trigger pour updated_at
CREATE TRIGGER rapport_text_templates_updated_at
  BEFORE UPDATE ON public.rapport_text_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.rapport_text_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own report templates"
  ON public.rapport_text_templates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own report templates"
  ON public.rapport_text_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report templates"
  ON public.rapport_text_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report templates"
  ON public.rapport_text_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. INSERTION DES TEMPLATES PAR DÉFAUT
-- ============================================================================
-- Fonction pour insérer les templates par défaut pour un utilisateur
CREATE OR REPLACE FUNCTION insert_default_report_templates(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Templates pour Vue d'ensemble
  INSERT INTO public.rapport_text_templates (user_id, category, context, template, is_default)
  VALUES
    (p_user_id, 'vue_ensemble', 'positive_high', 
     'Sur les {period}, {Z} personnes supplémentaires ont interagi avec votre établissement sur Google par rapport à l''année dernière. Cette hausse impressionnante de {percentage}% témoigne de l''efficacité de votre visibilité locale et de l''impact positif de votre stratégie digitale.', 
     true),
    (p_user_id, 'vue_ensemble', 'positive_moderate',
     'Votre visibilité locale continue de progresser avec {Z} interactions supplémentaires sur {period}. Cette évolution positive de {percentage}% montre que votre établissement gagne en notoriété auprès de vos clients potentiels.',
     true),
    (p_user_id, 'vue_ensemble', 'stable',
     'Vos interactions restent stables avec {X} interactions sur {period}, similaire à l''année précédente ({Y} interactions). Cette régularité démontre une visibilité locale solide et constante.',
     true),
    (p_user_id, 'vue_ensemble', 'negative',
     'Une légère baisse d''interactions ce mois-ci ({X} vs {Y} l''année dernière). Cette variation peut être due à la saisonnalité. Nous surveillons cette métrique et recommandons des actions d''optimisation si nécessaire.',
     true);

  -- Templates pour Appels
  INSERT INTO public.rapport_text_templates (user_id, category, context, template, is_default)
  VALUES
    (p_user_id, 'appels', 'positive_high',
     'Ce mois-ci, vous avez reçu {X} appels, soit une hausse impressionnante de {percentage}% par rapport à l''année dernière. Cela représente {Z} appels supplémentaires, soit environ {daily_avg} appels de plus par jour ouvrable. Cette forte augmentation témoigne de l''efficacité de votre visibilité locale.',
     true),
    (p_user_id, 'appels', 'positive_moderate',
     '{Z} appels téléphoniques supplémentaires sur {period}. C''est {monthly_avg} appels de plus par mois en moyenne, soit environ {daily_avg} appels supplémentaires par jour ouvrable.',
     true),
    (p_user_id, 'appels', 'stable',
     'Vos appels restent stables ce mois-ci avec {X} appels, similaire au mois précédent ({Y} appels). Cette régularité montre une visibilité locale solide et constante.',
     true),
    (p_user_id, 'appels', 'negative',
     'Une légère baisse d''appels ce mois-ci ({X} vs {Y} l''année dernière). Cette variation peut être due à la saisonnalité. Nous surveillons cette métrique et recommandons des actions d''optimisation si nécessaire.',
     true);

  -- Templates pour Clics Web
  INSERT INTO public.rapport_text_templates (user_id, category, context, template, is_default)
  VALUES
    (p_user_id, 'clics_web', 'positive_high',
     'Excellent résultat avec {X} clics vers votre site web, soit une augmentation de {percentage}% par rapport à l''année dernière. Cela représente {Z} clics supplémentaires, montrant que votre fiche Google Business Profile génère un trafic qualifié vers votre site.',
     true),
    (p_user_id, 'clics_web', 'positive_moderate',
     'Votre site web a reçu {Z} clics supplémentaires depuis votre fiche Google Business Profile sur {period}. Cette progression de {percentage}% démontre l''efficacité de votre présence locale en ligne.',
     true),
    (p_user_id, 'clics_web', 'stable',
     'Vos clics vers le site web restent stables avec {X} clics ce mois-ci, similaire à l''année dernière ({Y} clics). Votre fiche continue de générer un trafic régulier vers votre site.',
     true),
    (p_user_id, 'clics_web', 'negative',
     'Une légère diminution des clics vers votre site web ce mois-ci ({X} vs {Y} l''année dernière). Nous recommandons d''optimiser la description de votre fiche et d''encourager les avis clients pour améliorer cette métrique.',
     true);

  -- Templates pour Itinéraire
  INSERT INTO public.rapport_text_templates (user_id, category, context, template, is_default)
  VALUES
    (p_user_id, 'itineraire', 'positive_high',
     'Forte augmentation des demandes d''itinéraire avec {X} demandes, soit {Z} de plus que l''année dernière (+{percentage}%). Cela indique un intérêt croissant pour votre établissement et une forte intention de visite de la part de vos clients potentiels.',
     true),
    (p_user_id, 'itineraire', 'positive_moderate',
     'Vos demandes d''itinéraire ont progressé de {percentage}% avec {Z} demandes supplémentaires sur {period}. Cela montre que votre établissement attire de plus en plus de clients intéressés par une visite physique.',
     true),
    (p_user_id, 'itineraire', 'stable',
     'Vos demandes d''itinéraire restent stables avec {X} demandes ce mois-ci, similaire à l''année dernière ({Y} demandes). Votre localisation est bien identifiée par vos clients potentiels.',
     true),
    (p_user_id, 'itineraire', 'negative',
     'Une légère baisse des demandes d''itinéraire ce mois-ci ({X} vs {Y} l''année dernière). Cette variation peut être saisonnière. Nous recommandons de vérifier que vos informations de localisation sont à jour et optimisées.',
     true);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ✅ MIGRATION TERMINÉE
-- ============================================================================

