import { UseFormReturn, useFieldArray } from "react-hook-form";
import { OnboardingFormData } from "@/lib/onboarding-schema";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Info, Plus, X, Clock } from "lucide-react";
import { useState } from "react";

const JOURS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
] as const;

// Pas de catégories prédéfinies - formulaire flexible pour tous types d'entreprises

export function GoogleBusinessSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;
  const [zonesDesservies, setZonesDesservies] = useState<string[]>([]);
  const [nouvelleZone, setNouvelleZone] = useState("");

  const PrefilledLabel = ({ label, prefilled }: { label: string; prefilled: boolean }) => (
    <Label className="flex items-center gap-2">
      {label}
      {prefilled && (
        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
          <Info className="h-3 w-3" />
          Pré-rempli - À vérifier
        </span>
      )}
    </Label>
  );

  // Pas de sélection prédéfinie - champ libre

  const ajouterZone = () => {
    if (nouvelleZone.trim()) {
      const nouvellesZones = [...zonesDesservies, nouvelleZone.trim()];
      setZonesDesservies(nouvellesZones);
      setValue("google_business.categories_secondaires", nouvellesZones);
      setNouvelleZone("");
    }
  };

  const supprimerZone = (index: number) => {
    const nouvellesZones = zonesDesservies.filter((_, i) => i !== index);
    setZonesDesservies(nouvellesZones);
    setValue("google_business.categories_secondaires", nouvellesZones);
  };

  const aLieuPhysique = watch("google_business.urgence_24_7") === "lieu_physique";
  const proposeLivraison = watch("google_business.urgence_24_7") === "livraison";

  return (
    <AccordionItem value="section-6">
      <AccordionTrigger className="text-lg font-semibold">
        Fiche d'établissement Google Business Profile
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        {/* Nom de l'entreprise */}
        <div className="space-y-2">
          <PrefilledLabel
            label="Nom de l'entreprise *"
            prefilled={watch("google_business.nom_etablissement.prefilled")}
          />
          <Input
            {...register("google_business.nom_etablissement.value")}
            placeholder="Ex: Plomberie Martin"
            className={
              watch("google_business.nom_etablissement.prefilled")
                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                : ""
            }
          />
        </div>

        {/* Catégorie d'activité */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Catégorie d'activité principale *</Label>
          <Input
            {...register("google_business.categorie_principale")}
            placeholder="Ex: Agence immobilière, Organisme de formation, Plombier, Conseil..."
          />
          <p className="text-sm text-muted-foreground">
            Quelle catégorie décrit le mieux votre activité ?
          </p>
        </div>

        {/* Lieu physique */}
        <Card className="p-4 space-y-4 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Label className="text-base font-semibold">
                Souhaitez-vous ajouter un lieu que vos clients peuvent visiter ?
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Comme un magasin ou un bureau. Cette adresse s'affichera sur Google Maps.
              </p>
            </div>
            <Switch
              checked={aLieuPhysique}
              onCheckedChange={(checked) => 
                setValue("google_business.urgence_24_7", checked ? "lieu_physique" : "")
              }
            />
          </div>

          {aLieuPhysique && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Adresse de votre établissement</h4>
              
              <div className="space-y-2">
                <Label>Pays/Région</Label>
                <Input defaultValue="France" disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <PrefilledLabel
                  label="Adresse postale *"
                  prefilled={watch("legal_info.adresse.rue.prefilled")}
                />
                <Input
                  {...register("legal_info.adresse.rue.value")}
                  placeholder="123 rue de la République"
                  className={
                    watch("legal_info.adresse.rue.prefilled")
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                      : ""
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <PrefilledLabel
                    label="Code postal *"
                    prefilled={watch("legal_info.adresse.code_postal.prefilled")}
                  />
                  <Input
                    {...register("legal_info.adresse.code_postal.value")}
                    placeholder="75001"
                    className={
                      watch("legal_info.adresse.code_postal.prefilled")
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                        : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <PrefilledLabel
                    label="Ville *"
                    prefilled={watch("legal_info.adresse.ville.prefilled")}
                  />
                  <Input
                    {...register("legal_info.adresse.ville.value")}
                    placeholder="Paris"
                    className={
                      watch("legal_info.adresse.ville.prefilled")
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Livraisons et visites */}
        <Card className="p-4 space-y-4 bg-green-50/50 dark:bg-green-950/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Label className="text-base font-semibold">
                Proposez-vous des livraisons ou des visites à domicile ?
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Si vous vous rendez chez vos clients ou proposez vos services à domicile
              </p>
            </div>
            <Switch
              checked={proposeLivraison}
              onCheckedChange={(checked) => 
                setValue("google_business.urgence_24_7", checked ? "livraison" : (aLieuPhysique ? "lieu_physique" : ""))
              }
            />
          </div>

          {proposeLivraison && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold">Zones que vous desservez</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez les départements, villes ou régions où vous intervenez
                </p>
              </div>

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
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pl-3 pr-1 py-1 text-sm"
                    >
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
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Coordonnées à partager avec vos clients</h3>
          
          <div className="space-y-2">
            <PrefilledLabel
              label="Numéro de téléphone *"
              prefilled={watch("google_business.telephone_public.prefilled")}
            />
            <Input
              {...register("google_business.telephone_public.value")}
              type="tel"
              placeholder="01 23 45 67 89"
              className={
                watch("google_business.telephone_public.prefilled")
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <PrefilledLabel
              label="Site Web (facultatif)"
              prefilled={watch("google_business.site_web.prefilled")}
            />
            <Input
              {...register("google_business.site_web.value")}
              type="url"
              placeholder="https://www.votre-site.fr"
              className={
                watch("google_business.site_web.prefilled")
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                  : ""
              }
            />
          </div>
        </Card>

        {/* Horaires d'ouverture */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Horaires d'ouverture</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Informez vos clients de vos horaires d'ouverture
          </p>

          <div className="space-y-3">
            {JOURS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={watch(`google_business.horaires.${key}.ouvert`)}
                    onCheckedChange={(checked) =>
                      setValue(`google_business.horaires.${key}.ouvert`, checked)
                    }
                  />
                  <Label className="font-medium">{label}</Label>
                </div>
                <Input
                  {...register(`google_business.horaires.${key}.horaires`)}
                  placeholder="Ex: 9h-12h, 14h-18h"
                  disabled={!watch(`google_business.horaires.${key}.ouvert`)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Description de votre établissement
          </Label>
          <p className="text-sm text-muted-foreground">
            Donnez plus d'informations sur votre activité (750 caractères max)
          </p>
          <Textarea
            {...register("google_business.description_courte")}
            placeholder="Description complète de votre activité pour Google Business Profile..."
            rows={6}
            maxLength={750}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {watch("google_business.description_courte")?.length || 0} / 750 caractères
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
