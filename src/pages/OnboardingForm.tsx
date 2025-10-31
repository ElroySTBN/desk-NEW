import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { onboardingSchema, type OnboardingFormData } from "@/lib/onboarding-schema";
import type { Onboarding } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Save, CheckCircle2, ArrowLeft } from "lucide-react";

// Import section components
import { GeneralInfoSection } from "@/components/onboarding/GeneralInfoSection";
import { BrandIdentitySectionNew } from "@/components/onboarding/BrandIdentitySectionNew";
import { TargetAudienceSection } from "@/components/onboarding/TargetAudienceSection";
import { GoogleBusinessSection } from "@/components/onboarding/GoogleBusinessSection";
import { DescriptionAttributesSection } from "@/components/onboarding/DescriptionAttributesSection";

export default function OnboardingForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [currentSection, setCurrentSection] = useState<string[]>(["section-general"]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
  });

  const { watch, handleSubmit, reset } = form;

  // Fetch onboarding data
  useEffect(() => {
    if (id) {
      fetchOnboarding();
    }
  }, [id]);

  const fetchOnboarding = async () => {
    try {
      const { data, error } = await supabase
        .from("onboarding")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setOnboarding(data);
      
      // Reset form with fetched data
      reset({
        legal_info: data.legal_info || getDefaultLegalInfo(),
        brand_identity: data.brand_identity || getDefaultBrandIdentity(),
        target_audience: data.target_audience || getDefaultTargetAudience(),
        communication: data.communication || getDefaultCommunication(),
        history: data.history || getDefaultHistory(),
        google_business: data.google_business || getDefaultGoogleBusiness(),
        visuals: data.visuals || getDefaultVisuals(),
        nfc_team: data.nfc_team || getDefaultNFCTeam(),
        follow_up: data.follow_up || getDefaultFollowUp(),
        validation: data.validation || getDefaultValidation(),
      });
    } catch (error) {
      console.error("Error fetching onboarding:", error);
      toast.error("Erreur lors du chargement du formulaire");
    } finally {
      setLoading(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [watch]);

  const handleAutoSave = useCallback(async () => {
    if (!id || !onboarding) return;

    const formData = watch();
    await saveOnboarding(formData, false);
  }, [id, onboarding, watch]);

  const saveOnboarding = async (data: OnboardingFormData, showToast = true) => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from("onboarding")
        .update({
          legal_info: data.legal_info,
          brand_identity: data.brand_identity,
          target_audience: data.target_audience,
          communication: data.communication,
          history: data.history,
          google_business: data.google_business,
          visuals: data.visuals,
          nfc_team: data.nfc_team,
          follow_up: data.follow_up,
          validation: data.validation,
          last_saved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      if (showToast) {
        toast.success("Brouillon sauvegardé");
      }
    } catch (error) {
      console.error("Error saving onboarding:", error);
      if (showToast) {
        toast.error("Erreur lors de la sauvegarde");
      }
    }
  };

  const onSave = async (data: OnboardingFormData) => {
    setSaving(true);
    await saveOnboarding(data, true);
    setSaving(false);
  };

  const onComplete = async (data: OnboardingFormData) => {
    if (!id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("onboarding")
        .update({
          legal_info: data.legal_info,
          brand_identity: data.brand_identity,
          target_audience: data.target_audience,
          communication: data.communication,
          history: data.history,
          google_business: data.google_business,
          visuals: data.visuals,
          nfc_team: data.nfc_team,
          follow_up: data.follow_up,
          validation: data.validation,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Onboarding complété avec succès!");
      navigate(`/onboarding/export/${id}`);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Erreur lors de la finalisation");
    } finally {
      setSaving(false);
    }
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    const data = watch();
    let filledSections = 0;
    const totalSections = 8;

    // Check each section for completion
    if (isLegalInfoComplete(data.legal_info)) filledSections++;
    if (isBrandIdentityComplete(data.brand_identity)) filledSections++;
    if (isGoogleBusinessComplete(data.google_business)) filledSections++;
    if (isTargetAudienceComplete(data.target_audience)) filledSections++;
    if (isCommunicationComplete(data.communication)) filledSections++;
    if (isVisualsComplete(data.visuals)) filledSections++;
    if (isNFCTeamComplete(data.nfc_team)) filledSections++;
    if (isFollowUpComplete(data.follow_up)) filledSections++;
    if (isValidationComplete(data.validation)) filledSections++;

    return Math.round((filledSections / totalSections) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-lg mb-4">Onboarding introuvable</p>
          <Button onClick={() => navigate("/onboarding")}>
            Retour à la liste
          </Button>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/onboarding")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{onboarding.client_name}</h1>
                <p className="text-sm text-muted-foreground">
                  Formulaire d'onboarding
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSubmit(onSave)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button
                onClick={handleSubmit(onComplete)}
                disabled={saving || progress < 100}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Terminer
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{progress}% complété</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <form className="space-y-6">
          <Accordion
            type="multiple"
            value={currentSection}
            onValueChange={setCurrentSection}
            className="space-y-4"
          >
            <GeneralInfoSection form={form} />
            <BrandIdentitySectionNew form={form} />
            <TargetAudienceSection form={form} />
            <GoogleBusinessSection form={form} />
            <DescriptionAttributesSection form={form} />
          </Accordion>
        </form>
      </div>
    </div>
  );
}

// Helper functions to check section completion
function isLegalInfoComplete(data: any): boolean {
  return !!(
    data?.raison_sociale?.value &&
    data?.nom_commercial?.value &&
    data?.siret?.value &&
    data?.adresse?.rue?.value &&
    data?.contact_principal?.nom?.value
  );
}

function isBrandIdentityComplete(data: any): boolean {
  return !!(data?.metier_description && data?.services?.length > 0);
}

function isTargetAudienceComplete(data: any): boolean {
  return !!(data?.types_clients && data?.persona?.age_moyen);
}

function isCommunicationComplete(data: any): boolean {
  return !!(data?.perception_souhaitee?.length > 0 && data?.ton_reponses_avis);
}

function isHistoryComplete(data: any): boolean {
  return !!(data?.annee_creation && data?.equipe);
}

function isGoogleBusinessComplete(data: any): boolean {
  return !!(data?.nom_etablissement?.value && data?.categorie_principale);
}

function isVisualsComplete(data: any): boolean {
  return !!(data?.methode_envoi);
}

function isNFCTeamComplete(data: any): boolean {
  return !!(data?.nb_techniciens !== undefined);
}

function isFollowUpComplete(data: any): boolean {
  return !!(data?.frequence_rapports && data?.canal_communication);
}

function isValidationComplete(data: any): boolean {
  return !!(
    data?.accords?.gestion_gbp &&
    data?.accords?.photos_5_jours &&
    data?.accords?.validation_description
  );
}

// Default data generators
function getDefaultLegalInfo() {
  return {
    raison_sociale: { value: "", prefilled: false },
    nom_commercial: { value: "", prefilled: false },
    siret: { value: "", prefilled: false },
    adresse: {
      rue: { value: "", prefilled: false },
      code_postal: { value: "", prefilled: false },
      ville: { value: "", prefilled: false },
    },
    zones_intervention: [],
    contact_principal: {
      nom: { value: "", prefilled: false },
      fonction: "",
      telephone: { value: "", prefilled: false },
      email: { value: "", prefilled: false },
    },
    contact_operationnel: {
      nom: "",
      telephone: "",
      email: "",
    },
  };
}

function getDefaultBrandIdentity() {
  return {
    metier_description: "",
    services: [],
    points_forts: [],
    certifications: [],
    garanties: {
      pieces_ans: 0,
      main_oeuvre_ans: 0,
      sav_description: "",
    },
  };
}

function getDefaultTargetAudience() {
  return {
    types_clients: {
      particuliers: { checked: false, pourcentage_ca: 0 },
      professionnels: { checked: false, pourcentage_ca: 0 },
      coproprietes: { checked: false, pourcentage_ca: 0 },
      collectivites: { checked: false, pourcentage_ca: 0 },
    },
    persona: {
      age_moyen: "",
      situation: "",
      budget_moyen: "",
      motivations: "",
    },
    saisonnalite: {
      haute_saison: "",
      periode_forte_demande: "",
      services_saisonniers: "",
    },
  };
}

function getDefaultCommunication() {
  return {
    perception_souhaitee: [],
    ton_reponses_avis: "",
    valeurs: [],
  };
}

function getDefaultHistory() {
  return {
    annee_creation: new Date().getFullYear(),
    nb_interventions: 0,
    equipe: {
      nb_techniciens: 0,
      nb_commerciaux: 0,
      total_employes: 0,
    },
    clients_satisfaits_base: false,
    nb_clients_sollicitables: 0,
  };
}

function getDefaultGoogleBusiness() {
  return {
    nom_etablissement: { value: "", prefilled: false },
    categorie_principale: "",
    categories_secondaires: [],
    horaires: {
      lundi: { ouvert: true, horaires: "" },
      mardi: { ouvert: true, horaires: "" },
      mercredi: { ouvert: true, horaires: "" },
      jeudi: { ouvert: true, horaires: "" },
      vendredi: { ouvert: true, horaires: "" },
      samedi: { ouvert: false, horaires: "" },
      dimanche: { ouvert: false, horaires: "" },
    },
    urgence_24_7: "",
    telephone_public: { value: "", prefilled: false },
    email_public: { value: "", prefilled: false },
    site_web: { value: "", prefilled: false },
    reseaux_sociaux: {
      facebook: "",
      instagram: "",
      linkedin: "",
      autres: "",
    },
    description_courte: "",
    attributs: [],
  };
}

function getDefaultVisuals() {
  return {
    photos_disponibles: [],
    methode_envoi: "",
    uploaded_files: [],
    deadline: "",
  };
}

function getDefaultNFCTeam() {
  return {
    nb_techniciens: 0,
    techniciens: [],
    formation_date: "",
    formation_format: "",
  };
}

function getDefaultFollowUp() {
  return {
    frequence_rapports: "",
    canal_communication: "",
    personne_referente: {
      nom: "",
      disponibilites: "",
    },
    compte_google_existant: {
      existe: false,
      email: "",
    },
  };
}

function getDefaultValidation() {
  return {
    questions_preoccupations: "",
    accords: {
      gestion_gbp: false,
      photos_5_jours: false,
      validation_description: false,
    },
    date_rendez_vous: "",
    prochain_point: "",
  };
}

