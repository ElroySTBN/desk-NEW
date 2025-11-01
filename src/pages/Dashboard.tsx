import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, TrendingUp, AlertCircle, CheckCircle2, Mail, FileText, Calendar, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { AutoAlerts } from "@/components/dashboard/AutoAlerts";

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  urgency: boolean;
  due_date?: string;
  status: string;
  client_id?: string;
  client?: {
    name: string;
    company?: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    activeClients: 0,
    mrr: 0,
    totalInvoicedThisMonth: 0,
    totalFacture: 0,
  });
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [carouselPhotos, setCarouselPhotos] = useState<any[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Rotate carousel every 5 seconds
  useEffect(() => {
    if (carouselPhotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % carouselPhotos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselPhotos.length]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchUrgentTasks(), fetchCarouselPhotos()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Active clients + MRR
    const { data: activeClients, count: activeCount } = await supabase
      .from("clients")
      .select("monthly_amount, id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "actif");

    const mrr = activeClients?.reduce((sum, c) => sum + (Number(c.monthly_amount) || 0), 0) || 0;

    // Total facturé ce mois
    const { data: monthlyInvoices } = await supabase
      .from("invoices")
      .select("amount_ttc")
      .eq("user_id", user.id)
      .eq("status", "payee")
      .gte("created_at", firstDayOfMonth.toISOString());

    const totalInvoicedThisMonth = monthlyInvoices?.reduce((sum, inv) => sum + Number(inv.amount_ttc), 0) || 0;

    // Total facturé
    const { data: allInvoices } = await supabase
      .from("invoices")
      .select("amount_ttc")
      .eq("user_id", user.id)
      .eq("status", "payee");

    const totalFacture = allInvoices?.reduce((sum, inv) => sum + Number(inv.amount_ttc), 0) || 0;

    setStats({
      activeClients: activeCount || 0,
      mrr: mrr,
      totalInvoicedThisMonth,
      totalFacture,
    });
  };

  const fetchUrgentTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Tâches urgentes ou avec deadline dans 48h
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setHours(twoDaysFromNow.getHours() + 48);

    const { data: tasks } = await supabase
      .from("tasks")
      .select(`
        *,
        clients!left(id, name, company)
      `)
      .eq("user_id", user.id)
      .in("status", ["todo", "in_progress"])
      .or(`urgency.eq.true,priority.eq.urgent,due_date.lte.${twoDaysFromNow.toISOString()}`)
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true })
      .limit(10);

    setUrgentTasks(tasks || []);
  };

  const fetchCarouselPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: photos } = await supabase
      .from("client_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false })
      .limit(10);

    setCarouselPhotos(photos || []);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      default:
        return "Basse";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "onboarding":
        return Users;
      case "content":
        return FileText;
      case "invoice":
        return FileText;
      case "call":
        return Mail;
      default:
        return Calendar;
    }
  };

  const formatTimeUntil = (dueDate: string | null) => {
    if (!dueDate) return "Aucune deadline";
    const date = new Date(dueDate);
    const hours = differenceInHours(date, new Date());
    
    if (hours < 0) return "En retard";
    if (hours < 24) return `Dans ${hours}h`;
    const days = differenceInDays(date, new Date());
    return `Dans ${days}j`;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">🚀 Centre de Pilotage RAISEDESK</h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/clients/new")} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>

      {/* Carousel motivant */}
      {carouselPhotos.length > 0 && (
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/5">
            {carouselPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === currentPhotoIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt={photo.photo_name || "Photo motivante"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {carouselPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {carouselPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentPhotoIndex ? "w-8 bg-primary" : "w-2 bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Vue Business */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vue Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{stats.activeClients}</div>
              <div className="text-sm text-muted-foreground mt-1">Clients Actifs</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-success">{stats.mrr.toLocaleString("fr-FR")} €</div>
              <div className="text-sm text-muted-foreground mt-1">MRR Mensuel</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold">{stats.totalInvoicedThisMonth.toLocaleString("fr-FR")} €</div>
              <div className="text-sm text-muted-foreground mt-1">Facturé ce mois</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold">{stats.totalFacture.toLocaleString("fr-FR")} €</div>
              <div className="text-sm text-muted-foreground mt-1">Total Facturé</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes Automatiques */}
      <AutoAlerts />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Focus du jour - Tâches urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Focus du Jour
            </CardTitle>
            <CardDescription>Tâches urgentes à traiter dans les 48h</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                <p className="text-muted-foreground">Aucune tâche urgente ! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map((task) => {
                  const CategoryIcon = getCategoryIcon(task.category);
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => task.client_id && navigate(`/clients/${task.client_id}`)}
                    >
                      <CategoryIcon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</div>
                        )}
                        {task.client && (
                          <div className="text-xs text-primary mt-1">
                            {task.client.company || task.client.name}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeUntil(task.due_date || null)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accès Rapide */}
        <Card>
          <CardHeader>
            <CardTitle>Accès Rapide</CardTitle>
            <CardDescription>Actions fréquentes en un clic</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="h-14 text-base justify-start gap-3"
              onClick={() => navigate("/clients/new")}
            >
              <Plus className="h-5 w-5" />
              Créer un Client
            </Button>
            <Button
              variant="outline"
              className="h-14 text-base justify-start gap-3"
              onClick={() => navigate("/invoices")}
            >
              <FileText className="h-5 w-5" />
              Nouvelle Facture
            </Button>
            <Button
              variant="outline"
              className="h-14 text-base justify-start gap-3"
              onClick={() => navigate("/library")}
            >
              <FileText className="h-5 w-5" />
              Créer du Contenu
            </Button>
            <Button
              variant="outline"
              className="h-14 text-base justify-start gap-3"
              onClick={() => navigate("/clients")}
            >
              <Users className="h-5 w-5" />
              Voir mes Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
