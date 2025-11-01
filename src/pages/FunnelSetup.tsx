import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEntityType } from "@/hooks/use-entity-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

interface FunnelConfig {
  funnel_enabled: boolean;
  rating_threshold: number;
  show_logo: boolean;
  show_company_name: boolean;
  custom_url_slug: string;
}

export default function FunnelSetup() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { isOrganization, loading: entityTypeLoading } = useEntityType(clientId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [config, setConfig] = useState<FunnelConfig>({
    funnel_enabled: true,
    rating_threshold: 4,
    show_logo: true,
    show_company_name: true,
    custom_url_slug: '',
  });

  // Load data once when component mounts
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!clientId || entityTypeLoading || !mounted) return;

      try {
        setLoading(true);

        // Load client/organization
        let clientData: any = null;
        
        if (isOrganization) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, legal_name, commercial_name')
            .eq('id', clientId)
            .single();

          if (!orgError && orgData) {
            clientData = {
              id: orgData.id,
              name: orgData.commercial_name || orgData.legal_name,
            };
          }
        } else {
          const { data: clientDataFromDb, error: clientError } = await supabase
            .from('clients')
            .select('id, name, company')
            .eq('id', clientId)
            .single();

          if (!clientError && clientDataFromDb) {
            clientData = {
              id: clientDataFromDb.id,
              name: clientDataFromDb.company || clientDataFromDb.name,
            };
          }
        }

        if (!clientData) {
          toast.error('Client/Organization introuvable');
          return;
        }
        
        setClient(clientData);

        // Load funnel config
        const { data: configData, error: configError } = await supabase
          .from('review_funnel_config')
          .select('*')
          .eq('client_id', clientId)
          .single();

        if (configError && configError.code !== 'PGRST116') {
          console.error('Error loading config:', configError);
        }

        if (configData && mounted) {
          setConfig({
            funnel_enabled: configData.funnel_enabled ?? true,
            rating_threshold: configData.rating_threshold ?? 4,
            show_logo: configData.show_logo ?? true,
            show_company_name: configData.show_company_name ?? true,
            custom_url_slug: configData.custom_url_slug ?? '',
          });
        } else if (mounted) {
          // Initialize default config
          const defaultSlug = `${clientData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substr(2, 8)}`;
          setConfig({
            funnel_enabled: true,
            rating_threshold: 4,
            show_logo: true,
            show_company_name: true,
            custom_url_slug: defaultSlug,
          });
        }

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erreur de chargement');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [clientId, isOrganization, entityTypeLoading]);

  const handleSave = async () => {
    if (!clientId) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('review_funnel_config')
        .upsert({
          client_id: clientId,
          funnel_enabled: config.funnel_enabled,
          rating_threshold: config.rating_threshold,
          show_logo: config.show_logo,
          show_company_name: config.show_company_name,
          custom_url_slug: config.custom_url_slug,
        }, {
          onConflict: 'client_id'
        });

      if (error) throw error;

      toast.success('Configuration sauvegardée');
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    navigate(isOrganization ? `/organizations/${clientId}/funnel-content` : `/clients/${clientId}/funnel-content`);
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
        
        <h1 className="text-3xl font-bold">Configuration du Funnel d'Avis</h1>
        <p className="text-muted-foreground mt-2">
          Client: <span className="font-semibold">{client?.name}</span>
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-primary rounded-full"></div>
          <div className="flex-1 h-2 bg-muted rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">Étape 1/2 - Setup</p>
      </div>

      <div className="space-y-6">
        {/* Activation du funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Activation du Funnel</CardTitle>
            <CardDescription>
              Activez ou désactivez le système de collecte d'avis pour ce client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="funnel-enabled" className="text-base">
                  Funnel d'avis activé
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Les liens de scan redirigeront vers le funnel d'avis
                </p>
              </div>
              <Switch
                id="funnel-enabled"
                checked={config.funnel_enabled}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, funnel_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {config.funnel_enabled && (
          <>
            {/* Seuil de filtrage */}
            <Card>
              <CardHeader>
                <CardTitle>Seuil de Filtrage des Avis</CardTitle>
                <CardDescription>
                  Définissez à partir de quelle note les avis sont considérés comme négatifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Note minimum pour avis positif</Label>
                      <span className="text-primary font-semibold">{config.rating_threshold} ⭐</span>
                    </div>
                    <Slider
                      value={[config.rating_threshold]}
                      onValueChange={([value]) => setConfig({ ...config, rating_threshold: value })}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>1 ⭐ (tous négatifs)</span>
                      <span>5 ⭐ (très sélectif)</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Les avis {config.rating_threshold} étoiles et moins seront collectés en privé.
                    Les avis {config.rating_threshold + 1} étoiles et plus seront redirigés vers une plateforme publique.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personnalisation visuelle */}
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation Visuelle</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence du funnel d'avis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-logo">Afficher le logo</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Afficher le logo de l'entreprise sur le funnel
                    </p>
                  </div>
                  <Switch
                    id="show-logo"
                    checked={config.show_logo}
                    onCheckedChange={(checked) => setConfig({ ...config, show_logo: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-name">Afficher le nom de l'entreprise</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Afficher le nom de l'entreprise sur le funnel
                    </p>
                  </div>
                  <Switch
                    id="show-name"
                    checked={config.show_company_name}
                    onCheckedChange={(checked) => setConfig({ ...config, show_company_name: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* URL Personnalisée */}
            <Card>
              <CardHeader>
                <CardTitle>URL Personnalisée</CardTitle>
                <CardDescription>
                  Personnalisez l'URL du funnel d'avis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="url-slug">Slug d'URL</Label>
                    <Input
                      id="url-slug"
                      value={config.custom_url_slug}
                      onChange={(e) => setConfig({ ...config, custom_url_slug: e.target.value })}
                      placeholder="mon-entreprise-avis"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      L'URL finale sera : <code className="bg-muted px-1 rounded">/review/{config.custom_url_slug || 'slug'}</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </Button>
        <Button
          onClick={handleNext}
          disabled={saving || !config.funnel_enabled}
        >
          Suivant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
