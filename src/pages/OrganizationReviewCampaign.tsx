import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Star, BarChart3, MessageSquare, Settings, QrCode } from "lucide-react";
import type { Employee } from "@/types/review-system";

const OrganizationReviewCampaign = () => {
  const { id: orgId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      fetchEmployees();
    }
  }, [orgId]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .or(`organization_id.eq.${orgId},client_id.eq.${orgId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/organizations/${orgId}`)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Campagne de Récolte d'Avis</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos employés, configurez vos funnels et consultez vos rapports
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            Équipe
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageSquare className="h-4 w-4 mr-2" />
            Avis Négatifs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Link to={`/organizations/${orgId}/employees`} className="block">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>Gérer les Membres</CardTitle>
                <CardDescription>
                  Ajoutez des employés, générez leurs QR codes et suivez leurs performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {employees.length} membre{employees.length > 1 ? 's' : ''} actif{employees.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button>Ouvrir</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </TabsContent>

        <TabsContent value="settings">
          <Link to={`/organizations/${orgId}/funnel-setup`} className="block">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>Configuration Funnel</CardTitle>
                <CardDescription>
                  Configurez vos plateformes d'avis et personnalisez vos messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Ouvrir</Button>
              </CardContent>
            </Card>
          </Link>
        </TabsContent>

        <TabsContent value="reports">
          <Link to={`/organizations/${orgId}/scan-reports`} className="block">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>Rapports de Performance</CardTitle>
                <CardDescription>
                  Consultez vos statistiques de scans, avis et performances par employé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Ouvrir</Button>
              </CardContent>
            </Card>
          </Link>
        </TabsContent>

        <TabsContent value="reviews">
          <Link to={`/organizations/${orgId}/negative-reviews`} className="block">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>Avis Négatifs Collectés</CardTitle>
                <CardDescription>
                  Gérez vos avis négatifs et feedbacks clients collectés en privé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Ouvrir</Button>
              </CardContent>
            </Card>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationReviewCampaign;

