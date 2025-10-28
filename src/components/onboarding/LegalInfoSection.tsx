import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/lib/onboarding-schema";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface LegalInfoSectionProps {
  form: UseFormReturn<OnboardingFormData>;
}

export function LegalInfoSection({ form }: LegalInfoSectionProps) {
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
    <AccordionItem value="section-1">
      <AccordionTrigger className="text-lg font-semibold">
        1. Informations légales
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <PrefilledLabel
              label="Raison sociale *"
              prefilled={watch("legal_info.raison_sociale.prefilled")}
            />
            <Input
              {...register("legal_info.raison_sociale.value")}
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

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Adresse</h3>
          <div className="space-y-2">
            <PrefilledLabel
              label="Rue *"
              prefilled={watch("legal_info.adresse.rue.prefilled")}
            />
            <Input
              {...register("legal_info.adresse.rue.value")}
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
                className={
                  watch("legal_info.adresse.ville.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Contact principal</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <PrefilledLabel
                label="Nom *"
                prefilled={watch("legal_info.contact_principal.nom.prefilled")}
              />
              <Input
                {...register("legal_info.contact_principal.nom.value")}
                className={
                  watch("legal_info.contact_principal.nom.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Fonction</Label>
              <Input {...register("legal_info.contact_principal.fonction")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <PrefilledLabel
                label="Téléphone *"
                prefilled={watch("legal_info.contact_principal.telephone.prefilled")}
              />
              <Input
                {...register("legal_info.contact_principal.telephone.value")}
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
                className={
                  watch("legal_info.contact_principal.email.prefilled")
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Contact opérationnel (si différent)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input {...register("legal_info.contact_operationnel.nom")} />
            </div>

            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input {...register("legal_info.contact_operationnel.telephone")} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                {...register("legal_info.contact_operationnel.email")}
              />
            </div>
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

