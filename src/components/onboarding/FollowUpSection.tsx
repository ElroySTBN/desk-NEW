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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FollowUpSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;

  return (
    <AccordionItem value="section-9">
      <AccordionTrigger className="text-lg font-semibold">
        9. Communication & Suivi
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label>Fréquence des rapports *</Label>
          <Select
            value={watch("follow_up.frequence_rapports")}
            onValueChange={(value) => setValue("follow_up.frequence_rapports", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une fréquence..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hebdo">Hebdomadaire</SelectItem>
              <SelectItem value="bimensuel">Bimensuel</SelectItem>
              <SelectItem value="mensuel">Mensuel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Canal de communication préféré *</Label>
          <Select
            value={watch("follow_up.canal_communication")}
            onValueChange={(value) => setValue("follow_up.canal_communication", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un canal..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="telephone">Téléphone</SelectItem>
              <SelectItem value="visio">Visioconférence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Personne référente</h3>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              {...register("follow_up.personne_referente.nom")}
              placeholder="Nom de la personne référente"
            />
          </div>

          <div className="space-y-2">
            <Label>Disponibilités</Label>
            <Textarea
              {...register("follow_up.personne_referente.disponibilites")}
              placeholder="Précisez les horaires / jours de disponibilité..."
              rows={2}
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Compte Google existant</h3>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={watch("follow_up.compte_google_existant.existe")}
              onCheckedChange={(checked) =>
                setValue("follow_up.compte_google_existant.existe", !!checked)
              }
            />
            <Label>J'ai déjà un compte Google pour mon entreprise</Label>
          </div>

          {watch("follow_up.compte_google_existant.existe") && (
            <div className="space-y-2">
              <Label>Email du compte Google *</Label>
              <Input
                type="email"
                {...register("follow_up.compte_google_existant.email")}
                placeholder="votre-entreprise@gmail.com"
              />
            </div>
          )}
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

