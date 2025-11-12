import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Info } from 'lucide-react';
import type { TextTemplates } from '@/lib/gbpTemplateConfig';

interface TextTemplateEditorProps {
  templates: {
    vue_ensemble?: TextTemplates;
    appels?: TextTemplates;
    clics_web?: TextTemplates;
    itineraire?: TextTemplates;
  };
  onSave: (templates: {
    vue_ensemble?: TextTemplates;
    appels?: TextTemplates;
    clics_web?: TextTemplates;
    itineraire?: TextTemplates;
  }) => void;
}

const KPI_CATEGORIES = [
  { value: 'vue_ensemble', label: 'Vue d\'ensemble', description: 'Textes pour la section vue d\'ensemble' },
  { value: 'appels', label: 'Appels téléphoniques', description: 'Textes pour la section appels' },
  { value: 'clics_web', label: 'Clics vers le site web', description: 'Textes pour la section clics web' },
  { value: 'itineraire', label: 'Demandes d\'itinéraire', description: 'Textes pour la section itinéraire' },
] as const;

const EVOLUTION_TYPES = [
  { value: 'positive', label: 'Positive élevée (>10%)', description: 'Utilisé quand l\'évolution est supérieure à 10%' },
  { value: 'positive_moderate', label: 'Positive modérée (0-10%)', description: 'Utilisé quand l\'évolution est entre 0% et 10%' },
  { value: 'stable', label: 'Stable (-10% à 10%)', description: 'Utilisé quand l\'évolution est entre -10% et 10%' },
  { value: 'negative_moderate', label: 'Négative modérée (-10% à 0%)', description: 'Utilisé quand l\'évolution est entre -10% et 0%' },
  { value: 'negative', label: 'Négative élevée (<-10%)', description: 'Utilisé quand l\'évolution est inférieure à -10%' },
] as const;

const AVAILABLE_VARIABLES = [
  { variable: '{{current}}', description: 'Valeur actuelle du KPI (formaté avec séparateurs)' },
  { variable: '{{previous}}', description: 'Valeur précédente du KPI (formaté avec séparateurs)' },
  { variable: '{{difference}}', description: 'Différence entre current et previous (avec signe + ou -)' },
  { variable: '{{percentage}}', description: 'Pourcentage d\'évolution (avec signe + ou -)' },
  { variable: '{{percentage_abs}}', description: 'Pourcentage d\'évolution (valeur absolue)' },
  { variable: '{{period}}', description: 'Période du rapport (ex: "Octobre 2025" ou "Juin-Octobre 2025")' },
  { variable: '{{client_name}}', description: 'Nom du client ou de l\'entreprise' },
] as const;

export function TextTemplateEditor({ templates, onSave }: TextTemplateEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof templates>('vue_ensemble');
  const [localTemplates, setLocalTemplates] = useState(templates);

  const handleTemplateChange = (
    category: keyof typeof templates,
    evolutionType: keyof TextTemplates,
    value: string
  ) => {
    setLocalTemplates(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [evolutionType]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(localTemplates);
  };

  const currentCategoryTemplate = localTemplates[selectedCategory] || {};

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              Templates de textes conditionnels
            </p>
            <p className="text-sm text-blue-800 mb-2">
              Configurez les textes qui seront générés automatiquement selon l'évolution des KPIs.
              Les templates utilisent des variables dynamiques qui seront remplacées par les valeurs réelles.
            </p>
            <div className="mt-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">Variables disponibles :</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                {AVAILABLE_VARIABLES.map(({ variable, description }) => (
                  <div key={variable} className="flex items-start gap-1">
                    <code className="bg-blue-100 px-1 rounded text-blue-900">{variable}</code>
                    <span className="text-blue-600">: {description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as keyof typeof templates)}>
        <TabsList className="grid w-full grid-cols-4">
          {KPI_CATEGORIES.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {KPI_CATEGORIES.map((category) => (
          <TabsContent key={category.value} value={category.value} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              
              <div className="space-y-4">
                {EVOLUTION_TYPES.map((evolutionType) => {
                  const key = evolutionType.value as keyof TextTemplates;
                  const value = currentCategoryTemplate[key] || '';
                  
                  return (
                    <Card key={evolutionType.value}>
                      <CardHeader>
                        <CardTitle className="text-sm">{evolutionType.label}</CardTitle>
                        <CardDescription className="text-xs">{evolutionType.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={value}
                          onChange={(e) => handleTemplateChange(selectedCategory, key, e.target.value)}
                          placeholder={`Exemple : ${evolutionType.value === 'positive' 
                            ? 'Excellente progression ! {{difference}} interactions supplémentaires (+{{percentage}}%). Votre visibilité locale continue de croître fortement.'
                            : evolutionType.value === 'negative'
                            ? 'Baisse de {{percentage_abs}}% cette période. Analysez les causes de cette diminution pour améliorer les performances.'
                            : 'Évolution stable avec {{difference}} interactions ({{percentage}}%). Les performances restent constantes.'
                          }`}
                          rows={4}
                          className="font-mono text-sm"
                        />
                        {value && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Aperçu avec valeurs d'exemple : {value
                              .replace(/\{\{current\}\}/g, '2 726')
                              .replace(/\{\{previous\}\}/g, '1 779')
                              .replace(/\{\{difference\}\}/g, '+947')
                              .replace(/\{\{percentage\}\}/g, '+53,1')
                              .replace(/\{\{percentage_abs\}\}/g, '53,1')
                              .replace(/\{\{period\}\}/g, 'Juin-Octobre 2025')
                              .replace(/\{\{client_name\}\}/g, 'Nom du Client')
                            }
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les templates
        </Button>
      </div>
    </div>
  );
}

