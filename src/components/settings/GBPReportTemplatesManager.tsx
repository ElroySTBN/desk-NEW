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
import { TextTemplateEditor } from './TextTemplateEditor';
import { DEFAULT_OCR_ZONES } from '@/lib/kpiExtractor';
import type { GBPTemplateConfig } from '@/lib/gbpTemplateConfig';
import { DEFAULT_TEMPLATE_CONFIG, validateTemplateConfig } from '@/lib/gbpTemplateConfig';
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
  template_config: GBPTemplateConfig | any;
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
  const [templateConfig, setTemplateConfig] = useState<GBPTemplateConfig>(DEFAULT_TEMPLATE_CONFIG);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gbp_report_templates' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false }) as any;

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
        .from('gbp_report_templates' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle() as any;

      if (existing) {
        toast({
          title: 'Template par défaut existe déjà',
          description: 'Un template par défaut existe déjà. Modifiez-le ou supprimez-le d\'abord.',
        });
        return;
      }

      // Créer un template par défaut avec la structure simplifiée
      const defaultConfig: GBPTemplateConfig = {
        pages: [], // Pages à uploader par l'utilisateur
        variables: {},
        screenshot_placements: {},
        text_templates: {},
        ocr_zones: DEFAULT_OCR_ZONES,
      };

      const { error } = await supabase
        .from('gbp_report_templates' as any)
        .insert({
          user_id: user.id,
          name: 'Template par défaut',
          description: 'Template standard - Uploadez vos pages et configurez les variables',
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
    
    // Charger la configuration du template (nouveau format simplifié)
    if (template.template_config) {
      // Migrer depuis l'ancien format si nécessaire
      const config = template.template_config as any;
      const simplifiedConfig: GBPTemplateConfig = {
        pages: config.pages || (template.template_base_url ? [template.template_base_url] : []),
        variables: config.variables || config.variable_zones || {},
        screenshot_placements: config.screenshot_placements || {},
        text_templates: config.text_templates || {},
        ocr_zones: config.ocr_zones || DEFAULT_OCR_ZONES,
      };
      setTemplateConfig(simplifiedConfig);
    } else {
      setTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
    }
    
    setShowEditDialog(true);
  };

  const handleSaveTemplateConfig = async () => {
    if (!editingTemplate) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Valider la configuration
      const validation = validateTemplateConfig(templateConfig);
      if (!validation.valid) {
        toast({
          title: 'Configuration invalide',
          description: validation.errors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('gbp_report_templates' as any)
        .update({ template_config: templateConfig })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast({
        title: '✅ Configuration sauvegardée',
        description: 'La configuration du template a été enregistrée avec succès',
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

  const handleSaveTextTemplates = async (textTemplates: {
    vue_ensemble?: any;
    appels?: any;
    clics_web?: any;
    itineraire?: any;
  }) => {
    setTemplateConfig(prev => ({
      ...prev,
      text_templates: textTemplates,
    }));
    
    // Sauvegarder automatiquement
    if (editingTemplate) {
      const updatedConfig = {
        ...templateConfig,
        text_templates: textTemplates,
      };
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('gbp_report_templates' as any)
          .update({ template_config: updatedConfig })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        setTemplateConfig(updatedConfig);
        toast({
          title: '✅ Templates de textes sauvegardés',
          description: 'Les templates de textes ont été enregistrés avec succès',
        });

        fetchTemplates();
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        });
      }
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
            .from('gbp_report_templates' as any)
            .update({ is_default: false })
            .eq('user_id', user.id)
            .neq('id', editingTemplate.id);
        }

        // Valider la configuration avant de sauvegarder
        const validation = validateTemplateConfig(templateConfig);
        if (!validation.valid) {
          toast({
            title: 'Configuration invalide',
            description: validation.errors.join(', '),
            variant: 'destructive',
          });
          return;
        }

        const { error } = await supabase
          .from('gbp_report_templates' as any)
          .update({
            name: formData.name,
            description: formData.description,
            is_default: formData.is_default,
            template_config: templateConfig,
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
        .from('gbp_report_templates' as any)
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="textes">Templates de textes</TabsTrigger>
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

            <TabsContent value="textes" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Templates de textes conditionnels
                </p>
                <p className="text-sm text-blue-800">
                  Configurez les textes qui seront générés automatiquement selon l'évolution des KPIs.
                  Les textes changent selon que l'évolution est positive, négative ou stable.
                </p>
              </div>

              {editingTemplate ? (
                <TextTemplateEditor
                  templates={templateConfig.text_templates || {}}
                  onSave={handleSaveTextTemplates}
                />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Veuillez d'abord créer un template</p>
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

