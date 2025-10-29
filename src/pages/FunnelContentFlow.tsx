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
import {
  ReviewFunnelConfig,
  InitialPageConfig,
  NegativeReviewConfig,
  PositiveReviewConfig,
  MultiplatformConfig,
  ThankYouPageConfig,
} from "@/types/funnel-config";

export default function FunnelContentFlow() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Partial<ReviewFunnelConfig> | null>(null);

  const [initialPageConfig, setInitialPageConfig] = useState<InitialPageConfig>({
    title: "Comment nous évalueriez-vous ?",
    description: "Merci de prendre un moment pour évaluer votre expérience avec nous. Votre retour nous aide non seulement, mais il aide aussi d'autres clients potentiels.",
  });

  const [negativeConfig, setNegativeConfig] = useState<NegativeReviewConfig>({
    title: "Aidez-nous à nous améliorer",
    description: "Nous sommes désolés que votre expérience n'ait pas été à la hauteur. Pourriez-vous nous en dire plus ?",
    comment_placeholder: "Décrivez votre expérience...",
    submit_button_text: "Envoyer mon retour",
    require_email: false,
    require_name: false,
    require_phone: false,
  });

  const [positiveConfig, setPositiveConfig] = useState<PositiveReviewConfig>({
    redirect_mode: 'single',
    primary_platform: 'google',
    platforms: {
      google: { enabled: true, url: '', name: 'Google' },
      pages_jaunes: { enabled: false, url: '', name: 'Pages Jaunes' },
      trustpilot: { enabled: false, url: '', name: 'Trustpilot' },
      tripadvisor: { enabled: false, url: '', name: 'TripAdvisor' },
      facebook: { enabled: false, url: '', name: 'Facebook' },
      yelp: { enabled: false, url: '', name: 'Yelp' },
    },
  });

  const [multiplatformConfig, setMultiplatformConfig] = useState<MultiplatformConfig>({
    enabled: false,
    title: "Partagez votre expérience",
    description: "Choisissez les plateformes sur lesquelles vous souhaitez laisser votre avis. Cela nous aide énormément !",
    min_platforms: 1,
    show_platform_icons: true,
  });

  const [thankYouConfig, setThankYouConfig] = useState<ThankYouPageConfig>({
    title: "Merci pour votre retour",
    message: "Votre retour a été reçu et un membre de notre équipe support client vous contactera sous peu.",
    show_logo: true,
    show_company_name: true,
    redirect_delay_seconds: 0,
    redirect_url: "",
  });

  useEffect(() => {
    if (clientId) {
      loadConfig();
    }
  }, [clientId]);

  const loadConfig = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('review_funnel_config')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
        
        // Load existing configs
        if (data.initial_page_config) {
          setInitialPageConfig(data.initial_page_config as InitialPageConfig);
        }
        if (data.negative_review_config) {
          setNegativeConfig(data.negative_review_config as NegativeReviewConfig);
        }
        if (data.positive_review_config) {
          setPositiveConfig(data.positive_review_config as PositiveReviewConfig);
        }
        if (data.multiplatform_config) {
          setMultiplatformConfig(data.multiplatform_config as MultiplatformConfig);
        }
        if (data.thank_you_page_config) {
          setThankYouConfig(data.thank_you_page_config as ThankYouPageConfig);
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!clientId) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('review_funnel_config')
        .update({
          initial_page_config: initialPageConfig,
          negative_review_config: negativeConfig,
          positive_review_config: positiveConfig,
          multiplatform_config: multiplatformConfig,
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

  const handlePreview = () => {
    // Open preview in new tab
    const previewUrl = `/review/${config?.custom_url_slug || clientId}?preview=true`;
    window.open(previewUrl, '_blank');
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
          onClick={() => navigate(`/clients/${clientId}/funnel-setup`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold">Contenu et Flux</h1>
        <p className="text-muted-foreground mt-2">
          Personnalisez les messages et le parcours de vos clients
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-primary rounded-full"></div>
          <div className="flex-1 h-2 bg-primary rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">Étape 2/2 - Contenu et flux</p>
      </div>

      <div className="space-y-6">
        {/* Page d'évaluation initiale */}
        <Card>
          <CardHeader>
            <CardTitle>Page d'Évaluation Initiale</CardTitle>
            <CardDescription>
              Premier écran vu par vos clients - collecte de la note
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="initial-title">Titre</Label>
              <Input
                id="initial-title"
                value={initialPageConfig.title}
                onChange={(e) =>
                  setInitialPageConfig({ ...initialPageConfig, title: e.target.value })
                }
                placeholder="Comment nous évalueriez-vous ?"
              />
            </div>

            <div>
              <Label htmlFor="initial-description">Description</Label>
              <Textarea
                id="initial-description"
                value={initialPageConfig.description}
                onChange={(e) =>
                  setInitialPageConfig({ ...initialPageConfig, description: e.target.value })
                }
                placeholder="Message d'accueil pour vos clients..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Avis Négatifs */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration des Avis Négatifs</CardTitle>
            <CardDescription>
              Messages et champs pour collecter les retours négatifs en privé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="negative-title">Titre</Label>
              <Input
                id="negative-title"
                value={negativeConfig.title}
                onChange={(e) =>
                  setNegativeConfig({ ...negativeConfig, title: e.target.value })
                }
                placeholder="Aidez-nous à nous améliorer"
              />
            </div>

            <div>
              <Label htmlFor="negative-description">Description</Label>
              <Textarea
                id="negative-description"
                value={negativeConfig.description}
                onChange={(e) =>
                  setNegativeConfig({ ...negativeConfig, description: e.target.value })
                }
                placeholder="Message pour les clients insatisfaits..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="comment-placeholder">Placeholder du commentaire</Label>
              <Input
                id="comment-placeholder"
                value={negativeConfig.comment_placeholder}
                onChange={(e) =>
                  setNegativeConfig({ ...negativeConfig, comment_placeholder: e.target.value })
                }
                placeholder="Décrivez votre expérience..."
              />
            </div>

            <div>
              <Label htmlFor="submit-button">Texte du bouton</Label>
              <Input
                id="submit-button"
                value={negativeConfig.submit_button_text}
                onChange={(e) =>
                  setNegativeConfig({ ...negativeConfig, submit_button_text: e.target.value })
                }
                placeholder="Envoyer mon retour"
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <p className="font-medium text-sm">Champs requis</p>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="require-name">Nom obligatoire</Label>
                <Switch
                  id="require-name"
                  checked={negativeConfig.require_name}
                  onCheckedChange={(checked) =>
                    setNegativeConfig({ ...negativeConfig, require_name: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-email">Email obligatoire</Label>
                <Switch
                  id="require-email"
                  checked={negativeConfig.require_email}
                  onCheckedChange={(checked) =>
                    setNegativeConfig({ ...negativeConfig, require_email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-phone">Téléphone obligatoire</Label>
                <Switch
                  id="require-phone"
                  checked={negativeConfig.require_phone}
                  onCheckedChange={(checked) =>
                    setNegativeConfig({ ...negativeConfig, require_phone: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avis Positifs - Plateformes */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration des Avis Positifs</CardTitle>
            <CardDescription>
              Définissez où rediriger vos clients satisfaits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="font-medium text-sm">Plateformes disponibles</p>
              
              {Object.entries(positiveConfig.platforms).map(([key, platform]) => (
                <div key={key} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`platform-${key}`} className="capitalize">
                      {platform.name}
                    </Label>
                    <Switch
                      id={`platform-${key}`}
                      checked={platform.enabled}
                      onCheckedChange={(checked) =>
                        setPositiveConfig({
                          ...positiveConfig,
                          platforms: {
                            ...positiveConfig.platforms,
                            [key]: { ...platform, enabled: checked },
                          },
                        })
                      }
                    />
                  </div>

                  {platform.enabled && (
                    <Input
                      value={platform.url}
                      onChange={(e) =>
                        setPositiveConfig({
                          ...positiveConfig,
                          platforms: {
                            ...positiveConfig.platforms,
                            [key]: { ...platform, url: e.target.value },
                          },
                        })
                      }
                      placeholder={`URL ${platform.name} (ex: https://g.page/...)`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Label htmlFor="primary-platform">Plateforme principale (par défaut)</Label>
              <select
                id="primary-platform"
                className="w-full mt-2 px-3 py-2 border rounded-md"
                value={positiveConfig.primary_platform}
                onChange={(e) =>
                  setPositiveConfig({
                    ...positiveConfig,
                    primary_platform: e.target.value as any,
                  })
                }
              >
                {Object.entries(positiveConfig.platforms)
                  .filter(([_, platform]) => platform.enabled)
                  .map(([key, platform]) => (
                    <option key={key} value={key}>
                      {platform.name}
                    </option>
                  ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Multi-plateformes */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection Multi-Plateformes</CardTitle>
            <CardDescription>
              Permettez aux clients de laisser leur avis sur plusieurs plateformes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="multiplatform-enabled" className="text-base">
                  Activer la sélection multi-plateformes
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Afficher une page intermédiaire pour choisir les plateformes
                </p>
              </div>
              <Switch
                id="multiplatform-enabled"
                checked={multiplatformConfig.enabled}
                onCheckedChange={(checked) =>
                  setMultiplatformConfig({ ...multiplatformConfig, enabled: checked })
                }
              />
            </div>

            {multiplatformConfig.enabled && (
              <>
                <div>
                  <Label htmlFor="multi-title">Titre</Label>
                  <Input
                    id="multi-title"
                    value={multiplatformConfig.title}
                    onChange={(e) =>
                      setMultiplatformConfig({ ...multiplatformConfig, title: e.target.value })
                    }
                    placeholder="Partagez votre expérience"
                  />
                </div>

                <div>
                  <Label htmlFor="multi-description">Description</Label>
                  <Textarea
                    id="multi-description"
                    value={multiplatformConfig.description}
                    onChange={(e) =>
                      setMultiplatformConfig({ ...multiplatformConfig, description: e.target.value })
                    }
                    placeholder="Message pour encourager le partage..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="min-platforms">Nombre minimum de plateformes</Label>
                  <Input
                    id="min-platforms"
                    type="number"
                    min={1}
                    max={6}
                    value={multiplatformConfig.min_platforms}
                    onChange={(e) =>
                      setMultiplatformConfig({
                        ...multiplatformConfig,
                        min_platforms: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Page de remerciement */}
        <Card>
          <CardHeader>
            <CardTitle>Page de Remerciement</CardTitle>
            <CardDescription>
              Affichée après l'envoi d'un avis négatif
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="thankyou-title">Titre</Label>
              <Input
                id="thankyou-title"
                value={thankYouConfig.title}
                onChange={(e) =>
                  setThankYouConfig({ ...thankYouConfig, title: e.target.value })
                }
                placeholder="Merci pour votre retour"
              />
            </div>

            <div>
              <Label htmlFor="thankyou-message">Message</Label>
              <Textarea
                id="thankyou-message"
                value={thankYouConfig.message}
                onChange={(e) =>
                  setThankYouConfig({ ...thankYouConfig, message: e.target.value })
                }
                placeholder="Message de remerciement..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="thankyou-logo">Afficher le logo</Label>
                <Switch
                  id="thankyou-logo"
                  checked={thankYouConfig.show_logo}
                  onCheckedChange={(checked) =>
                    setThankYouConfig({ ...thankYouConfig, show_logo: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="thankyou-company">Afficher le nom</Label>
                <Switch
                  id="thankyou-company"
                  checked={thankYouConfig.show_company_name}
                  onCheckedChange={(checked) =>
                    setThankYouConfig({ ...thankYouConfig, show_company_name: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handlePreview}
          >
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}

