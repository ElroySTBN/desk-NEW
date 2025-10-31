import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Image, FileText, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Library = () => {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Charger les contenus
      const { data: contentData } = await supabase
        .from("content_library")
        .select(`
          *,
          clients!inner(name, company)
        `)
        .order("scheduled_date", { ascending: false });

      if (contentData) setContentItems(contentData);

      // Charger les clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, company")
        .eq("status", "actif");

      if (clientsData) setClients(clientsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-5 w-5" />;
      case "promotion":
        return <Badge className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: "secondary",
      ready: "default",
      scheduled: "outline",
      published: "default",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === "draft" && "Brouillon"}
        {status === "ready" && "Prêt"}
        {status === "scheduled" && "Planifié"}
        {status === "published" && "Publié"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Bibliothèque de Contenu</h1>
          <p className="text-muted-foreground mt-2">
            Gérez tous vos contenus Google Business Profile en un seul endroit
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contenu
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="list">
            <FileText className="h-4 w-4 mr-2" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Image className="h-4 w-4 mr-2" />
            Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4">
            {contentItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun contenu planifié. Créez votre premier contenu !
                  </p>
                </CardContent>
              </Card>
            ) : (
              contentItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(item.content_type)}
                        <div>
                          <CardTitle className="text-lg">{item.title || "Sans titre"}</CardTitle>
                          <CardDescription className="mt-1">
                            {item.clients?.company || item.clients?.name}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>
                        📅{" "}
                        {format(new Date(item.scheduled_date), "d MMMM yyyy", { locale: fr })}
                      </span>
                      <Badge variant="outline">{item.content_type}</Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{item.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contenu..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          <div className="grid gap-4">
            {contentItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Aucun contenu. Créez votre premier contenu !
                  </p>
                </CardContent>
              </Card>
            ) : (
              contentItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.title || "Sans titre"}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.clients?.company || item.clients?.name} •{" "}
                          {format(new Date(item.scheduled_date), "d MMMM yyyy", { locale: fr })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                    </div>
                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.hashtags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Fonctionnalité de gestion de photos à venir
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;

