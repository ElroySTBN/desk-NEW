import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
}

export const ContentModal = ({ open, onOpenChange, content }: ContentModalProps) => {
  const { toast } = useToast();

  if (!content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content.content);
    toast({
      title: "✅ Copié !",
      description: "Le contenu a été copié dans le presse-papier",
    });
  };

  const handleDownload = () => {
    const text = `${content.title || "Sans titre"}\n\n${content.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contenu-${content.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "✅ Téléchargé !",
      description: "Le contenu a été téléchargé",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{content.title || "Sans titre"}</DialogTitle>
              <DialogDescription className="mt-2">
                {content.clients?.company || content.clients?.name} •{" "}
                {format(new Date(content.scheduled_date), "d MMMM yyyy", { locale: fr })}
              </DialogDescription>
            </div>
            <Badge variant="outline">{content.content_type}</Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {content.description && (
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground">{content.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium mb-2">Contenu</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{content.content}</p>
            </div>
          </div>
          {content.hashtags && content.hashtags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {content.hashtags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCopy} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

