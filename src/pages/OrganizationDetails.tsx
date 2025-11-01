import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Calendar, DollarSign, FileText, Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Organization } from "@/types/crm";

type Invoice = {
  id: string;
  amount_ttc: number;
  status: string;
  created_at: string;
  due_date?: string;
};

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  function?: string;
};

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id!)
        .single();

      if (!orgError && orgData) {
        setOrg(orgData);
      }

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("id, amount_ttc, status, created_at, due_date")
        .eq("client_id", id!)
        .order("created_at", { ascending: false })
        .limit(5);

      setInvoices(invoicesData || []);

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, email, function")
        .eq("organization_id", id!)
        .limit(10);

      setContacts(contactsData || []);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntil = (date: string | null) => {
    if (!date) return null;
    const due = new Date(date);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateAnniversary = (startDate: string | null) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    if (months < 0) {
      return { years: years - 1, months: months + 12 };
    }
    return { years, months };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8">
        <p>Entreprise non trouvée</p>
      </div>
    );
  }

  const daysUntilNextInvoice = calculateDaysUntil(org.next_invoice_date);
  const anniversary = calculateAnniversary(org.start_date);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/organizations")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{org.commercial_name || org.legal_name}</h1>
          {org.commercial_name && org.legal_name && (
            <p className="text-muted-foreground mt-1">{org.legal_name}</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abonnement</p>
                <p className="text-2xl font-bold">{org.monthly_amount ? `${org.monthly_amount}€` : "-"}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prochaine Facture</p>
                <p className="text-2xl font-bold">
                  {daysUntilNextInvoice !== null
                    ? daysUntilNextInvoice > 0
                      ? `${daysUntilNextInvoice}j`
                      : "En retard"
                    : "-"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anniversaire</p>
                <p className="text-2xl font-bold">
                  {anniversary ? `${anniversary.years}a ${anniversary.months}m` : "-"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campagne d'Avis */}
      <Link to={`/organizations/${id}/review-campaign`}>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-primary/10">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Campagne de Récolte d'Avis</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez vos employés, configurez vos funnels, consultez vos rapports et vos avis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Résumé de l'Abonnement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge variant={org.status === "client" ? "default" : "secondary"}>
                      {org.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MRR</p>
                    <p className="text-lg font-semibold">
                      {org.monthly_amount ? `${org.monthly_amount}€/mois` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de début</p>
                    <p>{org.start_date ? format(new Date(org.start_date), "dd MMMM yyyy", { locale: fr }) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prochaine facture</p>
                    <p>
                      {org.next_invoice_date
                        ? format(new Date(org.next_invoice_date), "dd MMMM yyyy", { locale: fr })
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prochaines Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                {org.next_invoice_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Facture dans {daysUntilNextInvoice !== null && daysUntilNextInvoice > 0
                        ? `${daysUntilNextInvoice} jour${daysUntilNextInvoice > 1 ? "s" : ""}`
                        : "En retard"}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune deadline enregistrée</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground">Aucun contact</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.function && <p className="text-sm text-muted-foreground">{contact.function}</p>}
                        {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Dernières Factures</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground">Aucune facture</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {format(new Date(invoice.created_at), "dd MMMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.amount_ttc.toFixed(2)}€ TTC
                        </p>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "payee"
                            ? "default"
                            : invoice.status === "en_attente"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{org.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p>{org.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Site Web</p>
                  <p>{org.website || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SIRET</p>
                  <p>{org.siret || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">N° TVA</p>
                  <p>{org.tva_number || "-"}</p>
                </div>
              </div>
              {org.billing_address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adresse de facturation</p>
                  <p>
                    {org.billing_address}
                    {org.billing_postal_code && `, ${org.billing_postal_code}`}
                    {org.billing_city && ` ${org.billing_city}`}
                    {org.billing_country && `, ${org.billing_country}`}
                  </p>
                </div>
              )}
              {org.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap">{org.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationDetails;
