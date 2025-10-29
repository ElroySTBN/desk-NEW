import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  company: string | null;
  status: string;
  monthly_amount: number | null;
  start_date: string | null;
}

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("id, name, company, status, monthly_amount, start_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClients(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "actif":
        return "bg-success text-success-foreground";
      case "prospect":
        return "bg-warning text-warning-foreground";
      case "inactif":
        return "bg-muted text-muted-foreground";
      case "churned":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Memo pour éviter les recalculs à chaque render
  const formattedClients = useMemo(() => {
    return clients.map(client => ({
      ...client,
      formattedDate: client.start_date 
        ? new Date(client.start_date).toLocaleDateString("fr-FR")
        : null,
      formattedAmount: client.monthly_amount
        ? `${client.monthly_amount.toLocaleString("fr-FR")} € / mois`
        : null
    }));
  }, [clients]);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos clients et leurs informations
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos clients et leurs informations
          </p>
        </div>
        <Button onClick={() => navigate("/clients/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      <div className="grid gap-4">
        {formattedClients.map((client) => (
          <Card
            key={client.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{client.name}</h3>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                  {client.company && (
                    <p className="text-muted-foreground mt-1">{client.company}</p>
                  )}
                </div>
                <div className="text-right">
                  {client.formattedDate && (
                    <p className="text-sm text-muted-foreground">
                      Depuis le {client.formattedDate}
                    </p>
                  )}
                  {client.formattedAmount && (
                    <p className="text-lg font-semibold text-primary mt-1">
                      {client.formattedAmount}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clients;
