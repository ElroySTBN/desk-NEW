import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/lib/onboarding-schema";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CommunicationSection({ form }: { form: UseFormReturn<OnboardingFormData> }) {
  const { register, watch, setValue } = form;

  return (
    <AccordionItem value="section-4">
      <AccordionTrigger className="text-lg font-semibold">
        4. Tonalité & Communication
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label>Perception souhaitée (séparées par des virgules)</Label>
          <Input
            {...register("communication.perception_souhaitee")}
            placeholder="Professionnel, Rapide, Fiable, Accessible..."
          />
          <p className="text-sm text-muted-foreground">
            Comment souhaitez-vous être perçu par vos clients ?
          </p>
        </div>

        <div className="space-y-2">
          <Label>Ton pour les réponses aux avis *</Label>
          <Select
            value={watch("communication.ton_reponses_avis")}
            onValueChange={(value) => setValue("communication.ton_reponses_avis", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un ton..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formel">Formel et professionnel</SelectItem>
              <SelectItem value="amical">Amical et chaleureux</SelectItem>
              <SelectItem value="technique">Technique et précis</SelectItem>
              <SelectItem value="mix">Mix (selon le contexte)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Valeurs de l'entreprise (séparées par des virgules)</Label>
          <Input
            {...register("communication.valeurs")}
            placeholder="Qualité, Proximité, Innovation, Transparence..."
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

