import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateEvolution } from '@/lib/textTemplateEngine';

interface KPIFormProps {
  label: string;
  icon: string;
  current: number;
  previous: number | null; // Pourcentage d'évolution (ex: 15.0 pour +15%, -10.0 pour -10%, null si non défini)
  analysis: string;
  onCurrentChange: (value: number) => void;
  onPreviousChange: (value: number | null) => void;
  onAnalysisChange: (value: string) => void;
  unit?: string;
}

export function KPIForm({
  label,
  icon,
  current,
  previous,
  analysis,
  onCurrentChange,
  onPreviousChange,
  onAnalysisChange,
  unit = '',
}: KPIFormProps) {
  // previous est maintenant un pourcentage d'évolution, pas une valeur absolue
  // Calculer la valeur précédente à partir du pourcentage d'évolution
  const previousValue = (previous === 0 || previous === null || !current) 
    ? current 
    : current / (1 + previous / 100);
  
  // Utiliser calculateEvolution avec le pourcentage d'évolution seulement si previous n'est pas null
  const evolution = previous !== null ? calculateEvolution(current, previous) : {
    difference: 0,
    percentage: 0,
    direction: 'stable' as const,
  };
  
  // Déterminer la couleur et le texte d'évolution
  const evolutionText = previous !== null 
    ? (previous >= 0
        ? `+${Math.abs(previous).toFixed(1)}%`
        : `${previous.toFixed(1)}%`)
    : '0%';
  const evolutionColor = evolution.direction === 'positive' || evolution.direction === 'positive_moderate'
    ? 'text-green-600'
    : evolution.direction === 'negative' || evolution.direction === 'negative_moderate'
    ? 'text-red-600'
    : 'text-gray-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`current-${label}`}>
              Chiffre actuel ({unit})
            </Label>
            <Input
              id={`current-${label}`}
              type="number"
              value={current || ''}
              onChange={(e) => onCurrentChange(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor={`previous-${label}`}>
              Pourcentage d'évolution (%)
            </Label>
            <Input
              id={`previous-${label}`}
              type="number"
              step="0.1"
              value={previous !== null ? previous : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  onPreviousChange(null);
                } else {
                  onPreviousChange(parseFloat(value) || 0);
                }
              }}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ex: +15 pour +15%, -10 pour -10%
            </p>
          </div>
        </div>

        {current > 0 && previous !== null && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Valeur précédente calculée :</span>
              <span className="font-bold">
                {previousValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} {unit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Évolution :</span>
              <span className={`font-bold ${evolutionColor}`}>
                {evolution.difference >= 0 ? '+' : ''}{evolution.difference.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} {unit} ({evolutionText})
              </span>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor={`analysis-${label}`}>
            Analyse personnalisée
          </Label>
          <Textarea
            id={`analysis-${label}`}
            value={analysis}
            onChange={(e) => onAnalysisChange(e.target.value)}
            placeholder="Texte d'analyse..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}



