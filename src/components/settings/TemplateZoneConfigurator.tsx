import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, RotateCcw, Image as ImageIcon, Type, MousePointer2, Trash2, Edit } from 'lucide-react';
import type { GBPTemplateConfig, LogoPlacement, TextPlacement, ScreenshotPlacement, AVAILABLE_VARIABLES } from '@/lib/gbpTemplateConfig';
import type { VariableConfig } from '@/lib/templateConfig';
import { AVAILABLE_VARIABLES as GBP_VARIABLES } from '@/lib/gbpTemplateConfig';

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

interface ZoneInfo {
  id: string;
  type: 'logo' | 'screenshot' | 'text' | 'variable_text' | 'variable_image';
  label: string;
  zone: ZoneRect & { page: number; variable?: string; fontSize?: number; color?: string; align?: string };
  category?: string;
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
  const [selectedZoneType, setSelectedZoneType] = useState<'text' | 'image' | 'logo' | 'screenshot' | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentZone, setCurrentZone] = useState<ZoneRect | null>(null);
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pageZonesRef = useRef<ZoneInfo[]>([]);
  const drawAllZonesRef = useRef<typeof drawAllZones | null>(null);
  const [scale, setScale] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Mettre à jour la ref des zones quand elles changent
  useEffect(() => {
    pageZonesRef.current = pageZones;
  }, [pageZones]);
  
  // Mettre à jour la ref de drawAllZones quand elle change
  useEffect(() => {
    drawAllZonesRef.current = drawAllZones;
  }, [drawAllZones]);

  // Générer la liste des pages disponibles
  const availablePages = templateConfig.pages.length > 0 
    ? templateConfig.pages.map((_, index) => index + 1)
    : [1, 2, 3, 4, 5]; // Pages par défaut pour compatibilité

  // Récupérer l'URL de l'image pour la page sélectionnée
  const currentPageUrl = templateConfig.pages.length === 0
    ? null
    : (templateConfig.pages[selectedPage - 1] || templateConfig.pages[0] || null);

  // Collecter toutes les zones pour la page sélectionnée (memoized)
  const pageZones = useMemo((): ZoneInfo[] => {
    const zones: ZoneInfo[] = [];
    const page = selectedPage;

    // Logo sur page 1 (si applicable)
    if (page === 1 && templateConfig.logo_placement) {
      zones.push({
        id: 'logo',
        type: 'logo',
        label: 'Logo',
        zone: templateConfig.logo_placement,
      });
    }

    // Zones spécifiques GBP (screenshots et textes)
    if (page >= 2 && page <= 5) {
      const categoryIndex = page - 2;
      const category = CATEGORIES[categoryIndex];
      
      if (category) {
        // Screenshot
        const screenshotPlacement = templateConfig.screenshot_placements[category.value];
        if (screenshotPlacement && screenshotPlacement.page === page) {
          zones.push({
            id: `screenshot_${category.value}`,
            type: 'screenshot',
            label: `Screenshot - ${category.label}`,
            zone: screenshotPlacement,
            category: category.value,
          });
        }

        // Texte
        const textPlacement = templateConfig.text_placements[category.value];
        if (textPlacement && textPlacement.page === page) {
          zones.push({
            id: `text_${category.value}`,
            type: 'text',
            label: `Texte - ${category.label}`,
            zone: textPlacement,
            category: category.value,
          });
        }
      }
    }

    // Zones génériques (variables)
    if (templateConfig.variables) {
      for (const [key, variable] of Object.entries(templateConfig.variables)) {
        if (variable.page === page) {
          zones.push({
            id: `variable_${key}`,
            type: variable.type === 'text' ? 'variable_text' : 'variable_image',
            label: variable.variable || key,
            zone: variable,
          });
        }
      }
    }

    return zones;
  }, [selectedPage, templateConfig]);

  // Fonction pour dessiner une zone
  const drawZone = useCallback((
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
  }, []);

  // Obtenir la couleur selon le type de zone
  const getZoneColor = useCallback((type: string): string => {
    switch (type) {
      case 'logo':
      case 'variable_image':
        return '#10b981';
      case 'screenshot':
        return '#3b82f6';
      case 'text':
      case 'variable_text':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }, []);

  // Fonction pour dessiner toutes les zones sur le canvas
  const drawAllZones = useCallback((
    ctx: CanvasRenderingContext2D,
    currentScale: number,
    zones: ZoneInfo[],
    drawingZone: ZoneRect | null,
    isCurrentlyDrawing: boolean,
    zoneType: string | null
  ) => {
    // Dessiner toutes les zones de la page
    zones.forEach(zoneInfo => {
      drawZone(
        ctx,
        zoneInfo.zone,
        zoneInfo.label,
        getZoneColor(zoneInfo.type),
        currentScale
      );
    });

    // Dessiner la zone en cours de dessin
    if (drawingZone && isCurrentlyDrawing && zoneType) {
      const label = zoneType === 'text' || zoneType === 'variable_text' 
        ? 'Zone texte' 
        : zoneType === 'image' || zoneType === 'variable_image'
        ? 'Zone image'
        : zoneType === 'logo'
        ? 'Logo'
        : zoneType === 'screenshot'
        ? 'Screenshot'
        : zoneType;
      drawZone(ctx, drawingZone, label, getZoneColor(zoneType), 1);
    }
  }, [drawZone, getZoneColor]);


  // Charger l'image
  useEffect(() => {
    if (!currentPageUrl) {
      setImageError('Aucune image pour cette page');
      setImageLoading(false);
      return;
    }

    const urlLower = currentPageUrl.toLowerCase();
    if (urlLower.endsWith('.pdf') || urlLower.includes('.pdf?')) {
      setImageError('Les fichiers PDF ne peuvent pas être utilisés pour configurer les zones. Veuillez exporter votre template Canva en images PNG ou JPG et les uploader dans l\'onglet "Template".');
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    setImageError(null);
    
    let cancelled = false;
    
    const loadImageWithFetch = async () => {
      let objectUrl: string | null = null;
      try {
        const response = await fetch(currentPageUrl, {
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.statusText} (${response.status})`);
        }
        
        const blob = await response.blob();
        
        if (blob.type.includes('pdf') || blob.type.includes('application/pdf')) {
          throw new Error('PDF détecté dans le blob');
        }
        
        if (cancelled) return;
        
        objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        
        img.onload = () => {
          if (cancelled) {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            return;
          }
          
          imageRef.current = img;
          
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          
          requestAnimationFrame(() => {
            if (cancelled) return;
            
            const canvas = canvasRef.current;
            if (!canvas) {
              setImageError('Canvas non disponible. Veuillez rafraîchir la page.');
              setImageLoading(false);
              return;
            }

            const maxWidth = 800;
            const maxHeight = 600;
            const scaleX = maxWidth / img.naturalWidth;
            const scaleY = maxHeight / img.naturalHeight;
            const newScale = Math.min(scaleX, scaleY, 1);

            setScale(newScale);
            canvas.width = img.naturalWidth * newScale;
            canvas.height = img.naturalHeight * newScale;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
            }
            
            setImageLoading(false);
            
            // Dessiner les zones après un court délai pour s'assurer que tout est prêt
            setTimeout(() => {
              if (cancelled) return;
              
              const currentCanvas = canvasRef.current;
              const currentImg = imageRef.current;
              const drawFn = drawAllZonesRef.current;
              if (!currentCanvas || !currentImg || currentCanvas.width === 0 || !drawFn) return;
              
              const currentCtx = currentCanvas.getContext('2d');
              if (!currentCtx) return;
              
              currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
              currentCtx.drawImage(currentImg, 0, 0, currentCanvas.width, currentCanvas.height);
              // Dessiner les zones actuelles (utiliser la ref pour éviter les dépendances)
              drawFn(currentCtx, newScale, pageZonesRef.current, null, false, null);
            }, 200);
          });
        };
        
        img.onerror = () => {
          if (cancelled) return;
          
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          setImageError('Impossible de charger l\'image après téléchargement. Vérifiez que le fichier est bien une image PNG ou JPG valide.');
          setImageLoading(false);
        };
        
        img.src = objectUrl;
      } catch (error: any) {
        if (cancelled) return;
        
        if (error.message?.includes('PDF')) {
          setImageError('Les fichiers PDF ne peuvent pas être utilisés pour configurer les zones. Veuillez exporter votre template Canva en images PNG ou JPG (une image par page) et les uploader dans l\'onglet "Template".');
          setImageLoading(false);
          return;
        }
        
        // Fallback
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          
          imageRef.current = img;
          requestAnimationFrame(() => {
            if (cancelled) return;
            
            const canvas = canvasRef.current;
            if (!canvas) {
              setImageError('Canvas non disponible. Veuillez rafraîchir la page.');
              setImageLoading(false);
              return;
            }

            const maxWidth = 800;
            const maxHeight = 600;
            const scaleX = maxWidth / img.naturalWidth;
            const scaleY = maxHeight / img.naturalHeight;
            const newScale = Math.min(scaleX, scaleY, 1);

            setScale(newScale);
            canvas.width = img.naturalWidth * newScale;
            canvas.height = img.naturalHeight * newScale;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
            }
            
            setImageLoading(false);
            
            // Dessiner les zones après un court délai
            setTimeout(() => {
              if (cancelled) return;
              
              const currentCanvas = canvasRef.current;
              const currentImg = imageRef.current;
              const drawFn = drawAllZonesRef.current;
              if (!currentCanvas || !currentImg || currentCanvas.width === 0 || !drawFn) return;
              
              const currentCtx = currentCanvas.getContext('2d');
              if (!currentCtx) return;
              
              currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
              currentCtx.drawImage(currentImg, 0, 0, currentCanvas.width, currentCanvas.height);
              drawFn(currentCtx, newScale, pageZonesRef.current, null, false, null);
            }, 200);
          });
        };
        
        img.onerror = () => {
          if (cancelled) return;
          
          setImageError(`Impossible de charger l'image depuis ${currentPageUrl}. Vérifiez que l'URL est accessible, que CORS est configuré et qu'il s'agit d'une image PNG ou JPG.`);
          setImageLoading(false);
        };
        
        img.crossOrigin = 'anonymous';
        img.src = currentPageUrl;
      }
    };

    loadImageWithFetch();
    
    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [currentPageUrl, selectedPage]);

  // Re-dessiner le canvas quand on dessine (pas quand les zones changent, pour éviter les boucles)
  useEffect(() => {
    if (imageLoading || !imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || canvas.width === 0 || canvas.height === 0) return;
    
    // Redessiner seulement si on est en train de dessiner (currentZone change)
    if (isDrawing && currentZone) {
      requestAnimationFrame(() => {
        const currentCanvas = canvasRef.current;
        const currentImg = imageRef.current;
        if (!currentCanvas || !currentImg || currentCanvas.width === 0) return;
        
        const currentCtx = currentCanvas.getContext('2d');
        if (!currentCtx) return;
        
        currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
        currentCtx.drawImage(currentImg, 0, 0, currentCanvas.width, currentCanvas.height);
        drawAllZones(currentCtx, scale, pageZonesRef.current, currentZone, isDrawing, selectedZoneType);
      });
    }
  }, [imageLoading, scale, currentZone, isDrawing, selectedZoneType, drawAllZones]);
  
  // Redessiner quand les zones changent (mais pas en boucle)
  useEffect(() => {
    if (imageLoading || !imageRef.current || !canvasRef.current || isDrawing) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || canvas.width === 0 || canvas.height === 0) return;
    
    // Utiliser un délai pour éviter les re-renders trop fréquents
    const timeoutId = setTimeout(() => {
      const currentCanvas = canvasRef.current;
      const currentImg = imageRef.current;
      if (!currentCanvas || !currentImg || currentCanvas.width === 0 || isDrawing) return;
      
      const currentCtx = currentCanvas.getContext('2d');
      if (!currentCtx) return;
      
      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
      currentCtx.drawImage(currentImg, 0, 0, currentCanvas.width, currentCanvas.height);
      drawAllZones(currentCtx, scale, pageZonesRef.current, null, false, null);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageLoading, scale, pageZones, isDrawing, drawAllZones]);

  // Convertir les coordonnées de la souris
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = mouseX * scaleX;
    const canvasY = mouseY * scaleY;
    
    const imageX = canvasX / scale;
    const imageY = canvasY / scale;

    return { x: imageX, y: imageY };
  }, [scale]);

  // Gestion du clic sur le canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ne pas dessiner si on est en train de charger l'image
    if (imageLoading || !selectedZoneType) return;

    // Pour les zones texte/image génériques, vérifier qu'une variable est sélectionnée
    if ((selectedZoneType === 'text' || selectedZoneType === 'image') && 
        !(selectedPage >= 2 && selectedPage <= 5 && selectedZoneType === 'text' && CATEGORIES[selectedPage - 2]) &&
        !selectedVariable) {
      return;
    }

    const pos = getMousePos(e);
    if (!pos) return;

    e.preventDefault();
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentZone({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !selectedZoneType || imageLoading) return;

    const pos = getMousePos(e);
    if (!pos) return;

    e.preventDefault();
    const width = Math.abs(pos.x - startPos.x);
    const height = Math.abs(pos.y - startPos.y);
    const zoneX = Math.min(pos.x, startPos.x);
    const zoneY = Math.min(pos.y, startPos.y);

    setCurrentZone({ x: zoneX, y: zoneY, width, height });
  };

  const handleCanvasMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !selectedZoneType) {
      setIsDrawing(false);
      setStartPos(null);
      setCurrentZone(null);
      return;
    }

    if (e) {
      e.preventDefault();
    }

    if (currentZone && currentZone.width > 10 && currentZone.height > 10) {
      saveZone(currentZone);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentZone(null);
    // Ne pas réinitialiser selectedZoneType ici pour permettre de dessiner plusieurs zones du même type
  };

  // Sauvegarder la zone
  const saveZone = (zone: ZoneRect) => {
    if (!selectedZoneType) {
      return;
    }

    if (selectedPage === 1 && selectedZoneType === 'logo') {
      // Logo sur page 1 - pas besoin de variable
      onConfigChange({
        logo_placement: {
          page: 1,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
        },
      });
      // Réinitialiser après sauvegarde
      setSelectedZoneType(null);
      return;
    }

    if (selectedPage >= 2 && selectedPage <= 5) {
      // Zones spécifiques GBP (screenshots et textes)
      const categoryIndex = selectedPage - 2;
      const category = CATEGORIES[categoryIndex];
      
      if (category) {
        if (selectedZoneType === 'screenshot') {
          // Screenshot - pas besoin de variable
          onConfigChange({
            screenshot_placements: {
              ...templateConfig.screenshot_placements,
              [category.value]: {
                page: selectedPage,
                x: zone.x,
                y: zone.y,
                width: zone.width,
                height: zone.height,
              },
            },
          });
          setSelectedZoneType(null);
          return;
        } else if (selectedZoneType === 'text' && !selectedVariable) {
          // Texte pour les catégories GBP spécifiques - pas besoin de variable
          onConfigChange({
            text_placements: {
              ...templateConfig.text_placements,
              [category.value]: {
                page: selectedPage,
                x: zone.x,
                y: zone.y,
                width: zone.width,
                height: zone.height,
                fontSize: fontSize,
                color: textColor,
                align: textAlign,
              },
            },
          });
          setSelectedZoneType(null);
          return;
        }
      }
    }

    // Zones génériques (text/image) - nécessitent une variable
    if ((selectedZoneType === 'text' || selectedZoneType === 'image') && selectedVariable) {
      const variableConfig: VariableConfig = {
        page: selectedPage,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        type: selectedZoneType === 'text' ? 'text' : 'image',
        variable: selectedVariable,
        fontSize: selectedZoneType === 'text' ? fontSize : undefined,
        color: selectedZoneType === 'text' ? textColor : undefined,
        align: selectedZoneType === 'text' ? textAlign : undefined,
      };

      const existingVariables = templateConfig.variables || {};
      const variableKey = selectedVariable.replace(/\./g, '_');
      
      onConfigChange({
        variables: {
          ...existingVariables,
          [variableKey]: variableConfig,
        },
      });
      setSelectedZoneType(null);
      setSelectedVariable('');
    }
  };

  // Supprimer une zone
  const handleDeleteZone = (zoneId: string) => {
    if (zoneId === 'logo') {
      onConfigChange({
        logo_placement: undefined,
      });
    } else if (zoneId.startsWith('screenshot_')) {
      const category = zoneId.replace('screenshot_', '') as keyof typeof templateConfig.screenshot_placements;
      onConfigChange({
        screenshot_placements: {
          ...templateConfig.screenshot_placements,
          [category]: undefined as any,
        },
      });
    } else if (zoneId.startsWith('text_')) {
      const category = zoneId.replace('text_', '') as keyof typeof templateConfig.text_placements;
      onConfigChange({
        text_placements: {
          ...templateConfig.text_placements,
          [category]: undefined as any,
        },
      });
    } else if (zoneId.startsWith('variable_')) {
      const variableKey = zoneId.replace('variable_', '');
      const existingVariables = { ...(templateConfig.variables || {}) };
      delete existingVariables[variableKey];
      onConfigChange({
        variables: existingVariables,
      });
    }
  };

  if (!currentPageUrl) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Aucune image pour la page {selectedPage}. Veuillez d'abord uploader les pages du template dans l'onglet "Template".
          </p>
        </CardContent>
      </Card>
    );
  }

  const urlLower = currentPageUrl?.toLowerCase() || '';
  const isPDF = urlLower.endsWith('.pdf') || urlLower.includes('.pdf?');
  
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
                <li>Revenir dans l'onglet "Template" et uploader les images</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrer les variables selon le type de zone
  const availableVariables = GBP_VARIABLES.filter(v => {
    if (!selectedZoneType) return true;
    if (selectedZoneType === 'text' || selectedZoneType === 'variable_text') {
      return v.type === 'text';
    }
    if (selectedZoneType === 'image' || selectedZoneType === 'variable_image' || selectedZoneType === 'logo') {
      return v.type === 'image';
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration des zones</CardTitle>
          <CardDescription>
            Sélectionnez une page et configurez visuellement les zones pour les logos, les textes, les images et les screenshots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection de la page */}
          <div className="space-y-2">
            <Label>Page</Label>
            <Select
              value={selectedPage.toString()}
              onValueChange={(value) => {
                setSelectedPage(parseInt(value));
                setSelectedZoneType(null);
                setEditingZoneId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePages.map(pageNum => (
                  <SelectItem key={pageNum} value={pageNum.toString()}>
                    Page {pageNum}
                    {pageNum === 1 && ' - Couverture'}
                    {pageNum >= 2 && pageNum <= 5 && CATEGORIES[pageNum - 2] && ` - ${CATEGORIES[pageNum - 2].label}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zones existantes */}
          {pageZones.length > 0 && (
            <div className="space-y-2">
              <Label>Zones configurées sur cette page</Label>
              <div className="space-y-2">
                {pageZones.map(zoneInfo => (
                  <div key={zoneInfo.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getZoneColor(zoneInfo.type) }}
                      />
                      <span className="text-sm">{zoneInfo.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(zoneInfo.zone.x)}, {Math.round(zoneInfo.zone.y)}, {Math.round(zoneInfo.zone.width)}x{Math.round(zoneInfo.zone.height)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteZone(zoneInfo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration d'une nouvelle zone */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <Label>Ajouter une nouvelle zone</Label>
            
            {/* Type de zone */}
            <div className="space-y-2">
              <Label>Type de zone</Label>
              <Select
                value={selectedZoneType || ''}
                onValueChange={(value) => {
                  setSelectedZoneType(value as any);
                  setSelectedVariable('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de zone" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPage === 1 && (
                    <SelectItem value="logo">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Logo (Page 1 uniquement)
                      </div>
                    </SelectItem>
                  )}
                  {(selectedPage === 1 || selectedPage >= 2) && (
                    <>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Zone de texte
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Zone d'image
                        </div>
                      </SelectItem>
                    </>
                  )}
                  {selectedPage >= 2 && selectedPage <= 5 && (
                    <>
                      <SelectItem value="screenshot">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Screenshot
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Variable (pour les zones texte/image génériques uniquement, pas pour logo/screenshot) */}
            {(selectedZoneType === 'text' || selectedZoneType === 'image') && 
             !(selectedPage === 1 && selectedZoneType === 'logo') &&
             !(selectedPage >= 2 && selectedPage <= 5 && selectedZoneType === 'screenshot') &&
             !(selectedPage >= 2 && selectedPage <= 5 && selectedZoneType === 'text' && CATEGORIES[selectedPage - 2]) && (
              <div className="space-y-2">
                <Label>Variable *</Label>
                <Select
                  value={selectedVariable}
                  onValueChange={setSelectedVariable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVariables.map(variable => (
                      <SelectItem key={variable.value} value={variable.value}>
                        {variable.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Une variable est requise pour les zones texte/image génériques.
                </p>
              </div>
            )}

            {/* Options de texte (pour les zones texte, pas pour les screenshots) */}
            {selectedZoneType === 'text' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Taille de police</Label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                    min="8"
                    max="72"
                  />
                </div>
                <div>
                  <Label>Couleur</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Alignement</Label>
                  <Select
                    value={textAlign}
                    onValueChange={(value: 'left' | 'center' | 'right') => setTextAlign(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Gauche</SelectItem>
                      <SelectItem value="center">Centre</SelectItem>
                      <SelectItem value="right">Droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Instructions */}
            {selectedZoneType && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <MousePointer2 className="h-4 w-4 inline mr-2" />
                  Mode édition activé: Cliquez et glissez sur l'image ci-dessous pour dessiner une zone.
                  {((selectedZoneType === 'text' || selectedZoneType === 'image') && 
                    !(selectedPage >= 2 && selectedPage <= 5 && selectedZoneType === 'text' && CATEGORIES[selectedPage - 2]) &&
                    !selectedVariable) && (
                    <span className="block mt-1 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                      ⚠️ Veuillez sélectionner une variable avant de dessiner.
                    </span>
                  )}
                  {(selectedZoneType === 'logo' || selectedZoneType === 'screenshot') && (
                    <span className="block mt-1 text-xs text-green-700 dark:text-green-300">
                      ✓ Vous pouvez maintenant dessiner la zone directement.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Canvas pour dessiner les zones */}
          {imageError ? (
            <div className="p-8 text-center">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ Erreur de chargement
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">{imageError}</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto max-h-[600px] bg-gray-50 dark:bg-gray-900 relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 z-10">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Chargement de l'image...</p>
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className={`${selectedZoneType ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
