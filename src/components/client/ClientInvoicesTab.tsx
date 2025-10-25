import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientInvoicesTabProps {
  clientId: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  amount_ht: number;
  amount_ttc: number;
  status: string;
}

export const ClientInvoicesTab = ({ clientId }: ClientInvoicesTabProps) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });

    if (data) setInvoices(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      payee: "bg-success text-success-foreground",
      en_attente: "bg-warning text-warning-foreground",
      en_retard: "bg-destructive text-destructive-foreground",
    };
    const labels: Record<string, string> = {
      payee: "Payée",
      en_attente: "En attente",
      en_retard: "En retard",
    };
    return (
      <Badge className={variants[status] || ""}>{labels[status] || status}</Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Factures du client</CardTitle>
        <Button className="gap-2" onClick={() => navigate(`/invoices/new?client=${clientId}`)}>
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune facture pour ce client
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant HT</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>{invoice.amount_ht.toLocaleString("fr-FR")} €</TableCell>
                  <TableCell className="font-semibold">
                    {invoice.amount_ttc.toLocaleString("fr-FR")} €
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
