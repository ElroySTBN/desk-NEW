import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

interface Alert {
  id: string;
  type: "content_missing" | "deadline_approaching" | "onboarding_incomplete" | "brand_dna_missing";
  severity: "warning" | "critical";
  message: string;
  clientId?: string;
  clientName?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export const AutoAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const allAlerts: Alert[] = [];

      // 1. Check for incomplete onboarding
      const { data: incompleteOnboarding } = await supabase
        .from("onboarding")
        .select(`
          id,
          client_name,
          status,
          clients!left(id, name, company)
        `)
        .eq("user_id", user.id)
        .in("status", ["draft", "sent"]);

      incompleteOnboarding?.forEach((item) => {
        allAlerts.push({
          id: `onboarding-${item.id}`,
          type: "onboarding_incomplete",
          severity: "warning",
          message: `L'onboarding de ${item.client_name || item.clients?.name} est incomplet`,
          clientId: item.clients?.id,
          clientName: item.client_name || item.clients?.name || item.clients?.company,
          actionLabel: "Terminer l'onboarding",
          actionUrl: `/onboarding/form/${item.id}`,
        });
      });

      // 2. Check for missing content in the next 7 days
      const sevenDaysFromNow = addDays(new Date(), 7);
      const { data: upcomingContent } = await supabase
        .from("content_library")
        .select(`
          scheduled_date,
          clients!left(id, name, company)
        `)
        .eq("user_id", user.id)
        .gte("scheduled_date", new Date().toISOString())
        .lte("scheduled_date", sevenDaysFromNow.toISOString());

      // Group by client and check if any client has no content scheduled
      const { data: allActiveClients } = await supabase
        .from("clients")
        .select("id, name, company")
        .eq("user_id", user.id)
        .eq("status", "actif");

      const clientsWithContent = new Set(upcomingContent?.map((c) => c.clients?.id).filter(Boolean) || []);

      allActiveClients?.forEach((client) => {
        if (!clientsWithContent.has(client.id)) {
          allAlerts.push({
            id: `content-${client.id}`,
            type: "content_missing",
            severity: "warning",
            message: `Pas de contenu prévu pour ${client.name} dans les 7 prochains jours`,
            clientId: client.id,
            clientName: client.name || client.company,
            actionLabel: "Créer du contenu",
            actionUrl: `/library`,
          });
        }
      });

      // 3. Check for approaching deadlines in tasks
      const { data: approachingTasks } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          due_date,
          clients!left(id, name, company)
        `)
        .eq("user_id", user.id)
        .in("status", ["todo", "in_progress"])
        .not("due_date", "is", null);

      approachingTasks?.forEach((task) => {
        if (task.due_date) {
          const daysUntilDue = differenceInDays(new Date(task.due_date), new Date());
          if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            allAlerts.push({
              id: `task-${task.id}`,
              type: "deadline_approaching",
              severity: daysUntilDue === 0 ? "critical" : "warning",
              message: `Deadline : ${task.title}${task.clients ? ` (${task.clients.name})` : ""}`,
              clientId: task.clients?.id,
              clientName: task.clients?.name || task.clients?.company,
              actionLabel: "Voir la tâche",
              actionUrl: `/clients/${task.clients?.id}?tab=tasks`,
            });
          }
        }
      });

      // 4. Check for missing brand DNA
      const { data: brandDNA } = await supabase
        .from("brand_dna")
        .select("client_id")
        .eq("user_id", user.id);

      const clientsWithDNA = new Set(brandDNA?.map((bd) => bd.client_id) || []);

      allActiveClients?.forEach((client) => {
        if (!clientsWithDNA.has(client.id)) {
          // Check if onboarding exists for this client
          const { data: onboarding } = await supabase
            .from("onboarding")
            .select("id, status")
            .eq("user_id", user.id)
            .eq("clients.id", client.id)
            .eq("status", "completed")
            .limit(1);

          if (onboarding && onboarding.length > 0) {
            allAlerts.push({
              id: `brand-dna-${client.id}`,
              type: "brand_dna_missing",
              severity: "warning",
              message: `Brand DNA manquant pour ${client.name}`,
              clientId: client.id,
              clientName: client.name || client.company,
              actionLabel: "Créer le Brand DNA",
              actionUrl: `/clients/${client.id}?tab=brand-dna`,
            });
          }
        }
      });

      setAlerts(allAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "content_missing":
        return FileText;
      case "deadline_approaching":
        return Calendar;
      case "onboarding_incomplete":
        return CheckCircle;
      case "brand_dna_missing":
        return TrendingUp;
      default:
        return AlertCircle;
    }
  };

  const getAlertColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertes Automatiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertes Automatiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-green-600 text-sm">
            ✨ Aucune alerte ! Tout est à jour
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Alertes Automatiques ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === "critical" ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${alert.severity === "critical" ? "text-red-600" : ""}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <Badge variant={getAlertColor(alert.severity)} className="text-xs">
                      {alert.severity === "critical" ? "Critique" : "Attention"}
                    </Badge>
                  </div>
                  {alert.clientName && (
                    <p className="text-xs text-muted-foreground">Client : {alert.clientName}</p>
                  )}
                  {alert.actionUrl && alert.actionLabel && (
                    <a
                      href={alert.actionUrl}
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      → {alert.actionLabel}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

