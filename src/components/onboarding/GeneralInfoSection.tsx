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
import { Info, Building2, MapPin, Calendar, FileText } from "lucide-react";

export function GeneralInfoSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;

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

  const legalInfo = watch("legal_info");

  return (
    <AccordionItem value="section-general">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Section 1 : Informations Générales
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ℹ️ À propos de cette section :</strong><br />
            Ces informations générales sur l'entreprise seront pré-remplies à partir des données en ligne et des informations disponibles.
          </p>
        </div>

        {/* Informations légales */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Informations légales
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <PrefilledLabel
                label="Raison sociale"
                prefilled={legalInfo?.raison_sociale?.prefilled || false}
              />
              <Input
                {...register("legal_info.raison_sociale.value")}
                placeholder="Raison sociale"
              />
            </div>
            <div>
              <PrefilledLabel
                label="Nom commercial"
                prefilled={legalInfo?.nom_commercial?.prefilled || false}
              />
              <Input
                {...register("legal_info.nom_commercial.value")}
                placeholder="Nom commercial"
              />
            </div>
            <div>
              <PrefilledLabel
                label="SIRET"
                prefilled={legalInfo?.siret?.prefilled || false}
              />
              <Input
                {...register("legal_info.siret.value")}
                placeholder="12345678901234"
              />
            </div>
            <div>
              <Label>Date de création</Label>
              <Input
                type="date"
                {...register("history.annee_creation", { valueAsNumber: false })}
              />
            </div>
          </div>
        </Card>

        {/* Adresse */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Adresse
          </h3>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <PrefilledLabel
                label="Rue"
                prefilled={legalInfo?.adresse?.rue?.prefilled || false}
              />
              <Input
                {...register("legal_info.adresse.rue.value")}
                placeholder="123 Rue Example"
              />
            </div>
            <div>
              <PrefilledLabel
                label="Code postal"
                prefilled={legalInfo?.adresse?.code_postal?.prefilled || false}
              />
              <Input
                {...register("legal_info.adresse.code_postal.value")}
                placeholder="75001"
              />
            </div>
            <div className="md:col-span-2">
              <PrefilledLabel
                label="Ville"
                prefilled={legalInfo?.adresse?.ville?.prefilled || false}
              />
              <Input
                {...register("legal_info.adresse.ville.value")}
                placeholder="Paris"
              />
            </div>
          </div>
        </Card>

        {/* Contact principal */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">Contact principal</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <PrefilledLabel
                label="Nom"
                prefilled={legalInfo?.contact_principal?.nom?.prefilled || false}
              />
              <Input
                {...register("legal_info.contact_principal.nom.value")}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <Label>Fonction</Label>
              <Input
                {...register("legal_info.contact_principal.fonction")}
                placeholder="Directeur"
              />
            </div>
            <div>
              <PrefilledLabel
                label="Téléphone"
                prefilled={legalInfo?.contact_principal?.telephone?.prefilled || false}
              />
              <Input
                {...register("legal_info.contact_principal.telephone.value")}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div>
              <PrefilledLabel
                label="Email"
                prefilled={legalInfo?.contact_principal?.email?.prefilled || false}
              />
              <Input
                type="email"
                {...register("legal_info.contact_principal.email.value")}
                placeholder="contact@entreprise.fr"
              />
            </div>
          </div>
        </Card>

        {/* Histoire de l'entreprise */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histoire de l'entreprise
          </h3>
          
          <div>
            <Label>Histoire et parcours de l'entreprise</Label>
            <Textarea
              {...register("history.annee_creation", { 
                setValueAs: (v) => {
                  // Si c'est une date string, extraire l'année
                  if (typeof v === 'string' && v.includes('-')) {
                    return parseInt(v.split('-')[0]);
                  }
                  return v;
                }
              })}
              rows={4}
              placeholder="Décrivez l'histoire de l'entreprise, sa création, son évolution..."
            />
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

