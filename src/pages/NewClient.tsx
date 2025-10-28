import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewClient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    phone_mobile: "",
    billing_address: "",
    postal_code: "",
    city: "",
    siret: "",
    tva_number: "",
    client_type: "Professionnel",
    status: "actif",
    contract_type: "",
    monthly_amount: "",
    start_date: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("clients").insert({
      ...formData,
      user_id: user.id,
      monthly_amount: formData.monthly_amount ? parseFloat(formData.monthly_amount) : null,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Client créé avec succès",
      });
      navigate("/clients");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Nouveau Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_type">Type de client</Label>
                <Select value={formData.client_type} onValueChange={(value) => setFormData({ ...formData, client_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professionnel">Professionnel</SelectItem>
                    <SelectItem value="Particulier">Particulier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom / Raison sociale *</Label>
                <Input
                  id="name"
                  required
                  placeholder="Ex: Palma Speak ou SARL Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  placeholder="Nom de l'entreprise (si différent)"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@exemple.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone fixe</Label>
                <Input
                  id="phone"
                  placeholder="+33 1 42 68 25 25"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone_mobile">Téléphone portable</Label>
                <Input
                  id="phone_mobile"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone_mobile}
                  onChange={(e) => setFormData({ ...formData, phone_mobile: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse de facturation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billing_address">Adresse</Label>
                <Input
                  id="billing_address"
                  placeholder="46 rue Volta"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  placeholder="75003"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Paris"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations fiscales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations fiscales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  placeholder="51936755100024"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tva_number">Numéro de TVA</Label>
                <Input
                  id="tva_number"
                  placeholder="FR07519367551"
                  value={formData.tva_number}
                  onChange={(e) => setFormData({ ...formData, tva_number: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abonnement */}
        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthly_amount">Montant mensuel (€)</Label>
                <Input
                  id="monthly_amount"
                  type="number"
                  step="0.01"
                  placeholder="150"
                  value={formData.monthly_amount}
                  onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contract_type">Type de contrat</Label>
                <Input
                  id="contract_type"
                  placeholder="Ex: Abonnement mensuel, Abonnement semestriel"
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes et remarques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Ex: Frais d'intégration étalés sur 4 mois, Campagne Meta Ads, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/clients")}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Création en cours..." : "✅ Créer le client"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewClient;
