import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";

export default function FunnelContentFlow() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isOrganization, setIsOrganization] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const [initialPageConfig, setInitialPageConfig] = useState({
    title: "Comment nous évalueriez-vous ?",
    description: "Merci de prendre un moment pour évaluer votre expérience avec nous.",
  });

  const [negativeConfig, setNegativeConfig] = useState({
    title: "Aidez-nous à nous améliorer",
    description: "Nous sommes désolés que votre expérience n'ait pas été à la hauteur.",
    comment_placeholder: "Décrivez votre expérience...",
    submit_button_text: "Envoyer mon retour",
    require_email: false,
    require_name: false,
    require_phone: false,
  });

  const [thankYouConfig, setThankYouConfig] = useState({
    title: "Merci pour votre retour",
    message: "Votre retour a été reçu et un membre de notre équipe support client vous contactera sous peu.",
  });

  useEffect(() => {
    if (!clientId) return;

    let mounted = true;

    const loadConfig = async () => {
      try {
        setLoading(true);

        // Check if it's an organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('id', clientId)
          .single();

        if (!orgError && orgData) {
          setIsOrganization(true);
        }

        const { data, error } = await supabase
          .from('review_funnel_config')
          .select('*')
          .eq('client_id', clientId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading config:', error);
          if (mounted) {
            toast.error('Erreur de chargement');
          }
          return;
        }

        if (data && mounted) {
          setConfig(data);
          
          if (data.initial_page_config) {
            setInitialPageConfig(data.initial_page_config);
          }
          if (data.negative_review_config) {
            setNegativeConfig(data.negative_review_config);
          }
          if (data.thank_you_page_config) {
            setThankYouConfig(data.thank_you_page_config);
          }
        }
      } catch (error) {
        console.error('Error loading config:', error);
        if (mounted) {
          toast.error('Erreur de chargement');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      mounted = false;
    };
  }, [clientId]);

  const handleSave = async () => {
    if (!clientId) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('review_funnel_config')
        .update({
          initial_page_config: initialPageConfig,
          negative_review_config: negativeConfig,
          thank_you_page_config: thankYouConfig,
        })
        .eq('client_id', clientId);

      if (error) throw error;

      toast.success('Configuration sauvegardée');
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(isOrganization ? `/organizations/${clientId}` : `/clients/${clientId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <h1 className="text-3xl font-bold">Configuration du Contenu</h1>
        <p className="text-muted-foreground mt-2">
          Personnalisez les messages du funnel d'avis
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-muted rounded-full"></div>
          <div className="flex-1 h-2 bg-primary rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">Étape 2/2 - Contenu</p>
      </div>

      <div className="space-y-6">
        {/* Page Initiale */}
        <Card>
          <CardHeader>
            <CardTitle>Page Initiale</CardTitle>
            <CardDescription>
              Message affiché lors de l'arrivée sur le funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={initialPageConfig.title}
                onChange={(e) => setInitialPageConfig({ ...initialPageConfig, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={initialPageConfig.description}
                onChange={(e) => setInitialPageConfig({ ...initialPageConfig, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Avis Négatif */}
        <Card>
          <CardHeader>
            <CardTitle>Avis Négatif</CardTitle>
            <CardDescription>
              Message affiché pour les avis négatifs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={negativeConfig.title}
                onChange={(e) => setNegativeConfig({ ...negativeConfig, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={negativeConfig.description}
                onChange={(e) => setNegativeConfig({ ...negativeConfig, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Placeholder du commentaire</Label>
              <Input
                value={negativeConfig.comment_placeholder}
                onChange={(e) => setNegativeConfig({ ...negativeConfig, comment_placeholder: e.target.value })}
              />
            </div>
            <div>
              <Label>Texte du bouton</Label>
              <Input
                value={negativeConfig.submit_button_text}
                onChange={(e) => setNegativeConfig({ ...negativeConfig, submit_button_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Page de Remerciement */}
        <Card>
          <CardHeader>
            <CardTitle>Page de Remerciement</CardTitle>
            <CardDescription>
              Message affiché après soumission d'un avis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={thankYouConfig.title}
                onChange={(e) => setThankYouConfig({ ...thankYouConfig, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={thankYouConfig.message}
                onChange={(e) => setThankYouConfig({ ...thankYouConfig, message: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </Button>
        <Button
          onClick={() => navigate(isOrganization ? `/organizations/${clientId}` : `/clients/${clientId}`)}
        >
          Terminer
        </Button>
      </div>
    </div>
  );
}
