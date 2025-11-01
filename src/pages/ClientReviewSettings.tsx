import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSettings, ReviewSettingsFormData } from '@/types/review-system';
import { useEntityType } from '@/hooks/use-entity-type';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Star, 
  Mail, 
  ExternalLink,
  Save,
  Eye,
  Settings2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function ClientReviewSettings() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOrganization } = useEntityType(clientId);
  const [settings, setSettings] = useState<ReviewSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ReviewSettingsFormData>({
    review_platforms: {
      google: { enabled: true, url: '' },
      pages_jaunes: { enabled: false, url: '' },
      trustpilot: { enabled: false, url: '' },
      tripadvisor: { enabled: false, url: '' },
      custom: { enabled: false, url: '', name: '' },
    },
    threshold_score: 4,
    redirect_platform: 'google',
    email_notifications: [],
    slack_webhook: '',
    positive_message: 'Merci pour votre retour positif ! Pourriez-vous partager votre expérience ?',
    negative_message: 'Nous sommes désolés que votre expérience n\'ait pas été à la hauteur. Aidez-nous à nous améliorer.',
    collect_customer_info: true,
    require_email: false,
    is_active: true,
  });
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (clientId) {
      fetchSettings();
    }
  }, [clientId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('review_settings')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
        setFormData({
          review_platforms: data.review_platforms,
          threshold_score: data.threshold_score,
          redirect_platform: data.redirect_platform,
          email_notifications: data.email_notifications || [],
          slack_webhook: data.slack_webhook || '',
          positive_message: data.positive_message,
          negative_message: data.negative_message,
          collect_customer_info: data.collect_customer_info,
          require_email: data.require_email,
          is_active: data.is_active,
        });
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des paramètres');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (settings) {
        // Mise à jour
        const { error } = await supabase
          .from('review_settings')
          .update(formData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('review_settings')
          .insert({
            client_id: clientId,
            ...formData,
          });

        if (error) throw error;
      }

      toast.success('Paramètres enregistrés');
      fetchSettings();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updatePlatform = (platform: keyof typeof formData.review_platforms, field: string, value: any) => {
    setFormData({
      ...formData,
      review_platforms: {
        ...formData.review_platforms,
        [platform]: {
          ...formData.review_platforms[platform],
          [field]: value,
        },
      },
    });
  };

  const addEmail = () => {
    if (!newEmail) return;
    if (!newEmail.includes('@')) {
      toast.error('Email invalide');
      return;
    }
    if (formData.email_notifications.includes(newEmail)) {
      toast.error('Email déjà ajouté');
      return;
    }

    setFormData({
      ...formData,
      email_notifications: [...formData.email_notifications, newEmail],
    });
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setFormData({
      ...formData,
      email_notifications: formData.email_notifications.filter((e) => e !== email),
    });
  };

  const previewUrl = settings 
    ? `${window.location.origin}/review/${clientId}` 
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(isOrganization ? `/organizations/${clientId}` : `/clients/${clientId}`)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Configuration des Avis</h1>
          <p className="text-muted-foreground mt-1">
            Configurez le funnel d'avis et les plateformes de redirection
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={() => navigate(isOrganization ? `/organizations/${clientId}/funnel-content` : `/clients/${clientId}/funnel-content`)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Étape Suivante
          </Button>
          {settings && (
            <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              Prévisualiser
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activation */}
        <Card>
          <CardHeader>
            <CardTitle>Activation du système</CardTitle>
            <CardDescription>
              Activez ou désactivez le funnel d'avis pour ce client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>
                {formData.is_active ? 'Actif' : 'Inactif'}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Seuil d'avis */}
        <Card>
          <CardHeader>
            <CardTitle>Seuil d'avis positif</CardTitle>
            <CardDescription>
              Définissez le score minimum pour considérer un avis comme positif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="min-w-fit">Score minimum :</Label>
                <Select
                  value={formData.threshold_score.toString()}
                  onValueChange={(value) => setFormData({ ...formData, threshold_score: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 étoiles</SelectItem>
                    <SelectItem value="4">4 étoiles</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Les avis en dessous de ce seuil seront collectés en privé
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plateformes d'avis */}
        <Card>
          <CardHeader>
            <CardTitle>Plateformes d'avis</CardTitle>
            <CardDescription>
              Configurez les plateformes où rediriger les avis positifs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">Google Business Profile</Label>
                <Switch
                  checked={formData.review_platforms.google.enabled}
                  onCheckedChange={(checked) => updatePlatform('google', 'enabled', checked)}
                />
              </div>
              {formData.review_platforms.google.enabled && (
                <Input
                  placeholder="https://g.page/r/..."
                  value={formData.review_platforms.google.url}
                  onChange={(e) => updatePlatform('google', 'url', e.target.value)}
                />
              )}
            </div>

            <Separator />

            {/* Pages Jaunes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">Pages Jaunes</Label>
                <Switch
                  checked={formData.review_platforms.pages_jaunes.enabled}
                  onCheckedChange={(checked) => updatePlatform('pages_jaunes', 'enabled', checked)}
                />
              </div>
              {formData.review_platforms.pages_jaunes.enabled && (
                <Input
                  placeholder="https://www.pagesjaunes.fr/..."
                  value={formData.review_platforms.pages_jaunes.url}
                  onChange={(e) => updatePlatform('pages_jaunes', 'url', e.target.value)}
                />
              )}
            </div>

            <Separator />

            {/* Trustpilot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">Trustpilot</Label>
                <Switch
                  checked={formData.review_platforms.trustpilot.enabled}
                  onCheckedChange={(checked) => updatePlatform('trustpilot', 'enabled', checked)}
                />
              </div>
              {formData.review_platforms.trustpilot.enabled && (
                <Input
                  placeholder="https://www.trustpilot.com/review/..."
                  value={formData.review_platforms.trustpilot.url}
                  onChange={(e) => updatePlatform('trustpilot', 'url', e.target.value)}
                />
              )}
            </div>

            <Separator />

            {/* TripAdvisor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">TripAdvisor</Label>
                <Switch
                  checked={formData.review_platforms.tripadvisor.enabled}
                  onCheckedChange={(checked) => updatePlatform('tripadvisor', 'enabled', checked)}
                />
              </div>
              {formData.review_platforms.tripadvisor.enabled && (
                <Input
                  placeholder="https://www.tripadvisor.com/..."
                  value={formData.review_platforms.tripadvisor.url}
                  onChange={(e) => updatePlatform('tripadvisor', 'url', e.target.value)}
                />
              )}
            </div>

            <Separator />

            {/* Plateforme personnalisée */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">Plateforme personnalisée</Label>
                <Switch
                  checked={formData.review_platforms.custom.enabled}
                  onCheckedChange={(checked) => updatePlatform('custom', 'enabled', checked)}
                />
              </div>
              {formData.review_platforms.custom.enabled && (
                <div className="space-y-2">
                  <Input
                    placeholder="Nom de la plateforme"
                    value={formData.review_platforms.custom.name}
                    onChange={(e) => updatePlatform('custom', 'name', e.target.value)}
                  />
                  <Input
                    placeholder="URL de redirection"
                    value={formData.review_platforms.custom.url}
                    onChange={(e) => updatePlatform('custom', 'url', e.target.value)}
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Plateforme par défaut */}
            <div className="space-y-2">
              <Label>Plateforme de redirection par défaut</Label>
              <Select
                value={formData.redirect_platform}
                onValueChange={(value: any) => setFormData({ ...formData, redirect_platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.review_platforms.google.enabled && (
                    <SelectItem value="google">Google</SelectItem>
                  )}
                  {formData.review_platforms.pages_jaunes.enabled && (
                    <SelectItem value="pages_jaunes">Pages Jaunes</SelectItem>
                  )}
                  {formData.review_platforms.trustpilot.enabled && (
                    <SelectItem value="trustpilot">Trustpilot</SelectItem>
                  )}
                  {formData.review_platforms.tripadvisor.enabled && (
                    <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  )}
                  {formData.review_platforms.custom.enabled && (
                    <SelectItem value="custom">{formData.review_platforms.custom.name || 'Personnalisée'}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages personnalisés */}
        <Card>
          <CardHeader>
            <CardTitle>Messages personnalisés</CardTitle>
            <CardDescription>
              Personnalisez les messages affichés aux clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Message pour avis positif</Label>
              <Textarea
                value={formData.positive_message}
                onChange={(e) => setFormData({ ...formData, positive_message: e.target.value })}
                rows={3}
                placeholder="Merci pour votre retour positif..."
              />
            </div>

            <div className="space-y-2">
              <Label>Message pour avis négatif</Label>
              <Textarea
                value={formData.negative_message}
                onChange={(e) => setFormData({ ...formData, negative_message: e.target.value })}
                rows={3}
                placeholder="Nous sommes désolés..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications par email */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications par email</CardTitle>
            <CardDescription>
              Recevez les avis négatifs par email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
              />
              <Button type="button" onClick={addEmail}>
                Ajouter
              </Button>
            </div>

            {formData.email_notifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.email_notifications.map((email) => (
                  <Badge key={email} variant="secondary" className="cursor-pointer" onClick={() => removeEmail(email)}>
                    {email} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options de collecte */}
        <Card>
          <CardHeader>
            <CardTitle>Options de collecte</CardTitle>
            <CardDescription>
              Configurez les informations à collecter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Collecter les informations du client</Label>
                <p className="text-sm text-muted-foreground">
                  Nom, email, téléphone
                </p>
              </div>
              <Switch
                checked={formData.collect_customer_info}
                onCheckedChange={(checked) => setFormData({ ...formData, collect_customer_info: checked })}
              />
            </div>

            {formData.collect_customer_info && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email obligatoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Rendre l'email obligatoire pour les avis négatifs
                  </p>
                </div>
                <Switch
                  checked={formData.require_email}
                  onCheckedChange={(checked) => setFormData({ ...formData, require_email: checked })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lien de partage */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle>Lien du funnel d'avis</CardTitle>
              <CardDescription>
                Partagez ce lien avec vos clients pour collecter des avis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={previewUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(previewUrl);
                    toast.success('Lien copié');
                  }}
                >
                  Copier
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

