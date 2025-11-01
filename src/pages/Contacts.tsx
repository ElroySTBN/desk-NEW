import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { UserCircle, Plus, Search, Pencil, Trash2, Building2, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import type { Contact, ContactWithOrganization, Organization } from "@/types/crm";

const Contacts = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedOrgId = searchParams.get("org");

  const [contacts, setContacts] = useState<ContactWithOrganization[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactWithOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>(preselectedOrgId || "all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
    job_title: "",
    department: "",
    organization_id: preselectedOrgId || "",
    is_main_contact: false,
    is_billing_contact: false,
    is_technical_contact: false,
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, orgFilter]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch contacts with organization info
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts_with_organization")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Fetch organizations for the dropdown
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("id, legal_name, commercial_name")
        .eq("user_id", user.id)
        .order("legal_name");

      if (orgsError) throw orgsError;
      setOrganizations(orgsData || []);
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

  const filterContacts = () => {
    let filtered = contacts;

    if (orgFilter !== "all") {
      if (orgFilter === "none") {
        filtered = filtered.filter((c) => !c.organization_id);
      } else {
        filtered = filtered.filter((c) => c.organization_id === orgFilter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        job_title: contact.job_title || "",
        department: contact.department || "",
        organization_id: contact.organization_id || "",
        is_main_contact: contact.is_main_contact,
        is_billing_contact: contact.is_billing_contact,
        is_technical_contact: contact.is_technical_contact,
        notes: contact.notes || "",
      });
    } else {
      setEditingContact(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        mobile: "",
        job_title: "",
        department: "",
        organization_id: preselectedOrgId || "",
        is_main_contact: false,
        is_billing_contact: false,
        is_technical_contact: false,
        notes: "",
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const dataToSave = {
        ...formData,
        organization_id: formData.organization_id || null,
      };

      if (editingContact) {
        const { error } = await supabase
          .from("contacts")
          .update(dataToSave)
          .eq("id", editingContact.id);

        if (error) throw error;
        toast({ title: "✅ Contact modifié" });
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert({ ...dataToSave, user_id: user.id });

        if (error) throw error;
        toast({ title: "✅ Contact créé" });
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "🗑️ Contact supprimé" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
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
            <UserCircle className="h-10 w-10" />
            Contacts
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos contacts professionnels
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nouveau contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les organisations</SelectItem>
                <SelectItem value="none">Sans organisation</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.commercial_name || org.legal_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun contact trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {contact.email}
                          </div>
                        )}
                        {(contact.phone || contact.mobile) && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {contact.phone || contact.mobile}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contact.job_title && <div>{contact.job_title}</div>}
                        {contact.department && (
                          <div className="text-muted-foreground">{contact.department}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.organization_name ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.organization_commercial_name || contact.organization_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {contact.is_main_contact && (
                          <Badge variant="outline" className="text-xs">
                            Principal
                          </Badge>
                        )}
                        {contact.is_billing_contact && (
                          <Badge variant="outline" className="text-xs">
                            Facturation
                          </Badge>
                        )}
                        {contact.is_technical_contact && (
                          <Badge variant="outline" className="text-xs">
                            Technique
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(contact)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(contact.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Modifier le contact" : "Nouveau contact"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@example.com"
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
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Fonction */}
            <div className="space-y-4">
              <h3 className="font-semibold">Fonction</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_title">Titre/Poste</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="Directeur Marketing"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Marketing"
                  />
                </div>
              </div>
            </div>

            {/* Organisation */}
            <div>
              <Label htmlFor="organization_id">Organisation</Label>
              <Select
                value={formData.organization_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, organization_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une organisation (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune organisation</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.commercial_name || org.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rôles */}
            <div className="space-y-3">
              <h3 className="font-semibold">Rôles</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_main_contact"
                    checked={formData.is_main_contact}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_main_contact: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_main_contact" className="cursor-pointer">
                    Contact principal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_billing_contact"
                    checked={formData.is_billing_contact}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_billing_contact: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_billing_contact" className="cursor-pointer">
                    Contact facturation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_technical_contact"
                    checked={formData.is_technical_contact}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_technical_contact: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_technical_contact" className="cursor-pointer">
                    Contact technique
                  </Label>
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
              {editingContact ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;

