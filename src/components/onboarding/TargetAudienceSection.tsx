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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TargetAudienceSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;

  return (
    <AccordionItem value="section-3">
      <AccordionTrigger className="text-lg font-semibold">
        3. Clientèle cible
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Types de clients</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={watch("target_audience.types_clients.particuliers.checked")}
                  onCheckedChange={(checked) =>
                    setValue("target_audience.types_clients.particuliers.checked", !!checked)
                  }
                />
                <Label>Particuliers</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  {...register("target_audience.types_clients.particuliers.pourcentage_ca", {
                    valueAsNumber: true,
                  })}
                  className="w-20"
                  min="0"
                  max="100"
                  disabled={!watch("target_audience.types_clients.particuliers.checked")}
                />
                <span className="text-sm text-muted-foreground">% CA</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={watch("target_audience.types_clients.professionnels.checked")}
                  onCheckedChange={(checked) =>
                    setValue("target_audience.types_clients.professionnels.checked", !!checked)
                  }
                />
                <Label>Professionnels</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  {...register("target_audience.types_clients.professionnels.pourcentage_ca", {
                    valueAsNumber: true,
                  })}
                  className="w-20"
                  min="0"
                  max="100"
                  disabled={!watch("target_audience.types_clients.professionnels.checked")}
                />
                <span className="text-sm text-muted-foreground">% CA</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={watch("target_audience.types_clients.coproprietes.checked")}
                  onCheckedChange={(checked) =>
                    setValue("target_audience.types_clients.coproprietes.checked", !!checked)
                  }
                />
                <Label>Copropriétés</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  {...register("target_audience.types_clients.coproprietes.pourcentage_ca", {
                    valueAsNumber: true,
                  })}
                  className="w-20"
                  min="0"
                  max="100"
                  disabled={!watch("target_audience.types_clients.coproprietes.checked")}
                />
                <span className="text-sm text-muted-foreground">% CA</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={watch("target_audience.types_clients.collectivites.checked")}
                  onCheckedChange={(checked) =>
                    setValue("target_audience.types_clients.collectivites.checked", !!checked)
                  }
                />
                <Label>Collectivités</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  {...register("target_audience.types_clients.collectivites.pourcentage_ca", {
                    valueAsNumber: true,
                  })}
                  className="w-20"
                  min="0"
                  max="100"
                  disabled={!watch("target_audience.types_clients.collectivites.checked")}
                />
                <span className="text-sm text-muted-foreground">% CA</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Persona client type</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Âge moyen</Label>
              <Input
                {...register("target_audience.persona.age_moyen")}
                placeholder="35-50 ans"
              />
            </div>

            <div className="space-y-2">
              <Label>Situation</Label>
              <Input
                {...register("target_audience.persona.situation")}
                placeholder="Propriétaire, actif"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget moyen</Label>
            <Input
              {...register("target_audience.persona.budget_moyen")}
              placeholder="5000-15000€"
            />
          </div>

          <div className="space-y-2">
            <Label>Motivations principales</Label>
            <Textarea
              {...register("target_audience.persona.motivations")}
              placeholder="Confort, économies d'énergie..."
              rows={3}
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Saisonnalité</h3>
          <div className="space-y-2">
            <Label>Haute saison</Label>
            <Select
              value={watch("target_audience.saisonnalite.haute_saison")}
              onValueChange={(value) =>
                setValue("target_audience.saisonnalite.haute_saison", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ete">Été</SelectItem>
                <SelectItem value="hiver">Hiver</SelectItem>
                <SelectItem value="toute_annee">Toute l'année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Période de forte demande</Label>
            <Input
              {...register("target_audience.saisonnalite.periode_forte_demande")}
              placeholder="Mai-Septembre"
            />
          </div>

          <div className="space-y-2">
            <Label>Services saisonniers</Label>
            <Textarea
              {...register("target_audience.saisonnalite.services_saisonniers")}
              placeholder="Climatisation en été, chauffage en hiver..."
              rows={2}
            />
          </div>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

