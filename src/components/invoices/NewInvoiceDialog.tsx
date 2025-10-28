import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedClientId?: string;
}

export const NewInvoiceDialog = ({
  open,
  onOpenChange,
  onSuccess,
  preselectedClientId,
}: NewInvoiceDialogProps) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: preselectedClientId || "",
    date: new Date().toISOString().split("T")[0],
    amount_ht: "",
    tva_rate: "20",
    description: "",
  });

  useEffect(() => {
    if (open) {
      fetchClients();
      if (preselectedClientId) {
        setFormData((prev) => ({ ...prev, client_id: preselectedClientId }));
      }
    }
  }, [open, preselectedClientId]);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("clients")
      .select("id, name, company")
      .eq("user_id", user.id)
      .order("name");

    if (data) setClients(data);
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const year = new Date().getFullYear();
    
    // Get the latest invoice number for this year
    const { data } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("user_id", user.id)
      .like("invoice_number", `RMD-${year}-%`)
      .order("created_at", { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].invoice_number.split("-")[2]);
      nextNumber = lastNumber + 1;
    }

    return `RMD-${year}-${nextNumber.toString().padStart(3, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const amountHT = parseFloat(formData.amount_ht);
      const tvaRate = parseFloat(formData.tva_rate);
      const amountTTC = amountHT * (1 + tvaRate / 100);
      const invoiceNumber = await generateInvoiceNumber();

      const { error } = await supabase.from("invoices").insert({
        user_id: user.id,
        client_id: formData.client_id,
        invoice_number: invoiceNumber,
        date: formData.date,
        amount_ht: amountHT,
        tva_rate: tvaRate,
        amount_ttc: amountTTC,
        description: formData.description,
        status: "en_attente",
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Facture ${invoiceNumber} créée avec succès`,
      });

      // Reset form
      setFormData({
        client_id: "",
        date: new Date().toISOString().split("T")[0],
        amount_ht: "",
        tva_rate: "20",
        description: "",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la facture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTTC = () => {
    if (!formData.amount_ht || !formData.tva_rate) return 0;
    const ht = parseFloat(formData.amount_ht);
    const tva = parseFloat(formData.tva_rate);
    return ht * (1 + tva / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle Facture</DialogTitle>
          <DialogDescription>
            Créez une nouvelle facture pour un client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, client_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_ht">Montant HT (€) *</Label>
              <Input
                id="amount_ht"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount_ht}
                onChange={(e) =>
                  setFormData({ ...formData, amount_ht: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tva_rate">Taux TVA (%) *</Label>
              <Select
                value={formData.tva_rate}
                onValueChange={(value) =>
                  setFormData({ ...formData, tva_rate: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Franchise)</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Services de gestion Google Business Profile pour le mois de..."
              required
            />
          </div>

          {formData.amount_ht && (
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span>Montant HT:</span>
                <span className="font-medium">
                  {parseFloat(formData.amount_ht).toLocaleString("fr-FR")} €
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>TVA ({formData.tva_rate}%):</span>
                <span className="font-medium">
                  {(
                    parseFloat(formData.amount_ht) *
                    (parseFloat(formData.tva_rate) / 100)
                  ).toLocaleString("fr-FR")}{" "}
                  €
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC:</span>
                <span className="text-primary">
                  {calculateTTC().toLocaleString("fr-FR")} €
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

