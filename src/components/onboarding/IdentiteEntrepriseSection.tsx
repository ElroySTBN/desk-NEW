import { UseFormReturn } from "react-hook-form";
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
import { Info, Building2 } from "lucide-react";

export function IdentiteEntrepriseSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch } = form;

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

  return (
    <AccordionItem value="section-identity">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Document d'Identité d'Entreprise
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ℹ️ À propos de cette section :</strong><br />
            Ces informations serviront à créer le document d'identité complet de votre entreprise.
            Les champs en orange sont pré-remplis et doivent être vérifiés.
          </p>
        </div>

        {/* Informations légales de base */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Informations légales</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <PrefilledLabel
                label="Raison sociale *"
                prefilled={watch("legal_info.raison_sociale.prefilled")}
              />
              <Input
                {...register("legal_info.raison_sociale.value")}
                placeholder="SARL Martin Plomberie"
                className={
                  watch("legal_info.raison_sociale.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <PrefilledLabel
                label="Nom commercial *"
                prefilled={watch("legal_info.nom_commercial.prefilled")}
              />
              <Input
                {...register("legal_info.nom_commercial.value")}
                placeholder="Plomberie Martin"
                className={
                  watch("legal_info.nom_commercial.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <PrefilledLabel
              label="SIRET *"
              prefilled={watch("legal_info.siret.prefilled")}
            />
            <Input
              {...register("legal_info.siret.value")}
              placeholder="123 456 789 00010"
              className={
                watch("legal_info.siret.prefilled")
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                  : ""
              }
            />
          </div>
        </Card>

        {/* Activité et services */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Activité et services</h3>
          
          <div className="space-y-2">
            <Label>Description de votre métier *</Label>
            <Textarea
              {...register("brand_identity.metier_description")}
              placeholder="Ex: Nous sommes spécialisés dans l'installation et la maintenance de systèmes de climatisation pour particuliers et professionnels..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Services proposés (séparés par des virgules) *</Label>
            <Input
              {...register("brand_identity.services")}
              placeholder="Installation climatisation, Maintenance, Dépannage d'urgence, Entretien annuel..."
            />
            <p className="text-xs text-muted-foreground">
              Listez tous vos services principaux
            </p>
          </div>
        </Card>

        {/* Points forts et différenciation */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Points forts et différenciation</h3>
          
          <div className="space-y-2">
            <Label>Vos points forts (séparés par des virgules)</Label>
            <Input
              {...register("brand_identity.points_forts")}
              placeholder="Intervention rapide, Devis gratuit, Garantie 2 ans, Équipe certifiée..."
            />
          </div>

          <div className="space-y-2">
            <Label>Certifications et labels (séparés par des virgules)</Label>
            <Input
              {...register("brand_identity.certifications")}
              placeholder="QualiPAC, RGE, Qualibat, QualiClimat..."
            />
          </div>

          <div className="space-y-2">
            <Label>Vos valeurs d'entreprise (séparées par des virgules)</Label>
            <Input
              {...register("communication.valeurs")}
              placeholder="Qualité, Réactivité, Transparence, Proximité..."
            />
          </div>
        </Card>

        {/* Garanties */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Garanties et SAV</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Garantie pièces (en années)</Label>
              <Input
                type="number"
                {...register("brand_identity.garanties.pieces_ans", {
                  valueAsNumber: true,
                })}
                min="0"
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label>Garantie main d'œuvre (en années)</Label>
              <Input
                type="number"
                {...register("brand_identity.garanties.main_oeuvre_ans", {
                  valueAsNumber: true,
                })}
                min="0"
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description de votre service après-vente</Label>
            <Textarea
              {...register("brand_identity.garanties.sav_description")}
              placeholder="Ex: SAV disponible 7j/7, intervention sous 24h en cas d'urgence, suivi personnalisé..."
              rows={3}
            />
          </div>
        </Card>

        {/* Historique */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Historique et expérience</h3>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Année de création *</Label>
              <Input
                type="number"
                {...register("history.annee_creation", { valueAsNumber: true })}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="2010"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre d'interventions réalisées</Label>
              <Input
                type="number"
                {...register("history.nb_interventions", { valueAsNumber: true })}
                min="0"
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre total d'employés</Label>
              <Input
                type="number"
                {...register("history.equipe.total_employes", { valueAsNumber: true })}
                min="0"
                placeholder="5"
              />
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Contact principal</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <PrefilledLabel
                label="Nom du contact *"
                prefilled={watch("legal_info.contact_principal.nom.prefilled")}
              />
              <Input
                {...register("legal_info.contact_principal.nom.value")}
                placeholder="Jean Martin"
                className={
                  watch("legal_info.contact_principal.nom.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Fonction</Label>
              <Input
                {...register("legal_info.contact_principal.fonction")}
                placeholder="Gérant"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <PrefilledLabel
                label="Téléphone *"
                prefilled={watch("legal_info.contact_principal.telephone.prefilled")}
              />
              <Input
                type="tel"
                {...register("legal_info.contact_principal.telephone.value")}
                placeholder="01 23 45 67 89"
                className={
                  watch("legal_info.contact_principal.telephone.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <PrefilledLabel
                label="Email *"
                prefilled={watch("legal_info.contact_principal.email.prefilled")}
              />
              <Input
                type="email"
                {...register("legal_info.contact_principal.email.value")}
                placeholder="contact@entreprise.fr"
                className={
                  watch("legal_info.contact_principal.email.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

