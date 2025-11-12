import type { GBPReportData } from '@/types/gbp-reports';
import type { 
  BaseTemplateConfig, 
  VariableConfig as BaseVariableConfig,
  TextPlacement as BaseTextPlacement,
  ZonePlacement,
  TemplateVariable 
} from './templateConfig';
import { 
  cleanBaseTemplateConfig, 
  validateBaseTemplateConfig,
  DEFAULT_BASE_TEMPLATE_CONFIG 
} from './templateConfig';

/**
 * Configuration simplifiée pour un template de rapport GBP
 * Étend BaseTemplateConfig avec des propriétés spécifiques aux rapports GBP
 */

/**
 * Configuration d'une variable à placer sur le template (alias pour compatibilité)
 */
export interface VariableConfig extends BaseVariableConfig {}

/**
 * Configuration d'un placement de capture d'écran
 */
export interface ScreenshotPlacement extends ZonePlacement {}

/**
 * Configuration du placement du logo sur la page de couverture
 */
export interface LogoPlacement extends ZonePlacement {}

/**
 * Configuration d'un placement de texte d'analyse
 */
export interface TextPlacement extends BaseTextPlacement {}

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
 * Structure : 5 pages (ou plus avec le nouveau système)
 * - Page 1 : Couverture avec logo
 * - Pages 2-5 : Catégories (vue_ensemble, appels, clics_web, itineraire) avec screenshot et texte
 */
export interface GBPTemplateConfig extends BaseTemplateConfig {
  /** URLs des images de template (une par page) */
  pages: string[];
  
  /** Configuration du placement du logo sur la page de couverture (page 1) */
  logo_placement?: LogoPlacement;
  
  /** Configuration des placements de captures d'écran par catégorie (pages 2-5) */
  screenshot_placements: Record<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire', ScreenshotPlacement>;
  
  /** Configuration des placements de textes d'analyse par catégorie (pages 2-5) */
  text_placements: Record<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire', TextPlacement>;
  
  /** Templates de textes conditionnels par catégorie KPI */
  text_templates?: {
    vue_ensemble?: TextTemplates;
    appels?: TextTemplates;
    clics_web?: TextTemplates;
    itineraire?: TextTemplates;
  };
  
  /** Configuration des zones OCR pour extraction automatique depuis les screenshots */
  ocr_zones: {
    vue_ensemble: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
    appels: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
    clics_web: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
    itineraire: { current: { x: number; y: number; width: number; height: number }; previous: { x: number; y: number; width: number; height: number } };
  };
  
  /** Configuration des variables à placer sur le template (obsolète, remplacé par logo_placement et text_placements) */
  variables?: Record<string, VariableConfig>;
}

/**
 * Valeurs par défaut pour une configuration de template GBP
 */
export const DEFAULT_TEMPLATE_CONFIG: GBPTemplateConfig = {
  ...DEFAULT_BASE_TEMPLATE_CONFIG,
  pages: [], // Pages : couverture, vue_ensemble, appels, clics_web, itineraire (peut être étendu)
  logo_placement: undefined,
  screenshot_placements: {
    vue_ensemble: { page: 2, x: 0, y: 0, width: 500, height: 300 },
    appels: { page: 3, x: 0, y: 0, width: 500, height: 300 },
    clics_web: { page: 4, x: 0, y: 0, width: 500, height: 300 },
    itineraire: { page: 5, x: 0, y: 0, width: 500, height: 300 },
  },
  text_placements: {
    vue_ensemble: { page: 2, x: 0, y: 350, width: 500, height: 100, fontSize: 12, color: '#000000', align: 'left' },
    appels: { page: 3, x: 0, y: 350, width: 500, height: 100, fontSize: 12, color: '#000000', align: 'left' },
    clics_web: { page: 4, x: 0, y: 350, width: 500, height: 100, fontSize: 12, color: '#000000', align: 'left' },
    itineraire: { page: 5, x: 0, y: 350, width: 500, height: 100, fontSize: 12, color: '#000000', align: 'left' },
  },
  text_templates: {},
  ocr_zones: {
    vue_ensemble: { current: { x: 0, y: 0, width: 100, height: 30 }, previous: { x: 150, y: 0, width: 100, height: 30 } },
    appels: { current: { x: 0, y: 0, width: 100, height: 30 }, previous: { x: 150, y: 0, width: 100, height: 30 } },
    clics_web: { current: { x: 0, y: 0, width: 100, height: 30 }, previous: { x: 150, y: 0, width: 100, height: 30 } },
    itineraire: { current: { x: 0, y: 0, width: 100, height: 30 }, previous: { x: 150, y: 0, width: 100, height: 30 } },
  },
  variables: {},
};

/**
 * Variables disponibles pour les templates GBP
 */
