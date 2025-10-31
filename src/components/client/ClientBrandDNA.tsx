import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, FileText, Loader2 } from "lucide-react";

interface ClientBrandDNAProps {
  clientId: string;
  onboardingId?: string;
}

export const ClientBrandDNA = ({ clientId, onboardingId }: ClientBrandDNAProps) => {
  const { toast } = useToast();
  const [dna, setDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dnaContent, setDnaContent] = useState("");

  useEffect(() => {
    fetchBrandDNA();
  }, [clientId, onboardingId]);

  const fetchBrandDNA = async () => {
    setLoading(true);
    try {
      // Fetch from brand_dna table first
      const { data: brandDNA, error: dnaError } = await supabase
        .from("brand_dna")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (brandDNA) {
        setDna(brandDNA);
        setDnaContent(JSON.stringify(brandDNA.dna_content, null, 2));
      } else if (onboardingId) {
        // If no brand DNA exists but we have onboarding data, fetch from onboarding
        const { data: onboardingData, error: onboardingError } = await supabase
          .from("onboarding")
          .select("*")
          .eq("id", onboardingId)
          .single();

        if (onboardingData && !onboardingError) {
          const generatedDNA = generateBrandDNAFromOnboarding(onboardingData);
          setDna({ ...onboardingData, dna_content: generatedDNA });
          setDnaContent(JSON.stringify(generatedDNA, null, 2));
        }
      }
    } catch (error) {
      console.error("Error fetching brand DNA:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le Brand DNA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBrandDNAFromOnboarding = (onboardingData: any): string => {
    // Generate a formatted Brand DNA document from onboarding data
    let dnaText = `# DOCUMENT D'IDENTITÉ BRAND DNA\n\n`;
    dnaText += `**Client :** ${onboardingData.client_name}\n\n`;
    dnaText += `**Date de création :** ${new Date(onboardingData.created_at).toLocaleDateString("fr-FR")}\n\n`;
    dnaText += `---\n\n`;

    // Identité de marque
    if (onboardingData.brand_identity) {
      dnaText += `## IDENTITÉ DE MARQUE\n\n`;
      const bi = onboardingData.brand_identity;
      if (bi.metier_description) dnaText += `**Métier :** ${bi.metier_description}\n\n`;
      if (bi.services && bi.services.length > 0) {
        dnaText += `**Services principaux :**\n${bi.services.map((s: string) => `- ${s}`).join("\n")}\n\n`;
      }
      if (bi.points_forts && bi.points_forts.length > 0) {
        dnaText += `**Points forts :**\n${bi.points_forts.map((p: string) => `- ${p}`).join("\n")}\n\n`;
      }
      if (bi.certifications && bi.certifications.length > 0) {
        dnaText += `**Certifications :**\n${bi.certifications.map((c: string) => `- ${c}`).join("\n")}\n\n`;
      }
      dnaText += `\n`;
    }

    // Clientèle cible
    if (onboardingData.target_audience) {
      dnaText += `## CLIENTÈLE CIBLE\n\n`;
      const ta = onboardingData.target_audience;
      if (ta.persona) {
        dnaText += `### Profil du client idéal\n\n`;
        const p = ta.persona;
        if (p.age_moyen) dnaText += `- Âge moyen : ${p.age_moyen}\n`;
        if (p.situation) dnaText += `- Situation : ${p.situation}\n`;
        if (p.budget_moyen) dnaText += `- Budget moyen : ${p.budget_moyen}\n`;
        if (p.motivations) dnaText += `- Motivations : ${p.motivations}\n`;
        dnaText += `\n`;
      }
      dnaText += `\n`;
    }

    // Google Business Profile
    if (onboardingData.google_business) {
      dnaText += `## GOOGLE BUSINESS PROFILE\n\n`;
      const gb = onboardingData.google_business;
      if (gb.nom_etablissement) dnaText += `**Nom :** ${gb.nom_etablissement}\n\n`;
      if (gb.description_courte) dnaText += `**Description :** ${gb.description_courte}\n\n`;
      dnaText += `\n`;
    }

    // Communication
    if (onboardingData.communication) {
      dnaText += `## TON & COMMUNICATION\n\n`;
      const comm = onboardingData.communication;
      if (comm.perception_souhaitee && comm.perception_souhaitee.length > 0) {
        dnaText += `**Perception souhaitée :** ${comm.perception_souhaitee.join(", ")}\n\n`;
      }
      if (comm.ton_reponses_avis) dnaText += `**Ton des réponses :** ${comm.ton_reponses_avis}\n\n`;
      if (comm.valeurs && comm.valeurs.length > 0) {
        dnaText += `**Valeurs :** ${comm.valeurs.join(", ")}\n\n`;
      }
      dnaText += `\n`;
    }

    return dnaText;
  };

  const handleSave = async () => {
    if (!dnaContent) {
      toast({
        title: "Erreur",
        description: "Le contenu ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Parse JSON if it's JSON, otherwise treat as text
      let parsedContent;
      try {
        parsedContent = JSON.parse(dnaContent);
      } catch {
        parsedContent = dnaContent;
      }

      const { error } = await supabase.from("brand_dna").upsert({
        client_id: clientId,
        onboarding_id: onboardingId || null,
        dna_content: parsedContent,
        version: dna ? dna.version + 1 : 1,
      });

      if (error) throw error;

      toast({
        title: "✅ Brand DNA sauvegardé",
        description: "Le document a été mis à jour avec succès",
      });

      setEditMode(false);
      fetchBrandDNA();
    } catch (error: any) {
      console.error("Error saving brand DNA:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dnaContent);
    toast({
      title: "✅ Copié !",
      description: "Le Brand DNA a été copié dans le presse-papier",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([dnaContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brand-dna-${clientId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "✅ Téléchargé !",
      description: "Le Brand DNA a été téléchargé",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement du Brand DNA...</p>
        </CardContent>
      </Card>
    );
  }

  if (!dna) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Aucun Brand DNA disponible pour ce client
          </p>
          {onboardingId && (
            <Button onClick={fetchBrandDNA}>Générer depuis l'onboarding</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Brand DNA - Document d'Identité</CardTitle>
              <CardDescription>
                Document centralisé utilisable pour vos IAs, stratégies de contenu et réponses aux avis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!editMode && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <Textarea
                value={dnaContent}
                onChange={(e) => setDnaContent(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 p-6 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{dnaContent}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

