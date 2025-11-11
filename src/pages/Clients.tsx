import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;

const Clients = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    secteur_activite: "",
    type_campagne: [] as string[],
    statut: "actif" as const,
    date_debut_contrat: "",
    date_anniversaire_abonnement: "",
    montant_mensuel: 0,
    notes: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.statut === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || "",
        company: client.company || "",
        email: client.email || "",
        phone: client.phone || "",
        secteur_activite: client.secteur_activite || "",
        type_campagne: client.type_campagne || [],
        statut: client.statut || "actif",
        date_debut_contrat: client.date_debut_contrat || "",
        date_anniversaire_abonnement: client.date_anniversaire_abonnement || "",
        montant_mensuel: Number(client.montant_mensuel) || 0,
        notes: client.notes || "",
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        secteur_activite: "",
        type_campagne: [],
        statut: "actif",
        date_debut_contrat: "",
        date_anniversaire_abonnement: "",
        montant_mensuel: 0,
        notes: "",
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (editingClient) {
        const { error } = await supabase
          .from("clients")
          .update(formData)
          .eq("id", editingClient.id);

        if (error) throw error;
        toast({ title: "✅ Client modifié" });
      } else {
        const { error } = await supabase
          .from("clients")
          .insert({ ...formData, user_id: user.id });

        if (error) throw error;
        toast({ title: "✅ Client créé" });
      }

      setShowDialog(false);
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "🗑️ Client supprimé" });
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, any> = {
      actif: "default",
      pause: "secondary",
      a_renouveler: "destructive",
      archived: "outline",
    };
    const labels: Record<string, string> = {
      actif: "Actif",
      pause: "En pause",
      a_renouveler: "À renouveler",
      archived: "Archivé",
    };
    return <Badge variant={variants[statut]}>{labels[statut]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-10 w-10" />
            Clients
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos clients et leurs campagnes
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nouveau client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="pause">En pause</SelectItem>
                <SelectItem value="a_renouveler">À renouveler</SelectItem>
                <SelectItem value="archived">Archivés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant mensuel</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.company || "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.email && <div>{client.email}</div>}
                        {client.phone && <div className="text-muted-foreground">{client.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.statut || "actif")}</TableCell>
                    <TableCell>
                      {client.montant_mensuel ? `${Number(client.montant_mensuel).toFixed(2)} €` : "-"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Modifier le client" : "Nouveau client"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informations générales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@client.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secteur_activite">Secteur d'activité</Label>
                <Input
                  id="secteur_activite"
                  value={formData.secteur_activite}
                  onChange={(e) => setFormData({ ...formData, secteur_activite: e.target.value })}
                  placeholder="Immobilier, BTP, Formation..."
                />
              </div>
            </div>

            {/* Informations commerciales */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informations commerciales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value: any) => setFormData({ ...formData, statut: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="pause">En pause</SelectItem>
                      <SelectItem value="a_renouveler">À renouveler</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="montant_mensuel">Montant mensuel (€)</Label>
                  <Input
                    id="montant_mensuel"
                    type="number"
                    step="0.01"
                    value={formData.montant_mensuel}
                    onChange={(e) => setFormData({ ...formData, montant_mensuel: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_debut_contrat">Date de début de contrat</Label>
                  <Input
                    id="date_debut_contrat"
                    type="date"
                    value={formData.date_debut_contrat}
                    onChange={(e) => setFormData({ ...formData, date_debut_contrat: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date_anniversaire_abonnement">Date anniversaire abonnement</Label>
                  <Input
                    id="date_anniversaire_abonnement"
                    type="date"
                    value={formData.date_anniversaire_abonnement}
                    onChange={(e) => setFormData({ ...formData, date_anniversaire_abonnement: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes internes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingClient ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;

