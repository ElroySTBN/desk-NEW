import { useState, useEffect } from 'react';
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
import { TextTemplateSelector } from './TextTemplateSelector';
import { generateAndSaveGBPReport, calculateEvolution } from '@/lib/gbpReportGenerator';
import { sendGBPReportEmail } from '@/lib/emailService';
import { extractKPIsFromScreenshot, DEFAULT_OCR_ZONES, type KPIZonesConfig } from '@/lib/kpiExtractor';
import type { GBPReportData } from '@/types/gbp-reports';
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react';

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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  // Données du rapport
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || '');
  const [reportType, setReportType] = useState<'5_mois' | 'mensuel' | 'complet'>('complet');
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
  
  // KPIs
  const [kpis, setKpis] = useState<GBPReportData['kpis']>({
    vue_ensemble: { current: 0, previous: 0, analysis: '' },
    appels: { current: 0, previous: 0, analysis: '' },
    clics_web: { current: 0, previous: 0, analysis: '' },
    itineraire: { current: 0, previous: 0, analysis: '' },
  });
  
  // Monthly KPIs (pour page 6)
  const [monthlyKpis, setMonthlyKpis] = useState<GBPReportData['monthlyKpis']>({
    month: '',
    vue_ensemble: { current: 0, previous: 0, analysis: '' },
    appels: { current: 0, previous: 0, analysis: '' },
    clics_web: { current: 0, previous: 0, analysis: '' },
    itineraire: { current: 0, previous: 0, analysis: '' },
  });
  
  // Email
  const [sendEmail, setSendEmail] = useState(true);
  const [clientEmail, setClientEmail] = useState('');

  // OCR
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

  const handleReset = () => {
    setStep(1);
    setSelectedClientId(clientId || '');
    setReportType('complet');
    const currentDate = new Date();
    const currentMonth = MONTHS[currentDate.getMonth()];
    setSelectedMonth(currentMonth);
    setYear(currentDate.getFullYear());
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
    setMonthlyKpis({
      month: currentMonth,
      vue_ensemble: { current: 0, previous: 0, analysis: '' },
      appels: { current: 0, previous: 0, analysis: '' },
      clics_web: { current: 0, previous: 0, analysis: '' },
      itineraire: { current: 0, previous: 0, analysis: '' },
    });
    setSendEmail(true);
    setClientEmail('');
  };

  useEffect(() => {
    if (open) {
      fetchClients().then(() => {
        if (clientId) {
          setSelectedClientId(clientId);
          fetchClientEmail(clientId);
        }
      });
      const currentDate = new Date();
      const currentMonth = MONTHS[currentDate.getMonth()];
      setSelectedMonth(currentMonth);
      setYear(currentDate.getFullYear());
      // Réinitialiser monthlyKpis avec le mois sélectionné
      setMonthlyKpis({
        month: currentMonth,
        vue_ensemble: { current: 0, previous: 0, analysis: '' },
        appels: { current: 0, previous: 0, analysis: '' },
        clics_web: { current: 0, previous: 0, analysis: '' },
        itineraire: { current: 0, previous: 0, analysis: '' },
      });
    }
  }, [open, clientId]);

  useEffect(() => {
    // Mettre à jour le mois dans monthlyKpis quand selectedMonth change (seulement si le modal est ouvert)
    if (open && monthlyKpis) {
      setMonthlyKpis(prev => ({
        ...prev!,
        month: selectedMonth,
      }));
    }
  }, [selectedMonth, open]);

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

  const handleScreenshotChange = (type: keyof typeof screenshots, file: File | null, previewUrl: string | null) => {
    setScreenshots(prev => ({
      ...prev,
      [type]: previewUrl,
    }));
  };

  // Charger la configuration OCR depuis le template
  useEffect(() => {
    const loadOCRSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: template } = await supabase
          .from('gbp_report_templates')
          .select('template_config')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();

        if (template?.template_config?.ocr_zones) {
          setOcrZonesConfig(template.template_config.ocr_zones);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration OCR:', error);
      }
    };

    if (open) {
      loadOCRSettings();
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
      setKpis(prev => ({
        ...prev,
        [screenshotType]: {
          current: extracted.current || prev[screenshotType].current,
          previous: extracted.previous || prev[screenshotType].previous,
          analysis: prev[screenshotType].analysis,
        },
      }));

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
        return true;
      case 2:
        const missingScreenshots = Object.entries(screenshots).filter(([_, value]) => !value);
        if (missingScreenshots.length > 0) {
          toast({
            title: 'Erreur',
            description: `Veuillez uploader toutes les captures d'écran (manquantes: ${missingScreenshots.map(([key]) => key).join(', ')})`,
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 3:
        // Validation des KPIs
        return true;
      case 4:
        // Validation des textes
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 5) {
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

      // Préparer les données du rapport
      const reportData: GBPReportData = {
        client: {
          id: client.id,
          name: client.name,
          company: client.company,
          logo_url: client.logo_url,
        },
        period: {
          startMonth: reportType === '5_mois' ? 'Juin' : selectedMonth,
          endMonth: selectedMonth,
          year: year,
        },
        kpis: kpis,
        monthlyKpis: (reportType === 'mensuel' || reportType === 'complet') && monthlyKpis && monthlyKpis.vue_ensemble.current > 0 ? {
          month: selectedMonth,
          vue_ensemble: monthlyKpis.vue_ensemble,
          appels: monthlyKpis.appels,
          clics_web: monthlyKpis.clics_web,
          itineraire: monthlyKpis.itineraire,
        } : undefined,
        screenshots: {
          vue_ensemble: screenshots.vue_ensemble || '',
          appels: screenshots.appels || '',
          clics_web: screenshots.clics_web || '',
          itineraire: screenshots.itineraire || '',
        },
      };

      // Générer et sauvegarder le rapport
      const pdfUrl = await generateAndSaveGBPReport(
        reportData,
        reportType,
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
  const progress = (step / 5) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Générer un rapport GBP</DialogTitle>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        {/* Étape 1: Sélection client & période */}
        {step === 1 && (
          <div className="space-y-4">
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

            <div>
              <Label>Type de rapport *</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5_mois">Rapport sur 5 mois (Juin-{selectedMonth})</SelectItem>
                  <SelectItem value="mensuel">Rapport mensuel uniquement ({selectedMonth})</SelectItem>
                  <SelectItem value="complet">Les deux (génère 1 PDF de 6 pages)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Étape 2: Upload screenshots */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Uploadez les 4 captures d'écran depuis le dashboard GBP de votre client
            </p>
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
          </div>
        )}

        {/* Étape 3: Saisie KPIs */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Saisissez les KPIs pour la période {reportType === '5_mois' ? 'Juin-' : ''}{selectedMonth} {year}
            </p>
            <div className="space-y-4">
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
            </div>

            {/* Monthly KPIs pour page 6 */}
            {(reportType === 'mensuel' || reportType === 'complet') && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">KPIs Mensuels (Page 6)</h3>
                <p className="text-sm text-muted-foreground">
                  Comparaison {selectedMonth} {year} vs {selectedMonth} {year - 1}
                </p>
                <div className="space-y-4">
                  <KPIForm
                    label="Vue d'ensemble (Mensuel)"
                    icon="📊"
                    current={monthlyKpis?.vue_ensemble.current || 0}
                    previous={monthlyKpis?.vue_ensemble.previous || 0}
                    analysis={monthlyKpis?.vue_ensemble.analysis || ''}
                    onCurrentChange={(value) => setMonthlyKpis(prev => ({ ...prev, vue_ensemble: { ...(prev?.vue_ensemble || { current: 0, previous: 0, analysis: '' }), current: value } }))}
                    onPreviousChange={(value) => setMonthlyKpis(prev => ({ ...prev, vue_ensemble: { ...(prev?.vue_ensemble || { current: 0, previous: 0, analysis: '' }), previous: value } }))}
                    onAnalysisChange={(value) => setMonthlyKpis(prev => ({ ...prev, vue_ensemble: { ...(prev?.vue_ensemble || { current: 0, previous: 0, analysis: '' }), analysis: value } }))}
                    unit="interactions"
                  />
                  <KPIForm
                    label="Appels (Mensuel)"
                    icon="📞"
                    current={monthlyKpis?.appels.current || 0}
                    previous={monthlyKpis?.appels.previous || 0}
                    analysis={monthlyKpis?.appels.analysis || ''}
                    onCurrentChange={(value) => setMonthlyKpis(prev => ({ ...prev, appels: { ...(prev?.appels || { current: 0, previous: 0, analysis: '' }), current: value } }))}
                    onPreviousChange={(value) => setMonthlyKpis(prev => ({ ...prev, appels: { ...(prev?.appels || { current: 0, previous: 0, analysis: '' }), previous: value } }))}
                    onAnalysisChange={(value) => setMonthlyKpis(prev => ({ ...prev, appels: { ...(prev?.appels || { current: 0, previous: 0, analysis: '' }), analysis: value } }))}
                    unit="appels"
                  />
                  <KPIForm
                    label="Clics Web (Mensuel)"
                    icon="🌐"
                    current={monthlyKpis?.clics_web.current || 0}
                    previous={monthlyKpis?.clics_web.previous || 0}
                    analysis={monthlyKpis?.clics_web.analysis || ''}
                    onCurrentChange={(value) => setMonthlyKpis(prev => ({ ...prev, clics_web: { ...(prev?.clics_web || { current: 0, previous: 0, analysis: '' }), current: value } }))}
                    onPreviousChange={(value) => setMonthlyKpis(prev => ({ ...prev, clics_web: { ...(prev?.clics_web || { current: 0, previous: 0, analysis: '' }), previous: value } }))}
                    onAnalysisChange={(value) => setMonthlyKpis(prev => ({ ...prev, clics_web: { ...(prev?.clics_web || { current: 0, previous: 0, analysis: '' }), analysis: value } }))}
                    unit="clics"
                  />
                  <KPIForm
                    label="Itinéraire (Mensuel)"
                    icon="📍"
                    current={monthlyKpis?.itineraire.current || 0}
                    previous={monthlyKpis?.itineraire.previous || 0}
                    analysis={monthlyKpis?.itineraire.analysis || ''}
                    onCurrentChange={(value) => setMonthlyKpis(prev => ({ ...prev, itineraire: { ...(prev?.itineraire || { current: 0, previous: 0, analysis: '' }), current: value } }))}
                    onPreviousChange={(value) => setMonthlyKpis(prev => ({ ...prev, itineraire: { ...(prev?.itineraire || { current: 0, previous: 0, analysis: '' }), previous: value } }))}
                    onAnalysisChange={(value) => setMonthlyKpis(prev => ({ ...prev, itineraire: { ...(prev?.itineraire || { current: 0, previous: 0, analysis: '' }), analysis: value } }))}
                    unit="demandes"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Étape 4: Personnalisation textes */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Personnalisez les textes d'analyse pour chaque métrique
            </p>
            <div className="space-y-4">
              <TextTemplateSelector
                category="vue_ensemble"
                evolution={calculateEvolution(kpis.vue_ensemble.current, kpis.vue_ensemble.previous)}
                current={kpis.vue_ensemble.current}
                previous={kpis.vue_ensemble.previous}
                period={`${reportType === '5_mois' ? 'Juin-' : ''}${selectedMonth} ${year}`}
                value={kpis.vue_ensemble.analysis}
                onChange={(value) => setKpis(prev => ({ ...prev, vue_ensemble: { ...prev.vue_ensemble, analysis: value } }))}
                label="Vue d'ensemble"
              />
              <TextTemplateSelector
                category="appels"
                evolution={calculateEvolution(kpis.appels.current, kpis.appels.previous)}
                current={kpis.appels.current}
                previous={kpis.appels.previous}
                period={`${reportType === '5_mois' ? 'Juin-' : ''}${selectedMonth} ${year}`}
                value={kpis.appels.analysis}
                onChange={(value) => setKpis(prev => ({ ...prev, appels: { ...prev.appels, analysis: value } }))}
                label="Appels téléphoniques"
              />
              <TextTemplateSelector
                category="clics_web"
                evolution={calculateEvolution(kpis.clics_web.current, kpis.clics_web.previous)}
                current={kpis.clics_web.current}
                previous={kpis.clics_web.previous}
                period={`${reportType === '5_mois' ? 'Juin-' : ''}${selectedMonth} ${year}`}
                value={kpis.clics_web.analysis}
                onChange={(value) => setKpis(prev => ({ ...prev, clics_web: { ...prev.clics_web, analysis: value } }))}
                label="Clics vers le site web"
              />
              <TextTemplateSelector
                category="itineraire"
                evolution={calculateEvolution(kpis.itineraire.current, kpis.itineraire.previous)}
                current={kpis.itineraire.current}
                previous={kpis.itineraire.previous}
                period={`${reportType === '5_mois' ? 'Juin-' : ''}${selectedMonth} ${year}`}
                value={kpis.itineraire.analysis}
                onChange={(value) => setKpis(prev => ({ ...prev, itineraire: { ...prev.itineraire, analysis: value } }))}
                label="Demandes d'itinéraire"
              />
            </div>
          </div>
        )}

        {/* Étape 5: Preview & Validation */}
        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vérifiez les informations avant de générer le rapport
            </p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Résumé du rapport</h3>
                <p><strong>Client:</strong> {selectedClient?.company || selectedClient?.name}</p>
                <p><strong>Période:</strong> {reportType === '5_mois' ? 'Juin-' : ''}{selectedMonth} {year}</p>
                <p><strong>Type:</strong> {reportType === '5_mois' ? '5 mois' : reportType === 'mensuel' ? 'Mensuel' : 'Complet'}</p>
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
            {step < 5 ? (
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

