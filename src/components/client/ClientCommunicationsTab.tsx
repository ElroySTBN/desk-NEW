import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientCommunicationsTabProps {
  clientId: string;
}

interface Communication {
  id: string;
  type: string;
  content: string;
  communication_date: string | null;
  created_at: string | null;
}

export const ClientCommunicationsTab = ({ clientId }: ClientCommunicationsTabProps) => {
  const { toast } = useToast();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "note",
    content: "",
    communication_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    const { data } = await supabase
      .from("client_communications")
      .select("*")
      .eq("client_id", clientId)
      .order("communication_date", { ascending: false });

    if (data) setCommunications(data);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("client_communications").insert({
      client_id: clientId,
      user_id: user.id,
      ...formData,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la communication",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Communication ajoutée",
      });
      setFormData({
        type: "note",
        content: "",
        communication_date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      fetchCommunications();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "appel":
        return <Phone className="h-5 w-5 text-primary" />;
      case "email":
        return <Mail className="h-5 w-5 text-accent" />;
      default:
        return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des communications</CardTitle>
          <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Ajouter une note
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="appel">Appel</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="reunion">Réunion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.communication_date}
                    onChange={(e) =>
                      setFormData({ ...formData, communication_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Décrivez la communication..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>Enregistrer</Button>
              </div>
            </div>
          )}

          {communications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune communication enregistrée
            </p>
          ) : (
            <div className="space-y-4">
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">{getIcon(comm.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold capitalize">{comm.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {comm.communication_date
                          ? new Date(comm.communication_date).toLocaleDateString("fr-FR")
                          : "-"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comm.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
