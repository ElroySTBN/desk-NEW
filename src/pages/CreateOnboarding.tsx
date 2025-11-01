import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, ExternalLink, ArrowLeft, Plus, X, Info, Building2 } from "lucide-react";
import type { OnboardingLegalInfo, OnboardingGoogleBusiness, OnboardingBrandIdentity } from "@/types/onboarding";
import type { Organization } from "@/types/crm";

// Pas de catégories prédéfinies - tout est flexible

const JOURS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
] as const;

export default function CreateOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  // Informations obligatoires
  const [clientName, setClientName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  
  // Contact client
  const [contactEmail, setContactEmail] = useState("");

  // Activité et services
  const [metierDescription, setMetierDescription] = useState("");
  const [services, setServices] = useState("");
  const [pointsForts, setPointsForts] = useState("");
  const [certifications, setCertifications] = useState("");
  const [garantiePieces, setGarantiePieces] = useState("");
  const [garantieMainOeuvre, setGarantieMainOeuvre] = useState("");
  const [savDescription, setSavDescription] = useState("");

  // Google Business Profile
  const [categorieActivite, setCategorieActivite] = useState("");
  const [aLieuPhysique, setALieuPhysique] = useState(false);
  const [proposeLivraison, setProposeLivraison] = useState(false);
  const [zonesDesservies, setZonesDesservies] = useState<string[]>([]);
  const [nouvelleZone, setNouvelleZone] = useState("");
  const [telephone, setTelephone] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [description, setDescription] = useState("");
  
  // Horaires
  const [horaires, setHoraires] = useState({
    lundi: { ouvert: true, horaires: "" },
    mardi: { ouvert: true, horaires: "" },
    mercredi: { ouvert: true, horaires: "" },
    jeudi: { ouvert: true, horaires: "" },
    vendredi: { ouvert: true, horaires: "" },
    samedi: { ouvert: false, horaires: "" },
    dimanche: { ouvert: false, horaires: "" },
  });

  const ajouterZone = () => {
    if (nouvelleZone.trim()) {
      setZonesDesservies([...zonesDesservies, nouvelleZone.trim()]);
      setNouvelleZone("");
    }
  };

  const supprimerZone = (index: number) => {
    setZonesDesservies(zonesDesservies.filter((_, i) => i !== index));
  };

  const handleHoraireChange = (jour: string, field: 'ouvert' | 'horaires', value: boolean | string) => {
    setHoraires(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("organizations")
          .select("id, legal_name, commercial_name, email, phone, website")
          .eq("user_id", user.id)
          .order("legal_name");

        if (error) throw error;
        setOrganizations(data || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  // Auto-fill when organization is selected
  useEffect(() => {
    if (!selectedOrgId) return;

    const org = organizations.find(o => o.id === selectedOrgId);
    if (!org) return;

    // Pre-fill client name and contact email
    if (org.commercial_name) setClientName(org.commercial_name);
    if (org.email) setContactEmail(org.email);
    if (org.phone) setTelephone(org.phone);
    if (org.website) setSiteWeb(org.website);
  }, [selectedOrgId, organizations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !createdBy.trim()) {
      toast.error("Le nom du client et votre nom sont obligatoires");
      return;
    }

    setLoading(true);

    try {
      // Contact email only - you already have legal info from billing
      const legal_info: Partial<OnboardingLegalInfo> = {
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
          email: { value: contactEmail, prefilled: !!contactEmail },
        },
        contact_operationnel: {
          nom: "",
          telephone: "",
          email: "",
        },
      };

      const brand_identity: Partial<OnboardingBrandIdentity> = {
        metier_description: metierDescription,
        services: services ? services.split(',').map(s => s.trim()) : [],
        points_forts: pointsForts ? pointsForts.split(',').map(s => s.trim()) : [],
        certifications: certifications ? certifications.split(',').map(s => s.trim()) : [],
        garanties: {
          pieces_ans: garantiePieces ? parseInt(garantiePieces) : 0,
          main_oeuvre_ans: garantieMainOeuvre ? parseInt(garantieMainOeuvre) : 0,
          sav_description: savDescription,
        },
      };

      const categorie = categorieActivite;

      const google_business: Partial<OnboardingGoogleBusiness> = {
        nom_etablissement: { value: clientName, prefilled: true },
        categorie_principale: categorie,
        categories_secondaires: zonesDesservies,
        horaires: horaires as any,
        urgence_24_7: aLieuPhysique ? "lieu_physique" : (proposeLivraison ? "livraison" : ""),
        telephone_public: { value: telephone, prefilled: !!telephone },
        email_public: { value: "", prefilled: false },
        site_web: { value: siteWeb, prefilled: !!siteWeb },
        reseaux_sociaux: {
          facebook: "",
          instagram: "",
          linkedin: "",
          autres: "",
        },
        description_courte: description,
        attributs: [],
      };

      const { data, error } = await supabase
        .from("onboarding")
        .insert({
          client_name: clientName,
          created_by: createdBy,
          status: "sent",
          legal_info,
          brand_identity,
          google_business,
          target_audience: {},
          communication: {},
          history: {},
          visuals: {},
          nfc_team: {},
          follow_up: {},
          validation: {},
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedId(data.id);
      setShowLinkDialog(true);
      toast.success("Onboarding créé avec succès!");
    } catch (error) {
      console.error("Error creating onboarding:", error);
      toast.error("Erreur lors de la création de l'onboarding");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/onboarding/form/${generatedId}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié dans le presse-papiers");
  };

  const openLink = () => {
    const link = `${window.location.origin}/onboarding/form/${generatedId}`;
    window.open(link, "_blank");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/onboarding")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau onboarding</CardTitle>
          <CardDescription>
            Pré-remplissez un maximum d'informations pour faciliter le travail de votre client.
            Tous les champs que vous remplissez ici seront marqués en orange pour être vérifiés par le client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection organisation */}
            <div className="space-y-2 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <Label className="font-semibold">Sélectionner une organisation existante (optionnel)</Label>
              </div>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une organisation pour pré-remplir..." />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.commercial_name || org.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Si vous avez déjà facturé ce client, sélectionnez-le pour pré-remplir ses coordonnées
              </p>
            </div>

            {/* Informations obligatoires */}
            <div className="space-y-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Informations obligatoires</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nom du client *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nom de l'entreprise"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdBy">Créé par *</Label>
                  <Input
                    id="createdBy"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label>Email du contact principal</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@entreprise.fr"
              />
              <p className="text-xs text-muted-foreground">
                Email pour envoyer les informations et factures
              </p>
            </div>

            <Accordion type="multiple" defaultValue={["activite", "google"]} className="space-y-4">

              {/* Activité et services */}
              <AccordionItem value="activite">
                <AccordionTrigger className="text-lg font-semibold">
                  1. Activité et services
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Description du métier</Label>
                    <Textarea
                      value={metierDescription}
                      onChange={(e) => setMetierDescription(e.target.value)}
                      placeholder="Décrivez l'activité principale de l'entreprise..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Services/Prestations proposés (séparés par des virgules)</Label>
                    <Input
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="Listez les services ou prestations..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Points forts et avantages (séparés par des virgules)</Label>
                    <Input
                      value={pointsForts}
                      onChange={(e) => setPointsForts(e.target.value)}
                      placeholder="Les points qui différencient l'entreprise..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Certifications et labels (séparés par des virgules)</Label>
                    <Input
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="Certifications, labels, agréments..."
                    />
                  </div>

                  <Card className="p-4 space-y-4 bg-muted/50">
                    <h4 className="font-medium">Garanties</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Garantie pièces (années)</Label>
                        <Input
                          type="number"
                          value={garantiePieces}
                          onChange={(e) => setGarantiePieces(e.target.value)}
                          placeholder="2"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Garantie main d'œuvre (années)</Label>
                        <Input
                          type="number"
                          value={garantieMainOeuvre}
                          onChange={(e) => setGarantieMainOeuvre(e.target.value)}
                          placeholder="1"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description du service client / SAV</Label>
                      <Textarea
                        value={savDescription}
                        onChange={(e) => setSavDescription(e.target.value)}
                        placeholder="Décrivez le service client ou service après-vente..."
                        rows={2}
                      />
                    </div>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* Google Business Profile */}
              <AccordionItem value="google">
                <AccordionTrigger className="text-lg font-semibold">
                  2. Fiche Google Business Profile
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  {/* Catégorie */}
                  <div className="space-y-2">
                    <Label>Catégorie d'activité principale</Label>
                    <Input
                      value={categorieActivite}
                      onChange={(e) => setCategorieActivite(e.target.value)}
                      placeholder="Ex: Agence immobilière, Organisme de formation, Plombier, Conseil..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Entrez la catégorie qui décrit le mieux l'activité du client
                    </p>
                  </div>

                  {/* Lieu physique */}
                  <Card className="p-4 space-y-4 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">A un lieu physique visitable</Label>
                      <Switch checked={aLieuPhysique} onCheckedChange={setALieuPhysique} />
                    </div>
                  </Card>

                  {/* Livraisons */}
                  <Card className="p-4 space-y-4 bg-green-50/50 dark:bg-green-950/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Propose des livraisons/visites à domicile</Label>
                      <Switch checked={proposeLivraison} onCheckedChange={setProposeLivraison} />
                    </div>

                    {proposeLivraison && (
                      <div className="space-y-4 pt-4 border-t">
                        <Label>Zones desservies</Label>
                        <div className="flex gap-2">
                          <Input
                            value={nouvelleZone}
                            onChange={(e) => setNouvelleZone(e.target.value)}
                            placeholder="Département, ville, région..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                ajouterZone();
                              }
                            }}
                          />
                          <Button type="button" onClick={ajouterZone} size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {zonesDesservies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {zonesDesservies.map((zone, index) => (
                              <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                                {zone}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 ml-2 hover:bg-destructive/20"
                                  onClick={() => supprimerZone(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Coordonnées */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Téléphone public</Label>
                      <Input
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site web</Label>
                      <Input
                        value={siteWeb}
                        onChange={(e) => setSiteWeb(e.target.value)}
                        placeholder="https://www.entreprise.fr"
                      />
                    </div>
                  </div>

                  {/* Horaires */}
                  <Card className="p-4 space-y-4 bg-muted/50">
                    <h4 className="font-semibold">Horaires d'ouverture</h4>
                    <div className="space-y-3">
                      {JOURS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center gap-3 w-32">
                            <Switch
                              checked={horaires[key].ouvert}
                              onCheckedChange={(checked) => handleHoraireChange(key, 'ouvert', checked)}
                            />
                            <Label className="font-medium">{label}</Label>
                          </div>
                          <Input
                            value={horaires[key].horaires}
                            onChange={(e) => handleHoraireChange(key, 'horaires', e.target.value)}
                            placeholder="Ex: 9h-12h, 14h-18h"
                            disabled={!horaires[key].ouvert}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description de l'établissement (750 caractères max)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description complète de l'activité de l'entreprise pour Google Business Profile..."
                      rows={6}
                      maxLength={750}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {description.length} / 750 caractères
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/onboarding")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Création..." : "Créer l'onboarding"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Onboarding créé avec succès!</DialogTitle>
            <DialogDescription>
              Partagez ce lien avec votre client pour qu'il puisse vérifier et compléter son onboarding.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <code className="text-sm break-all">
                {window.location.origin}/onboarding/form/{generatedId}
              </code>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyLink} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </Button>
              <Button onClick={openLink} className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir le formulaire
              </Button>
            </div>
            <Button
              onClick={() => {
                setShowLinkDialog(false);
                navigate("/onboarding");
              }}
              variant="ghost"
              className="w-full"
            >
              Retour à la liste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
