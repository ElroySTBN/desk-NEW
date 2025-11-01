import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, FileText, Calendar, TrendingUp, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MonthlyReport {
  id: string;
  client_id: string;
  client_name: string;
  month: number;
  year: number;
  total_scans: number;
  total_positive_reviews: number;
  total_negative_reviews: number;
  scans_by_employee: Array<{
    employee_id: string;
    employee_name: string;
    scans_count: number;
  }>;
  sent_at?: string;
  status: "draft" | "sent";
}

const MonthlyReports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, company")
        .eq("user_id", user.id)
        .eq("status", "actif");

      setClients(clientsData || []);

      // Fetch existing reports
      const { data: reportsData } = await supabase
        .from("monthly_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      setReports(reportsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = async (clientId: string) => {
    setGenerating(clientId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Check if report already exists
      const { data: existing } = await supabase
        .from("monthly_reports")
        .select("id")
        .eq("client_id", clientId)
        .eq("month", month)
        .eq("year", year)
        .single();

      if (existing) {
        toast({ title: "Rapport déjà généré ce mois-ci" });
        setGenerating(null);
        return;
      }

      // Get scans for this month
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0, 23, 59, 59);

      const { data: scansData } = await supabase
        .from("scan_tracking")
        .select(`
          *,
          employee:employees(id, name)
        `)
        .eq("client_id", clientId)
        .gte("scanned_at", firstDay.toISOString())
        .lte("scanned_at", lastDay.toISOString());

      // Get positive reviews
      const { data: positiveReviews } = await supabase
        .from("positive_review_redirects")
        .select("*")
        .eq("client_id", clientId)
        .gte("created_at", firstDay.toISOString())
        .lte("created_at", lastDay.toISOString());

      // Get negative reviews
      const { data: negativeReviews } = await supabase
        .from("negative_reviews")
        .select("*")
        .eq("client_id", clientId)
        .gte("created_at", firstDay.toISOString())
        .lte("created_at", lastDay.toISOString());

      // Count by employee
      const employeeScans = new Map<string, { name: string; count: number }>();
      scansData?.forEach((scan: any) => {
        if (scan.employee) {
          const current = employeeScans.get(scan.employee.id) || { name: scan.employee.name, count: 0 };
          employeeScans.set(scan.employee.id, { name: current.name, count: current.count + 1 });
        }
      });

      const scansByEmployee = Array.from(employeeScans.entries()).map(([employeeId, data]) => ({
        employee_id: employeeId,
        employee_name: data.name,
        scans_count: data.count,
      }));

      // Get client name
      const client = clients.find((c) => c.id === clientId);
      const clientName = client?.company || client?.name || "Client";

      // Create report
      const reportData = {
        user_id: user.id,
        client_id: clientId,
        client_name: clientName,
        month,
        year,
        total_scans: scansData?.length || 0,
        total_positive_reviews: positiveReviews?.length || 0,
        total_negative_reviews: negativeReviews?.length || 0,
        scans_by_employee: scansByEmployee,
        status: "draft",
      };

      const { error } = await supabase
        .from("monthly_reports")
        .insert(reportData);

      if (error) throw error;

      toast({ title: "✅ Rapport généré avec succès" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const sendReport = async (reportId: string) => {
    try {
      // TODO: Implement email sending
      const { error } = await supabase
        .from("monthly_reports")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({ title: "📧 Rapport envoyé" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">📊 Rapports Mensuels</h1>
        <p className="text-muted-foreground mt-2">
          Rapport mensuel de performance pour vos clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Générer un rapport</CardTitle>
          <CardDescription>
            Sélectionnez un client pour générer son rapport du mois en cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {clients.map((client) => (
              <Card key={client.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{client.company || client.name}</h3>
                    <Button
                      onClick={() => generateMonthlyReport(client.id)}
                      disabled={generating === client.id}
                      className="w-full"
                      size="sm"
                    >
                      {generating === client.id ? "Génération..." : "Générer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports générés</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Avis +</TableHead>
                  <TableHead>Avis -</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.client_name}</TableCell>
                    <TableCell>
                      {format(new Date(report.year, report.month - 1, 1), "MMMM yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {report.total_scans}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {report.total_positive_reviews}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {report.total_negative_reviews}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === "sent" ? "default" : "secondary"}>
                        {report.status === "sent" ? "Envoyé" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendReport(report.id)}
                          disabled={report.status === "sent"}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonthlyReports;

