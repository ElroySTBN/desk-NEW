import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RotateCcw, Image as ImageIcon, Type, MousePointer2 } from 'lucide-react';
import type { GBPTemplateConfig, LogoPlacement, TextPlacement, ScreenshotPlacement } from '@/lib/gbpTemplateConfig';
import type { OCRZone } from '@/lib/ocrService';

interface ZoneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TemplateZoneConfiguratorProps {
  templateConfig: GBPTemplateConfig;
  onConfigChange: (config: Partial<GBPTemplateConfig>) => void;
}

const CATEGORIES = [
  { value: 'vue_ensemble', label: 'Vue d\'ensemble', page: 2 },
  { value: 'appels', label: 'Appels', page: 3 },
  { value: 'clics_web', label: 'Clics web', page: 4 },
  { value: 'itineraire', label: 'Itinéraire', page: 5 },
] as const;

export function TemplateZoneConfigurator({
  templateConfig,
  onConfigChange,
}: TemplateZoneConfiguratorProps) {
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire' | null>(null);
  const [editingZone, setEditingZone] = useState<'logo' | 'screenshot' | 'text' | 'ocr_current' | 'ocr_previous' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentZone, setCurrentZone] = useState<ZoneRect | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);

  // Récupérer l'URL de l'image pour la page sélectionnée
  // Si une seule page est uploadée, l'utiliser pour toutes les pages
  // Sinon, utiliser la page correspondante
  const currentPageUrl = templateConfig.pages.length === 1
    ? templateConfig.pages[0]
    : (templateConfig.pages[selectedPage - 1] || templateConfig.pages[0] || null);

  // Vérifier si l'URL pointe vers un PDF
  const isPDF = currentPageUrl?.toLowerCase().endsWith('.pdf') || currentPageUrl?.includes('.pdf') || currentPageUrl?.includes('application/pdf');

  // Charger l'image et calculer l'échelle
  useEffect(() => {
    if (!currentPageUrl) {
      setImageError('Aucune image pour cette page');
      setImageLoading(false);
      return;
    }

    // Si c'est un PDF, afficher un message d'erreur clair
    if (isPDF) {
      setImageError('Les fichiers PDF ne peuvent pas être utilisés pour configurer les zones. Veuillez exporter votre template Canva en images PNG ou JPG et les uploader dans l\'onglet "Template".');
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    setImageError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Vérifier le type MIME avant de charger
    fetch(currentPageUrl, { mode: 'cors', method: 'HEAD' })
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          throw new Error('PDF détecté');
        }
        return fetch(currentPageUrl, { mode: 'cors' });
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur de chargement');
        return response.blob();
      })
      .then(blob => {
        // Vérifier le type MIME du blob
        if (blob.type.includes('pdf')) {
          throw new Error('PDF détecté');
        }
        
        const url = URL.createObjectURL(blob);
        img.src = url;
        imageRef.current = img;

        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Calculer l'échelle pour que l'image rentre dans le conteneur
          const maxWidth = 800;
          const maxHeight = 600;
          const imgWidth = img.width;
          const imgHeight = img.height;

          const scaleX = maxWidth / imgWidth;
          const scaleY = maxHeight / imgHeight;
          const newScale = Math.min(scaleX, scaleY, 1); // Ne pas agrandir

          setScale(newScale);

          canvas.width = imgWidth * newScale;
          canvas.height = imgHeight * newScale;

          setImageLoading(false);
          drawCanvas();
        };

        img.onerror = (error) => {
          URL.revokeObjectURL(url);
          setImageError('Erreur lors du chargement de l\'image. Vérifiez que le fichier est bien une image PNG ou JPG.');
          setImageLoading(false);
        };
      })
      .catch((error) => {
        if (error.message === 'PDF détecté' || isPDF) {
          setImageError('Les fichiers PDF ne peuvent pas être utilisés pour configurer les zones. Veuillez exporter votre template Canva en images PNG ou JPG (une image par page) et les uploader dans l\'onglet "Template".');
        } else {
          setImageError(`Erreur lors du chargement: ${error.message || 'Impossible de charger l\'image. Vérifiez que le fichier est accessible et qu\'il s\'agit d\'une image PNG ou JPG.'}`);
        }
        setImageLoading(false);
      });
  }, [currentPageUrl, isPDF]);

  // Dessiner le canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dessiner les zones existantes selon la page
    if (selectedPage === 1) {
      // Page 1: Logo
      if (templateConfig.logo_placement) {
        drawZone(
          ctx,
          templateConfig.logo_placement,
          'Logo',
          '#10b981',
          scale
        );
      }
    } else if (selectedPage >= 2 && selectedPage <= 5) {
      // Pages 2-5: Screenshot et texte
      const categoryIndex = selectedPage - 2;
      const category = CATEGORIES[categoryIndex];
      
      if (category) {
        // Screenshot
        const screenshotPlacement = templateConfig.screenshot_placements[category.value];
        if (screenshotPlacement && screenshotPlacement.page === selectedPage) {
          drawZone(
            ctx,
            screenshotPlacement,
            'Screenshot',
            '#3b82f6',
            scale
          );
        }

        // Texte
        const textPlacement = templateConfig.text_placements[category.value];
        if (textPlacement && textPlacement.page === selectedPage) {
          drawZone(
            ctx,
            textPlacement,
            'Texte d\'analyse',
            '#f59e0b',
            scale
          );
        }
      }
    }

    // Dessiner la zone en cours de dessin
    if (currentZone && isDrawing) {
      drawZone(ctx, currentZone, editingZone || 'Zone', getZoneColor(editingZone), 1);
    }
  }, [templateConfig, selectedPage, currentZone, isDrawing, editingZone, scale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Fonction pour dessiner une zone
  const drawZone = (
    ctx: CanvasRenderingContext2D,
    zone: { x: number; y: number; width: number; height: number },
    label: string,
    color: string,
    zoneScale: number
  ) => {
    const x = zone.x * zoneScale;
    const y = zone.y * zoneScale;
    const width = zone.width * zoneScale;
    const height = zone.height * zoneScale;

    // Rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Fond semi-transparent
    ctx.fillStyle = color + '30';
    ctx.fillRect(x, y, width, height);

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(label, x + 5, y + 20);
  };

  // Obtenir la couleur selon le type de zone
  const getZoneColor = (type: string | null): string => {
    switch (type) {
      case 'logo':
        return '#10b981';
      case 'screenshot':
        return '#3b82f6';
      case 'text':
        return '#f59e0b';
      case 'ocr_current':
        return '#10b981';
      case 'ocr_previous':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  // Gestion du clic sur le canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editingZone) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentZone({ x, y, width: 0, height: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !editingZone) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);
    const zoneX = Math.min(x, startPos.x);
    const zoneY = Math.min(y, startPos.y);

    setCurrentZone({ x: zoneX, y: zoneY, width, height });
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentZone || !editingZone) return;

    // Sauvegarder la zone selon le type
    saveZone(currentZone);

    setIsDrawing(false);
    setStartPos(null);
    setCurrentZone(null);
    setEditingZone(null);
  };

  // Sauvegarder la zone
  const saveZone = (zone: ZoneRect) => {
    if (selectedPage === 1 && editingZone === 'logo') {
      // Logo sur page 1
      onConfigChange({
        logo_placement: {
          page: 1,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
        },
      });
    } else if (selectedPage >= 2 && selectedPage <= 5 && selectedCategory) {
      // Screenshot ou texte sur pages 2-5
      if (editingZone === 'screenshot') {
        onConfigChange({
          screenshot_placements: {
            ...templateConfig.screenshot_placements,
            [selectedCategory]: {
              page: selectedPage,
              x: zone.x,
              y: zone.y,
              width: zone.width,
              height: zone.height,
            },
          },
        });
      } else if (editingZone === 'text') {
        onConfigChange({
          text_placements: {
            ...templateConfig.text_placements,
            [selectedCategory]: {
              page: selectedPage,
              x: zone.x,
              y: zone.y,
              width: zone.width,
              height: zone.height,
              fontSize: templateConfig.text_placements[selectedCategory]?.fontSize || 12,
              color: templateConfig.text_placements[selectedCategory]?.color || '#000000',
              align: templateConfig.text_placements[selectedCategory]?.align || 'left',
            },
          },
        });
      }
    }
  };

  // Gérer le changement de page
  useEffect(() => {
    if (selectedPage === 1) {
      setSelectedCategory(null);
      setEditingZone(null);
    } else if (selectedPage >= 2 && selectedPage <= 5) {
      const categoryIndex = selectedPage - 2;
      const category = CATEGORIES[categoryIndex];
      if (category) {
        setSelectedCategory(category.value);
      }
    }
  }, [selectedPage]);

  if (!currentPageUrl) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Aucune image pour la page {selectedPage}. Veuillez d'abord uploader les pages du template.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Afficher un message d'erreur clair si c'est un PDF
  if (isPDF) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ Format PDF détecté
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              Les fichiers PDF ne peuvent pas être utilisés pour configurer les zones visuellement.
            </p>
            <div className="text-left space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold">Pour configurer les zones, vous devez :</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Exporter votre template Canva en images PNG ou JPG (une image par page)</li>
                <li>Dans Canva : Menu → Télécharger → Format PNG ou JPG</li>
                <li>Pour chaque page (5 pages au total) : exporter séparément</li>
                <li>Revenir dans l'onglet "Template" et uploader les 5 images</li>
              </ol>
              <p className="mt-4 font-semibold">Note :</p>
              <p>Vous pouvez toujours utiliser le PDF pour la génération du rapport final. Les images PNG/JPG sont uniquement nécessaires pour configurer visuellement les zones.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration des zones</CardTitle>
          <CardDescription>
            Sélectionnez une page et configurez visuellement les zones pour le logo, les screenshots, les textes et les zones OCR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection de la page */}
          <div className="space-y-2">
            <Label>Page</Label>
            <Select
              value={selectedPage.toString()}
              onValueChange={(value) => setSelectedPage(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Page 1 - Couverture (Logo)</SelectItem>
                <SelectItem value="2">Page 2 - Vue d'ensemble</SelectItem>
                <SelectItem value="3">Page 3 - Appels</SelectItem>
                <SelectItem value="4">Page 4 - Clics web</SelectItem>
                <SelectItem value="5">Page 5 - Itinéraire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instructions selon la page */}
          {selectedPage === 1 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Page 1 - Couverture:</strong> Configurez la zone où le logo du client sera placé.
                Cliquez sur "Configurer le logo" puis dessinez une zone sur l'image.
              </p>
            </div>
          )}

          {selectedPage >= 2 && selectedPage <= 5 && selectedCategory && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Page {selectedPage} - {CATEGORIES[selectedPage - 2].label}:</strong>
                Configurez les zones pour le screenshot et le texte d'analyse.
                Cliquez sur les boutons ci-dessous puis dessinez les zones sur l'image.
              </p>
            </div>
          )}

          {/* Boutons d'édition selon la page */}
          <div className="flex gap-2 flex-wrap">
            {selectedPage === 1 && (
              <Button
                type="button"
                variant={editingZone === 'logo' ? 'default' : 'outline'}
                onClick={() => setEditingZone(editingZone === 'logo' ? null : 'logo')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {editingZone === 'logo' ? 'Annuler' : 'Configurer le logo'}
              </Button>
            )}

            {selectedPage >= 2 && selectedPage <= 5 && selectedCategory && (
              <>
                <Button
                  type="button"
                  variant={editingZone === 'screenshot' ? 'default' : 'outline'}
                  onClick={() => setEditingZone(editingZone === 'screenshot' ? null : 'screenshot')}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {editingZone === 'screenshot' ? 'Annuler' : 'Configurer le screenshot'}
                </Button>
                <Button
                  type="button"
                  variant={editingZone === 'text' ? 'default' : 'outline'}
                  onClick={() => setEditingZone(editingZone === 'text' ? null : 'text')}
                >
                  <Type className="h-4 w-4 mr-2" />
                  {editingZone === 'text' ? 'Annuler' : 'Configurer le texte'}
                </Button>
              </>
            )}
          </div>

          {/* Canvas pour dessiner les zones */}
          {imageLoading ? (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Chargement de l'image...</p>
              </div>
            </div>
          ) : imageError ? (
            <div className="p-8 text-center">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ Erreur de chargement
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">{imageError}</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto max-h-[600px] bg-gray-50 dark:bg-gray-900">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="cursor-crosshair"
                style={{ display: 'block' }}
              />
            </div>
          )}

          {/* Instructions de dessin */}
          {editingZone && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <MousePointer2 className="h-4 w-4 inline mr-2" />
                Mode édition activé: Cliquez et glissez sur l'image pour dessiner une zone.
              </p>
            </div>
          )}

          {/* Configuration des zones OCR (pour les screenshots) */}
          {selectedPage >= 2 && selectedPage <= 5 && selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Zones OCR pour {CATEGORIES[selectedPage - 2].label}</CardTitle>
                <CardDescription className="text-xs">
                  Configurez les zones OCR pour extraire les valeurs actuelles et précédentes depuis les screenshots.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    Les zones OCR sont configurées lors de l'upload des screenshots.
                    Utilisez l'éditeur OCR dans la section de création de rapport pour configurer ces zones.
                  </p>
                </div>
                {templateConfig.ocr_zones[selectedCategory] && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Zone Current</Label>
                      <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        X: {templateConfig.ocr_zones[selectedCategory].current.x.toFixed(0)}, 
                        Y: {templateConfig.ocr_zones[selectedCategory].current.y.toFixed(0)}, 
                        W: {templateConfig.ocr_zones[selectedCategory].current.width.toFixed(0)}, 
                        H: {templateConfig.ocr_zones[selectedCategory].current.height.toFixed(0)}
                      </div>
                    </div>
                    <div>
                      <Label>Zone Previous</Label>
                      <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        X: {templateConfig.ocr_zones[selectedCategory].previous.x.toFixed(0)}, 
                        Y: {templateConfig.ocr_zones[selectedCategory].previous.y.toFixed(0)}, 
                        W: {templateConfig.ocr_zones[selectedCategory].previous.width.toFixed(0)}, 
                        H: {templateConfig.ocr_zones[selectedCategory].previous.height.toFixed(0)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

