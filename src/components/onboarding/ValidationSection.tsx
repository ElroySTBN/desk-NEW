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
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

export function ValidationSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;

  return (
    <AccordionItem value="section-10">
      <AccordionTrigger className="text-lg font-semibold">
        10. Validation finale
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label>Questions ou préoccupations</Label>
          <Textarea
            {...register("validation.questions_preoccupations")}
            placeholder="Avez-vous des questions ou des préoccupations particulières ?"
            rows={4}
          />
        </div>

        <Card className="p-4 space-y-4 bg-primary/5">
          <h3 className="font-semibold">Accords et confirmations *</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={watch("validation.accords.gestion_gbp")}
                onCheckedChange={(checked) =>
                  setValue("validation.accords.gestion_gbp", !!checked)
                }
                className="mt-1"
              />
              <Label className="cursor-pointer">
                J'autorise RaiseMed.IA à gérer mon profil Google Business et à répondre aux avis en mon nom
              </Label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                checked={watch("validation.accords.photos_5_jours")}
                onCheckedChange={(checked) =>
                  setValue("validation.accords.photos_5_jours", !!checked)
                }
                className="mt-1"
              />
              <Label className="cursor-pointer">
                Je m'engage à fournir les photos dans un délai de 5 jours ouvrés
              </Label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                checked={watch("validation.accords.validation_description")}
                onCheckedChange={(checked) =>
                  setValue("validation.accords.validation_description", !!checked)
                }
                className="mt-1"
              />
              <Label className="cursor-pointer">
                Je validerai la description Google Business avant publication
              </Label>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Date du rendez-vous de lancement</Label>
            <Input
              type="date"
              {...register("validation.date_rendez_vous")}
            />
          </div>

          <div className="space-y-2">
            <Label>Prochain point prévu</Label>
            <Input
              type="date"
              {...register("validation.prochain_point")}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

