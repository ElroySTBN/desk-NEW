import type { GBPReportData } from '@/types/gbp-reports';

/**
 * Configuration simplifiée pour un template de rapport GBP
 * Utilise des coordonnées fixes au lieu de zones configurables complexes
 */

/**
 * Configuration d'une variable à placer sur le template
 */
export interface VariableConfig {
  /** Numéro de la page (1-indexed) */
  page: number;
  /** Position X en pixels (coordonnées du template original) */
  x: number;
  /** Position Y en pixels (coordonnées du template original) */
  y: number;
  /** Largeur en pixels */
  width: number;
  /** Hauteur en pixels */
  height: number;
  /** Type de variable : texte ou image */
  type: 'text' | 'image';
  /** Pour les textes : taille de police */
  fontSize?: number;
  /** Pour les textes : couleur (hex) */
  color?: string;
  /** Pour les textes : alignement */
  align?: 'left' | 'center' | 'right';
}

/**
 * Configuration d'un placement de capture d'écran
 */
export interface ScreenshotPlacement {
  /** Numéro de la page (1-indexed) */
  page: number;
  /** Position X en pixels */
  x: number;
  /** Position Y en pixels */
  y: number;
  /** Largeur en pixels */
  width: number;
  /** Hauteur en pixels */
  height: number;
}

/**
 * Templates de textes conditionnels
 * Basés sur l'évolution des KPIs
 */
export interface TextTemplates {
  /** Texte si évolution > 10% (positive élevée) */
  positive?: string;
  /** Texte si évolution entre 0% et 10% (positive modérée) */
  positive_moderate?: string;
  /** Texte si évolution entre -10% et 10% (stable) */
  stable?: string;
  /** Texte si évolution entre -10% et 0% (négative modérée) */
  negative_moderate?: string;
  /** Texte si évolution < -10% (négative élevée) */
  negative?: string;
}

/**
 * Configuration complète d'un template de rapport GBP
 */
export interface GBPTemplateConfig {
  /** URLs des images de template (une par page, dans l'ordre) */
  pages: string[];
  /** Configuration des variables à placer sur le template */
  variables: Record<string, VariableConfig>;
  /** Configuration des placements de captures d'écran */
  screenshot_placements: Record<string, ScreenshotPlacement>;
  /** Templates de textes conditionnels par catégorie KPI */
  text_templates?: {
    vue_ensemble?: TextTemplates;
    appels?: TextTemplates;
    clics_web?: TextTemplates;
    itineraire?: TextTemplates;
  };
  /** Configuration des zones OCR (optionnel, pour extraction automatique) */
  ocr_zones?: {
    vue_ensemble?: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
    appels?: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
    clics_web?: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
    itineraire?: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
  };
}

/**
 * Valeurs par défaut pour une configuration de template
 */
export const DEFAULT_TEMPLATE_CONFIG: GBPTemplateConfig = {
  pages: [],
  variables: {},
  screenshot_placements: {},
  text_templates: {},
  ocr_zones: {},
};

/**
 * Variables disponibles pour les templates
 */
export const AVAILABLE_VARIABLES = [
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
  { value: 'analysis.vue_ensemble', label: 'Analyse Vue d\'ensemble', type: 'text' as const },
  { value: 'analysis.appels', label: 'Analyse Appels', type: 'text' as const },
  { value: 'analysis.clics_web', label: 'Analyse Clics Web', type: 'text' as const },
  { value: 'analysis.itineraire', label: 'Analyse Itinéraire', type: 'text' as const },
] as const;

/**
 * Récupère la valeur d'une variable depuis les données du rapport
 */
