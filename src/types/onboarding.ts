export interface PrefilledField<T> {
  value: T;
  prefilled: boolean;
}

export interface OnboardingLegalInfo {
  raison_sociale: PrefilledField<string>;
  nom_commercial: PrefilledField<string>;
  siret: PrefilledField<string>;
  adresse: {
    rue: PrefilledField<string>;
    code_postal: PrefilledField<string>;
    ville: PrefilledField<string>;
  };
  zones_intervention: string[];
  contact_principal: {
    nom: PrefilledField<string>;
    fonction: string;
    telephone: PrefilledField<string>;
    email: PrefilledField<string>;
  };
  contact_operationnel: {
    nom: string;
    telephone: string;
    email: string;
  };
}

export interface OnboardingBrandIdentity {
  metier_description: string;
  services: string[];
  points_forts: string[];
  certifications: string[];
  garanties: {
    pieces_ans: number;
    main_oeuvre_ans: number;
    sav_description: string;
  };
}

export interface OnboardingTargetAudience {
  types_clients: {
    particuliers: { checked: boolean; pourcentage_ca: number };
    professionnels: { checked: boolean; pourcentage_ca: number };
    coproprietes: { checked: boolean; pourcentage_ca: number };
    collectivites: { checked: boolean; pourcentage_ca: number };
  };
  persona: {
    age_moyen: string;
    situation: string;
    budget_moyen: string;
    motivations: string;
  };
  saisonnalite: {
    haute_saison: string;
    periode_forte_demande: string;
    services_saisonniers: string;
  };
}

export interface OnboardingCommunication {
  perception_souhaitee: string[];
  ton_reponses_avis: string;
  valeurs: string[];
}

export interface OnboardingHistory {
  annee_creation: number;
  nb_interventions: number;
  equipe: {
    nb_techniciens: number;
    nb_commerciaux: number;
    total_employes: number;
  };
  clients_satisfaits_base: boolean;
  nb_clients_sollicitables: number;
}

export interface OnboardingGoogleBusiness {
  nom_etablissement: PrefilledField<string>;
  categorie_principale: string;
  categories_secondaires: string[];
  horaires: {
    lundi: { ouvert: boolean; horaires: string };
    mardi: { ouvert: boolean; horaires: string };
    mercredi: { ouvert: boolean; horaires: string };
    jeudi: { ouvert: boolean; horaires: string };
    vendredi: { ouvert: boolean; horaires: string };
    samedi: { ouvert: boolean; horaires: string };
    dimanche: { ouvert: boolean; horaires: string };
  };
  urgence_24_7: string;
  telephone_public: PrefilledField<string>;
  email_public: PrefilledField<string>;
  site_web: PrefilledField<string>;
  reseaux_sociaux: {
    facebook: string;
    instagram: string;
    linkedin: string;
    autres: string;
  };
  description_courte: string;
  attributs: string[];
}

export interface OnboardingVisuals {
  photos_disponibles: string[];
  methode_envoi: string;
  uploaded_files: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  deadline: string;
}

export interface OnboardingNFCTeam {
  nb_techniciens: number;
  techniciens: {
    nom: string;
    prenom: string;
    cartes_attribuees: number;
  }[];
  formation_date: string;
  formation_format: string;
}

export interface OnboardingFollowUp {
  frequence_rapports: string;
  canal_communication: string;
  personne_referente: {
    nom: string;
    disponibilites: string;
  };
  compte_google_existant: {
    existe: boolean;
    email: string;
  };
}

export interface OnboardingValidation {
  questions_preoccupations: string;
  accords: {
    gestion_gbp: boolean;
    photos_5_jours: boolean;
    validation_description: boolean;
  };
  date_rendez_vous: string;
  prochain_point: string;
}

export interface Onboarding {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'sent' | 'completed' | 'exported';
  client_id?: string;
  client_name: string;
  created_by: string;
  legal_info: OnboardingLegalInfo;
  brand_identity: OnboardingBrandIdentity;
  target_audience: OnboardingTargetAudience;
  communication: OnboardingCommunication;
  history: OnboardingHistory;
  google_business: OnboardingGoogleBusiness;
  visuals: OnboardingVisuals;
  nfc_team: OnboardingNFCTeam;
  follow_up: OnboardingFollowUp;
  validation: OnboardingValidation;
  last_saved_at?: string;
  completed_at?: string;
  exported_at?: string;
}

export type OnboardingStatus = Onboarding['status'];

