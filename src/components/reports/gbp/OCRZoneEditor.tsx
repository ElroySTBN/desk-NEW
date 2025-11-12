import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw } from 'lucide-react';
import type { OCRZone } from '@/lib/ocrService';
import type { KPIZonesConfig } from '@/lib/kpiExtractor';

interface ZoneRect {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

interface OCRZoneEditorProps {
  imageUrl: string;
  screenshotType: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire';
  initialZones?: {
    current: OCRZone;
    previous: OCRZone;
  };
  onSave: (zones: { current: OCRZone; previous: OCRZone }) => void;
}

export function OCRZoneEditor({
  imageUrl,
  screenshotType,
  initialZones,
  onSave,
}: OCRZoneEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zones, setZones] = useState<{
    current: OCRZone | null;
    previous: OCRZone | null;
  }>({
    current: initialZones?.current || null,
    previous: initialZones?.previous || null,
  });
  const [isDrawing, setIsDrawing] = useState<'current' | 'previous' | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);

  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Charger l'image et calculer l'échelle
  useEffect(() => {
    if (!imageUrl) {
      setImageError('Aucune URL d\'image fournie');
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    setImageError(null);
    
    const img = new Image();
    
    // Gérer les erreurs CORS en essayant sans crossOrigin d'abord
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) {
        setImageError('Canvas non disponible');
        setImageLoading(false);
        return;
      }

      // Calculer l'échelle pour que l'image rentre dans le canvas
      const maxWidth = 800;
      const maxHeight = 600;
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
      canvas.width = img.width * newScale;
      canvas.height = img.height * newScale;

      drawCanvas();
      setImageLoading(false);
    };
    
    img.onerror = (error) => {
      console.error('Erreur de chargement de l\'image:', error);
      setImageError('Impossible de charger l\'image. Vérifiez que l\'URL est accessible et que CORS est configuré.');
      setImageLoading(false);
    };
    
    // Essayer avec crossOrigin d'abord, puis sans si ça échoue
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  }, [imageUrl]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner l'image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dessiner les zones
    if (zones.current) {
      drawZone(ctx, zones.current, 'Current', '#10b981');
    }
    if (zones.previous) {
      drawZone(ctx, zones.previous, 'Previous', '#3b82f6');
    }
  }, [zones, scale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const drawZone = (
    ctx: CanvasRenderingContext2D,
    zone: OCRZone,
    label: string,
    color: string
  ) => {
    const x = zone.x * scale;
    const y = zone.y * scale;
    const width = zone.width * scale;
    const height = zone.height * scale;

    // Rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Fond semi-transparent
    ctx.fillStyle = color + '20';
    ctx.fillRect(x, y, width, height);

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(label, x + 5, y + 20);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    return { x: x / scale, y: y / scale };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (!pos) return;

    // Déterminer quelle zone on dessine (clic droit = previous, clic gauche = current)
    const zoneType = e.button === 2 ? 'previous' : 'current';
    setIsDrawing(zoneType);
    setStartPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const pos = getMousePos(e);
    if (!pos) return;

    const newZone: OCRZone = {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    };

    setZones((prev) => ({
      ...prev,
      [isDrawing]: newZone,
    }));
  };

  const handleMouseUp = () => {
    setIsDrawing(null);
    setStartPos(null);
  };

  const handleReset = () => {
    setZones({
      current: null,
      previous: null,
    });
  };

  const handleSave = () => {
    if (!zones.current || !zones.previous) {
      alert('Veuillez définir les deux zones (current et previous)');
      return;
    }

    onSave({
      current: zones.current,
      previous: zones.previous,
    });
  };

  const screenshotLabels: Record<typeof screenshotType, string> = {
    vue_ensemble: "Vue d'ensemble",
    appels: 'Appels téléphoniques',
    clics_web: 'Clics vers le site web',
    itineraire: 'Demandes d\'itinéraire',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{screenshotLabels[screenshotType]}</CardTitle>
        <div className="space-y-2 mt-2">
          <p className="text-sm font-medium text-foreground">
            📍 Définir les zones OCR pour extraire automatiquement les métriques
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 mb-2">Comment utiliser :</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li><strong>Clic gauche + glisser</strong> = Zone "Current" (valeur actuelle, en vert)</li>
              <li><strong>Clic droit + glisser</strong> = Zone "Previous" (valeur précédente, en bleu)</li>
              <li>Dessinez un rectangle autour du chiffre que vous voulez extraire</li>
              <li>Vous devez définir les <strong>deux zones</strong> avant de pouvoir enregistrer</li>
            </ol>
            <p className="mt-2 text-blue-700">
              💡 <strong>Astuce :</strong> Utilisez une capture d'écran de votre dashboard GBP pour voir exactement où se trouvent les chiffres
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageLoading && (
          <div className="border rounded-lg p-8 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement du template...</p>
            </div>
          </div>
        )}
        {imageError && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Erreur de chargement</p>
            <p className="text-sm text-red-700">{imageError}</p>
            <p className="text-xs text-red-600 mt-2">
              URL du template : {imageUrl?.substring(0, 100)}...
            </p>
          </div>
        )}
        {!imageLoading && !imageError && (
          <div className="border rounded-lg overflow-auto max-h-[600px] flex justify-center bg-gray-50">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => e.preventDefault()}
              className="cursor-crosshair"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <Label className="text-sm">Current</Label>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <Label className="text-sm">Previous</Label>
          </div>
        </div>

        {zones.current && (
          <div className="text-sm">
            <strong>Current:</strong> x={Math.round(zones.current.x)}, y={Math.round(zones.current.y)}, w={Math.round(zones.current.width)}, h={Math.round(zones.current.height)}
          </div>
        )}
        {zones.previous && (
          <div className="text-sm">
            <strong>Previous:</strong> x={Math.round(zones.previous.x)}, y={Math.round(zones.previous.y)}, w={Math.round(zones.previous.width)}, h={Math.round(zones.previous.height)}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!zones.current || !zones.previous}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les zones
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

