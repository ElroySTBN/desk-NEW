import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Email {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  type: string;
  sent_at: string;
}

interface ClientEmailsTabProps {
  clientId: string;
}

export const ClientEmailsTab = ({ clientId }: ClientEmailsTabProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [clientId]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("client_id", clientId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      invoice: "Facture",
      report: "Rapport",
      reminder: "Rappel",
      request: "Demande d'infos",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      invoice: "default",
      report: "secondary",
      reminder: "destructive",
      request: "outline",
      other: "outline",
    };
    return variants[type] || "outline";
  };

  const viewEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Historique des emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Historique des emails ({emails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun email envoyé à ce client</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => viewEmail(email)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{email.subject}</span>
                      <Badge variant={getTypeBadgeVariant(email.type)}>
                        {getTypeLabel(email.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(email.sent_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                      <span>→ {email.recipient}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email detail dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {selectedEmail?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={getTypeBadgeVariant(selectedEmail.type)}>
                  {getTypeLabel(selectedEmail.type)}
                </Badge>
                <span className="text-muted-foreground">
                  {format(new Date(selectedEmail.sent_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="text-sm">
                <strong>À :</strong> {selectedEmail.recipient}
              </div>
              <div
                className="border-t pt-4"
                dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};


