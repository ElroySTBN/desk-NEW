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
import { Checkbox } from "@/components/ui/checkbox";

export function HistorySection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;

  return (
    <AccordionItem value="section-5">
      <AccordionTrigger className="text-lg font-semibold">
        5. Historique & Expérience
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Année de création *</Label>
            <Input
              type="number"
              {...register("history.annee_creation", { valueAsNumber: true })}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre d'interventions réalisées</Label>
            <Input
              type="number"
              {...register("history.nb_interventions", { valueAsNumber: true })}
              min="0"
            />
          </div>
        </div>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Équipe</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nombre de techniciens</Label>
              <Input
                type="number"
                {...register("history.equipe.nb_techniciens", { valueAsNumber: true })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre de commerciaux</Label>
              <Input
                type="number"
                {...register("history.equipe.nb_commerciaux", { valueAsNumber: true })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Total employés</Label>
              <Input
                type="number"
                {...register("history.equipe.total_employes", { valueAsNumber: true })}
                min="0"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={watch("history.clients_satisfaits_base")}
              onCheckedChange={(checked) =>
                setValue("history.clients_satisfaits_base", !!checked)
              }
            />
            <Label>Disposez-vous d'une base de clients satisfaits ?</Label>
          </div>

          {watch("history.clients_satisfaits_base") && (
            <div className="space-y-2 ml-6">
              <Label>Nombre de clients sollicitables pour avis</Label>
              <Input
                type="number"
                {...register("history.nb_clients_sollicitables", { valueAsNumber: true })}
                min="0"
                placeholder="Environ combien ?"
              />
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

