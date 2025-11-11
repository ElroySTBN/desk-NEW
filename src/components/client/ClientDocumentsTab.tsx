import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientDocumentsTabProps {
  clientId: string;
}

interface Document {
  id: string;
  type: 'rapport' | 'facture' | 'onboarding' | 'autre';
  titre: string;
  fichier_url: string;
  created_at: string;
}

const documentTypeConfig = {
  rapport: { label: 'Rapport', color: 'bg-blue-100 text-blue-800' },
  facture: { label: 'Facture', color: 'bg-green-100 text-green-800' },
  onboarding: { label: 'Onboarding', color: 'bg-purple-100 text-purple-800' },
  autre: { label: 'Autre', color: 'bg-gray-100 text-gray-800' },
};

export const ClientDocumentsTab = ({ clientId }: ClientDocumentsTabProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents Archivés</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun document archivé pour ce client
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const config = documentTypeConfig[doc.type];
                return (
                  <Card key={doc.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.titre}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={config.color}>{config.label}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc.fichier_url, doc.titre)}
                            className="gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ouvrir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
