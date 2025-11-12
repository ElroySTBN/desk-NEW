import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
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
    setShowEditDialog(true);
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </DialogTitle>
            <DialogDescription>
              Configurez les informations de base du template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!formData.name}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

