import { useState, useEffect, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";
import InvomaInvoiceViewer, { InvoiceData } from "./InvomaInvoiceViewer";
import { generateAndSaveInvoicePDF } from "@/lib/invomaInvoiceGenerator";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;

interface CompanySettings {
  company_name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
}

interface GenerateRecurringInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}

export const GenerateRecurringInvoiceDialog = ({
  open,
  onOpenChange,
  client,
  onSuccess,
}: GenerateRecurringInvoiceDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const invoiceContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    description: "",
    date: new Date().toISOString().split("T")[0],
    tva_rate: "20",
  });

  useEffect(() => {
    if (open && client) {
      // Set default date from anniversary if available
      if (client.date_anniversaire_abonnement) {
        const anniversaryDate = new Date(client.date_anniversaire_abonnement);
        const currentDate = new Date();
        // Use anniversary day of current month/year
        const invoiceDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          anniversaryDate.getDate()
        );
        setFormData((prev) => ({
          ...prev,
          date: invoiceDate.toISOString().split("T")[0],
        }));
      }
      fetchCompanySettings();
    }
  }, [open, client]);

  useEffect(() => {
    if (client && companySettings) {
      prepareInvoiceData();
    }
  }, [formData, client, companySettings]);

  const fetchCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setCompanySettings(data);
      } else {
        // Default company settings
        setCompanySettings({
          company_name: "RaiseMed.IA",
          address: "4 Rue Bellanger",
          postal_code: "92200",
          city: "Neuilly-Sur-Seine",
          email: "contact@raisemed.ia",
          phone: "07 82 49 21 24",
        });
      }
    } catch (error: any) {
      console.error("Error fetching company settings:", error);
    }
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

  const prepareInvoiceData = () => {
    if (!client || !companySettings) return;

    const invoiceNumber = "TEMP"; // Will be generated on save
    const date = formData.date || new Date().toISOString().split("T")[0];
    const montantHT = Number(client.montant_mensuel) || 0;
    const tvaRate = parseFloat(formData.tva_rate);
    const description =
      formData.description ||
      `Services de gestion Google Business Profile pour le mois de ${new Date(date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;

    const companyAddress = [
      companySettings.address,
      companySettings.postal_code && companySettings.city
        ? `${companySettings.postal_code} ${companySettings.city}`
        : companySettings.city || companySettings.postal_code,
    ]
      .filter(Boolean)
      .join("<br />");

    const clientAddress = [
      client.billing_address,
      client.postal_code && client.city ? `${client.postal_code} ${client.city}` : client.city || client.postal_code,
    ]
      .filter(Boolean)
      .join("<br />");

    const data: InvoiceData = {
      invoiceNumber,
      date,
      clientName: client.name,
      clientCompany: client.company || undefined,
      clientAddress: clientAddress || undefined,
      clientEmail: client.email || undefined,
      clientPhone: client.phone || undefined,
      companyName: companySettings.company_name,
      companyAddress,
      companyEmail: companySettings.email || undefined,
      companyPhone: companySettings.phone || undefined,
      items: [
        {
          item: "Services de gestion Google Business Profile",
          desc: description,
          price: montantHT,
          qty: 1,
        },
      ],
      tvaRate,
      terms: [
        "Règlement sous 15 jours par virement bancaire",
        "Pénalités de retard: Taux BCE + 10 points",
      ],
    };

    setInvoiceData(data);
  };

  useEffect(() => {
    if (client && companySettings) {
      prepareInvoiceData();
    }
  }, [formData, client, companySettings]);

  const handleGenerate = async () => {
    if (!client || !invoiceData || !invoiceRef.current) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      // Update invoice data with real invoice number
      const finalInvoiceData = { ...invoiceData, invoiceNumber };
      setInvoiceData(finalInvoiceData);

      // Wait for React to update the DOM with the new invoice number
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find the invoice element
      const invoiceElement = invoiceContainerRef.current?.querySelector("#tm_download_section") as HTMLElement;
      if (!invoiceElement) {
        throw new Error("Invoice element not found. Please try again.");
      }

      // Generate and save PDF
      const pdfUrl = await generateAndSaveInvoicePDF(invoiceElement, invoiceNumber, user.id);

      // Calculate amounts
      const amountHT = invoiceData.items.reduce((total, item) => total + item.price * item.qty, 0);
      const tvaRate = parseFloat(formData.tva_rate);
      const amountTTC = amountHT * (1 + tvaRate / 100);

      // Create invoice in database
      const { error: invoiceError } = await supabase.from("invoices").insert({
        user_id: user.id,
        client_id: client.id,
        invoice_number: invoiceNumber,
        date: formData.date,
        amount_ht: amountHT,
        tva_rate: tvaRate,
        amount_ttc: amountTTC,
        description: formData.description || invoiceData.items[0].desc,
        status: "en_attente",
      });

      if (invoiceError) throw invoiceError;

      // Update invoice with PDF URL (if column exists)
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ pdf_url: pdfUrl })
        .eq("invoice_number", invoiceNumber);

      if (updateError && updateError.code !== "42703") {
        // Ignore error if column doesn't exist
        console.warn("Could not update PDF URL:", updateError);
      }

      // Archive in documents table
      const { error: docError } = await supabase.from("documents").insert({
        user_id: user.id,
        client_id: client.id,
        type: "facture",
        titre: `Facture ${invoiceNumber}`,
        fichier_url: pdfUrl,
      });

      if (docError && docError.code !== "42P01") {
        // Ignore if documents table doesn't exist
        console.warn("Could not archive document:", docError);
      }

      toast({
        title: "Succès",
        description: `Facture ${invoiceNumber} générée et archivée avec succès`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer la facture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Générer une facture récurrente</DialogTitle>
          <DialogDescription>
            Générer une facture mensuelle pour {client.name || client.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date d'émission *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tva_rate">Taux TVA (%) *</Label>
              <Input
                id="tva_rate"
                type="number"
                step="0.1"
                value={formData.tva_rate}
                onChange={(e) => setFormData({ ...formData, tva_rate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Services de gestion Google Business Profile pour le mois de..."
            />
          </div>

          {invoiceData && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">Aperçu de la facture</h3>
              <div ref={invoiceContainerRef}>
                <InvomaInvoiceViewer
                  data={invoiceData}
                  logoUrl={companySettings?.logo_url}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerate} disabled={loading || !invoiceData}>
              {loading ? "Génération..." : "Générer et sauvegarder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

