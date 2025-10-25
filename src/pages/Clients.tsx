import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClients(data);
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
        {clients.map((client) => (
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
                  {client.start_date && (
                    <p className="text-sm text-muted-foreground">
                      Depuis le {new Date(client.start_date).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  {client.monthly_amount && (
                    <p className="text-lg font-semibold text-primary mt-1">
                      {client.monthly_amount.toLocaleString("fr-FR")} € / mois
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
