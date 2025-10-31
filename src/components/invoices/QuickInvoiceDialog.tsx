import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Receipt, Wrench, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Category = "installation" | "service" | null;

export const QuickInvoiceDialog = ({ open, onOpenChange, onSuccess }: QuickInvoiceDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<Category>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setStep(2);
  };

  const handleContinue = () => {
    if (step === 2 && !selectedClientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      });
      return;
    }
    
    // Rediriger vers le formulaire complet avec les données pré-remplies
    onOpenChange(false);
    // Ici on pourrait ouvrir un nouveau dialog ou rediriger
    // Pour l'instant, on ferme et on notifie le parent
    toast({
      title: "Info",
      description: "Cette fonctionnalité sera disponible dans la version complète",
    });
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedClientId("");
    } else {
      onOpenChange(false);
      setStep(1);
      setCategory(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nouvelle Facture en 3 clics</DialogTitle>
          <DialogDescription>
            {step === 1 && "Étape 1/3 : Choisissez le type de facture"}
            {step === 2 && "Étape 2/3 : Sélectionnez le client"}
            {step === 3 && "Étape 3/3 : Confirmez et créez"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Choose Category */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCategorySelect("installation")}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Wrench className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Frais d'Installation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Factures pour les installations initiales, configurations et mises en place
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCategorySelect("service")}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Receipt className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Prestations de Service</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Factures pour services récurrents, interventions ponctuelles ou complémentaires
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Select Client */}
        {step === 2 && (
          <ClientSelectionStep 
            onSelect={(clientId) => setSelectedClientId(clientId)}
            selectedClientId={selectedClientId}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            {step === 1 ? "Annuler" : "Retour"}
          </Button>
          {step > 1 && (
            <Button onClick={handleContinue} disabled={step === 2 && !selectedClientId}>
              {step === 2 ? "Continuer" : "Créer la facture"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for client selection
function ClientSelectionStep({ onSelect, selectedClientId }: { onSelect: (id: string) => void; selectedClientId: string }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("clients")
      .select("id, name, company, status")
      .eq("user_id", user.id)
      .eq("status", "actif")
      .order("name");

    if (data) setClients(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
      {clients.map((client) => (
        <Card
          key={client.id}
          className={`cursor-pointer hover:shadow-lg transition-all ${
            selectedClientId === client.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onSelect(client.id)}
        >
          <CardContent className="p-4">
            <div className="font-medium text-sm">{client.name}</div>
            {client.company && (
              <div className="text-xs text-muted-foreground mt-1">{client.company}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

