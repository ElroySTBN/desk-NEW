import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Copy, FileText } from 'lucide-react';
import type { ReportTextTemplate } from '@/types/gbp-reports';
import { ensureDefaultTemplates } from '@/lib/reportTemplates';

const CATEGORIES: ReportTextTemplate['category'][] = ['vue_ensemble', 'appels', 'clics_web', 'itineraire'];
const CONTEXTS: ReportTextTemplate['context'][] = ['positive_high', 'positive_moderate', 'stable', 'negative'];

const CATEGORY_LABELS: Record<ReportTextTemplate['category'], string> = {
  vue_ensemble: 'Vue d\'ensemble',
  appels: 'Appels téléphoniques',
  clics_web: 'Clics vers le site web',
  itineraire: 'Demandes d\'itinéraire',
};

const CONTEXT_LABELS: Record<ReportTextTemplate['context'], string> = {
  positive_high: 'Hausse significative (+50%+)',
  positive_moderate: 'Hausse modérée (+10% à +49%)',
  stable: 'Stabilité (-10% à +10%)',
  negative: 'Baisse (-10% et moins)',
};

export function ReportTemplatesManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ReportTextTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ReportTextTemplate['category']>('vue_ensemble');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTextTemplate | null>(null);
  const [formData, setFormData] = useState({
    category: 'vue_ensemble' as ReportTextTemplate['category'],
    context: 'positive_high' as ReportTextTemplate['context'],
    template: '',
    is_default: false,
  });

  useEffect(() => {
    ensureDefaultTemplates().then(() => {
      fetchTemplates();
    });
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rapport_text_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', selectedCategory)
        .order('is_default', { ascending: false })
        .order('context');

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

  const handleOpenDialog = (template?: ReportTextTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        category: template.category,
        context: template.context,
        template: template.template,
        is_default: template.is_default,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        category: selectedCategory,
        context: 'positive_high',
        template: '',
        is_default: false,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingTemplate) {
        const { error } = await supabase
          .from('rapport_text_templates')
          .update({
            category: formData.category,
            context: formData.context,
            template: formData.template,
            is_default: formData.is_default,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: '✅ Template modifié' });
      } else {
        const { error } = await supabase
          .from('rapport_text_templates')
          .insert({
            user_id: user.id,
            category: formData.category,
            context: formData.context,
            template: formData.template,
            is_default: formData.is_default,
          });

        if (error) throw error;
        toast({ title: '✅ Template créé' });
      }

      setShowDialog(false);
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
        .from('rapport_text_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: '🗑️ Template supprimé' });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (template: ReportTextTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('rapport_text_templates')
        .insert({
          user_id: user.id,
          category: template.category,
          context: template.context,
          template: template.template,
          is_default: false,
        });

      if (error) throw error;
      toast({ title: '✅ Template dupliqué' });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de Rapports GBP</h2>
          <p className="text-muted-foreground">
            Gérez les templates de textes pour vos rapports mensuels
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catégories</CardTitle>
          <CardDescription>Sélectionnez une catégorie pour voir les templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {CATEGORY_LABELS[category]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{CONTEXT_LABELS[template.context]}</CardTitle>
                  {template.is_default && (
                    <Badge variant="default">Par défaut</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!template.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {template.template}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Variables disponibles: {'{X}'}, {'{Y}'}, {'{Z}'}, {'{percentage}'}, {'{period}'}, {'{daily_avg}'}, {'{monthly_avg}'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ReportTextTemplate['category']) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Contexte</Label>
              <Select
                value={formData.context}
                onValueChange={(value: ReportTextTemplate['context']) =>
                  setFormData({ ...formData, context: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTEXTS.map((ctx) => (
                    <SelectItem key={ctx} value={ctx}>
                      {CONTEXT_LABELS[ctx]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Template</Label>
              <Textarea
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                placeholder="Texte du template avec variables {X}, {Y}, {Z}, {percentage}, {period}, {daily_avg}, {monthly_avg}"
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Variables disponibles: {'{X}'} (valeur actuelle), {'{Y}'} (valeur précédente), {'{Z}'} (différence), {'{percentage}'} (pourcentage), {'{period}'} (période), {'{daily_avg}'} (moyenne quotidienne), {'{monthly_avg}'} (moyenne mensuelle)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) =>
                  setFormData({ ...formData, is_default: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Template par défaut (sera suggéré automatiquement)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


