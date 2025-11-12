import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Check, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, FileText } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type GBPReportTemplate = Tables<'gbp_report_templates'>;

interface GBPTemplateUploaderProps {
  template: GBPReportTemplate;
  onTemplateUpdated: () => void;
}

interface PageInfo {
  url: string;
  index: number;
  name?: string;
}

export function GBPTemplateUploader({ template, onTemplateUpdated }: GBPTemplateUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les pages existantes depuis template_config
  useEffect(() => {
    const loadPages = async () => {
      try {
        const { data: currentTemplate, error: fetchError } = await supabase
          .from('gbp_report_templates')
          .select('template_config, template_base_url')
          .eq('id', template.id)
          .single();

        if (fetchError) {
          console.error('Erreur lors de la récupération du template:', fetchError);
          return;
        }

        const currentConfig = currentTemplate?.template_config || {};
        const configPages = currentConfig.pages || [];
        
        // Si template_base_url existe mais pas dans pages, l'ajouter pour compatibilité
        if (currentTemplate?.template_base_url && configPages.length === 0) {
          configPages.push(currentTemplate.template_base_url);
        }

        // Créer la liste des pages avec leurs indices
        const pagesList: PageInfo[] = configPages.map((url: string, index: number) => ({
          url,
          index: index + 1,
          name: `Page ${index + 1}`,
        }));

        setPages(pagesList);
      } catch (error) {
        console.error('Erreur lors du chargement des pages:', error);
      }
    };

    loadPages();
  }, [template.id, template.template_config]);

  const uploadFile = async (file: File, pageIndex?: number): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.type === 'application/pdf' ? 'pdf' : file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const fileName = `template-${template.id}-page-${pageIndex !== undefined ? pageIndex : timestamp}.${fileExt}`;
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

    return publicUrl;
  };

  const updateTemplatePages = async (newPages: string[]) => {
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('gbp_report_templates')
      .select('template_config')
      .eq('id', template.id)
      .single();

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération du template: ${fetchError.message}`);
    }

    const currentConfig = currentTemplate?.template_config || {};
    const updatedConfig = {
      ...currentConfig,
      pages: newPages,
    };

    // Déterminer template_base_url (première page pour compatibilité)
    const templateBaseUrl = newPages.length > 0 ? newPages[0] : null;

    // Mettre à jour le template dans la base de données
    const { error: updateError } = await supabase
      .from('gbp_report_templates')
      .update({ 
        template_base_url: templateBaseUrl,
        template_config: updatedConfig,
      })
      .eq('id', template.id);

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Vérifier les types de fichiers
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner uniquement des fichiers PDF ou des images (PNG, JPG)',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      // Uploader tous les fichiers
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadFile(file, pages.length + i + 1);
        uploadedUrls.push(url);
      }

      // Ajouter les nouvelles pages à la liste existante
      const newPages = [...pages.map(p => p.url), ...uploadedUrls];
      await updateTemplatePages(newPages);

      // Mettre à jour l'état local
      const newPagesList: PageInfo[] = newPages.map((url, index) => ({
        url,
        index: index + 1,
        name: `Page ${index + 1}`,
      }));
      setPages(newPagesList);

      toast({
        title: '✅ Pages uploadées',
        description: `${uploadedUrls.length} page(s) ajoutée(s) avec succès. Vous pouvez maintenant configurer les zones dans l'onglet "Zones".`,
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePage = async (pageIndex: number) => {
    if (pages.length === 0) return;

    setUploading(true);
    try {
      // Retirer la page de la liste
      const pageToRemove = pages[pageIndex];
      const newPages = pages.filter((_, index) => index !== pageIndex).map(p => p.url);
      
      // Supprimer le fichier du storage si possible
      try {
        const urlParts = pageToRemove.url.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('gbp-templates') + 1).join('/');
        await supabase.storage
          .from('gbp-templates')
          .remove([filePath]);
      } catch (error) {
        console.warn('Impossible de supprimer le fichier du storage:', error);
      }

      // Mettre à jour le template
      await updateTemplatePages(newPages);

      // Mettre à jour l'état local
      const newPagesList: PageInfo[] = newPages.map((url, index) => ({
        url,
        index: index + 1,
        name: `Page ${index + 1}`,
      }));
      setPages(newPagesList);

      toast({
        title: '✅ Page supprimée',
        description: 'La page a été supprimée avec succès',
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

  const handleMovePage = async (pageIndex: number, direction: 'up' | 'down') => {
    if (pages.length <= 1) return;

    const newIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;

    setUploading(true);
    try {
      // Réorganiser les pages
      const newPages = [...pages];
      [newPages[pageIndex], newPages[newIndex]] = [newPages[newIndex], newPages[pageIndex]];

      // Mettre à jour le template
      await updateTemplatePages(newPages.map(p => p.url));

      // Mettre à jour l'état local
      const updatedPagesList: PageInfo[] = newPages.map((page, index) => ({
        ...page,
        index: index + 1,
        name: `Page ${index + 1}`,
      }));
      setPages(updatedPagesList);

      toast({
        title: '✅ Page déplacée',
        description: `La page a été déplacée ${direction === 'up' ? 'vers le haut' : 'vers le bas'}`,
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

  const handleReplacePage = async (pageIndex: number, file: File) => {
    setUploading(true);
    try {
      // Uploader le nouveau fichier
      const newUrl = await uploadFile(file, pageIndex + 1);

      // Remplacer la page dans la liste
      const newPages = [...pages];
      const oldUrl = newPages[pageIndex].url;
      newPages[pageIndex] = {
        url: newUrl,
        index: pageIndex + 1,
        name: `Page ${pageIndex + 1}`,
      };

      // Supprimer l'ancien fichier du storage
      try {
        const urlParts = oldUrl.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('gbp-templates') + 1).join('/');
        await supabase.storage
          .from('gbp-templates')
          .remove([filePath]);
      } catch (error) {
        console.warn('Impossible de supprimer l\'ancien fichier du storage:', error);
      }

      // Mettre à jour le template
      await updateTemplatePages(newPages.map(p => p.url));

      // Mettre à jour l'état local
      setPages(newPages);

      toast({
        title: '✅ Page remplacée',
        description: 'La page a été remplacée avec succès',
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

  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages du Template</CardTitle>
        <CardDescription>
          Uploadez plusieurs pages pour votre template. Pour configurer les zones, utilisez des images PNG ou JPG (une image par page). Le PDF peut être utilisé pour la génération du rapport, mais les images sont nécessaires pour la configuration visuelle des zones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone d'upload */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <Label htmlFor="template-upload" className="cursor-pointer">
            <Button variant="outline" asChild disabled={uploading}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Upload en cours...' : 'Ajouter des pages (PDF ou images)'}
              </span>
            </Button>
          </Label>
          <Input
            id="template-upload"
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Formats acceptés: PDF, PNG, JPG (sélection multiple possible)
          </p>
          {pages.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {pages.length} page(s) configurée(s)
            </p>
          )}
        </div>

        {/* Liste des pages */}
        {pages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Pages configurées</h3>
              <span className="text-xs text-muted-foreground">{pages.length} page(s)</span>
            </div>
            <div className="grid gap-3">
              {pages.map((page, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Aperçu de la page */}
                      <div className="flex-shrink-0 w-24 h-32 border rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {isPDF(page.url) ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        ) : (
                          <img
                            src={page.url}
                            alt={`Page ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Informations de la page */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold">Page {index + 1}</span>
                          {isPDF(page.url) && (
                            <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded">
                              PDF
                            </span>
                          )}
                          {!isPDF(page.url) && (
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded">
                              Image
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {isPDF(page.url) 
                            ? 'Format PDF détecté. Pour configurer les zones, exportez cette page en image PNG ou JPG.'
                            : 'Image prête pour la configuration des zones.'}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMovePage(index, 'up')}
                            disabled={index === 0 || uploading}
                          >
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Haut
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMovePage(index, 'down')}
                            disabled={index === pages.length - 1 || uploading}
                          >
                            <ArrowDown className="h-3 w-3 mr-1" />
                            Bas
                          </Button>
                          <Label htmlFor={`replace-page-${index}`} className="cursor-pointer">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              disabled={uploading}
                            >
                              <span>
                                <Upload className="h-3 w-3 mr-1" />
                                Remplacer
                              </span>
                            </Button>
                          </Label>
                          <Input
                            id={`replace-page-${index}`}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleReplacePage(index, file);
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePage(index)}
                            disabled={uploading || pages.length === 1}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Message d'aide */}
        {pages.length === 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
              💡 Astuce pour configurer les zones :
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Pour configurer visuellement les zones (logo, screenshots, textes), exportez votre template Canva en images PNG ou JPG (une image par page). Le PDF peut toujours être utilisé pour la génération du rapport final.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
