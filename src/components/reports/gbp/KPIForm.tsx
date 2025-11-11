import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateEvolution } from '@/lib/gbpReportGenerator';
import type { Evolution } from '@/types/gbp-reports';

interface KPIFormProps {
  label: string;
  icon: string;
  current: number;
  previous: number;
  analysis: string;
  onCurrentChange: (value: number) => void;
  onPreviousChange: (value: number) => void;
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
  const evolution: Evolution = calculateEvolution(current, previous);
  const evolutionText = evolution.direction === 'up'
    ? `+${evolution.percentage.toFixed(1)}%`
    : evolution.direction === 'down'
    ? `-${evolution.percentage.toFixed(1)}%`
    : `${evolution.percentage.toFixed(1)}%`;
  const evolutionColor = evolution.direction === 'up'
    ? 'text-green-600'
    : evolution.direction === 'down'
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
              {new Date().getFullYear()} ({unit})
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
              {new Date().getFullYear() - 1} ({unit})
            </Label>
            <Input
              id={`previous-${label}`}
              type="number"
              value={previous || ''}
              onChange={(e) => onPreviousChange(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {current > 0 && previous > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Évolution :</span>
              <span className={`font-bold ${evolutionColor}`}>
                {evolution.difference >= 0 ? '+' : ''}{evolution.difference.toLocaleString('fr-FR')} {unit} ({evolutionText})
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



