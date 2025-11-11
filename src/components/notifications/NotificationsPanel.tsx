import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Calendar, DollarSign, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  due_date: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  client_id: string | null;
  clients?: {
    name: string;
  };
}

export const NotificationsPanel = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    generateAutomaticNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select(`
        *,
        clients (
          name
        )
      `)
      .eq("user_id", user.id)
      .eq("is_dismissed", false)
      .order("created_at", { ascending: false });

    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  const generateAutomaticNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for upcoming renewals (clients with monthly subscriptions)
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, start_date, monthly_amount")
      .eq("user_id", user.id)
      .eq("statut", "actif")
      .not("start_date", "is", null);

    if (clients) {
      for (const client of clients) {
        if (!client.start_date) continue;

        const startDate = new Date(client.start_date);
        const today = new Date();
        const dayOfMonth = startDate.getDate();
        const currentDay = today.getDate();
        
        // Notify 7 days before renewal (anniversary date)
        if (currentDay === dayOfMonth - 7) {
          // Check if notification already exists
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("client_id", client.id)
            .eq("type", "renewal")
            .gte("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString());

          if (!existing || existing.length === 0) {
            await supabase.from("notifications").insert({
              user_id: user.id,
              client_id: client.id,
              type: "renewal",
              title: `Renouvellement dans 7 jours`,
              message: `Le client ${client.name} aura son renouvellement d'abonnement dans 7 jours.`,
              due_date: new Date(today.getFullYear(), today.getMonth(), dayOfMonth).toISOString(),
            });
          }
        }
      }
    }

    // Check for overdue invoices (en_attente > 15 jours)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const { data: overdueInvoices } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        amount_ttc,
        client_id,
        clients (
          name
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "en_attente")
      .lte("date", fifteenDaysAgo.toISOString());

    if (overdueInvoices) {
      for (const invoice of overdueInvoices) {
        // Check if notification already exists
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("type", "payment_reminder")
          .like("message", `%${invoice.invoice_number}%`);

        if (!existing || existing.length === 0) {
          await supabase.from("notifications").insert({
            user_id: user.id,
            client_id: invoice.client_id,
            type: "payment_reminder",
            title: `Facture en retard`,
            message: `La facture ${invoice.invoice_number} (${invoice.amount_ttc}€) est impayée depuis plus de 15 jours.`,
          });
        }
      }
    }

    fetchNotifications();
  };

  const handleDismiss = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_dismissed: true })
      .eq("id", notificationId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de masquer la notification",
        variant: "destructive",
      });
    } else {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "renewal":
        return <Calendar className="h-5 w-5 text-primary" />;
      case "payment_reminder":
        return <DollarSign className="h-5 w-5 text-destructive" />;
      case "report_due":
        return <FileText className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const variants: Record<string, string> = {
      renewal: "bg-primary/20 text-primary",
      payment_reminder: "bg-destructive/20 text-destructive",
      report_due: "bg-warning/20 text-warning",
      custom: "bg-muted text-muted-foreground",
    };
    const labels: Record<string, string> = {
      renewal: "Renouvellement",
      payment_reminder: "Paiement",
      report_due: "Rapport",
      custom: "Autre",
    };
    return (
      <Badge variant="outline" className={variants[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Notifications & Rappels</CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                  !notification.is_read
                    ? "bg-accent/50 border-primary/50"
                    : "hover:bg-accent/30"
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    {getNotificationBadge(notification.type)}
                    {!notification.is_read && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.clients && (
                    <p className="text-xs text-primary mt-1">
                      Client: {notification.clients.name}
                    </p>
                  )}
                  {notification.due_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📅{" "}
                      {new Date(notification.due_date).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(notification.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