export function getVariableValue(
  varName: string,
  reportData: GBPReportData,
  type: 'text' | 'image' = 'text'
): string | null {
  const parts = varName.split('.');
  
  // Variables client
  if (parts[0] === 'client') {
    if (parts[1] === 'name') return reportData.client.name;
    if (parts[1] === 'company') return reportData.client.company || reportData.client.name;
    if (parts[1] === 'logo_url' || parts[1] === 'logo') {
      return reportData.client.logo_url || null;
    }
  }
  
  // Variables période
  if (parts[0] === 'period') {
    if (parts[1] === 'startMonth') return reportData.period.startMonth;
    if (parts[1] === 'endMonth') return reportData.period.endMonth;
    if (parts[1] === 'year') return reportData.period.year.toString();
  }
  
  // Variables KPIs
  if (parts[0] === 'kpis') {
    const kpiType = parts[1] as keyof typeof reportData.kpis;
    const kpi = reportData.kpis[kpiType];
    if (!kpi) return null;
    
    if (parts[2] === 'current') return kpi.current.toLocaleString('fr-FR');
    if (parts[2] === 'previous') return kpi.previous.toLocaleString('fr-FR');
    if (parts[2] === 'evolution') {
      const diff = kpi.current - kpi.previous;
      const percentage = kpi.previous > 0 
        ? ((diff / kpi.previous) * 100).toFixed(1)
        : '0';
      return `${diff >= 0 ? '+' : ''}${diff.toLocaleString('fr-FR')} (${diff >= 0 ? '+' : ''}${percentage}%)`;
    }
  }
  
  // Variables analysis
  if (parts[0] === 'analysis') {
    const kpiType = parts[1] as keyof typeof reportData.kpis;
    const kpi = reportData.kpis[kpiType];
    if (kpi?.analysis) return kpi.analysis;
    
    // Si pas d'analyse dans les KPIs, vérifier les monthly KPIs
    if (reportData.monthlyKpis) {
      const monthlyKpi = reportData.monthlyKpis[kpiType];
      if (monthlyKpi?.analysis) return monthlyKpi.analysis;
    }
  }
  
  return null;
}

/**
 * Nettoie une configuration de template en supprimant les objets partiellement définis
 */
export function cleanTemplateConfig(config: Partial<GBPTemplateConfig>): GBPTemplateConfig {
  const cleaned: GBPTemplateConfig = {
    pages: config.pages || [],
    variables: {},
    screenshot_placements: {},
    text_templates: config.text_templates || {},
    ocr_zones: config.ocr_zones || {},
  };

  // Nettoyer les variables : ne garder que celles qui sont complètement configurées
  if (config.variables) {
    for (const [varName, varConfig] of Object.entries(config.variables)) {
      if (varConfig && 
          varConfig.page !== undefined &&
          varConfig.x !== undefined &&
          varConfig.y !== undefined &&
          varConfig.width !== undefined &&
          varConfig.height !== undefined &&
          varConfig.type !== undefined) {
        cleaned.variables[varName] = varConfig;
      }
    }
  }

  // Nettoyer les placements de screenshots : ne garder que ceux qui sont complètement configurés
  if (config.screenshot_placements) {
    for (const [screenshotType, placement] of Object.entries(config.screenshot_placements)) {
      if (placement &&
          placement.page !== undefined &&
          placement.x !== undefined &&
          placement.y !== undefined &&
          placement.width !== undefined &&
          placement.height !== undefined) {
        cleaned.screenshot_placements[screenshotType] = placement;
      }
    }
  }

  return cleaned;
}

/**
 * Valide une configuration de template
 */
export function validateTemplateConfig(config: Partial<GBPTemplateConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Nettoyer la configuration avant validation
  const cleanedConfig = cleanTemplateConfig(config);
  
  if (!cleanedConfig.pages || cleanedConfig.pages.length === 0) {
    errors.push('Au moins une page de template est requise');
  }
  
  // Valider les variables (qui ont déjà été nettoyées)
  for (const [varName, varConfig] of Object.entries(cleanedConfig.variables)) {
    if (!varConfig.page || varConfig.page < 1) {
      errors.push(`Variable ${varName}: numéro de page invalide`);
    }
    if (typeof varConfig.x !== 'number' || typeof varConfig.y !== 'number') {
      errors.push(`Variable ${varName}: coordonnées x et y doivent être des nombres`);
    }
    if (typeof varConfig.width !== 'number' || typeof varConfig.height !== 'number' || varConfig.width <= 0 || varConfig.height <= 0) {
      errors.push(`Variable ${varName}: largeur et hauteur doivent être des nombres positifs`);
    }
    if (!varConfig.type || !['text', 'image'].includes(varConfig.type)) {
      errors.push(`Variable ${varName}: type invalide (doit être 'text' ou 'image')`);
    }
  }
  
  // Valider les placements de screenshots (qui ont déjà été nettoyés)
  for (const [screenshotType, placement] of Object.entries(cleanedConfig.screenshot_placements)) {
    if (!placement.page || placement.page < 1) {
      errors.push(`Screenshot ${screenshotType}: numéro de page invalide`);
    }
    if (typeof placement.x !== 'number' || typeof placement.y !== 'number') {
      errors.push(`Screenshot ${screenshotType}: coordonnées x et y doivent être des nombres`);
    }
    if (typeof placement.width !== 'number' || typeof placement.height !== 'number' || placement.width <= 0 || placement.height <= 0) {
      errors.push(`Screenshot ${screenshotType}: largeur et hauteur doivent être des nombres positifs`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

