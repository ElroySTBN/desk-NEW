// Types pour la configuration du funnel d'avis personnalisable

export interface ReviewFunnelConfig {
  id: string;
  client_id: string;
  
  // ÉTAPE 1: SETUP
  funnel_enabled: boolean;
  rating_threshold: number; // 1-5
  show_logo: boolean;
  show_company_name: boolean;
  custom_url_slug: string | null;
  
  // ÉTAPE 2: CONTENU ET FLUX
  initial_page_config: InitialPageConfig;
  negative_review_config: NegativeReviewConfig;
  positive_review_config: PositiveReviewConfig;
  multiplatform_config: MultiplatformConfig;
  thank_you_page_config: ThankYouPageConfig;
  
  // PERSONNALISATION VISUELLE
  theme_config: ThemeConfig;
  
  // NOTIFICATIONS
  notification_emails: string[] | null;
  notification_webhook_url: string | null;
  instant_notification: boolean;
  
  // MÉTADONNÉES
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface InitialPageConfig {
  title: string;
  description: string;
}

export interface NegativeReviewConfig {
  title: string;
  description: string;
  comment_placeholder: string;
  submit_button_text: string;
  require_email: boolean;
  require_name: boolean;
  require_phone: boolean;
}

export interface ReviewPlatform {
  enabled: boolean;
  url: string;
  name: string;
}

export interface PositiveReviewConfig {
  redirect_mode: 'single' | 'multiple'; // single = redirection directe, multiple = choix de plateformes
  primary_platform: 'google' | 'pages_jaunes' | 'trustpilot' | 'tripadvisor' | 'facebook' | 'yelp';
  platforms: {
    google: ReviewPlatform;
    pages_jaunes: ReviewPlatform;
    trustpilot: ReviewPlatform;
    tripadvisor: ReviewPlatform;
    facebook: ReviewPlatform;
    yelp: ReviewPlatform;
  };
}

export interface MultiplatformConfig {
  enabled: boolean;
  title: string;
  description: string;
  min_platforms: number;
  show_platform_icons: boolean;
}

export interface ThankYouPageConfig {
  title: string;
  message: string;
  show_logo: boolean;
  show_company_name: boolean;
  redirect_delay_seconds: number;
  redirect_url: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  success_color: string;
  error_color: string;
  text_color: string;
  background_color: string;
  star_color: string;
}

// Interface pour les clients avec logo
export interface ClientWithLogo {
  id: string;
  name: string;
  company?: string;
  logo_url?: string;
  // ... autres champs existants
}

// Interface pour l'upload de logo
export interface LogoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