export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { value: 'client.name', label: 'Nom du client', type: 'text' as const, category: 'Client' },
  { value: 'client.company', label: 'Nom de l\'entreprise', type: 'text' as const, category: 'Client' },
  { value: 'client.logo_url', label: 'Logo du client', type: 'image' as const, category: 'Client' },
  { value: 'period.startMonth', label: 'Mois de début', type: 'text' as const, category: 'Période' },
  { value: 'period.endMonth', label: 'Mois de fin', type: 'text' as const, category: 'Période' },
  { value: 'period.year', label: 'Année', type: 'text' as const, category: 'Période' },
  { value: 'kpis.vue_ensemble.current', label: 'KPI Vue d\'ensemble - Current', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.vue_ensemble.previous', label: 'KPI Vue d\'ensemble - Previous', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.vue_ensemble.evolution', label: 'KPI Vue d\'ensemble - Évolution', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.appels.current', label: 'KPI Appels - Current', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.appels.previous', label: 'KPI Appels - Previous', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.appels.evolution', label: 'KPI Appels - Évolution', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.clics_web.current', label: 'KPI Clics Web - Current', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.clics_web.previous', label: 'KPI Clics Web - Previous', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.clics_web.evolution', label: 'KPI Clics Web - Évolution', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.itineraire.current', label: 'KPI Itinéraire - Current', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.itineraire.previous', label: 'KPI Itinéraire - Previous', type: 'text' as const, category: 'KPIs' },
  { value: 'kpis.itineraire.evolution', label: 'KPI Itinéraire - Évolution', type: 'text' as const, category: 'KPIs' },
  { value: 'analysis.vue_ensemble', label: 'Analyse Vue d\'ensemble', type: 'text' as const, category: 'Analyse' },
  { value: 'analysis.appels', label: 'Analyse Appels', type: 'text' as const, category: 'Analyse' },
  { value: 'analysis.clics_web', label: 'Analyse Clics Web', type: 'text' as const, category: 'Analyse' },
  { value: 'analysis.itineraire', label: 'Analyse Itinéraire', type: 'text' as const, category: 'Analyse' },
];

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
    if (parts[1] === 'month') return reportData.period.month;
    if (parts[1] === 'year') return reportData.period.year.toString();
    // Compatibilité avec ancien format
    if (parts[1] === 'startMonth' || parts[1] === 'endMonth') return reportData.period.month;
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
  }
  
  return null;
}

/**
 * Nettoie une configuration de template GBP en supprimant les objets partiellement définis
 */
export function cleanTemplateConfig(config: Partial<GBPTemplateConfig>): GBPTemplateConfig {
  // D'abord nettoyer la configuration de base
  const baseCleaned = cleanBaseTemplateConfig(config);
  
  const cleaned: GBPTemplateConfig = {
    ...baseCleaned,
    screenshot_placements: config.screenshot_placements || DEFAULT_TEMPLATE_CONFIG.screenshot_placements,
    text_placements: config.text_placements || DEFAULT_TEMPLATE_CONFIG.text_placements,
    text_templates: config.text_templates || {},
    ocr_zones: config.ocr_zones || DEFAULT_TEMPLATE_CONFIG.ocr_zones,
  };

  // Nettoyer le logo_placement : ne garder que si complètement configuré
  if (config.logo_placement) {
    const logo = config.logo_placement;
    if (logo.page !== undefined &&
        logo.x !== undefined &&
        logo.y !== undefined &&
        logo.width !== undefined &&
        logo.height !== undefined) {
      cleaned.logo_placement = logo;
    } else {
      cleaned.logo_placement = undefined;
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
        cleaned.screenshot_placements[screenshotType as keyof typeof cleaned.screenshot_placements] = placement;
      }
    }
  }

  // Nettoyer les placements de textes : ne garder que ceux qui sont complètement configurés
  if (config.text_placements) {
    for (const [category, placement] of Object.entries(config.text_placements)) {
      if (placement &&
          placement.page !== undefined &&
          placement.x !== undefined &&
          placement.y !== undefined &&
          placement.width !== undefined &&
          placement.height !== undefined) {
        cleaned.text_placements[category as keyof typeof cleaned.text_placements] = placement;
      }
    }
  }

  return cleaned;
}

/**
 * Valide une configuration de template GBP
 */
