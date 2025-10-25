import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeClients: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
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
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
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

    setStats({
      activeClients: activeCount || 0,
      monthlyRevenue,
      totalRevenue,
    });
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
      title: "Revenu Total",
      value: `${stats.totalRevenue.toLocaleString("fr-FR")} €`,
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de RaiseMed.IA
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/clients/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
          <Button onClick={() => navigate("/invoices/new")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Accès Rapide</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="h-24 text-lg"
            onClick={() => navigate("/clients")}
          >
            Voir tous les clients
          </Button>
          <Button
            variant="outline"
            className="h-24 text-lg"
            onClick={() => navigate("/invoices")}
          >
            Gérer les factures
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
