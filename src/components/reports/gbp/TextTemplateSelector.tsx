import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { getTemplates, suggestTemplate, fillTemplate } from '@/lib/reportTemplates';
import type { ReportTextTemplate, Evolution } from '@/types/gbp-reports';

interface TextTemplateSelectorProps {
  category: ReportTextTemplate['category'];
  evolution: Evolution;
  current: number;
  previous: number;
  period?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function TextTemplateSelector({
  category,
  evolution,
  current,
  previous,
  period,
  value,
  onChange,
  label,
}: TextTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ReportTextTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [category]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const allTemplates = await getTemplates(category);
      setTemplates(allTemplates);

      // Suggérer un template automatiquement
      const suggested = await suggestTemplate(evolution, category);
      if (suggested && !value) {
        applyTemplate(suggested);
        setSelectedTemplateId(suggested.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: ReportTextTemplate) => {
    const difference = current - previous;
    const percentage = previous > 0 ? ((difference / previous) * 100) : 0;
    const dailyAvg = difference / 30; // Approximation
    const monthlyAvg = difference;

    const filled = fillTemplate(template.template, {
      X: current,
      Y: previous,
      Z: difference,
      percentage: Math.abs(percentage),
      period: period || '',
      daily_avg: dailyAvg,
      monthly_avg: monthlyAvg,
    });

    onChange(filled);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      applyTemplate(template);
      setSelectedTemplateId(templateId);
    }
  };

  const refreshSuggestion = async () => {
    const suggested = await suggestTemplate(evolution, category);
    if (suggested) {
      applyTemplate(suggested);
      setSelectedTemplateId(suggested.id);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshSuggestion}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Suggérer un template
          </Button>
        </div>

        {!loading && templates.length > 0 && (
          <Select value={selectedTemplateId || ''} onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.context} {template.is_default && '(Par défaut)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Texte d'analyse..."
          rows={6}
        />
      </CardContent>
    </Card>
  );
}



