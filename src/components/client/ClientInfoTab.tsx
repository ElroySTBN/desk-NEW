import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;

interface ClientInfoTabProps {
  client: Client;
  onUpdate: () => void;
}

export const ClientInfoTab = ({ client, onUpdate }: ClientInfoTabProps) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    company: client.company || "",
    email: client.email || "",
    phone: client.phone || "",
    status: client.status,
    contract_type: client.contract_type || "",
    monthly_amount: client.monthly_amount?.toString() || "",
    start_date: client.start_date || "",
    notes: client.notes || "",
  });

  const handleSave = async () => {
    const { error } = await supabase
      .from("clients")
      .update({
        ...formData,
        monthly_amount: formData.monthly_amount ? parseFloat(formData.monthly_amount) : null,
      })
      .eq("id", client.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
      });
      setEditing(false);
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Informations du client</CardTitle>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nom</Label>
            {editing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="text-sm">{client.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Entreprise</Label>
            {editing ? (
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            ) : (
              <p className="text-sm">{client.company || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            {editing ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            ) : (
              <p className="text-sm">{client.email || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Téléphone</Label>
            {editing ? (
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <p className="text-sm">{client.phone || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            {editing ? (
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm capitalize">{client.status}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de contrat</Label>
            {editing ? (
              <Input
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
              />
            ) : (
              <p className="text-sm">{client.contract_type || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Montant mensuel</Label>
            {editing ? (
              <Input
                type="number"
                step="0.01"
                value={formData.monthly_amount}
                onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
              />
            ) : (
              <p className="text-sm">
                {client.monthly_amount ? `${client.monthly_amount.toLocaleString("fr-FR")} €` : "-"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date de signature</Label>
            {editing ? (
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            ) : (
              <p className="text-sm">
                {client.start_date ? new Date(client.start_date).toLocaleDateString("fr-FR") : "-"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes générales</Label>
          {editing ? (
            <Textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{client.notes || "-"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
