import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, StickyNote, Phone, Lightbulb, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientNotesTabProps {
  clientId: string;
}

interface Note {
  id: string;
  type: 'observation' | 'call' | 'insight' | 'alerte';
  contenu: string;
  tags: string[];
  date_note: string;
  created_at: string;
}

const noteTypeConfig = {
  observation: { icon: StickyNote, label: 'Observation', color: 'bg-blue-100 text-blue-800' },
  call: { icon: Phone, label: 'Appel', color: 'bg-green-100 text-green-800' },
  insight: { icon: Lightbulb, label: 'Insight', color: 'bg-yellow-100 text-yellow-800' },
  alerte: { icon: AlertTriangle, label: 'Alerte', color: 'bg-red-100 text-red-800' },
};

export const ClientNotesTab = ({ clientId }: ClientNotesTabProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'observation' as Note['type'],
    contenu: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("client_id", clientId)
      .order("date_note", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notes",
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.contenu.trim()) {
      toast({
        title: "Erreur",
        description: "Le contenu de la note est requis",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      client_id: clientId,
      type: formData.type,
      contenu: formData.contenu,
      tags: formData.tags,
      date_note: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la note",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Note créée avec succès",
      });
      setFormData({ type: 'observation', contenu: '', tags: [] });
      setShowForm(false);
      fetchNotes();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notes & Observations</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Note
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de note</label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as Note['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observation">📝 Observation</SelectItem>
                  <SelectItem value="call">📞 Appel</SelectItem>
                  <SelectItem value="insight">💡 Insight</SelectItem>
                  <SelectItem value="alerte">🚨 Alerte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenu</label>
              <Textarea
                rows={6}
                value={formData.contenu}
                onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                placeholder="Rédigez votre note..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Enregistrer</Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setFormData({ type: 'observation', contenu: '', tags: [] });
              }}>
                Annuler
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              Aucune note pour ce client
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => {
            const config = noteTypeConfig[note.type];
            const Icon = config.icon;
            return (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.date_note), "d MMM yyyy à HH:mm", { locale: fr })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{note.contenu}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {note.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};


