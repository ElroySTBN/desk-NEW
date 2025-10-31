import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, Mail, Calendar, FileText, User, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientHistoryTabProps {
  clientId: string;
}

interface QuickNote {
  id: string;
  content: string;
  created_at: string;
}

interface Call {
  id: string;
  call_date: string;
  duration_minutes: number | null;
  call_type: string;
  notes: string | null;
  action_items: string[];
  follow_ups: string[];
}

export const ClientHistoryTab = ({ clientId }: ClientHistoryTabProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [newCall, setNewCall] = useState({
    call_date: "",
    duration_minutes: "",
    call_type: "phone",
    notes: "",
    action_items: [] as string[],
    follow_ups: [] as string[],
  });

  useEffect(() => {
    fetchHistory();
  }, [clientId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [notesResult, callsResult] = await Promise.all([
        supabase
          .from("quick_notes")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("client_calls")
          .select("*")
          .eq("client_id", clientId)
          .order("call_date", { ascending: false })
          .limit(20),
      ]);

      setNotes(notesResult.data || []);
      setCalls(callsResult.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCall = async () => {
    if (!newCall.call_date) {
      toast({
        title: "Erreur",
        description: "La date est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("client_calls").insert({
        client_id: clientId,
        call_date: newCall.call_date,
        duration_minutes: newCall.duration_minutes ? parseInt(newCall.duration_minutes) : null,
        call_type: newCall.call_type,
        notes: newCall.notes || null,
        action_items: newCall.action_items,
        follow_ups: newCall.follow_ups,
      });

      if (error) throw error;

      toast({
        title: "✅ Appel enregistré",
        description: "L'appel a été ajouté à l'historique",
      });

      setShowCallDialog(false);
      setNewCall({
        call_date: "",
        duration_minutes: "",
        call_type: "phone",
        notes: "",
        action_items: [],
        follow_ups: [],
      });
      fetchHistory();
    } catch (error: any) {
      console.error("Error adding call:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer l'appel",
        variant: "destructive",
      });
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case "phone":
        return Phone;
      case "video":
        return Phone;
      case "meeting":
        return Calendar;
      default:
        return Mail;
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case "phone":
        return "Téléphone";
      case "video":
        return "Visio";
      case "meeting":
        return "Réunion";
      default:
        return "Email";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Historique & Activité</h2>
          <p className="text-muted-foreground">Notes, appels et actions récentes</p>
        </div>
        <Button onClick={() => setShowCallDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Appel
        </Button>
      </div>

      {/* Appels récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Appels & Réunions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun appel enregistré
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => {
                const CallIcon = getCallTypeIcon(call.call_type);
                return (
                  <div key={call.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CallIcon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(call.call_date), "EEEE d MMMM yyyy", { locale: fr })}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <Badge variant="outline">{getCallTypeLabel(call.call_type)}</Badge>
                            {call.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {call.duration_minutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {call.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{call.notes}</p>
                    )}
                    {call.action_items && call.action_items.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1">Actions à suivre :</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {call.action_items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune note rapide
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter un appel */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un Appel</DialogTitle>
            <DialogDescription>
              Ajoutez un appel, une réunion ou un email important à l'historique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Date *</Label>
                <Input
                  type="datetime-local"
                  value={newCall.call_date}
                  onChange={(e) => setNewCall({ ...newCall, call_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  value={newCall.duration_minutes}
                  onChange={(e) => setNewCall({ ...newCall, duration_minutes: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={newCall.call_type} onValueChange={(value) => setNewCall({ ...newCall, call_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Téléphone</SelectItem>
                  <SelectItem value="video">Visio</SelectItem>
                  <SelectItem value="meeting">Réunion</SelectItem>
                  <SelectItem value="email">Email important</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newCall.notes}
                onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                rows={4}
                placeholder="Points abordés, décisions prises, etc."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCallDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddCall}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

