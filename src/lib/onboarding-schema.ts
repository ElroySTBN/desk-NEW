import { z } from "zod";

const prefilledFieldSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema,
    prefilled: z.boolean(),
  });

export const onboardingSchema = z.object({
  legal_info: z.object({
    raison_sociale: prefilledFieldSchema(z.string()),
    nom_commercial: prefilledFieldSchema(z.string()),
    siret: prefilledFieldSchema(z.string()),
    adresse: z.object({
      rue: prefilledFieldSchema(z.string()),
      code_postal: prefilledFieldSchema(z.string()),
      ville: prefilledFieldSchema(z.string()),
    }),
    zones_intervention: z.array(z.string()),
    contact_principal: z.object({
      nom: prefilledFieldSchema(z.string()),
      fonction: z.string(),
      telephone: prefilledFieldSchema(z.string()),
      email: prefilledFieldSchema(z.string().email().or(z.literal(""))),
    }),
    contact_operationnel: z.object({
      nom: z.string(),
      telephone: z.string(),
      email: z.string().email().or(z.literal("")),
    }),
  }),

  brand_identity: z.object({
    metier_description: z.string(),
    services: z.array(z.string()),
    points_forts: z.array(z.string()),
    certifications: z.array(z.string()),
    garanties: z.object({
      pieces_ans: z.number().min(0),
      main_oeuvre_ans: z.number().min(0),
      sav_description: z.string(),
    }),
  }),

  target_audience: z.object({
    types_clients: z.object({
      particuliers: z.object({
        checked: z.boolean(),
        pourcentage_ca: z.number().min(0).max(100),
      }),
      professionnels: z.object({
        checked: z.boolean(),
        pourcentage_ca: z.number().min(0).max(100),
      }),
      coproprietes: z.object({
        checked: z.boolean(),
        pourcentage_ca: z.number().min(0).max(100),
      }),
      collectivites: z.object({
        checked: z.boolean(),
        pourcentage_ca: z.number().min(0).max(100),
      }),
    }),
    persona: z.object({
      age_moyen: z.string(),
      situation: z.string(),
      budget_moyen: z.string(),
      motivations: z.string(),
    }),
    saisonnalite: z.object({
      haute_saison: z.string(),
      periode_forte_demande: z.string(),
      services_saisonniers: z.string(),
    }),
  }),

  communication: z.object({
    perception_souhaitee: z.array(z.string()),
    ton_reponses_avis: z.string(),
    valeurs: z.array(z.string()),
  }),

  history: z.object({
    annee_creation: z.number().min(1900).max(new Date().getFullYear()),
    nb_interventions: z.number().min(0),
    equipe: z.object({
      nb_techniciens: z.number().min(0),
      nb_commerciaux: z.number().min(0),
      total_employes: z.number().min(0),
    }),
    clients_satisfaits_base: z.boolean(),
    nb_clients_sollicitables: z.number().min(0),
  }),

  google_business: z.object({
    nom_etablissement: prefilledFieldSchema(z.string()),
    categorie_principale: z.string(),
    categories_secondaires: z.array(z.string()),
    horaires: z.object({
      lundi: z.object({ ouvert: z.boolean(), horaires: z.string() }),
      mardi: z.object({ ouvert: z.boolean(), horaires: z.string() }),
      mercredi: z.object({ ouvert: z.boolean(), horaires: z.string() }),
      jeudi: z.object({ ouvert: z.boolean(), horaires: z.string() }),
      vendredi: z.object({ ouvert: z.boolean(), horaires: z.string() }),
      samedi: z.object({ ouvert: z.boolean(), horaires: z.string() }),
      dimanche: z.object({ ouvert: z.boolean(), horaires: z.string() }),
    }),
    urgence_24_7: z.string(),
    telephone_public: prefilledFieldSchema(z.string()),
    email_public: prefilledFieldSchema(z.string().email().or(z.literal(""))),
    site_web: prefilledFieldSchema(z.string()),
    reseaux_sociaux: z.object({
      facebook: z.string(),
      instagram: z.string(),
      linkedin: z.string(),
      autres: z.string(),
    }),
    description_courte: z.string(),
    attributs: z.array(z.string()),
  }),

  visuals: z.object({
    photos_disponibles: z.array(z.string()),
    methode_envoi: z.string(),
    uploaded_files: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      })
    ),
    deadline: z.string(),
  }),

  nfc_team: z.object({
    nb_techniciens: z.number().min(0),
    techniciens: z.array(
      z.object({
        nom: z.string(),
        prenom: z.string(),
        cartes_attribuees: z.number().min(0),
      })
    ),
    formation_date: z.string(),
    formation_format: z.string(),
  }),

  follow_up: z.object({
    frequence_rapports: z.string(),
    canal_communication: z.string(),
    personne_referente: z.object({
      nom: z.string(),
      disponibilites: z.string(),
    }),
    compte_google_existant: z.object({
      existe: z.boolean(),
      email: z.string(),
    }),
  }),

  validation: z.object({
    questions_preoccupations: z.string(),
    accords: z.object({
      gestion_gbp: z.boolean(),
      photos_5_jours: z.boolean(),
      validation_description: z.boolean(),
    }),
    date_rendez_vous: z.string(),
    prochain_point: z.string(),
  }),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

