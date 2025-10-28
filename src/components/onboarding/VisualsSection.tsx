import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { OnboardingFormData } from "@/lib/onboarding-schema";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, FileImage } from "lucide-react";

interface VisualsSectionProps {
  form: UseFormReturn<OnboardingFormData>;
  onboardingId: string;
}

export function VisualsSection({ form, onboardingId }: VisualsSectionProps) {
  const { register, watch, setValue } = form;
  const [uploading, setUploading] = useState(false);

  const uploadedFiles = watch("visuals.uploaded_files") || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${onboardingId}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("onboarding-files")
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("onboarding-files")
          .getPublicUrl(fileName);

        return {
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size,
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setValue("visuals.uploaded_files", [...uploadedFiles, ...newFiles]);
      toast.success(`${newFiles.length} fichier(s) téléversé(s)`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Erreur lors du téléversement des fichiers");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setValue("visuals.uploaded_files", newFiles);
  };

  return (
    <AccordionItem value="section-7">
      <AccordionTrigger className="text-lg font-semibold">
        7. Visuels & Photos
      </AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label>Types de photos disponibles (séparés par virgules)</Label>
          <Input
            {...register("visuals.photos_disponibles")}
            placeholder="Photos chantier, Équipe, Locaux, Réalisations..."
          />
        </div>

        <div className="space-y-2">
          <Label>Méthode d'envoi préférée *</Label>
          <Select
            value={watch("visuals.methode_envoi")}
            onValueChange={(value) => setValue("visuals.methode_envoi", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une méthode..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="wetransfer">WeTransfer</SelectItem>
              <SelectItem value="upload">Upload direct</SelectItem>
              <SelectItem value="usb">Clé USB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {watch("visuals.methode_envoi") === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {uploading ? "Téléversement..." : "Cliquez pour téléverser des fichiers"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Images uniquement (JPG, PNG, etc.)
                  </p>
                </div>
              </Label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Fichiers téléversés ({uploadedFiles.length})</Label>
                <div className="grid gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileImage className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Date limite pour l'envoi des photos</Label>
          <Input
            type="date"
            {...register("visuals.deadline")}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

