import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Star, BarChart3, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Organization } from "@/types/crm";

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrg();
  }, [id]);

  const fetchOrg = async () => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id!)
        .single();

      if (!error && data) {
        setOrg(data);
      }
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

  if (!org) {
    return (
      <div className="p-8">
        <p>Entreprise non trouvée</p>
      </div>
    );
  }

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

      {/* Informations de l'entreprise */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="brand">Brand DNA</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">MRR</p>
                  <p>{org.monthly_amount ? `${org.monthly_amount.toFixed(2)} €` : "-"}</p>
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

        <TabsContent value="brand">
          <p className="text-muted-foreground">Brand DNA à venir...</p>
        </TabsContent>

        <TabsContent value="history">
          <p className="text-muted-foreground">Historique à venir...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationDetails;
