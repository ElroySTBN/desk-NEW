import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { KPIForm } from './KPIForm';
import { ScreenshotUpload } from './ScreenshotUpload';
import { generateAndSaveGBPReport } from '@/lib/gbpReportGenerator';
import { sendGBPReportEmail } from '@/lib/emailService';
import { extractKPIsFromScreenshot, DEFAULT_OCR_ZONES, type KPIZonesConfig } from '@/lib/kpiExtractor';
import { generateAllAnalysisTexts } from '@/lib/textTemplateEngine';
import type { GBPReportData } from '@/types/gbp-reports';
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface CreateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  onSuccess?: () => void;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function CreateReportModal({ open, onOpenChange, clientId, onSuccess }: CreateReportModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 2 étapes seulement
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  // Données du rapport
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Screenshots
  const [screenshots, setScreenshots] = useState<{
    vue_ensemble: string | null;
    appels: string | null;
    clics_web: string | null;
    itineraire: string | null;
  }>({
    vue_ensemble: null,
    appels: null,
    clics_web: null,
    itineraire: null,
  });
  
  // KPIs (comparaison N vs N-1 pour le même mois)
  const [kpis, setKpis] = useState<GBPReportData['kpis']>({
    vue_ensemble: { current: 0, previous: 0, analysis: '' },
    appels: { current: 0, previous: 0, analysis: '' },
    clics_web: { current: 0, previous: 0, analysis: '' },
    itineraire: { current: 0, previous: 0, analysis: '' },
  });
  
  // Email
  const [sendEmail, setSendEmail] = useState(true);
  const [clientEmail, setClientEmail] = useState('');

  // OCR - extraction automatique optionnelle
  const [extractingOCR, setExtractingOCR] = useState<{
    vue_ensemble: boolean;
    appels: boolean;
    clics_web: boolean;
    itineraire: boolean;
  }>({
    vue_ensemble: false,
    appels: false,
    clics_web: false,
    itineraire: false,
  });
  const [ocrZonesConfig, setOcrZonesConfig] = useState<KPIZonesConfig>(DEFAULT_OCR_ZONES);
  const [autoExtractOCR, setAutoExtractOCR] = useState(true); // Extraction automatique activée par défaut
  const [textTemplates, setTextTemplates] = useState<any>(null); // Templates de textes depuis la configuration du template

  const handleReset = () => {
    setStep(1);
    setSelectedClientId(clientId || '');
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonth = MONTHS[previousMonth.getMonth()];
    setSelectedMonth(currentMonth);
    setYear(previousMonth.getFullYear());
    setScreenshots({
      vue_ensemble: null,
      appels: null,
      clics_web: null,
      itineraire: null,
    });
    setKpis({
      vue_ensemble: { current: 0, previous: 0, analysis: '' },
      appels: { current: 0, previous: 0, analysis: '' },
      clics_web: { current: 0, previous: 0, analysis: '' },
      itineraire: { current: 0, previous: 0, analysis: '' },
    });
    setSendEmail(true);
    setClientEmail('');
    setAutoExtractOCR(true);
  };

  useEffect(() => {
    if (open) {
      fetchClients().then(() => {
        if (clientId) {
          setSelectedClientId(clientId);
          fetchClientEmail(clientId);
        }
      });
      // Par défaut, utiliser le mois précédent
      const currentDate = new Date();
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const currentMonth = MONTHS[previousMonth.getMonth()];
      setSelectedMonth(currentMonth);
      setYear(previousMonth.getFullYear());
    }
  }, [open, clientId]);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, company, email, logo_url')
        .eq('user_id', user.id)
        .eq('statut', 'actif')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchClientEmail = async (id: string) => {
    try {
      // Si les clients sont déjà chargés, utiliser la liste
      const client = clients.find(c => c.id === id);
      if (client?.email) {
        setClientEmail(client.email);
        return;
      }
      
      // Sinon, récupérer depuis la base de données
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('email')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data?.email) {
        setClientEmail(data.email);
      }
    } catch (error) {
      console.error('Error fetching client email:', error);
    }
  };

  const handleClientChange = (id: string) => {
    setSelectedClientId(id);
    fetchClientEmail(id);
  };

  const handleScreenshotChange = async (type: keyof typeof screenshots, file: File | null, previewUrl: string | null) => {
    setScreenshots(prev => ({
      ...prev,
      [type]: previewUrl,
    }));
    
    // Extraction OCR automatique si activée et si un fichier est uploadé
    if (autoExtractOCR && file && previewUrl) {
      await handleExtractOCR(type, file);
    }
  };

  // Charger la configuration OCR et les templates de textes depuis le template
  useEffect(() => {
    const loadTemplateSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: template } = await supabase
          .from('gbp_report_templates' as any)
          .select('template_config')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle() as any;

        if (template?.template_config) {
          // Charger les zones OCR
          if (template.template_config.ocr_zones) {
            setOcrZonesConfig(template.template_config.ocr_zones);
          }
          // Charger les templates de textes
          if (template.template_config.text_templates) {
            setTextTemplates(template.template_config.text_templates);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration du template:', error);
      }
    };

    if (open) {
      loadTemplateSettings();
    }
  }, [open]);
  

  // Fonction pour extraire les KPIs via OCR
  const handleExtractOCR = async (
    screenshotType: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire',
    file: File
  ) => {
    setExtractingOCR(prev => ({ ...prev, [screenshotType]: true }));

    try {
      const extracted = await extractKPIsFromScreenshot(file, screenshotType, ocrZonesConfig);

      // Mettre à jour les KPIs avec les valeurs extraites
      setKpis(prev => {
        const updated = {
          ...prev,
          [screenshotType]: {
            current: extracted.current || prev[screenshotType].current,
            previous: extracted.previous || prev[screenshotType].previous,
            analysis: prev[screenshotType].analysis, // Garder l'analyse existante
          },
        };
        
        // Générer automatiquement l'analyse après extraction OCR si templates disponibles et analyse vide
        if (textTemplates && extracted.current && extracted.previous && !updated[screenshotType].analysis) {
          const client = clients.find(c => c.id === selectedClientId);
          if (client && selectedMonth) {
            const tempReportData: GBPReportData = {
              client: {
                id: client.id,
                name: client.name,
                company: client.company,
                logo_url: client.logo_url,
              },
              period: {
                month: selectedMonth,
                year: year,
              },
              kpis: updated,
              screenshots: {
                vue_ensemble: screenshots.vue_ensemble || '',
                appels: screenshots.appels || '',
                clics_web: screenshots.clics_web || '',
                itineraire: screenshots.itineraire || '',
              },
            };
            
            const generatedAnalyses = generateAllAnalysisTexts(tempReportData, textTemplates);
            
            // Mettre à jour l'analyse seulement si elle est vide
            return {
              ...updated,
              [screenshotType]: {
                ...updated[screenshotType],
                analysis: generatedAnalyses[screenshotType],
              },
            };
          }
        }
        
        return updated;
      });

      toast({
        title: '✅ Extraction réussie',
        description: `Current: ${extracted.current || 'N/A'}, Previous: ${extracted.previous || 'N/A'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur OCR',
        description: error.message || 'Erreur lors de l\'extraction des métriques',
        variant: 'destructive',
      });
    } finally {
      setExtractingOCR(prev => ({ ...prev, [screenshotType]: false }));
    }
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!selectedClientId) {
          toast({
            title: 'Erreur',
            description: 'Veuillez sélectionner un client',
            variant: 'destructive',
          });
          return false;
        }
        if (!selectedMonth) {
          toast({
            title: 'Erreur',
            description: 'Veuillez sélectionner un mois',
            variant: 'destructive',
          });
          return false;
        }
        // Vérifier que les KPIs principaux sont remplis (au moins current et previous)
        const missingKPIs = Object.entries(kpis).filter(([_, kpi]) => kpi.current === 0 || kpi.previous === 0);
        if (missingKPIs.length > 0) {
          toast({
            title: 'Attention',
            description: `Certains KPIs sont manquants. Le rapport sera généré avec les valeurs disponibles.`,
            variant: 'default',
          });
        }
        return true;
      case 2:
        // Validation de l'aperçu - toujours valide, juste pour vérifier
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      // Générer automatiquement les analyses avant de passer à l'étape 2 si nécessaire
      if (step === 1 && textTemplates && selectedClientId && selectedMonth) {
        const client = clients.find(c => c.id === selectedClientId);
        if (client) {
          const tempReportData: GBPReportData = {
            client: {
              id: client.id,
              name: client.name,
              company: client.company,
              logo_url: client.logo_url,
            },
            period: {
              month: selectedMonth,
              year: year,
            },
            kpis: kpis,
            screenshots: {
              vue_ensemble: screenshots.vue_ensemble || '',
              appels: screenshots.appels || '',
              clics_web: screenshots.clics_web || '',
              itineraire: screenshots.itineraire || '',
            },
          };
          
          // Générer les analyses seulement si elles sont vides
          const generatedAnalyses = generateAllAnalysisTexts(tempReportData, textTemplates);
          
          setKpis(prev => ({
            vue_ensemble: {
              ...prev.vue_ensemble,
              analysis: prev.vue_ensemble.analysis || generatedAnalyses.vue_ensemble,
            },
            appels: {
              ...prev.appels,
              analysis: prev.appels.analysis || generatedAnalyses.appels,
            },
            clics_web: {
              ...prev.clics_web,
              analysis: prev.clics_web.analysis || generatedAnalyses.clics_web,
            },
            itineraire: {
              ...prev.itineraire,
              analysis: prev.itineraire.analysis || generatedAnalyses.itineraire,
            },
          }));
        }
      }
      
      if (step < 2) {
        setStep(step + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGenerate = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const client = clients.find(c => c.id === selectedClientId);
      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Préparer les données du rapport (rapport mensuel uniquement)
      const reportData: GBPReportData = {
        client: {
          id: client.id,
          name: client.name,
          company: client.company,
          logo_url: client.logo_url,
        },
        period: {
          month: selectedMonth,
          year: year,
        },
        kpis: kpis,
        screenshots: {
          vue_ensemble: screenshots.vue_ensemble || '',
          appels: screenshots.appels || '',
          clics_web: screenshots.clics_web || '',
          itineraire: screenshots.itineraire || '',
        },
      };

      // Générer et sauvegarder le rapport (mensuel uniquement)
      const pdfUrl = await generateAndSaveGBPReport(
        reportData,
        selectedMonth,
        year
      );

      toast({
        title: '✅ Rapport généré avec succès',
        description: 'Le PDF a été généré et sauvegardé',
      });

      // Envoyer l'email si demandé
      if (sendEmail && clientEmail) {
        try {
          await sendGBPReportEmail(
            clientEmail,
            pdfUrl,
            {
              clientName: client.company || client.name,
              month: selectedMonth,
              year: year,
            },
            client.id
          );
          toast({
            title: '📧 Email envoyé',
            description: 'Le rapport a été envoyé au client',
          });
        } catch (error: any) {
          toast({
            title: 'Erreur',
            description: `Erreur lors de l'envoi de l'email: ${error.message}`,
            variant: 'destructive',
          });
        }
      }

      onSuccess?.();
      handleReset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const progress = (step / 2) * 100; // 2 étapes seulement

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Générer un rapport GBP</DialogTitle>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        {/* Étape 1: Client + Upload screenshots + KPIs */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Section Client & Période */}
            <Card>
              <CardHeader>
                <CardTitle>Client et Période</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Client *</Label>
                  <Select value={selectedClientId} onValueChange={handleClientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company || client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mois du rapport *</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Année *</Label>
                    <Input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p><strong>Comparaison :</strong> {selectedMonth} {year} vs {selectedMonth} {year - 1}</p>
                  <p className="text-xs text-blue-600 mt-1">Le rapport compare le mois sélectionné avec le même mois de l'année précédente.</p>
                </div>
              </CardContent>
            </Card>

            {/* Section Upload Screenshots */}
            <Card>
              <CardHeader>
                <CardTitle>Captures d'écran</CardTitle>
                <CardDescription>
                  Uploadez les 4 captures d'écran depuis le dashboard GBP de votre client
                </CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="auto-extract-ocr"
                    checked={autoExtractOCR}
                    onCheckedChange={setAutoExtractOCR}
                  />
                  <Label htmlFor="auto-extract-ocr" className="cursor-pointer">
                    Extraction OCR automatique après upload
                  </Label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <ScreenshotUpload
                    label="Vue d'ensemble"
                    icon="📊"
                    value={screenshots.vue_ensemble}
                    onChange={(file, url) => handleScreenshotChange('vue_ensemble', file, url)}
                    onExtractOCR={(file) => handleExtractOCR('vue_ensemble', file)}
                    extracting={extractingOCR.vue_ensemble}
                    required
                  />
                  <ScreenshotUpload
                    label="Appels"
                    icon="📞"
                    value={screenshots.appels}
                    onChange={(file, url) => handleScreenshotChange('appels', file, url)}
                    onExtractOCR={(file) => handleExtractOCR('appels', file)}
                    extracting={extractingOCR.appels}
                    required
                  />
                  <ScreenshotUpload
                    label="Clics site web"
                    icon="🌐"
                    value={screenshots.clics_web}
                    onChange={(file, url) => handleScreenshotChange('clics_web', file, url)}
                    onExtractOCR={(file) => handleExtractOCR('clics_web', file)}
                    extracting={extractingOCR.clics_web}
                    required
                  />
                  <ScreenshotUpload
                    label="Itinéraire"
                    icon="📍"
                    value={screenshots.itineraire}
                    onChange={(file, url) => handleScreenshotChange('itineraire', file, url)}
                    onExtractOCR={(file) => handleExtractOCR('itineraire', file)}
                    extracting={extractingOCR.itineraire}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section KPIs */}
            <Card>
              <CardHeader>
                <CardTitle>KPIs et Analyses</CardTitle>
                <CardDescription>
                  Les KPIs peuvent être extraits automatiquement via OCR ou saisis manuellement.
                  Les analyses sont générées automatiquement selon les templates configurés.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <KPIForm
                  label="Vue d'ensemble"
                  icon="📊"
                  current={kpis.vue_ensemble.current}
                  previous={kpis.vue_ensemble.previous}
                  analysis={kpis.vue_ensemble.analysis}
                  onCurrentChange={(value) => setKpis(prev => ({ ...prev, vue_ensemble: { ...prev.vue_ensemble, current: value } }))}
                  onPreviousChange={(value) => setKpis(prev => ({ ...prev, vue_ensemble: { ...prev.vue_ensemble, previous: value } }))}
                  onAnalysisChange={(value) => setKpis(prev => ({ ...prev, vue_ensemble: { ...prev.vue_ensemble, analysis: value } }))}
                  unit="interactions"
                />
                <KPIForm
                  label="Appels téléphoniques"
                  icon="📞"
                  current={kpis.appels.current}
                  previous={kpis.appels.previous}
                  analysis={kpis.appels.analysis}
                  onCurrentChange={(value) => setKpis(prev => ({ ...prev, appels: { ...prev.appels, current: value } }))}
                  onPreviousChange={(value) => setKpis(prev => ({ ...prev, appels: { ...prev.appels, previous: value } }))}
                  onAnalysisChange={(value) => setKpis(prev => ({ ...prev, appels: { ...prev.appels, analysis: value } }))}
                  unit="appels"
                />
                <KPIForm
                  label="Clics vers le site web"
                  icon="🌐"
                  current={kpis.clics_web.current}
                  previous={kpis.clics_web.previous}
                  analysis={kpis.clics_web.analysis}
                  onCurrentChange={(value) => setKpis(prev => ({ ...prev, clics_web: { ...prev.clics_web, current: value } }))}
                  onPreviousChange={(value) => setKpis(prev => ({ ...prev, clics_web: { ...prev.clics_web, previous: value } }))}
                  onAnalysisChange={(value) => setKpis(prev => ({ ...prev, clics_web: { ...prev.clics_web, analysis: value } }))}
                  unit="clics"
                />
                <KPIForm
                  label="Demandes d'itinéraire"
                  icon="📍"
                  current={kpis.itineraire.current}
                  previous={kpis.itineraire.previous}
                  analysis={kpis.itineraire.analysis}
                  onCurrentChange={(value) => setKpis(prev => ({ ...prev, itineraire: { ...prev.itineraire, current: value } }))}
                  onPreviousChange={(value) => setKpis(prev => ({ ...prev, itineraire: { ...prev.itineraire, previous: value } }))}
                  onAnalysisChange={(value) => setKpis(prev => ({ ...prev, itineraire: { ...prev.itineraire, analysis: value } }))}
                  unit="demandes"
                />
              </CardContent>
            </Card>

          </div>
        )}

        {/* Étape 2: Aperçu & Génération */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vérifiez les informations avant de générer le rapport
            </p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Résumé du rapport</h3>
                <p><strong>Client:</strong> {selectedClient?.company || selectedClient?.name}</p>
                <p><strong>Période:</strong> {selectedMonth} {year}</p>
                <p><strong>Comparaison:</strong> {selectedMonth} {year} vs {selectedMonth} {year - 1}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Options d'envoi</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send-email"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="send-email" className="cursor-pointer">
                    Envoyer par email au client
                  </Label>
                </div>
                {sendEmail && (
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Email du client"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            {step < 2 ? (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? 'Génération...' : 'Générer le PDF'}
                <FileText className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

