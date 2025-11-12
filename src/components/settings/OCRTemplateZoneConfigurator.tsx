import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GBPTemplateConfig } from '@/lib/gbpTemplateConfig';
import type { OCRZone } from '@/lib/ocrService';
import type { KPIZonesConfig } from '@/lib/kpiExtractor';
import { OCRZoneEditor } from '@/components/reports/gbp/OCRZoneEditor';
import { DEFAULT_OCR_ZONES } from '@/lib/kpiExtractor';

interface OCRTemplateZoneConfiguratorProps {
  templateConfig: GBPTemplateConfig;
  onConfigChange: (config: Partial<GBPTemplateConfig>) => void;
  templateId: string;
}

const SCREENSHOT_TYPES: Array<{
  value: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire';
  label: string;
  description: string;
}> = [
  {
    value: 'vue_ensemble',
    label: 'Vue d\'ensemble',
    description: 'Configurez les zones OCR pour extraire les métriques de la vue d\'ensemble',
  },
  {
    value: 'appels',
    label: 'Appels téléphoniques',
    description: 'Configurez les zones OCR pour extraire les métriques des appels téléphoniques',
  },
  {
    value: 'clics_web',
    label: 'Clics vers le site web',
    description: 'Configurez les zones OCR pour extraire les métriques des clics vers le site web',
  },
  {
    value: 'itineraire',
    label: 'Demandes d\'itinéraire',
    description: 'Configurez les zones OCR pour extraire les métriques des demandes d\'itinéraire',
  },
];

export function OCRTemplateZoneConfigurator({
  templateConfig,
  onConfigChange,
  templateId,
}: OCRTemplateZoneConfiguratorProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire'>('vue_ensemble');
  const [referenceImages, setReferenceImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [ocrZones, setOcrZones] = useState<KPIZonesConfig>(
    templateConfig.ocr_zones || DEFAULT_OCR_ZONES
  );

  // Obtenir l'ID de l'utilisateur authentifié
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Charger les zones OCR depuis la configuration du template
  useEffect(() => {
    if (templateConfig.ocr_zones) {
      setOcrZones(templateConfig.ocr_zones);
    }
  }, [templateConfig.ocr_zones]);

  // Charger les images de référence si elles existent
  useEffect(() => {
    const loadReferenceImages = async () => {
      // Les images de référence peuvent être stockées dans Supabase Storage
      // ou être des URLs externes
      // Pour l'instant, on les charge depuis le template_config si elles existent
      // TODO: Implémenter le stockage des images de référence
    };

    loadReferenceImages();
  }, [templateConfig]);

  // Uploader une image de référence pour un type de screenshot
  const handleUploadReferenceImage = async (
    type: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire',
    file: File
  ) => {
    if (!userId) {
      toast({
        title: 'Erreur',
        description: 'Utilisateur non authentifié',
        variant: 'destructive',
      });
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `ocr-reference-${type}-${Date.now()}.${fileExtension}`;
      // Le chemin doit commencer par userId pour que la politique RLS fonctionne
      const filePath = `${userId}/templates/${templateId}/ocr-references/${fileName}`;

      // Upload vers Supabase Storage (bucket gbp-templates)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gbp-templates')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Erreur upload image référence:', uploadError);
        throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
      }

      // Récupérer l'URL publique (le bucket gbp-templates est public)
      const { data: { publicUrl } } = supabase.storage
        .from('gbp-templates')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Impossible de récupérer l\'URL publique de l\'image');
      }

      // Mettre à jour l'état local
      setReferenceImages(prev => ({
        ...prev,
        [type]: publicUrl,
      }));

      toast({
        title: '✅ Image uploadée',
        description: 'L\'image de référence a été uploadée avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'upload de l\'image',
        variant: 'destructive',
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Sauvegarder les zones OCR pour un type de screenshot
  const handleSaveOCRRoles = (
    type: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire',
    zones: { current: OCRZone; previous: OCRZone }
  ) => {
    // Mettre à jour les zones OCR
    const updatedOcrZones: KPIZonesConfig = {
      ...ocrZones,
      [type]: zones,
    };

    setOcrZones(updatedOcrZones);

    // Sauvegarder dans la configuration du template
    onConfigChange({
      ocr_zones: updatedOcrZones,
    });

    toast({
      title: '✅ Zones OCR sauvegardées',
      description: `Les zones OCR pour ${SCREENSHOT_TYPES.find(t => t.value === type)?.label} ont été sauvegardées`,
    });
  };

  // Obtenir l'image de référence pour un type
  const getReferenceImage = (type: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire'): string | null => {
    // Si une image de référence est uploadée, l'utiliser
    if (referenceImages[type]) {
      return referenceImages[type];
    }

    // Sinon, utiliser une capture d'écran existante du template si disponible
    // (pour l'instant, on retourne null et on demande à l'utilisateur d'uploader une image)
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration des zones OCR</CardTitle>
          <CardDescription>
            Configurez les zones OCR pour extraire automatiquement les métriques depuis vos captures d'écran.
            Les zones doivent être définies sur une image de référence qui correspond au format de vos captures d'écran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              📋 Instructions
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Pour chaque type de screenshot, uploadez une image de référence (une capture d'écran typique)</li>
              <li>Dessinez deux zones sur l'image : une pour la valeur "Current" (vert) et une pour la valeur "Previous" (bleu)</li>
              <li>Les zones doivent correspondre exactement à l'emplacement des chiffres dans vos captures d'écran</li>
              <li>Une fois les zones configurées, elles seront utilisées automatiquement lors de l'extraction OCR</li>
            </ol>
          </div>

          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              {SCREENSHOT_TYPES.map(type => (
                <TabsTrigger key={type.value} value={type.value}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {SCREENSHOT_TYPES.map(type => {
              const referenceImage = getReferenceImage(type.value);
              const zones = ocrZones[type.value];
              const hasZones = zones?.current && zones?.previous;

              return (
                <TabsContent key={type.value} value={type.value} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{type.label}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Upload d'image de référence */}
                      <div className="space-y-2">
                        <Label>Image de référence</Label>
                        <div className="flex items-center gap-4">
                          {referenceImage ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Image de référence configurée</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-yellow-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>Aucune image de référence</span>
                            </div>
                          )}
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadReferenceImage(type.value, file);
                                }
                              }}
                              disabled={uploading[type.value]}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploading[type.value]}
                              asChild
                            >
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                {referenceImage ? 'Remplacer' : 'Uploader'} l'image
                              </span>
                            </Button>
                          </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploader une capture d'écran typique pour ce type de métrique. Cette image sera utilisée pour configurer les zones OCR.
                        </p>
                      </div>

                      {/* Éditeur de zones OCR */}
                      {referenceImage ? (
                        <div className="space-y-4">
                          <OCRZoneEditor
                            imageUrl={referenceImage}
                            screenshotType={type.value}
                            initialZones={zones}
                            onSave={(savedZones) => handleSaveOCRRoles(type.value, savedZones)}
                          />
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center text-muted-foreground">
                            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Veuillez d'abord uploader une image de référence pour configurer les zones OCR</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Statut de la configuration */}
                      {hasZones && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-semibold">Zones OCR configurées</span>
                          </div>
                          <div className="mt-2 text-xs text-green-700">
                            <p>Current: x={Math.round(zones.current.x)}, y={Math.round(zones.current.y)}, w={Math.round(zones.current.width)}, h={Math.round(zones.current.height)}</p>
                            <p>Previous: x={Math.round(zones.previous.x)}, y={Math.round(zones.previous.y)}, w={Math.round(zones.previous.width)}, h={Math.round(zones.previous.height)}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

