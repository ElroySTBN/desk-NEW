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
import { Info, FileText, Tag, X } from "lucide-react";

export function DescriptionAttributesSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;
  const { control } = form;

  const {
    fields: attributesFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "google_business.attributs",
  });

  const description = watch("google_business.description_courte") || "";
  const maxLength = 750;
  const remaining = maxLength - description.length;

  return (
    <AccordionItem value="section-description">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Section 5 : Description et Attributs
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>ℹ️ À propos de cette section :</strong><br />
            Rédigez une description courte (750 caractères max) pour Google Business Profile. Les suggestions seront pré-remplies et modifiables.
          </p>
        </div>

        {/* Description courte */}
        <Card className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Description courte (pour Google Business Profile)</Label>
              <span className={`text-xs ${remaining < 50 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {description.length} / {maxLength} caractères
              </span>
            </div>
            <Textarea
              {...register("google_business.description_courte")}
              rows={6}
              maxLength={maxLength}
              placeholder="Rédigez une description courte et engageante de votre entreprise qui apparaîtra sur Google Business Profile..."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Cette description sera visible publiquement sur votre fiche Google Business Profile. Assurez-vous qu'elle soit claire et représentative de votre activité.
            </p>
          </div>
        </Card>

        {/* Attributs */}
        <Card className="p-4 space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Attributs Google Business Profile
          </Label>
          <p className="text-sm text-muted-foreground">
            Ajoutez les attributs qui décrivent votre entreprise (ex: Accessible aux fauteuils roulants, Accepte les réservations, etc.)
          </p>
          <div className="space-y-2">
            {attributesFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`google_business.attributs.${index}`)}
                  placeholder="Ex: Accessible aux fauteuils roulants"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttribute(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendAttribute("")}
            >
              + Ajouter un attribut
            </Button>
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

