import type { GBPReportData } from '@/types/gbp-reports';
import type { TextTemplates } from './gbpTemplateConfig';

/**
 * Moteur pour générer des textes conditionnels basés sur les performances
 * Utilise les templates de textes configurés pour générer automatiquement
 * les analyses basées sur l'évolution des KPIs
 */

/**
 * Calcule l'évolution d'un KPI
 */
export function calculateEvolution(current: number, previous: number): {
  difference: number;
  percentage: number;
  direction: 'positive' | 'positive_moderate' | 'stable' | 'negative_moderate' | 'negative';
} {
  if (previous === 0) {
    return {
      difference: current,
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'positive' : 'stable',
    };
  }

  const difference = current - previous;
  const percentage = (difference / previous) * 100;

  // Déterminer la direction basée sur le pourcentage
  if (percentage > 10) {
    return { difference, percentage: Math.abs(percentage), direction: 'positive' };
  } else if (percentage > 0) {
    return { difference, percentage: Math.abs(percentage), direction: 'positive_moderate' };
  } else if (percentage >= -10) {
    return { difference, percentage: Math.abs(percentage), direction: 'stable' };
  } else if (percentage > -20) {
    return { difference, percentage: Math.abs(percentage), direction: 'negative_moderate' };
  } else {
    return { difference, percentage: Math.abs(percentage), direction: 'negative' };
  }
}

/**
 * Remplit un template de texte avec les variables dynamiques
 */
function fillTemplate(template: string, variables: Record<string, string | number>): string {
  let filled = template;
  
  // Remplacer les variables au format {{variable}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    filled = filled.replace(regex, String(value));
  }
  
  return filled;
}

/**
 * Génère un texte d'analyse basé sur les templates et l'évolution du KPI
 */
export function generateAnalysisText(
  kpiType: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire',
  reportData: GBPReportData,
  textTemplates?: TextTemplates,
  customAnalysis?: string
): string {
  // Si une analyse personnalisée existe, l'utiliser
  if (customAnalysis) {
    return customAnalysis;
  }

  // Si pas de templates, retourner un texte par défaut
  if (!textTemplates) {
    const kpi = reportData.kpis[kpiType];
    const evolution = calculateEvolution(kpi.current, kpi.previous);
    return generateDefaultAnalysis(kpiType, kpi.current, kpi.previous, evolution);
  }

  // Récupérer le KPI
  const kpi = reportData.kpis[kpiType];
  const evolution = calculateEvolution(kpi.current, kpi.previous);

  // Sélectionner le template selon la direction
  let template = '';
  switch (evolution.direction) {
    case 'positive':
      template = textTemplates.positive || textTemplates.positive_moderate || '';
      break;
    case 'positive_moderate':
      template = textTemplates.positive_moderate || textTemplates.stable || '';
      break;
    case 'stable':
      template = textTemplates.stable || '';
      break;
    case 'negative_moderate':
      template = textTemplates.negative_moderate || textTemplates.stable || '';
      break;
    case 'negative':
      template = textTemplates.negative || textTemplates.negative_moderate || '';
      break;
  }

  // Si pas de template trouvé, utiliser un template par défaut
  if (!template) {
    return generateDefaultAnalysis(kpiType, kpi.current, kpi.previous, evolution);
  }

  // Préparer les variables pour le remplissage
  const variables: Record<string, string | number> = {
    current: kpi.current.toLocaleString('fr-FR'),
    previous: kpi.previous.toLocaleString('fr-FR'),
    difference: evolution.difference >= 0 
      ? `+${evolution.difference.toLocaleString('fr-FR')}` 
      : evolution.difference.toLocaleString('fr-FR'),
    percentage: evolution.percentage.toFixed(1),
    percentage_abs: Math.abs(evolution.percentage).toFixed(1),
    period: `${reportData.period.month} ${reportData.period.year}`,
    client_name: reportData.client.company || reportData.client.name,
  };

  // Remplir le template
  return fillTemplate(template, variables);
}

/**
 * Génère une analyse par défaut si aucun template n'est configuré
 */
function generateDefaultAnalysis(
  kpiType: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire',
  current: number,
  previous: number,
  evolution: ReturnType<typeof calculateEvolution>
): string {
  const kpiLabels: Record<typeof kpiType, string> = {
    vue_ensemble: 'interactions',
    appels: 'appels téléphoniques',
    clics_web: 'clics vers le site web',
    itineraire: 'demandes d\'itinéraire',
  };

  const label = kpiLabels[kpiType];
  const diff = evolution.difference >= 0 
    ? `+${evolution.difference.toLocaleString('fr-FR')}` 
    : evolution.difference.toLocaleString('fr-FR');
  const percentage = evolution.percentage.toFixed(1);

  if (evolution.direction === 'positive') {
    return `${diff} ${label} supplémentaires. C'est une augmentation de ${percentage}% par rapport à la période précédente. La visibilité locale continue de progresser fortement.`;
  } else if (evolution.direction === 'negative') {
    return `${Math.abs(evolution.difference).toLocaleString('fr-FR')} ${label} en moins. C'est une diminution de ${percentage}% par rapport à la période précédente. Il serait judicieux d'analyser les causes de cette baisse.`;
  } else {
    return `Évolution stable avec ${diff} ${label} (${diff.startsWith('+') ? '+' : ''}${percentage}%). Les performances restent constantes.`;
  }
}

/**
 * Génère tous les textes d'analyse pour un rapport
 */
export function generateAllAnalysisTexts(
  reportData: GBPReportData,
  textTemplates?: {
    vue_ensemble?: TextTemplates;
    appels?: TextTemplates;
    clics_web?: TextTemplates;
    itineraire?: TextTemplates;
  }
): {
  vue_ensemble: string;
  appels: string;
  clics_web: string;
  itineraire: string;
} {
  return {
    vue_ensemble: generateAnalysisText(
      'vue_ensemble',
      reportData,
      textTemplates?.vue_ensemble,
      reportData.kpis.vue_ensemble.analysis
    ),
    appels: generateAnalysisText(
      'appels',
      reportData,
      textTemplates?.appels,
      reportData.kpis.appels.analysis
    ),
    clics_web: generateAnalysisText(
      'clics_web',
      reportData,
      textTemplates?.clics_web,
      reportData.kpis.clics_web.analysis
    ),
    itineraire: generateAnalysisText(
      'itineraire',
      reportData,
      textTemplates?.itineraire,
      reportData.kpis.itineraire.analysis
    ),
  };
}

