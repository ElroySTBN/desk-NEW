import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, DollarSign, TrendingUp, Calendar, Bell, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { format, addDays, differenceInDays, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { generateAndSendInvoice, processInvoicesDueToday } from "@/lib/invoiceAutomation";
import { useToast } from "@/hooks/use-toast";

interface UpcomingEvent {
  id: string;
  clientId: string;
  clientName: string;
  type: "anniversary" | "deadline" | "report";
  date: Date;
  daysUntil: number;
  amount?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    activeClients: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [todayActions, setTodayActions] = useState<UpcomingEvent[]>([]);
  const [processingAutomation, setProcessingAutomation] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUpcomingEvents();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Active clients
    const { count: activeCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "actif");

    // Monthly revenue (invoices paid this month)
    const firstDayOfMonth = startOfMonth(new Date());
    const { data: monthlyInvoices } = await supabase
      .from("invoices")
      .select("amount_ttc")
      .eq("user_id", user.id)
      .eq("status", "payee")
      .gte("date", firstDayOfMonth.toISOString());

    const monthlyRevenue = monthlyInvoices?.reduce((sum, inv) => sum + Number(inv.amount_ttc), 0) || 0;

    // Total revenue
    const { data: allInvoices } = await supabase
      .from("invoices")
      .select("amount_ttc")
      .eq("user_id", user.id)
      .eq("status", "payee");

    const totalRevenue = allInvoices?.reduce((sum, inv) => sum + Number(inv.amount_ttc), 0) || 0;

    // Pending invoices
    const { count: pendingCount } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "en_attente");

    // Overdue invoices
    const { count: overdueCount } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "en_retard");

    setStats({
      activeClients: activeCount || 0,
      monthlyRevenue,
      totalRevenue,
      pendingInvoices: pendingCount || 0,
      overdueInvoices: overdueCount || 0,
    });
  };

  const fetchUpcomingEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch active clients with subscription start dates
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, company, start_date, monthly_amount")
      .eq("user_id", user.id)
      .eq("status", "actif")
      .not("start_date", "is", null);

    if (!clients) return;

    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    const events: UpcomingEvent[] = [];

    // Calculate next anniversary dates
    clients.forEach((client) => {
      if (!client.start_date) return;

      const startDate = parseISO(client.start_date);
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      // Calculate next anniversary (this month or next months)
      let nextAnniversary = new Date(currentYear, currentMonth, startDate.getDate());
      
      // If anniversary already passed this month, check next month
      if (nextAnniversary < today) {
        nextAnniversary = new Date(currentYear, currentMonth + 1, startDate.getDate());
      }

      // If it's within 30 days, add to events
      if (nextAnniversary <= thirtyDaysFromNow) {
        const daysUntil = differenceInDays(nextAnniversary, today);
        
        events.push({
          id: `anniversary-${client.id}`,
          clientId: client.id,
          clientName: client.company || client.name,
          type: "anniversary",
          date: nextAnniversary,
          daysUntil,
          amount: client.monthly_amount,
        });

        // Add report event (same day as anniversary)
        events.push({
          id: `report-${client.id}`,
          clientId: client.id,
          clientName: client.company || client.name,
          type: "report",
          date: nextAnniversary,
          daysUntil,
        });
      }
    });

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Separate today's actions
    const todayActions = events.filter(e => e.daysUntil === 0);
    
    setUpcomingEvents(events);
    setTodayActions(todayActions);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "anniversary":
        return Calendar;
      case "report":
        return Bell;
      case "deadline":
        return AlertCircle;
      default:
        return Calendar;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "anniversary":
        return "Anniversaire abonnement";
      case "report":
        return "Rapport mensuel à envoyer";
      case "deadline":
        return "Échéance";
      default:
        return type;
    }
  };

  const getEventBadgeColor = (daysUntil: number) => {
    if (daysUntil === 0) return "destructive";
    if (daysUntil <= 3) return "default";
    if (daysUntil <= 7) return "secondary";
    return "outline";
  };

  const handleProcessAllInvoices = async () => {
    setProcessingAutomation(true);
    
    try {
      const results = await processInvoicesDueToday();
      
      if (results.success > 0) {
        toast({
          title: "Factures automatiques générées !",
          description: `${results.success} facture(s) créée(s) et envoyée(s) avec succès.`,
        });
        
        // Refresh stats and events
        await fetchStats();
        await fetchUpcomingEvents();
      }
      
      if (results.errors.length > 0) {
        toast({
          title: "Erreurs lors de la génération",
          description: results.errors.join("\n"),
          variant: "destructive",
        });
      }
      
      if (results.total === 0) {
        toast({
          title: "Aucune facture à générer",
          description: "Aucun client n'a d'anniversaire aujourd'hui.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingAutomation(false);
    }
  };

  const handleProcessSingleInvoice = async (clientId: string, clientName: string) => {
    try {
      const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (!client) throw new Error("Client non trouvé");

      const result = await generateAndSendInvoice(client);
      
      if (result.success) {
        toast({
          title: "Facture générée !",
          description: result.message,
        });
        
        await fetchStats();
        await fetchUpcomingEvents();
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const statCards = [
    {
      title: "Clients Actifs",
      value: stats.activeClients,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Revenu Mensuel",
      value: `${stats.monthlyRevenue.toLocaleString("fr-FR")} €`,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Factures en attente",
      value: stats.pendingInvoices,
      icon: AlertCircle,
      color: "text-warning",
    },
    {
      title: "Factures en retard",
      value: stats.overdueInvoices,
      icon: AlertCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Centre de Pilotage</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de RaiseMed.IA • {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex gap-3">
          {todayActions.length > 0 && (
            <Button
              onClick={handleProcessAllInvoices}
              disabled={processingAutomation}
              variant="default"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {processingAutomation ? "Génération..." : `Générer ${todayActions.filter(e => e.type === "anniversary").length} facture(s)`}
            </Button>
          )}
          <Button onClick={() => navigate("/clients/new")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
          <Button onClick={() => navigate("/invoices")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Actions du jour */}
      {todayActions.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Actions à faire aujourd'hui ({todayActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayActions.map((event) => {
              const EventIcon = getEventIcon(event.type);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border"
                >
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/clients/${event.clientId}`)}
                  >
                    <EventIcon className="h-5 w-5 text-destructive" />
                    <div>
                      <div className="font-medium">{event.clientName}</div>
                      <div className="text-sm text-muted-foreground">{getEventLabel(event.type)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {event.amount && (
                      <span className="text-sm font-medium">{event.amount.toLocaleString("fr-FR")} €</span>
                    )}
                    <Badge variant="destructive">Aujourd'hui</Badge>
                    {event.type === "anniversary" && (
                      <Button
                        size="sm"
                        onClick={() => handleProcessSingleInvoice(event.clientId, event.clientName)}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Générer facture
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prochaines échéances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines échéances (30 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
              <p>Aucune échéance dans les 30 prochains jours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 10).map((event) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/clients/${event.clientId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <EventIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{event.clientName}</div>
                        <div className="text-xs text-muted-foreground">{getEventLabel(event.type)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {event.amount && (
                        <span className="text-sm font-medium">{event.amount.toLocaleString("fr-FR")} €</span>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {format(event.date, "d MMM", { locale: fr })}
                        </div>
                        <Badge variant={getEventBadgeColor(event.daysUntil)}>
                          {event.daysUntil === 0 ? "Aujourd'hui" : `Dans ${event.daysUntil}j`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingEvents.length > 10 && (
                <div className="text-center pt-3">
                  <Button variant="ghost" size="sm">
                    Voir toutes les échéances ({upcomingEvents.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accès rapide et notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accès Rapide</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="outline"
              className="h-16 text-lg justify-start gap-3"
              onClick={() => navigate("/clients")}
            >
              <Users className="h-5 w-5" />
              Voir tous les clients
            </Button>
            <Button
              variant="outline"
              className="h-16 text-lg justify-start gap-3"
              onClick={() => navigate("/invoices")}
            >
              <DollarSign className="h-5 w-5" />
              Gérer les factures
            </Button>
            <Button
              variant="outline"
              className="h-16 text-lg justify-start gap-3"
              onClick={() => navigate("/templates")}
            >
              <Bell className="h-5 w-5" />
              Templates
            </Button>
          </CardContent>
        </Card>

        <NotificationsPanel />
      </div>
    </div>
  );
};

export default Dashboard;
