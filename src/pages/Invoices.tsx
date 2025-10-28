import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download, Mail, Check, FileText } from "lucide-react";
import { NewInvoiceDialog } from "@/components/invoices/NewInvoiceDialog";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  amount_ht: number;
  amount_ttc: number;
  status: string;
  description: string;
  tva_rate: number;
  client_id: string;
  clients: {
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
  };
}

const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          name,
          company,
          email,
          phone
        )
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error && data) {
      setInvoices(data as Invoice[]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(filters.search.toLowerCase()) ||
          inv.clients.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          inv.clients.company?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((inv) => inv.status === filters.status);
    }

    // Filter by month/year
    filtered = filtered.filter((inv) => {
      const invDate = new Date(inv.date);
      return (
        invDate.getMonth() + 1 === filters.month &&
        invDate.getFullYear() === filters.year
      );
    });

    setFilteredInvoices(filtered);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    downloadInvoicePDF({
      invoice_number: invoice.invoice_number,
      date: invoice.date,
      client_name: invoice.clients.name,
      client_company: invoice.clients.company || undefined,
      client_email: invoice.clients.email || undefined,
      client_phone: invoice.clients.phone || undefined,
      description: invoice.description,
      amount_ht: invoice.amount_ht,
      tva_rate: invoice.tva_rate,
      amount_ttc: invoice.amount_ttc,
    });
    toast({
      title: "PDF téléchargé",
      description: `Facture ${invoice.invoice_number} téléchargée`,
    });
  };

  const handleCopyEmailTemplate = (invoice: Invoice) => {
    const template = `Bonjour ${invoice.clients.name},

J'espère que tout se passe bien de votre côté.

Vous trouverez ci-joint la facture ${invoice.invoice_number} pour nos services du mois de ${new Date(invoice.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} d'un montant de ${invoice.amount_ttc.toLocaleString("fr-FR")}€ TTC.

Le règlement est attendu sous 15 jours par virement bancaire.

Restant à votre disposition pour toute question.

Cordialement,
Elroy SITBON
RaiseMed.IA`;

    navigator.clipboard.writeText(template);
    toast({
      title: "Email copié",
      description: "Le template email a été copié dans le presse-papier",
    });
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "payee" })
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Facture marquée comme payée",
      });
      fetchInvoices();
    }
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

  const calculateStats = () => {
    const allInvoices = invoices;
    const paid = allInvoices.filter((inv) => inv.status === "payee");
    const pending = allInvoices.filter((inv) => inv.status === "en_attente");
    const overdue = allInvoices.filter((inv) => inv.status === "en_retard");

    return {
      totalPaid: paid.reduce((sum, inv) => sum + inv.amount_ttc, 0),
      totalPending: pending.reduce((sum, inv) => sum + inv.amount_ttc, 0),
      totalOverdue: overdue.reduce((sum, inv) => sum + inv.amount_ttc, 0),
      countPaid: paid.length,
      countPending: pending.length,
      countOverdue: overdue.length,
    };
  };

  const stats = calculateStats();

  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground mt-2">
            Gérez toutes vos factures et paiements
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures Payées
            </CardTitle>
            <Check className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalPaid.toLocaleString("fr-FR")} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.countPaid} facture{stats.countPaid > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
            <FileText className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.totalPending.toLocaleString("fr-FR")} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.countPending} facture{stats.countPending > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Retard
            </CardTitle>
            <FileText className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.totalOverdue.toLocaleString("fr-FR")} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.countOverdue} facture{stats.countOverdue > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select
                value={filters.month.toString()}
                onValueChange={(value) =>
                  setFilters({ ...filters, month: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select
                value={filters.year.toString()}
                onValueChange={(value) =>
                  setFilters({ ...filters, year: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune facture trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.clients.name}</p>
                        {invoice.clients.company && (
                          <p className="text-sm text-muted-foreground">
                            {invoice.clients.company}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {invoice.amount_ttc.toLocaleString("fr-FR")} €
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyEmailTemplate(invoice)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        {invoice.status !== "payee" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewInvoiceDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={fetchInvoices}
      />
    </div>
  );
};

export default Invoices;