export function validateTemplateConfig(config: Partial<GBPTemplateConfig>): {
  valid: boolean;
  errors: string[];
} {
  // D'abord valider la configuration de base
  const baseValidation = validateBaseTemplateConfig(config);
  const errors: string[] = [...baseValidation.errors];
  
  // Nettoyer la configuration avant validation
  const cleanedConfig = cleanTemplateConfig(config);
  
  // Valider le logo_placement seulement s'il est défini
  if (cleanedConfig.logo_placement) {
    const logo = cleanedConfig.logo_placement;
    if (logo.page !== undefined && logo.page !== 1 && cleanedConfig.pages.length > 0) {
      // Note: on n'impose plus que le logo soit sur la page 1, mais on peut ajouter un avertissement
      // errors.push('Le logo doit être placé sur la page 1 (couverture)');
    }
    if (logo.x !== undefined && logo.y !== undefined) {
      if (typeof logo.x !== 'number' || typeof logo.y !== 'number') {
        errors.push('Logo: coordonnées x et y doivent être des nombres');
      }
    }
    if (logo.width !== undefined && logo.height !== undefined) {
      if (typeof logo.width !== 'number' || typeof logo.height !== 'number' || logo.width <= 0 || logo.height <= 0) {
        errors.push('Logo: largeur et hauteur doivent être des nombres positifs');
      }
    }
  }
  
  // Valider les placements de screenshots seulement s'ils sont définis
  const categories: Array<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire'> = ['vue_ensemble', 'appels', 'clics_web', 'itineraire'];
  const expectedPages = [2, 3, 4, 5];
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const expectedPage = expectedPages[i];
    const placement = cleanedConfig.screenshot_placements[category];
    
    // Ne valider que si le placement existe
    if (placement) {
      // Note: on n'impose plus que les screenshots soient sur des pages spécifiques
      // On valide juste que la page existe si des pages sont configurées
      if (placement.page !== undefined && cleanedConfig.pages.length > 0 && placement.page > cleanedConfig.pages.length) {
        errors.push(`Screenshot ${category}: la page ${placement.page} n'existe pas (${cleanedConfig.pages.length} pages disponibles)`);
      }
      if (placement.x !== undefined && placement.y !== undefined) {
        if (typeof placement.x !== 'number' || typeof placement.y !== 'number') {
          errors.push(`Screenshot ${category}: coordonnées x et y doivent être des nombres`);
        }
      }
      if (placement.width !== undefined && placement.height !== undefined) {
        if (typeof placement.width !== 'number' || typeof placement.height !== 'number' || placement.width <= 0 || placement.height <= 0) {
          errors.push(`Screenshot ${category}: largeur et hauteur doivent être des nombres positifs`);
        }
      }
    }
  }
  
  // Valider les placements de textes seulement s'ils sont définis
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const expectedPage = expectedPages[i];
    const placement = cleanedConfig.text_placements[category];
    
    // Ne valider que si le placement existe
    if (placement) {
      // Note: on n'impose plus que les textes soient sur des pages spécifiques
      // On valide juste que la page existe si des pages sont configurées
      if (placement.page !== undefined && cleanedConfig.pages.length > 0 && placement.page > cleanedConfig.pages.length) {
        errors.push(`Texte ${category}: la page ${placement.page} n'existe pas (${cleanedConfig.pages.length} pages disponibles)`);
      }
      if (placement.x !== undefined && placement.y !== undefined) {
        if (typeof placement.x !== 'number' || typeof placement.y !== 'number') {
          errors.push(`Texte ${category}: coordonnées x et y doivent être des nombres`);
        }
      }
      if (placement.width !== undefined && placement.height !== undefined) {
        if (typeof placement.width !== 'number' || typeof placement.height !== 'number' || placement.width <= 0 || placement.height <= 0) {
          errors.push(`Texte ${category}: largeur et hauteur doivent être des nombres positifs`);
        }
      }
    }
  }
  
  // Valider les zones OCR seulement si elles sont définies
  for (const category of categories) {
    const ocrZone = cleanedConfig.ocr_zones[category];
    if (ocrZone) {
      // Valider zone current si elle existe
      if (ocrZone.current) {
        if (ocrZone.current.x !== undefined && ocrZone.current.y !== undefined) {
          if (typeof ocrZone.current.x !== 'number' || typeof ocrZone.current.y !== 'number') {
            errors.push(`Zone OCR ${category}.current: coordonnées x et y doivent être des nombres`);
          }
        }
        if (ocrZone.current.width !== undefined && ocrZone.current.height !== undefined) {
          if (typeof ocrZone.current.width !== 'number' || typeof ocrZone.current.height !== 'number' || ocrZone.current.width <= 0 || ocrZone.current.height <= 0) {
            errors.push(`Zone OCR ${category}.current: largeur et hauteur doivent être des nombres positifs`);
          }
        }
      }
      
      // Valider zone previous si elle existe
      if (ocrZone.previous) {
        if (ocrZone.previous.x !== undefined && ocrZone.previous.y !== undefined) {
          if (typeof ocrZone.previous.x !== 'number' || typeof ocrZone.previous.y !== 'number') {
            errors.push(`Zone OCR ${category}.previous: coordonnées x et y doivent être des nombres`);
          }
        }
        if (ocrZone.previous.width !== undefined && ocrZone.previous.height !== undefined) {
          if (typeof ocrZone.previous.width !== 'number' || typeof ocrZone.previous.height !== 'number' || ocrZone.previous.width <= 0 || ocrZone.previous.height <= 0) {
            errors.push(`Zone OCR ${category}.previous: largeur et hauteur doivent être des nombres positifs`);
          }
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
