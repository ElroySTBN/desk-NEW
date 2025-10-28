import { UseFormReturn, useFieldArray } from "react-hook-form";
import { OnboardingFormData } from "@/lib/onboarding-schema";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export function NFCTeamSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue, control } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nfc_team.techniciens",
  });

  return (
    <AccordionItem value="section-8">
      <AccordionTrigger className="text-lg font-semibold">
        8. Cartes NFC & Équipe
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label>Nombre de techniciens *</Label>
          <Input
            type="number"
            {...register("nfc_team.nb_techniciens", { valueAsNumber: true })}
            min="0"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Techniciens à équiper</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ nom: "", prenom: "", cartes_attribuees: 1 })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un technicien
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      {...register(`nfc_team.techniciens.${index}.nom`)}
                      placeholder="Dupont"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      {...register(`nfc_team.techniciens.${index}.prenom`)}
                      placeholder="Jean"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cartes attribuées</Label>
                    <Input
                      type="number"
                      {...register(`nfc_team.techniciens.${index}.cartes_attribuees`, {
                        valueAsNumber: true,
                      })}
                      min="1"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mt-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Date de formation prévue</Label>
          <Input
            type="date"
            {...register("nfc_team.formation_date")}
          />
        </div>

        <div className="space-y-2">
          <Label>Format de formation *</Label>
          <Select
            value={watch("nfc_team.formation_format")}
            onValueChange={(value) => setValue("nfc_team.formation_format", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un format..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personne">En personne</SelectItem>
              <SelectItem value="video">Vidéo tutoriel</SelectItem>
              <SelectItem value="les_deux">Les deux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

