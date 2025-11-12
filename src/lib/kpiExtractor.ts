import {
  extractNumberFromZone,
  extractMultipleZones,
  parseNumberFromOCR,
  type OCRZone,
} from './ocrService';
import type { GBPReportData } from '@/types/gbp-reports';

/**
 * Configuration des zones OCR pour chaque type de capture d'écran
 */
export interface KPIZonesConfig {
  vue_ensemble: {
    current: OCRZone;
    previous: OCRZone;
  };
  appels: {
    current: OCRZone;
    previous: OCRZone;
  };
  clics_web: {
    current: OCRZone;
    previous: OCRZone;
  };
  itineraire: {
    current: OCRZone;
    previous: OCRZone;
  };
}

/**
 * Résultat de l'extraction d'un KPI
 */
export interface ExtractedKPI {
  current: number | null;
  previous: number | null;
  confidence: {
    current: number;
    previous: number;
  };
  rawText: {
    current: string;
    previous: string;
  };
}

/**
 * Résultat de l'extraction de tous les KPIs
 */
export interface ExtractedKPIs {
  vue_ensemble: ExtractedKPI;
  appels: ExtractedKPI;
  clics_web: ExtractedKPI;
  itineraire: ExtractedKPI;
}

/**
 * Extrait les KPIs depuis une capture d'écran en utilisant les zones prédéfinies
 */
export async function extractKPIsFromScreenshot(
  screenshotSource: string | File | Blob,
  screenshotType: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire',
  zonesConfig: KPIZonesConfig
): Promise<ExtractedKPI> {
  const zones = zonesConfig[screenshotType];
  
  // Extraire les deux valeurs (current et previous) en parallèle
  const [currentResult, previousResult] = await Promise.all([
    extractNumberFromZone(screenshotSource, zones.current),
    extractNumberFromZone(screenshotSource, zones.previous),
  ]);
  
  // Pour obtenir le texte brut et la confiance, on doit faire une extraction complète
  const allZones = await extractMultipleZones(screenshotSource, {
    current: zones.current,
    previous: zones.previous,
  });
  
  return {
    current: currentResult,
    previous: previousResult,
    confidence: {
      current: allZones.current.confidence,
      previous: allZones.previous.confidence,
    },
    rawText: {
      current: allZones.current.text,
      previous: allZones.previous.text,
    },
  };
}

/**
 * Extrait tous les KPIs depuis les 4 captures d'écran
 */
export async function extractAllKPIs(
  screenshots: {
    vue_ensemble: string | File | Blob | null;
    appels: string | File | Blob | null;
    clics_web: string | File | Blob | null;
    itineraire: string | File | Blob | null;
  },
  zonesConfig: KPIZonesConfig
): Promise<ExtractedKPIs> {
  const results: Partial<ExtractedKPIs> = {};
  
  // Extraire les KPIs pour chaque type de capture
  const extractions = await Promise.allSettled([
    screenshots.vue_ensemble
      ? extractKPIsFromScreenshot(screenshots.vue_ensemble, 'vue_ensemble', zonesConfig)
      : Promise.resolve(null),
    screenshots.appels
      ? extractKPIsFromScreenshot(screenshots.appels, 'appels', zonesConfig)
      : Promise.resolve(null),
    screenshots.clics_web
      ? extractKPIsFromScreenshot(screenshots.clics_web, 'clics_web', zonesConfig)
      : Promise.resolve(null),
    screenshots.itineraire
      ? extractKPIsFromScreenshot(screenshots.itineraire, 'itineraire', zonesConfig)
      : Promise.resolve(null),
  ]);
  
  // Traiter les résultats
  if (extractions[0].status === 'fulfilled' && extractions[0].value) {
    results.vue_ensemble = extractions[0].value;
  }
  if (extractions[1].status === 'fulfilled' && extractions[1].value) {
    results.appels = extractions[1].value;
  }
  if (extractions[2].status === 'fulfilled' && extractions[2].value) {
    results.clics_web = extractions[2].value;
  }
  if (extractions[3].status === 'fulfilled' && extractions[3].value) {
    results.itineraire = extractions[3].value;
  }
  
  // Créer un objet complet avec des valeurs par défaut
  return {
    vue_ensemble: results.vue_ensemble || {
      current: null,
      previous: null,
      confidence: { current: 0, previous: 0 },
      rawText: { current: '', previous: '' },
    },
    appels: results.appels || {
      current: null,
      previous: null,
      confidence: { current: 0, previous: 0 },
      rawText: { current: '', previous: '' },
    },
    clics_web: results.clics_web || {
      current: null,
      previous: null,
      confidence: { current: 0, previous: 0 },
      rawText: { current: '', previous: '' },
    },
    itineraire: results.itineraire || {
      current: null,
      previous: null,
      confidence: { current: 0, previous: 0 },
      rawText: { current: '', previous: '' },
    },
  };
}

/**
 * Convertit les KPIs extraits au format GBPReportData
 */
export function convertExtractedKPIsToReportData(
  extractedKPIs: ExtractedKPIs
): Partial<GBPReportData['kpis']> {
  return {
    vue_ensemble: {
      current: extractedKPIs.vue_ensemble.current || 0,
      previous: extractedKPIs.vue_ensemble.previous || 0,
      analysis: '', // L'analyse sera générée plus tard avec les templates de texte
    },
    appels: {
      current: extractedKPIs.appels.current || 0,
      previous: extractedKPIs.appels.previous || 0,
      analysis: '',
    },
    clics_web: {
      current: extractedKPIs.clics_web.current || 0,
      previous: extractedKPIs.clics_web.previous || 0,
      analysis: '',
    },
    itineraire: {
      current: extractedKPIs.itineraire.current || 0,
      previous: extractedKPIs.itineraire.previous || 0,
      analysis: '',
    },
  };
}

/**
 * Zones par défaut (à configurer via l'interface)
 * Ces valeurs sont des exemples et doivent être ajustées selon vos captures d'écran
 */
export const DEFAULT_OCR_ZONES: KPIZonesConfig = {
  vue_ensemble: {
    current: { x: 100, y: 100, width: 200, height: 50 },
    previous: { x: 100, y: 200, width: 200, height: 50 },
  },
  appels: {
    current: { x: 100, y: 100, width: 200, height: 50 },
    previous: { x: 100, y: 200, width: 200, height: 50 },
  },
  clics_web: {
    current: { x: 100, y: 100, width: 200, height: 50 },
    previous: { x: 100, y: 200, width: 200, height: 50 },
  },
  itineraire: {
    current: { x: 100, y: 100, width: 200, height: 50 },
    previous: { x: 100, y: 200, width: 200, height: 50 },
  },
};

