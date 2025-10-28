import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Onboarding } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, ArrowLeft, FileText } from "lucide-react";
import { generateOnboardingPDF } from "@/lib/pdfExport";

export default function OnboardingExport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);

  useEffect(() => {
    if (id) {
      fetchOnboarding();
    }
  }, [id]);

  const fetchOnboarding = async () => {
    try {
      const { data, error } = await supabase
        .from("onboarding")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setOnboarding(data);
    } catch (error) {
      console.error("Error fetching onboarding:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!onboarding) return;

    setExporting(true);

    try {
      await generateOnboardingPDF(onboarding);

      // Update status to exported
      const { error } = await supabase
        .from("onboarding")
        .update({
          status: "exported",
          exported_at: new Date().toISOString(),
        })
        .eq("id", id!);

      if (error) throw error;

      toast.success("PDF généré avec succès!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-lg mb-4">Onboarding introuvable</p>
          <Button onClick={() => navigate("/onboarding")}>
            Retour à la liste
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/onboarding")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Export PDF - {onboarding.client_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Informations légales</p>
                <p className="text-sm text-muted-foreground">
                  Raison sociale, SIRET, adresse, contacts
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 1</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Identité de marque</p>
                <p className="text-sm text-muted-foreground">
                  Services, points forts, certifications, garanties
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 2</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Clientèle cible</p>
                <p className="text-sm text-muted-foreground">
                  Types de clients, persona, saisonnalité
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 3</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Communication</p>
                <p className="text-sm text-muted-foreground">
                  Perception, ton, valeurs
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 4</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Historique & Expérience</p>
                <p className="text-sm text-muted-foreground">
                  Création, interventions, équipe
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 5</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Google Business Profile</p>
                <p className="text-sm text-muted-foreground">
                  Établissement, horaires, contacts, description
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 6</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Visuels & Photos</p>
                <p className="text-sm text-muted-foreground">
                  Photos disponibles, méthode d'envoi
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 7</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Cartes NFC & Équipe</p>
                <p className="text-sm text-muted-foreground">
                  Techniciens, formation
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 8</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Communication & Suivi</p>
                <p className="text-sm text-muted-foreground">
                  Rapports, canal, référent
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 9</div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Validation finale</p>
                <p className="text-sm text-muted-foreground">
                  Questions, accords, dates
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Section 10</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <Button
              onClick={handleExport}
              disabled={exporting}
              size="lg"
              className="w-full"
            >
              <Download className="mr-2 h-5 w-5" />
              {exporting ? "Génération du PDF..." : "Télécharger le PDF"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Le PDF contiendra toutes les informations complétées lors de l'onboarding,
            avec le logo RaiseMed.IA et une mise en page professionnelle.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

