import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Edit, Upload, Settings } from 'lucide-react';
import { GBPTemplateUploader } from './GBPTemplateUploader';
import { OCRZoneEditor } from '@/components/reports/gbp/OCRZoneEditor';
import { VariableZoneEditor } from '@/components/reports/gbp/VariableZoneEditor';
import { DEFAULT_OCR_ZONES, type KPIZonesConfig } from '@/lib/kpiExtractor';
import type { VariableZone } from '@/lib/canvaReportGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GBPReportTemplate {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  template_base_url?: string | null;
  template_config: {
    pages?: Array<{
      type: string;
      elements: Array<any>;
    }>;
    kpi_placements?: Record<string, { page: number; position: { x: number; y: number } }>;
    screenshot_placements?: Record<string, { page: number; position: { x: number; y: number } }>;
  };
}

export function GBPReportTemplatesManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<GBPReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GBPReportTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
  });
  const [ocrZones, setOcrZones] = useState<KPIZonesConfig>(DEFAULT_OCR_ZONES);
  const [selectedScreenshotType, setSelectedScreenshotType] = useState<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire'>('vue_ensemble');
  const [variableZones, setVariableZones] = useState<Record<string, VariableZone>>({});
  const [selectedVariableZone, setSelectedVariableZone] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gbp_report_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
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

  const handleCreateDefault = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Vérifier si un template par défaut existe déjà
      const { data: existing } = await supabase
        .from('gbp_report_templates')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Template par défaut existe déjà',
          description: 'Un template par défaut existe déjà. Modifiez-le ou supprimez-le d\'abord.',
        });
        return;
      }

      // Créer un template par défaut avec la structure actuelle
      const defaultConfig = {
        pages: [
          {
            type: 'cover',
            elements: [
              { type: 'title', value: 'Rapport de Performances' },
              { type: 'client_logo', position: 'top-right' },
              { type: 'client_name', variable: 'client.name' },
            ],
          },
          {
            type: 'kpi',
            kpi_type: 'vue_ensemble',
            screenshot_type: 'vue_ensemble',
          },
          {
            type: 'kpi',
            kpi_type: 'appels',
            screenshot_type: 'appels',
          },
          {
            type: 'kpi',
            kpi_type: 'clics_web',
            screenshot_type: 'clics_web',
          },
          {
            type: 'kpi',
            kpi_type: 'itineraire',
            screenshot_type: 'itineraire',
          },
        ],
        kpi_placements: {
          vue_ensemble: { page: 2, position: { x: 0, y: 0 } },
          appels: { page: 3, position: { x: 0, y: 0 } },
          clics_web: { page: 4, position: { x: 0, y: 0 } },
          itineraire: { page: 5, position: { x: 0, y: 0 } },
        },
        screenshot_placements: {
          vue_ensemble: { page: 2, position: { x: 0, y: 200 } },
          appels: { page: 3, position: { x: 0, y: 200 } },
          clics_web: { page: 4, position: { x: 0, y: 200 } },
          itineraire: { page: 5, position: { x: 0, y: 200 } },
        },
      };

      const { error } = await supabase
        .from('gbp_report_templates')
        .insert({
          user_id: user.id,
          name: 'Template par défaut',
          description: 'Template standard avec toutes les pages KPI',
          is_default: true,
          template_config: defaultConfig,
        });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Template par défaut créé avec succès',
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (template: GBPReportTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      is_default: template.is_default,
    });
    // Charger les zones OCR si elles existent
    if (template.template_config?.ocr_zones) {
      setOcrZones(template.template_config.ocr_zones);
    } else {
      setOcrZones(DEFAULT_OCR_ZONES);
    }
    // Charger les zones de variables si elles existent
    if (template.template_config?.variable_zones) {
      setVariableZones(template.template_config.variable_zones);
    } else {
      setVariableZones({});
    }
    setShowEditDialog(true);
  };

  const handleSaveOCRZones = async (zones: { current: any; previous: any }) => {
    if (!editingTemplate) return;

    const updatedZones = {
      ...ocrZones,
      [selectedScreenshotType]: zones,
    };
    setOcrZones(updatedZones);

    // Sauvegarder dans la base de données
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentConfig = editingTemplate.template_config || {};
      const updatedConfig = {
        ...currentConfig,
        ocr_zones: updatedZones,
      };

      const { error } = await supabase
        .from('gbp_report_templates')
        .update({ template_config: updatedConfig })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast({
        title: '✅ Zones OCR sauvegardées',
        description: 'Les zones OCR ont été enregistrées avec succès',
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveVariableZone = async (zone: VariableZone) => {
    if (!editingTemplate) return;

    const updatedZones = {
      ...variableZones,
      [zone.variable]: zone,
    };
    setVariableZones(updatedZones);

    // Sauvegarder dans la base de données
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentConfig = editingTemplate.template_config || {};
      const updatedConfig = {
        ...currentConfig,
        variable_zones: updatedZones,
      };

      const { error } = await supabase
        .from('gbp_report_templates')
        .update({ template_config: updatedConfig })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast({
        title: '✅ Zone de variable sauvegardée',
        description: `La zone pour "${zone.variable}" a été enregistrée`,
      });

      fetchTemplates();
      setSelectedVariableZone(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVariableZone = async (variableName: string) => {
    if (!editingTemplate) return;

    const updatedZones = { ...variableZones };
    delete updatedZones[variableName];
    setVariableZones(updatedZones);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentConfig = editingTemplate.template_config || {};
      const updatedConfig = {
        ...currentConfig,
        variable_zones: updatedZones,
      };

      const { error } = await supabase
        .from('gbp_report_templates')
        .update({ template_config: updatedConfig })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast({
        title: '✅ Zone supprimée',
        description: 'La zone de variable a été supprimée',
      });

      fetchTemplates();
      setSelectedVariableZone(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingTemplate) {
        // Si on définit comme template par défaut, retirer le statut des autres
        if (formData.is_default) {
          await supabase
            .from('gbp_report_templates')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .neq('id', editingTemplate.id);
        }

        const { error } = await supabase
          .from('gbp_report_templates')
          .update({
            name: formData.name,
            description: formData.description,
            is_default: formData.is_default,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: 'Succès',
          description: 'Template mis à jour avec succès',
        });
      }

      setShowEditDialog(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

    try {
      const { error } = await supabase
        .from('gbp_report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Template supprimé avec succès',
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de rapports GBP</h2>
          <p className="text-muted-foreground">
            Configurez les templates pour personnaliser la structure de vos rapports
          </p>
        </div>
        <Button onClick={handleCreateDefault} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer template par défaut
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun template configuré
            </p>
            <Button onClick={handleCreateDefault} variant="outline">
              Créer un template par défaut
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.is_default && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Par défaut
                        </span>
                      )}
                    </CardTitle>
                    {template.description && (
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.template_base_url && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      Template uploadé
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    {!template.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </DialogTitle>
            <DialogDescription>
              Configurez les informations de base du template et uploadez votre template personnalisé
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="variables">Zones Variables</TabsTrigger>
              <TabsTrigger value="ocr">Zones OCR</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Template par défaut"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du template..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="is_default">Template par défaut</Label>
                <Select
                  value={formData.is_default ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_default: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="template">
              {editingTemplate && (
                <GBPTemplateUploader
                  template={editingTemplate}
                  onTemplateUpdated={fetchTemplates}
                />
              )}
            </TabsContent>

            <TabsContent value="variables" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  📝 Zones Variables : Où placer les éléments dynamiques sur votre template
                </p>
                <div className="text-sm text-green-800 space-y-1">
                  <p>
                    Les <strong>zones variables</strong> définissent où placer les éléments qui changent d'un client à l'autre sur votre <strong>template de rapport Canva</strong>.
                  </p>
                  <p className="mt-2">
                    <strong>Exemples :</strong> Logo du client (page de garde), Nom du client, Métriques KPI, etc.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Page du template</Label>
                  <Select
                    value={selectedPage.toString()}
                    onValueChange={(value) => {
                      setSelectedPage(parseInt(value));
                      setSelectedVariableZone(null); // Réinitialiser la sélection quand on change de page
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Page 1 (Page de garde)</SelectItem>
                      <SelectItem value="2">Page 2</SelectItem>
                      <SelectItem value="3">Page 3</SelectItem>
                      <SelectItem value="4">Page 4</SelectItem>
                      <SelectItem value="5">Page 5</SelectItem>
                      <SelectItem value="6">Page 6</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sélectionnez la page sur laquelle vous voulez définir une zone
                  </p>
                </div>
                <div>
                  <Label>Zone existante à modifier</Label>
                  <Select
                    value={selectedVariableZone || '__new__'}
                    onValueChange={(value) => setSelectedVariableZone(value === '__new__' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nouvelle zone..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">➕ Créer une nouvelle zone</SelectItem>
                      {Object.entries(variableZones)
                        .filter(([_, zone]) => zone.page === selectedPage)
                        .map(([varName, zone]) => (
                          <SelectItem key={varName} value={varName}>
                            {varName} ({zone.type || 'text'})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modifiez une zone existante ou créez-en une nouvelle
                  </p>
                </div>
              </div>

              {editingTemplate && editingTemplate.template_base_url ? (
                <VariableZoneEditor
                  imageUrl={editingTemplate.template_base_url}
                  pageNumber={selectedPage}
                  initialZone={selectedVariableZone ? variableZones[selectedVariableZone] : undefined}
                  onSave={handleSaveVariableZone}
                />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Veuillez d'abord uploader un template pour configurer les zones de variables</p>
                  </CardContent>
                </Card>
              )}

              {Object.keys(variableZones).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Zones configurées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(variableZones)
                        .filter(([_, zone]) => zone.page === selectedPage)
                        .map(([varName, zone]) => (
                          <div key={varName} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <strong>{varName}</strong> ({zone.type || 'text'})
                              <div className="text-xs text-muted-foreground">
                                x={Math.round(zone.x)}, y={Math.round(zone.y)}, 
                                w={Math.round(zone.width)}, h={Math.round(zone.height)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVariableZone(varName)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ocr" className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ Important : Zones OCR vs Zones Variables
                </p>
                <div className="text-sm text-amber-800 space-y-1">
                  <p>
                    <strong>Zones OCR</strong> : Définissez où se trouvent les chiffres sur vos <strong>captures d'écran du dashboard Google Business Profile</strong>.
                  </p>
                  <p>
                    <strong>Zones Variables</strong> : Définissez où placer les textes/logos sur votre <strong>template de rapport Canva</strong>.
                  </p>
                  <p className="mt-2 font-medium">
                    💡 Pour configurer les zones OCR, utilisez une capture d'écran d'exemple de votre dashboard GBP (pas le template du rapport).
                  </p>
                </div>
              </div>

              <div>
                <Label>Sélectionner le type de capture d'écran</Label>
                <Select
                  value={selectedScreenshotType}
                  onValueChange={(value: any) => setSelectedScreenshotType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vue_ensemble">Vue d'ensemble</SelectItem>
                    <SelectItem value="appels">Appels téléphoniques</SelectItem>
                    <SelectItem value="clics_web">Clics vers le site web</SelectItem>
                    <SelectItem value="itineraire">Demandes d'itinéraire</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Sélectionnez le type de métrique pour lequel vous voulez définir les zones OCR
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📸 Comment configurer les zones OCR :
                </p>
                <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                  <li>Prenez une capture d'écran de votre dashboard Google Business Profile</li>
                  <li>Uploadez-la temporairement (ou utilisez le template comme référence visuelle)</li>
                  <li>Dessinez deux rectangles : un pour la valeur "Current" (actuelle) et un pour "Previous" (année précédente)</li>
                  <li>Ces zones seront utilisées pour extraire automatiquement les chiffres des futures captures d'écran</li>
                </ol>
              </div>

              {editingTemplate && editingTemplate.template_base_url ? (
                <div className="space-y-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                    <strong>Note :</strong> Vous utilisez actuellement le template du rapport comme référence. 
                    Pour une meilleure précision, utilisez une vraie capture d'écran du dashboard GBP.
                  </div>
                  <OCRZoneEditor
                    imageUrl={editingTemplate.template_base_url}
                    screenshotType={selectedScreenshotType}
                    initialZones={ocrZones[selectedScreenshotType]}
                    onSave={handleSaveOCRZones}
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Pour configurer les zones OCR, vous avez besoin d'une image de référence</p>
                    <p className="text-xs">
                      Utilisez une capture d'écran de votre dashboard GBP ou uploadez d'abord un template
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

