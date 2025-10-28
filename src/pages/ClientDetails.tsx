import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientInfoTab } from "@/components/client/ClientInfoTab";
import { ClientKPIsTab } from "@/components/client/ClientKPIsTab";
import { ClientInvoicesTab } from "@/components/client/ClientInvoicesTab";
import { ClientDocumentsTab } from "@/components/client/ClientDocumentsTab";
import { ClientEmailsTab } from "@/components/client/ClientEmailsTab";
import { ClientOnboardingTab } from "@/components/client/ClientOnboardingTab";
import { ClientTasksTab } from "@/components/client/ClientTasksTab";
import { QuickEmailActions } from "@/components/client/QuickEmailActions";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchClient();
  }, [id]);

  const fetchClient = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id!)
      .single();

    if (!error && data) {
      setClient(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <p>Client non trouvé</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{client.name}</h1>
          {client.company && (
            <p className="text-muted-foreground mt-1">{client.company}</p>
          )}
        </div>
      </div>

      <QuickEmailActions
        clientId={client.id}
        clientName={client.company || client.name}
        clientEmail={client.email}
      />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ClientInfoTab client={client} onUpdate={fetchClient} />
        </TabsContent>

        <TabsContent value="onboarding">
          <ClientOnboardingTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <ClientTasksTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="kpis">
          <ClientKPIsTab 
            clientId={client.id} 
            clientName={client.name}
            clientCompany={client.company || undefined}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <ClientInvoicesTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="documents">
          <ClientDocumentsTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="communications">
          <ClientEmailsTab clientId={client.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
