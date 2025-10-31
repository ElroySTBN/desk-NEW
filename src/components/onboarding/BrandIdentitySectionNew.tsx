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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, Sparkles, Trophy, Award, X } from "lucide-react";

export function BrandIdentitySectionNew({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, control } = form;

  const {
    fields: servicesFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "brand_identity.services",
  });

  const {
    fields: pointsFortsFields,
    append: appendPointFort,
    remove: removePointFort,
  } = useFieldArray({
    control,
    name: "brand_identity.points_forts",
  });

  const {
    fields: certificationsFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "brand_identity.certifications",
  });

  return (
    <AccordionItem value="section-brand-identity">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Section 2 : Identité de Marque
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ℹ️ À propos de cette section :</strong><br />
            Décrivez l'identité, les valeurs et les différenciateurs de votre entreprise. Ces informations serviront à créer votre Brand DNA.
          </p>
        </div>

        {/* Description du métier */}
        <Card className="p-4 space-y-4">
          <div>
            <Label>Description de l'entreprise et du métier</Label>
            <Textarea
              {...register("brand_identity.metier_description")}
              rows={4}
              placeholder="Décrivez votre entreprise, votre métier, vos activités principales..."
            />
          </div>
        </Card>

        {/* Histoire et mission */}
        <Card className="p-4 space-y-4">
          <div>
            <Label>Histoire et mission de l'entreprise</Label>
            <Textarea
              {...register("brand_identity.metier_description")}
              rows={3}
              placeholder="Racontez l'histoire de votre entreprise et sa mission..."
            />
          </div>
        </Card>

        {/* Trois valeurs principales */}
        <Card className="p-4 space-y-4">
          <Label className="text-base font-semibold">Les 3 valeurs principales</Label>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Valeur 1</Label>
              <Input placeholder="Ex: Qualité" />
            </div>
            <div>
              <Label>Valeur 2</Label>
              <Input placeholder="Ex: Fiabilité" />
            </div>
            <div>
              <Label>Valeur 3</Label>
              <Input placeholder="Ex: Proximité" />
            </div>
          </div>
        </Card>

        {/* Points forts */}
        <Card className="p-4 space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Points forts de l'entreprise
          </Label>
          {pointsFortsFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`brand_identity.points_forts.${index}`)}
                placeholder="Ex: Expertise de 20 ans"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePointFort(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendPointFort("")}
          >
            + Ajouter un point fort
          </Button>
        </Card>

        {/* Différenciateurs */}
        <Card className="p-4 space-y-4">
          <Label className="text-base font-semibold">Différenciateurs de la concurrence</Label>
          <Textarea
            {...register("brand_identity.metier_description")}
            rows={3}
            placeholder="Qu'est-ce qui vous distingue de vos concurrents ?"
          />
        </Card>

        {/* Certifications et labels */}
        <Card className="p-4 space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certifications et labels
          </Label>
          {certificationsFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`brand_identity.certifications.${index}`)}
                placeholder="Ex: QualiPAC, RGE, etc."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCertification(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendCertification("")}
          >
            + Ajouter une certification
          </Button>
        </Card>

        {/* Mots à éviter/utiliser */}
        <Card className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Mots ou expressions à éviter absolument</Label>
              <Textarea
                rows={3}
                placeholder="Ex: pas cher, discount..."
              />
            </div>
            <div>
              <Label>Mots ou expressions à utiliser souvent</Label>
              <Textarea
                rows={3}
                placeholder="Ex: expertise, qualité, confiance..."
              />
            </div>
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

