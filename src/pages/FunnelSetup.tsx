import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Upload, X, Save } from "lucide-react";
import { ReviewFunnelConfig, ClientWithLogo } from "@/types/funnel-config";
import { uploadClientLogo, deleteClientLogo } from "@/lib/logoService";

export default function FunnelSetup() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<ClientWithLogo | null>(null);
  const [config, setConfig] = useState<Partial<ReviewFunnelConfig>>({
    funnel_enabled: true,
    rating_threshold: 4,
    show_logo: true,
    show_company_name: true,
    custom_url_slug: '',
  });
  
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name, company, logo_url')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Load funnel config
      const { data: configData, error: configError } = await supabase
        .from('review_funnel_config')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (configData) {
        setConfig(configData);
      } else {
        // Initialize default config
        const defaultSlug = `${clientData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substr(2, 8)}`;
        setConfig({
          ...config,
          custom_url_slug: defaultSlug,
        });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;

    setUploadingLogo(true);
    const result = await uploadClientLogo(file, clientId);
    
    if (result.success && result.url) {
      setClient(prev => prev ? { ...prev, logo_url: result.url } : null);
      toast.success('Logo uploadé avec succès');
    } else {
      toast.error(result.error || 'Erreur d\'upload');
    }
    
    setUploadingLogo(false);
  };

  const handleLogoDelete = async () => {
    if (!client?.logo_url || !clientId) return;

    const confirmed = window.confirm('Voulez-vous vraiment supprimer ce logo ?');
    if (!confirmed) return;

    const success = await deleteClientLogo(clientId, client.logo_url);
    if (success) {
      setClient(prev => prev ? { ...prev, logo_url: undefined } : null);
      toast.success('Logo supprimé');
    } else {
      toast.error('Erreur de suppression');
    }
  };

  const handleSave = async () => {
    if (!clientId) return;

    try {
      setSaving(true);

      const { data: existing } = await supabase
        .from('review_funnel_config')
        .select('id')
        .eq('client_id', clientId)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('review_funnel_config')
          .update({
            funnel_enabled: config.funnel_enabled,
            rating_threshold: config.rating_threshold,
            show_logo: config.show_logo,
            show_company_name: config.show_company_name,
            custom_url_slug: config.custom_url_slug,
          })
          .eq('client_id', clientId);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('review_funnel_config')
          .insert({
            client_id: clientId,
            funnel_enabled: config.funnel_enabled,
            rating_threshold: config.rating_threshold,
            show_logo: config.show_logo,
            show_company_name: config.show_company_name,
            custom_url_slug: config.custom_url_slug,
          });

        if (error) throw error;
      }

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
    navigate(`/clients/${clientId}/funnel-content`);
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
          onClick={() => navigate(`/clients/${clientId}/review-settings`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <h1 className="text-3xl font-bold">Configuration du Funnel d'Avis</h1>
        <p className="text-muted-foreground mt-2">
          Client: <span className="font-semibold">{client?.company || client?.name}</span>
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
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Note seuil</Label>
                    <span className="text-2xl font-bold text-primary">
                      ≤ {config.rating_threshold}/5
                    </span>
                  </div>
                  
                  <Slider
                    value={[config.rating_threshold || 4]}
                    onValueChange={([value]) =>
                      setConfig({ ...config, rating_threshold: value })
                    }
                    min={1}
                    max={4}
                    step={1}
                    className="mb-2"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 étoile</span>
                    <span>2 étoiles</span>
                    <span>3 étoiles</span>
                    <span>4 étoiles</span>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Comportement :</p>
                  <p className="text-sm text-muted-foreground">
                    • Note ≤ {config.rating_threshold} → <span className="font-semibold">Feedback privé</span> (collecté en interne)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Note {Number(config.rating_threshold) + 1}-5 → <span className="font-semibold">Redirection publique</span> (Google, Pages Jaunes, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Logo de l'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle>Logo de l'Entreprise</CardTitle>
                <CardDescription>
                  Ajoutez et gérez le logo qui apparaîtra sur la page de collecte d'avis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current logo */}
                {client?.logo_url && (
                  <div className="relative inline-block">
                    <img
                      src={client.logo_url}
                      alt="Logo"
                      className="h-32 w-auto object-contain border rounded-lg p-4"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2"
                      onClick={handleLogoDelete}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload button */}
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium">
                        {client?.logo_url ? 'Remplacer le logo' : 'Ajouter un logo'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, SVG ou WEBP (max 2MB)
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </div>

                {/* Display logo option */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label htmlFor="show-logo" className="text-base">
                      Afficher le logo
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Le logo sera centré en haut de la page
                    </p>
                  </div>
                  <Switch
                    id="show-logo"
                    checked={config.show_logo}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, show_logo: checked })
                    }
                    disabled={!client?.logo_url}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Nom de l'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle>Nom de l'Entreprise</CardTitle>
                <CardDescription>
                  Personnalisez l'affichage du nom de l'entreprise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-company" className="text-base">
                      Afficher le nom de l'entreprise
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {client?.company || client?.name}
                    </p>
                  </div>
                  <Switch
                    id="show-company"
                    checked={config.show_company_name}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, show_company_name: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* URL personnalisée */}
            <Card>
              <CardHeader>
                <CardTitle>URL Personnalisée</CardTitle>
                <CardDescription>
                  Personnalisez l'URL publique de votre funnel d'avis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-slug">Slug personnalisé</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">
                      {window.location.origin}/review/
                    </span>
                    <Input
                      id="custom-slug"
                      value={config.custom_url_slug || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          custom_url_slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      placeholder="mon-entreprise"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Lien final: {window.location.origin}/review/{config.custom_url_slug}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>

          <Button
            onClick={handleNext}
            disabled={saving || !config.funnel_enabled}
          >
            Étape suivante
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

