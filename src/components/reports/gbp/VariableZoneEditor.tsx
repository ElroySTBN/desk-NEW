import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Save, RotateCcw, Image as ImageIcon, Type } from 'lucide-react';
import type { VariableZone } from '@/lib/canvaReportGenerator';

interface VariableZoneEditorProps {
  imageUrl: string;
  pageNumber: number;
  initialZone?: VariableZone;
  onSave: (zone: VariableZone) => void;
}

const AVAILABLE_VARIABLES = [
  { value: 'client.name', label: 'Nom du client', type: 'text' as const },
  { value: 'client.company', label: 'Nom de l\'entreprise', type: 'text' as const },
  { value: 'client.logo_url', label: 'Logo du client', type: 'image' as const },
  { value: 'period.startMonth', label: 'Mois de début', type: 'text' as const },
  { value: 'period.endMonth', label: 'Mois de fin', type: 'text' as const },
  { value: 'period.year', label: 'Année', type: 'text' as const },
  { value: 'kpis.vue_ensemble.current', label: 'KPI Vue d\'ensemble - Current', type: 'text' as const },
  { value: 'kpis.vue_ensemble.previous', label: 'KPI Vue d\'ensemble - Previous', type: 'text' as const },
  { value: 'kpis.vue_ensemble.evolution', label: 'KPI Vue d\'ensemble - Évolution', type: 'text' as const },
  { value: 'kpis.appels.current', label: 'KPI Appels - Current', type: 'text' as const },
  { value: 'kpis.appels.previous', label: 'KPI Appels - Previous', type: 'text' as const },
  { value: 'kpis.appels.evolution', label: 'KPI Appels - Évolution', type: 'text' as const },
  { value: 'kpis.clics_web.current', label: 'KPI Clics Web - Current', type: 'text' as const },
  { value: 'kpis.clics_web.previous', label: 'KPI Clics Web - Previous', type: 'text' as const },
  { value: 'kpis.clics_web.evolution', label: 'KPI Clics Web - Évolution', type: 'text' as const },
  { value: 'kpis.itineraire.current', label: 'KPI Itinéraire - Current', type: 'text' as const },
  { value: 'kpis.itineraire.previous', label: 'KPI Itinéraire - Previous', type: 'text' as const },
  { value: 'kpis.itineraire.evolution', label: 'KPI Itinéraire - Évolution', type: 'text' as const },
];

export function VariableZoneEditor({
  imageUrl,
  pageNumber,
  initialZone,
  onSave,
}: VariableZoneEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zone, setZone] = useState<Partial<VariableZone>>({
    x: initialZone?.x || 0,
    y: initialZone?.y || 0,
    width: initialZone?.width || 100,
    height: initialZone?.height || 50,
    page: pageNumber,
    variable: initialZone?.variable || '',
    type: initialZone?.type || 'text',
    fontSize: initialZone?.fontSize || 12,
    color: initialZone?.color || '#000000',
    align: initialZone?.align || 'left',
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);

  // Charger l'image et calculer l'échelle
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxWidth = 800;
      const maxHeight = 600;
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
      canvas.width = img.width * newScale;
      canvas.height = img.height * newScale;

      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (zone.x !== undefined && zone.y !== undefined && zone.width && zone.height) {
      const x = zone.x * scale;
      const y = zone.y * scale;
      const width = zone.width * scale;
      const height = zone.height * scale;

      ctx.strokeStyle = zone.type === 'image' ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = (zone.type === 'image' ? '#10b981' : '#3b82f6') + '20';
      ctx.fillRect(x, y, width, height);

      ctx.fillStyle = zone.type === 'image' ? '#10b981' : '#3b82f6';
      ctx.font = 'bold 14px Arial';
      const label = zone.variable || (zone.type === 'image' ? 'Image' : 'Texte');
      ctx.fillText(label, x + 5, y + 20);
    }
  }, [zone, scale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

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

    setIsDrawing(true);
    setStartPos(pos);
    setZone(prev => ({
      ...prev,
      x: pos.x,
      y: pos.y,
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const pos = getMousePos(e);
    if (!pos) return;

    setZone(prev => ({
      ...prev,
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    }));
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  const handleReset = () => {
    setZone({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      page: pageNumber,
      variable: '',
      type: 'text',
      fontSize: 12,
      color: '#000000',
      align: 'left',
    });
  };

  const handleSave = () => {
    if (!zone.variable || !zone.x || !zone.y || !zone.width || !zone.height) {
      alert('Veuillez définir une zone et sélectionner une variable');
      return;
    }

    const selectedVar = AVAILABLE_VARIABLES.find(v => v.value === zone.variable);
    const zoneType = selectedVar?.type || zone.type || 'text';

    onSave({
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      page: pageNumber,
      variable: zone.variable,
      type: zoneType,
      fontSize: zone.fontSize,
      color: zone.color,
      align: zone.align,
    });
  };

  const selectedVariable = AVAILABLE_VARIABLES.find(v => v.value === zone.variable);
  const zoneType = selectedVariable?.type || zone.type || 'text';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone de variable - Page {pageNumber}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cliquez et glissez pour définir la zone sur le template
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-auto max-h-[600px] flex justify-center bg-gray-50">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type de zone</Label>
            <Select
              value={zoneType}
              onValueChange={(value: 'text' | 'image') => {
                setZone(prev => ({ ...prev, type: value }));
                // Si on change vers image, suggérer client.logo_url
                if (value === 'image' && !zone.variable) {
                  setZone(prev => ({ ...prev, variable: 'client.logo_url' }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Texte
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image (Logo)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Variable</Label>
            <Select
              value={zone.variable || ''}
              onValueChange={(value) => {
                setZone(prev => ({ ...prev, variable: value }));
                const selectedVar = AVAILABLE_VARIABLES.find(v => v.value === value);
                if (selectedVar) {
                  setZone(prev => ({ ...prev, type: selectedVar.type }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une variable" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VARIABLES
                  .filter(v => zoneType === 'image' ? v.type === 'image' : true)
                  .map((variable) => (
                    <SelectItem key={variable.value} value={variable.value}>
                      {variable.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {zoneType === 'text' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Taille de police</Label>
              <Input
                type="number"
                value={zone.fontSize || 12}
                onChange={(e) => setZone(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))}
                min="8"
                max="72"
              />
            </div>
            <div>
              <Label>Couleur</Label>
              <Input
                type="color"
                value={zone.color || '#000000'}
                onChange={(e) => setZone(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={zone.align || 'left'}
                onValueChange={(value: 'left' | 'center' | 'right') => setZone(prev => ({ ...prev, align: value }))}
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

        {zone.x !== undefined && zone.y !== undefined && (
          <div className="text-sm space-y-1">
            <div><strong>Position:</strong> x={Math.round(zone.x)}, y={Math.round(zone.y)}</div>
            <div><strong>Dimensions:</strong> w={Math.round(zone.width || 0)}, h={Math.round(zone.height || 0)}</div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!zone.variable || !zone.width || !zone.height}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer la zone
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

