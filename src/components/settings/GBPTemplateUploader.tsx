import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type GBPReportTemplate = Tables<'gbp_report_templates'>;

interface GBPTemplateUploaderProps {
  template: GBPReportTemplate;
  onTemplateUpdated: () => void;
}

export function GBPTemplateUploader({ template, onTemplateUpdated }: GBPTemplateUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [templateUrl, setTemplateUrl] = useState<string | null>(template.template_base_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier (PDF ou image)
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier PDF ou une image (PNG, JPG)',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.type === 'application/pdf' ? 'pdf' : file.name.split('.').pop();
      const fileName = `template-${template.id}.${fileExt}`;
      const filePath = `${user.id}/templates/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('gbp-templates')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('gbp-templates')
        .getPublicUrl(filePath);

      // Récupérer le template actuel pour mettre à jour template_config.pages
      const { data: currentTemplate, error: fetchError } = await supabase
        .from('gbp_report_templates')
        .select('template_config')
        .eq('id', template.id)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération du template: ${fetchError.message}`);
      }

      // Mettre à jour template_config.pages avec la nouvelle URL
      const currentConfig = currentTemplate?.template_config || {};
      const currentPages = currentConfig.pages || [];
      
      // Si pages est vide ou si c'est un seul fichier, remplacer par la nouvelle URL
      // Sinon, ajouter la nouvelle URL à la fin (pour support multi-pages)
      let updatedPages: string[];
      if (currentPages.length === 0 || currentPages.length === 1) {
        // Remplacer la seule page ou ajouter la première page
        updatedPages = [publicUrl];
      } else {
        // Pour l'instant, on remplace toutes les pages par la nouvelle URL
        // TODO: Implémenter un système pour uploader plusieurs pages
        updatedPages = [publicUrl];
      }

      const updatedConfig = {
        ...currentConfig,
        pages: updatedPages,
      };

      // Mettre à jour le template dans la base de données
      const { error: updateError } = await supabase
        .from('gbp_report_templates')
        .update({ 
          template_base_url: publicUrl,
          template_config: updatedConfig,
        })
        .eq('id', template.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
      }

      setTemplateUrl(publicUrl);
      
      // Vérifier si c'est un PDF
      const isPDF = file.type === 'application/pdf' || publicUrl.toLowerCase().endsWith('.pdf');
      
      if (isPDF) {
        toast({
          title: '✅ Template PDF uploadé',
          description: 'Le template PDF a été uploadé. Pour configurer les zones, vous devez exporter votre template Canva en images PNG ou JPG (une image par page) et les uploader. Allez dans l\'onglet "Zones" pour plus d\'informations.',
          variant: 'default',
        });
      } else {
        toast({
          title: '✅ Template uploadé',
          description: 'Le template a été uploadé avec succès. Allez dans l\'onglet "Zones" pour configurer les placements (logo, screenshots, textes).',
        });
      }
      
      onTemplateUpdated();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveTemplate = async () => {
    if (!templateUrl) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Extraire le chemin du fichier depuis l'URL
      const urlParts = templateUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('gbp-templates') + 1).join('/');

      // Supprimer le fichier du storage
      const { error: deleteError } = await supabase.storage
        .from('gbp-templates')
        .remove([filePath]);

      if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError);
      }

      // Récupérer le template actuel pour mettre à jour template_config.pages
      const { data: currentTemplate, error: fetchError } = await supabase
        .from('gbp_report_templates')
        .select('template_config')
        .eq('id', template.id)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération du template: ${fetchError.message}`);
      }

      // Mettre à jour template_config.pages pour retirer l'URL supprimée
      const currentConfig = currentTemplate?.template_config || {};
      const currentPages = currentConfig.pages || [];
      
      // Retirer l'URL supprimée du tableau pages
      const updatedPages = currentPages.filter((url: string) => url !== templateUrl);

      const updatedConfig = {
        ...currentConfig,
        pages: updatedPages,
      };

      // Mettre à jour le template dans la base de données
      const { error: updateError } = await supabase
        .from('gbp_report_templates')
        .update({ 
          template_base_url: null,
          template_config: updatedConfig,
        })
        .eq('id', template.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
      }

      setTemplateUrl(null);
      toast({
        title: '✅ Template supprimé',
        description: 'Le template a été supprimé',
      });
      onTemplateUpdated();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template de Base</CardTitle>
        <CardDescription>
          Uploadez votre template personnalisé. Pour configurer les zones, utilisez des images PNG ou JPG (une image par page). Le PDF peut être utilisé pour la génération du rapport, mais les images sont nécessaires pour la configuration visuelle des zones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templateUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              Template uploadé
            </div>
            {templateUrl.endsWith('.pdf') ? (
              <iframe
                src={templateUrl}
                className="w-full h-96 border rounded"
                title="Template PDF"
              />
            ) : (
              <img
                src={templateUrl}
                alt="Template"
                className="max-w-full h-auto border rounded"
              />
            )}
            <Button
              variant="outline"
              onClick={handleRemoveTemplate}
              disabled={uploading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Supprimer le template
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="template-upload" className="cursor-pointer">
              <Button variant="outline" asChild disabled={uploading}>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Upload en cours...' : 'Sélectionner un template (PDF ou image)'}
                </span>
              </Button>
            </Label>
            <Input
              id="template-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Formats acceptés: PDF, PNG, JPG
            </p>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                💡 Astuce pour configurer les zones :
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Pour configurer visuellement les zones (logo, screenshots, textes), exportez votre template Canva en images PNG ou JPG (une image par page). Le PDF peut toujours être utilisé pour la génération du rapport final.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

