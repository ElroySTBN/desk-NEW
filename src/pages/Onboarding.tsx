import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, ExternalLink, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Onboarding } from "@/types/onboarding";

export default function OnboardingPage() {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const fetchOnboardings = async () => {
    try {
      const { data, error } = await supabase
        .from("onboarding")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOnboardings(data || []);
    } catch (error) {
      console.error("Error fetching onboardings:", error);
      toast.error("Erreur lors du chargement des onboardings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOnboarding = () => {
    navigate("/onboarding/create");
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/onboarding/form/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié dans le presse-papiers");
  };

  const openLink = (id: string) => {
    const link = `${window.location.origin}/onboarding/form/${id}`;
    window.open(link, "_blank");
  };

  const getStatusBadge = (status: Onboarding["status"]) => {
    const variants: Record<Onboarding["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Brouillon", variant: "secondary" },
      sent: { label: "Envoyé", variant: "default" },
      completed: { label: "Complété", variant: "outline" },
      exported: { label: "Exporté", variant: "outline" },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCompletionPercentage = (onboarding: Onboarding): number => {
    const sections = [
      onboarding.legal_info,
      onboarding.brand_identity,
      onboarding.target_audience,
      onboarding.communication,
      onboarding.history,
      onboarding.google_business,
      onboarding.visuals,
      onboarding.nfc_team,
      onboarding.follow_up,
      onboarding.validation,
    ];
    
    const filledSections = sections.filter(section => 
      section && Object.keys(section).length > 0
    ).length;
    
    return Math.round((filledSections / sections.length) * 100);
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Onboarding Clients</h1>
          <p className="text-muted-foreground">
            Gérez le processus d'onboarding de vos clients
          </p>
        </div>
        <Button onClick={handleCreateOnboarding} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Onboarding
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {onboardings.map((onboarding) => (
          <Card key={onboarding.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{onboarding.client_name}</CardTitle>
                  <CardDescription>
                    Créé le {new Date(onboarding.created_at).toLocaleDateString("fr-FR")}
                  </CardDescription>
                </div>
                {getStatusBadge(onboarding.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{getCompletionPercentage(onboarding)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${getCompletionPercentage(onboarding)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyLink(onboarding.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copier lien
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openLink(onboarding.id)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/onboarding/form/${onboarding.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                {onboarding.status === "completed" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/onboarding/export/${onboarding.id}`)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {onboardings.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Aucun onboarding</p>
              <p className="text-muted-foreground mb-4">
                Créez votre premier onboarding client
              </p>
              <Button onClick={handleCreateOnboarding}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un onboarding
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

