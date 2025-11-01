import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReviewFunnelConfig, ClientWithLogo } from '@/types/funnel-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Star, Loader2, CheckCircle, Send } from 'lucide-react';

type Step = 'rating' | 'negative' | 'multiplatform' | 'thank_you';

export default function ReviewFunnel() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employee');
  const previewMode = searchParams.get('preview') === 'true';

  const [config, setConfig] = useState<ReviewFunnelConfig | null>(null);
  const [client, setClient] = useState<ClientWithLogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('rating');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (clientId) {
      fetchConfig();
    }
  }, [clientId]);

  const fetchConfig = async () => {
    try {
      // Try organizations first
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, legal_name, commercial_name, logo_url')
        .eq('id', clientId)
        .single();

      if (!orgError && orgData) {
        setClient({
          id: orgData.id,
          name: orgData.commercial_name || orgData.legal_name,
          company: orgData.commercial_name || orgData.legal_name,
          logo_url: orgData.logo_url
        });
      } else {
        // Fallback to clients
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, name, company, logo_url')
          .eq('id', clientId)
          .single();

        if (!clientError && clientData) {
          setClient(clientData);
        }
      }

      // Fetch funnel config
      const { data: configData, error: configError } = await supabase
        .from('review_funnel_config')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      setConfig(configData);
    } catch (error: any) {
      console.error('Error fetching config:', error);
      toast.error('Configuration non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    
    setTimeout(() => {
      if (config) {
        if (value <= config.rating_threshold) {
          // Negative review - collect feedback
          setStep('negative');
        } else {
          // Positive review - check if multiplatform is enabled
          const multiConfig = config.multiplatform_config as any;
          if (multiConfig?.enabled) {
            setStep('multiplatform');
          } else {
            // Redirect directly to primary platform
            handlePositiveRedirect();
          }
        }
      }
    }, 500);
  };

  const handleNegativeSubmit = async () => {
    if (!config) return;

    const negativeConfig = config.negative_review_config as any;

    if (negativeConfig?.require_email && !customerEmail) {
      toast.error('L\'email est obligatoire');
      return;
    }

    if (negativeConfig?.require_name && !customerName) {
      toast.error('Le nom est obligatoire');
      return;
    }

    if (negativeConfig?.require_phone && !customerPhone) {
      toast.error('Le téléphone est obligatoire');
      return;
    }

    setSubmitting(true);

    try {
      if (!previewMode) {
        const { error } = await supabase
          .from('negative_reviews')
          .insert({
            client_id: clientId,
            employee_id: employeeId || null,
            rating,
            comment: comment || null,
            customer_name: customerName || null,
            customer_email: customerEmail || null,
            customer_phone: customerPhone || null,
            source: employeeId ? 'qr' : 'web',
            user_agent: navigator.userAgent,
          });

        if (error) throw error;
      }

      setStep('thank_you');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePositiveRedirect = async (platformKey?: string) => {
    if (!config) return;

    setSubmitting(true);

    try {
      const positiveConfig = config.positive_review_config as any;
      const targetPlatform = platformKey || positiveConfig?.primary_platform || 'google';
      const platformUrl = positiveConfig?.platforms?.[targetPlatform]?.url || '';

      if (!platformUrl) {
        toast.error('URL de redirection non configurée');
        setSubmitting(false);
        return;
      }

      // Enregistrer la redirection (skip in preview mode)
      if (!previewMode) {
        const { error } = await supabase
          .from('positive_review_redirects')
          .insert({
            client_id: clientId,
            employee_id: employeeId || null,
            rating,
            platform: targetPlatform,
            user_agent: navigator.userAgent,
          });

        if (error) throw error;
      }

      // Redirect
      if (!previewMode) {
        window.location.href = platformUrl;
      } else {
        toast.info(`Redirection vers ${targetPlatform}: ${platformUrl}`);
        setStep('thank_you');
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error recording redirect:', error);
      setSubmitting(false);
    }
  };

  const handleMultiplatformSubmit = async () => {
    const multiConfig = config?.multiplatform_config as any;
    const minPlatforms = multiConfig?.min_platforms || 1;

    if (selectedPlatforms.length < minPlatforms) {
      toast.error(`Veuillez sélectionner au moins ${minPlatforms} plateforme(s)`);
      return;
    }

    // Open first platform
    if (selectedPlatforms.length > 0) {
      await handlePositiveRedirect(selectedPlatforms[0]);
    }
  };

  const togglePlatform = (platformKey: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformKey)
        ? prev.filter(p => p !== platformKey)
        : [...prev, platformKey]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!config || (!config.funnel_enabled && !previewMode)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Page non disponible</CardTitle>
            <CardDescription>
              La collecte d'avis n'est pas activée pour ce client
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const initialConfig = config.initial_page_config as any;
  const negativeConfig = config.negative_review_config as any;
  const positiveConfig = config.positive_review_config as any;
  const multiConfig = config.multiplatform_config as any;
  const thankYouConfig = config.thank_you_page_config as any;

  const enabledPlatforms = positiveConfig?.platforms
    ? Object.entries(positiveConfig.platforms)
        .filter(([_, platform]: any) => platform.enabled)
        .map(([key, platform]: any) => ({ key, ...platform }))
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl">
        {previewMode && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg mb-4 text-center">
            🔍 Mode prévisualisation - Aucune donnée ne sera enregistrée
          </div>
        )}

        {/* Étape 1 : Sélection de la note */}
        {step === 'rating' && (
          <Card className="shadow-xl">
            {/* Logo */}
            {config.show_logo && client?.logo_url && (
              <div className="flex justify-center pt-8 pb-4">
                <img
                  src={client.logo_url}
                  alt={client.company || client.name}
                  className="h-24 w-auto object-contain"
                />
              </div>
            )}

            <CardHeader className="text-center">
              {config.show_company_name && (
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  {client?.company || client?.name}
                </p>
              )}
              <CardTitle className="text-3xl mb-2">
                {initialConfig?.title || "Comment nous évalueriez-vous ?"}
              </CardTitle>
              <CardDescription className="text-lg">
                {initialConfig?.description || "Merci de prendre un moment pour évaluer votre expérience avec nous."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-16 w-16 ${
                        value <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {hoverRating > 0 && (
                  <p className="font-medium text-lg">
                    {hoverRating === 1 && 'Très insatisfait 😞'}
                    {hoverRating === 2 && 'Insatisfait 😕'}
                    {hoverRating === 3 && 'Neutre 😐'}
                    {hoverRating === 4 && 'Satisfait 😊'}
                    {hoverRating === 5 && 'Très satisfait 🤩'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2A : Avis négatif */}
        {step === 'negative' && (
          <Card className="shadow-xl">
            {/* Logo */}
            {config.show_logo && client?.logo_url && (
              <div className="flex justify-center pt-8 pb-4">
                <img
                  src={client.logo_url}
                  alt={client.company || client.name}
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            <CardHeader className="text-center">
              {config.show_company_name && (
                <p className="text-base font-semibold text-muted-foreground mb-2">
                  {client?.company || client?.name}
                </p>
              )}
              <CardTitle className="text-2xl mb-2">
                {negativeConfig?.title || "Aidez-nous à nous améliorer"}
              </CardTitle>
              <CardDescription className="text-base">
                {negativeConfig?.description || "Nous sommes désolés que votre expérience n'ait pas été à la hauteur."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-8 w-8 ${
                      value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {negativeConfig?.require_name !== false && (
                <div className="space-y-2">
                  <Label>
                    Votre nom{' '}
                    {negativeConfig?.require_name && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jean Dupont"
                  />
                </div>
              )}

              {negativeConfig?.require_email !== false && (
                <div className="space-y-2">
                  <Label>
                    Email{' '}
                    {negativeConfig?.require_email && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jean.dupont@example.com"
                  />
                </div>
              )}

              {negativeConfig?.require_phone !== false && (
                <div className="space-y-2">
                  <Label>
                    Téléphone{' '}
                    {negativeConfig?.require_phone && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Votre commentaire</Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={negativeConfig?.comment_placeholder || "Partagez-nous votre expérience..."}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleNegativeSubmit}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {negativeConfig?.submit_button_text || "Envoyer mon retour"}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Vos informations resteront confidentielles
              </p>
            </CardContent>
          </Card>
        )}

        {/* Étape 2B : Sélection multi-plateformes */}
        {step === 'multiplatform' && (
          <Card className="shadow-xl">
            {/* Logo */}
            {config.show_logo && client?.logo_url && (
              <div className="flex justify-center pt-8 pb-4">
                <img
                  src={client.logo_url}
                  alt={client.company || client.name}
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            <CardHeader className="text-center">
              {config.show_company_name && (
                <p className="text-base font-semibold text-muted-foreground mb-2">
                  {client?.company || client?.name}
                </p>
              )}
              <CardTitle className="text-2xl mb-2">
                {multiConfig?.title || "Partagez votre expérience"}
              </CardTitle>
              <CardDescription className="text-base">
                {multiConfig?.description || "Choisissez les plateformes sur lesquelles vous souhaitez laisser votre avis."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-8 w-8 ${
                      value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {enabledPlatforms.map((platform: any) => (
                  <div
                    key={platform.key}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => togglePlatform(platform.key)}
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.key)}
                      onCheckedChange={() => togglePlatform(platform.key)}
                    />
                    <Label className="cursor-pointer flex-1">
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleMultiplatformSubmit}
                disabled={submitting || selectedPlatforms.length === 0}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    Continuer ({selectedPlatforms.length} sélectionné{selectedPlatforms.length > 1 ? 's' : ''})
                  </>
                )}
              </Button>

              {multiConfig?.min_platforms > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Minimum {multiConfig.min_platforms} plateforme{multiConfig.min_platforms > 1 ? 's' : ''} requise{multiConfig.min_platforms > 1 ? 's' : ''}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 3 : Remerciement */}
        {step === 'thank_you' && (
          <Card className="shadow-xl">
            {thankYouConfig?.show_logo && config.show_logo && client?.logo_url && (
              <div className="flex justify-center pt-8 pb-4">
                <img
                  src={client.logo_url}
                  alt={client.company || client.name}
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              {thankYouConfig?.show_company_name && config.show_company_name && (
                <p className="text-base font-semibold text-muted-foreground mb-2">
                  {client?.company || client?.name}
                </p>
              )}
              
              <h1 className="text-3xl font-bold mb-4">
                {thankYouConfig?.title || "Merci !"}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {thankYouConfig?.message || "Votre retour a été reçu et un membre de notre équipe support client vous contactera sous peu."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Propulsé par RaiseMed.IA</p>
        </div>
      </div>
    </div>
  );
}
