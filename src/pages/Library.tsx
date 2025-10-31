import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Image, FileText, Plus, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CreateContentDialog } from "@/components/library/CreateContentDialog";
import { ContentModal } from "@/components/library/ContentModal";

const Library = () => {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Charger les contenus
      const { data: contentData, error: contentError } = await supabase
        .from("content_library")
        .select(`
          *,
          clients!inner(id, name, company)
        `)
        .order("scheduled_date", { ascending: true });

      if (contentError) throw contentError;
      if (contentData) setContentItems(contentData);

      // Charger les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, company")
        .eq("status", "actif");

      if (clientsError) throw clientsError;
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

  // Group content by date for calendar view
  const contentByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    contentItems.forEach((item) => {
      const dateKey = format(new Date(item.scheduled_date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  }, [contentItems]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    return days;
  }, [currentMonth]);

  const getContentForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return contentByDate[dateKey] || [];
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />;
      case "promotion":
        return <Badge className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
      <Badge variant={variants[status] || "secondary"} className="text-xs">
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
        <Button onClick={() => setShowCreateDialog(true)}>
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
          {/* Calendar Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {format(currentMonth, "MMMM yyyy", { locale: fr })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
                    Aujourd'hui
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayContent = getContentForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[80px] border rounded-lg p-2 ${
                        isCurrentMonth ? "bg-background" : "bg-muted/30"
                      } ${isToday ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayContent.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedContent(item)}
                            className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/20 truncate"
                            title={item.title || item.content.substring(0, 30)}
                          >
                            {item.title || item.content.substring(0, 20)}
                          </div>
                        ))}
                        {dayContent.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayContent.length - 2} autres
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected day content */}
          {contentItems.length > 0 && (
            <div className="grid gap-4">
              {contentItems.slice(0, 10).map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedContent(item)}
                >
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
                        📅 {format(new Date(item.scheduled_date), "d MMMM yyyy", { locale: fr })}
                      </span>
                      <Badge variant="outline">{item.content_type}</Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un contenu..." className="pl-10" />
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
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedContent(item)}
                >
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
              <p className="text-muted-foreground mb-4">
                Gestion des photos à venir
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une Photo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateContentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        clients={clients}
        onSuccess={loadData}
      />

      <ContentModal
        open={!!selectedContent}
        onOpenChange={(open) => !open && setSelectedContent(null)}
        content={selectedContent}
      />
    </div>
  );
};

export default Library;
