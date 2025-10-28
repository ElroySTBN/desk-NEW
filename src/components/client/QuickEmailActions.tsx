import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, FileText, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendEmail, replaceEmailVariables, EMAIL_TEMPLATES } from "@/lib/emailService";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";

interface QuickEmailActionsProps {
  clientId: string;
  clientName: string;
  clientEmail?: string | null;
  clientDriveLink?: string;
}

export const QuickEmailActions = ({ 
  clientId, 
  clientName, 
  clientEmail,
  clientDriveLink 
}: QuickEmailActionsProps) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [emailPreview, setEmailPreview] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [driveLink, setDriveLink] = useState(clientDriveLink || "");
  const [deadline, setDeadline] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));

  if (!clientEmail) {
    return (
      <div className="text-sm text-muted-foreground">
        Aucun email configuré pour ce client
      </div>
    );
  }

  const handleRequestInfoClick = () => {
    const nextMonth = format(addDays(new Date(), 30), "MMMM yyyy", { locale: fr });
    const deadlineFormatted = format(new Date(deadline), "d MMMM yyyy", { locale: fr });
    
    const content = replaceEmailVariables(
      EMAIL_TEMPLATES.REQUEST_INFO.html,
      {
        "CLIENT_NAME": clientName,
        "MONTH": nextMonth,
        "DRIVE_LINK": driveLink || "[LIEN_DRIVE_À_CONFIGURER]",
        "DEADLINE": deadlineFormatted,
      }
    );

    const subject = replaceEmailVariables(
      EMAIL_TEMPLATES.REQUEST_INFO.subject,
      {
        "CLIENT_NAME": clientName,
        "MONTH": nextMonth,
      }
    );

    setEmailSubject(subject);
    setEmailPreview(content);
    setShowDialog(true);
  };

  const handleSendEmail = async () => {
    setSending(true);
    
    try {
      await sendEmail({
        to: clientEmail,
        subject: emailSubject,
        html: emailPreview,
        clientId: clientId,
        type: "request",
      });

      toast({
        title: "Email envoyé !",
        description: `Demande d'informations envoyée à ${clientName}`,
      });

      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={handleRequestInfoClick}
          variant="outline"
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          Demander infos mois prochain
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Demande d'informations - {clientName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="driveLink">Lien Google Drive (optionnel)</Label>
              <Input
                id="driveLink"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div>
              <Label>Aperçu de l'email</Label>
              <div 
                className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: emailPreview }}
              />
            </div>

            <Button
              onClick={() => {
                // Regenerate preview with current values
                handleRequestInfoClick();
              }}
              variant="outline"
              size="sm"
            >
              Régénérer l'aperçu
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={sending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sending}
            >
              {sending ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


