import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Plus, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientOnboardingTabProps {
  clientId: string;
}

interface OnboardingChecklist {
  id?: string;
  tally_form_completed: boolean;
  google_drive_created: boolean;
  google_drive_link: string;
  identity_document_created: boolean;
  google_business_access: boolean;
  visuals_uploaded: boolean;
  visuals_count: number;
  first_meeting_scheduled: boolean;
  first_meeting_date: string;
  contract_signed: boolean;
  first_invoice_sent: boolean;
  notes: string;
}

interface ClientLink {
  id: string;
  link_type: string;
  link_url: string;
  link_name: string;
  description: string | null;
}

export const ClientOnboardingTab = ({ clientId }: ClientOnboardingTabProps) => {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<OnboardingChecklist>({
    tally_form_completed: false,
    google_drive_created: false,
    google_drive_link: "",
    identity_document_created: false,
    google_business_access: false,
    visuals_uploaded: false,
    visuals_count: 0,
    first_meeting_scheduled: false,
    first_meeting_date: "",
    contract_signed: false,
    first_invoice_sent: false,
    notes: "",
  });
  const [links, setLinks] = useState<ClientLink[]>([]);
  const [newLink, setNewLink] = useState({
    link_type: "google_drive",
    link_url: "",
    link_name: "",
    description: "",
  });
  const [showLinkForm, setShowLinkForm] = useState(false);

  useEffect(() => {
    fetchOnboardingData();
    fetchLinks();
  }, [clientId]);

  const fetchOnboardingData = async () => {
    const { data } = await supabase
      .from("onboarding_checklists")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (data) {
      setChecklist({
        id: data.id,
        tally_form_completed: data.tally_form_completed,
        google_drive_created: data.google_drive_created,
        google_drive_link: data.google_drive_link || "",
        identity_document_created: data.identity_document_created,
        google_business_access: data.google_business_access,
        visuals_uploaded: data.visuals_uploaded,
        visuals_count: data.visuals_count || 0,
        first_meeting_scheduled: data.first_meeting_scheduled,
        first_meeting_date: data.first_meeting_date || "",
        contract_signed: data.contract_signed,
        first_invoice_sent: data.first_invoice_sent,
        notes: data.notes || "",
      });
    }
  };

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("client_links")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (data) setLinks(data);
  };

  const handleSaveChecklist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      client_id: clientId,
      user_id: user.id,
      ...checklist,
    };

    if (checklist.id) {
      const { error } = await supabase
        .from("onboarding_checklists")
        .update(payload)
        .eq("id", checklist.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la checklist",
          variant: "destructive",
        });
      } else {
        toast({ title: "Succès", description: "Checklist mise à jour" });
      }
    } else {
      const { data, error } = await supabase
        .from("onboarding_checklists")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la checklist",
          variant: "destructive",
        });
      } else {
        toast({ title: "Succès", description: "Checklist créée" });
        setChecklist({ ...checklist, id: data.id });
      }
    }
  };

  const handleAddLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("client_links").insert({
      client_id: clientId,
      user_id: user.id,
      ...newLink,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le lien",
        variant: "destructive",
      });
    } else {
      toast({ title: "Succès", description: "Lien ajouté" });
      setNewLink({
        link_type: "google_drive",
        link_url: "",
        link_name: "",
        description: "",
      });
      setShowLinkForm(false);
      fetchLinks();
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const { error } = await supabase
      .from("client_links")
      .delete()
      .eq("id", linkId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    } else {
      toast({ title: "Succès", description: "Lien supprimé" });
      fetchLinks();
    }
  };

  const calculateProgress = () => {
    const items = [
      checklist.tally_form_completed,
      checklist.google_drive_created,
      checklist.identity_document_created,
      checklist.google_business_access,
      checklist.visuals_uploaded,
      checklist.first_meeting_scheduled,
      checklist.contract_signed,
      checklist.first_invoice_sent,
    ];
    const completed = items.filter(Boolean).length;
    return (completed / items.length) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progression Onboarding</span>
            <span className="text-2xl font-bold text-primary">
              {Math.round(progress)}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Checklist Card */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist d'Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Tally Form */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="tally"
                checked={checklist.tally_form_completed}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    tally_form_completed: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label htmlFor="tally" className="cursor-pointer">
                  Formulaire Tally complété
                </Label>
                <p className="text-sm text-muted-foreground">
                  Produits, services, horaires, ICP
                </p>
              </div>
              {checklist.tally_form_completed && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* Google Drive */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="drive"
                checked={checklist.google_drive_created}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    google_drive_created: checked as boolean,
                  })
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="drive" className="cursor-pointer">
                  Google Drive créé
                </Label>
                <Input
                  placeholder="Lien Google Drive..."
                  value={checklist.google_drive_link}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      google_drive_link: e.target.value,
                    })
                  }
                />
              </div>
              {checklist.google_drive_created && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* Identity Document */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="identity"
                checked={checklist.identity_document_created}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    identity_document_created: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label htmlFor="identity" className="cursor-pointer">
                  Document d'identité d'entreprise créé
                </Label>
                <p className="text-sm text-muted-foreground">
                  Document central pour les modèles IA
                </p>
              </div>
              {checklist.identity_document_created && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* Google Business Access */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="gbp"
                checked={checklist.google_business_access}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    google_business_access: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label htmlFor="gbp" className="cursor-pointer">
                  Accès Google Business Profile obtenu
                </Label>
              </div>
              {checklist.google_business_access && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* Visuals Uploaded */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="visuals"
                checked={checklist.visuals_uploaded}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    visuals_uploaded: checked as boolean,
                  })
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="visuals" className="cursor-pointer">
                  Visuels uploadés (15 minimum)
                </Label>
                <Input
                  type="number"
                  placeholder="Nombre de visuels"
                  value={checklist.visuals_count}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      visuals_count: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              {checklist.visuals_uploaded && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* First Meeting */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="meeting"
                checked={checklist.first_meeting_scheduled}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    first_meeting_scheduled: checked as boolean,
                  })
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="meeting" className="cursor-pointer">
                  Première réunion planifiée
                </Label>
                <Input
                  type="datetime-local"
                  value={checklist.first_meeting_date}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      first_meeting_date: e.target.value,
                    })
                  }
                />
              </div>
              {checklist.first_meeting_scheduled && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* Contract Signed */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="contract"
                checked={checklist.contract_signed}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    contract_signed: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label htmlFor="contract" className="cursor-pointer">
                  Contrat signé / CGV acceptées
                </Label>
              </div>
              {checklist.contract_signed && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>

            {/* First Invoice */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="invoice"
                checked={checklist.first_invoice_sent}
                onCheckedChange={(checked) =>
                  setChecklist({
                    ...checklist,
                    first_invoice_sent: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <Label htmlFor="invoice" className="cursor-pointer">
                  Première facture envoyée
                </Label>
              </div>
              {checklist.first_invoice_sent && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={4}
              value={checklist.notes}
              onChange={(e) =>
                setChecklist({ ...checklist, notes: e.target.value })
              }
              placeholder="Notes sur l'onboarding..."
            />
          </div>

          <Button onClick={handleSaveChecklist} className="w-full">
            Enregistrer la checklist
          </Button>
        </CardContent>
      </Card>

      {/* Links Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liens & Ressources</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowLinkForm(!showLinkForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un lien
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showLinkForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-accent/50">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom du lien</Label>
                  <Input
                    placeholder="Ex: Google Drive Client"
                    value={newLink.link_name}
                    onChange={(e) =>
                      setNewLink({ ...newLink, link_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newLink.link_type}
                    onChange={(e) =>
                      setNewLink({ ...newLink, link_type: e.target.value })
                    }
                  >
                    <option value="google_drive">Google Drive</option>
                    <option value="tally_form">Formulaire Tally</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://..."
                  value={newLink.link_url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, link_url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optionnelle)</Label>
                <Textarea
                  rows={2}
                  value={newLink.description}
                  onChange={(e) =>
                    setNewLink({ ...newLink, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddLink} className="flex-1">
                  Ajouter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLinkForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {links.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun lien enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{link.link_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.description || link.link_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.link_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

