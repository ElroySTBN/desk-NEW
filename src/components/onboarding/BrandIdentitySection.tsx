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

export function BrandIdentitySection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register } = form;

  return (
    <AccordionItem value="section-2">
      <AccordionTrigger className="text-lg font-semibold">
        2. Identité de marque
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label>Description du métier *</Label>
          <Textarea
            {...register("brand_identity.metier_description")}
            placeholder="Décrivez votre activité principale..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Services proposés (séparés par des virgules) *</Label>
          <Input
            {...register("brand_identity.services")}
            placeholder="Installation climatisation, Maintenance, Dépannage..."
          />
          <p className="text-sm text-muted-foreground">
            Ex: Installation climatisation, Maintenance, Dépannage d'urgence
          </p>
        </div>

        <div className="space-y-2">
          <Label>Points forts (séparés par des virgules)</Label>
          <Input
            {...register("brand_identity.points_forts")}
            placeholder="Intervention rapide, Garantie étendue, Équipe certifiée..."
          />
        </div>

        <div className="space-y-2">
          <Label>Certifications (séparées par des virgules)</Label>
          <Input
            {...register("brand_identity.certifications")}
            placeholder="QualiPAC, RGE, Qualibat..."
          />
        </div>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Garanties</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Garantie pièces (années)</Label>
              <Input
                type="number"
                {...register("brand_identity.garanties.pieces_ans", {
                  valueAsNumber: true,
                })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Garantie main d'œuvre (années)</Label>
              <Input
                type="number"
                {...register("brand_identity.garanties.main_oeuvre_ans", {
                  valueAsNumber: true,
                })}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description du SAV</Label>
            <Textarea
              {...register("brand_identity.garanties.sav_description")}
              placeholder="Décrivez votre service après-vente..."
              rows={3}
            />
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

