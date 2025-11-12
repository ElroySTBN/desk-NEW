/**
 * Configuration générique pour les templates de documents
 * Ce fichier définit les interfaces de base qui peuvent être étendues pour différents types de templates
 */

/**
 * Type de template disponible
 */
export type TemplateType = 'gbp_report' | 'audit_document' | 'custom';

/**
 * Configuration d'une zone de placement générique
 */
export interface ZonePlacement {
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
}

/**
 * Configuration d'une variable à placer sur le template
 */
export interface VariableConfig extends ZonePlacement {
  /** Type de variable : texte ou image */
  type: 'text' | 'image';
  /** Variable à utiliser (ex: 'client.name', 'client.logo_url') */
  variable: string;
  /** Pour les textes : taille de police */
  fontSize?: number;
  /** Pour les textes : couleur (hex) */
  color?: string;
  /** Pour les textes : alignement */
  align?: 'left' | 'center' | 'right';
}

/**
 * Configuration d'un placement de texte
 */
export interface TextPlacement extends ZonePlacement {
  /** Taille de police */
  fontSize?: number;
  /** Couleur (hex) */
  color?: string;
  /** Alignement */
  align?: 'left' | 'center' | 'right';
}

/**
 * Configuration d'un placement d'image
 */
export interface ImagePlacement extends ZonePlacement {
  /** Variable d'image à utiliser (ex: 'client.logo_url') */
  variable?: string;
}

/**
 * Configuration générique d'un template
 * Cette interface de base peut être étendue pour différents types de templates
 */
export interface BaseTemplateConfig {
  /** URLs des images de template (une par page) */
  pages: string[];
  
  /** Configuration des variables à placer sur le template */
  variables?: Record<string, VariableConfig>;
  
  /** Configuration des zones de texte */
  text_zones?: Record<string, TextPlacement>;
  
  /** Configuration des zones d'images */
  image_zones?: Record<string, ImagePlacement>;
}

/**
 * Définition d'une variable disponible pour un type de template
 */
export interface TemplateVariable {
  /** Nom de la variable (ex: 'client.name') */
  value: string;
  /** Libellé affiché à l'utilisateur */
  label: string;
  /** Type de variable */
  type: 'text' | 'image';
  /** Catégorie de la variable (optionnel, pour organiser) */
  category?: string;
}

/**
 * Configuration par défaut pour un template générique
 */
export const DEFAULT_BASE_TEMPLATE_CONFIG: BaseTemplateConfig = {
  pages: [],
  variables: {},
  text_zones: {},
  image_zones: {},
};

/**
 * Nettoie une configuration de template en supprimant les objets partiellement définis
 */
export function cleanBaseTemplateConfig(config: Partial<BaseTemplateConfig>): BaseTemplateConfig {
  const cleaned: BaseTemplateConfig = {
    pages: config.pages || [],
    variables: config.variables || {},
    text_zones: config.text_zones || {},
    image_zones: config.image_zones || {},
  };

  // Nettoyer les variables : ne garder que celles complètement configurées ET que la page existe
  if (config.variables) {
    const cleanedVariables: Record<string, VariableConfig> = {};
    const numPages = cleaned.pages.length;
    
    for (const [key, variable] of Object.entries(config.variables)) {
      if (variable &&
          variable.page !== undefined &&
          variable.x !== undefined &&
          variable.y !== undefined &&
          variable.width !== undefined &&
          variable.height !== undefined &&
          variable.variable &&
          variable.type) {
        // Vérifier que la page existe
        if (numPages === 0 || variable.page <= numPages) {
          cleanedVariables[key] = variable;
        }
        // Sinon, ne pas inclure la variable (page inexistante)
      }
    }
    cleaned.variables = cleanedVariables;
  }

  // Nettoyer les zones de texte : ne garder que celles complètement configurées ET que la page existe
  if (config.text_zones) {
    const cleanedTextZones: Record<string, TextPlacement> = {};
    const numPages = cleaned.pages.length;
    
    for (const [key, zone] of Object.entries(config.text_zones)) {
      if (zone &&
          zone.page !== undefined &&
          zone.x !== undefined &&
          zone.y !== undefined &&
          zone.width !== undefined &&
          zone.height !== undefined) {
        // Vérifier que la page existe
        if (numPages === 0 || zone.page <= numPages) {
          cleanedTextZones[key] = zone;
        }
        // Sinon, ne pas inclure la zone (page inexistante)
      }
    }
    cleaned.text_zones = cleanedTextZones;
  }

  // Nettoyer les zones d'images : ne garder que celles complètement configurées ET que la page existe
  if (config.image_zones) {
    const cleanedImageZones: Record<string, ImagePlacement> = {};
    const numPages = cleaned.pages.length;
    
    for (const [key, zone] of Object.entries(config.image_zones)) {
      if (zone &&
          zone.page !== undefined &&
          zone.x !== undefined &&
          zone.y !== undefined &&
          zone.width !== undefined &&
          zone.height !== undefined) {
        // Vérifier que la page existe
        if (numPages === 0 || zone.page <= numPages) {
          cleanedImageZones[key] = zone;
        }
        // Sinon, ne pas inclure la zone (page inexistante)
      }
    }
    cleaned.image_zones = cleanedImageZones;
  }

  return cleaned;
}

/**
 * Valide une configuration de template de base
 */
export function validateBaseTemplateConfig(config: Partial<BaseTemplateConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const cleanedConfig = cleanBaseTemplateConfig(config);

  // Valider les pages : au moins une page est requise
  if (!cleanedConfig.pages || cleanedConfig.pages.length === 0) {
    // Note: on ne force pas les pages lors de la création, mais on peut ajouter un avertissement
    // errors.push('Au moins une page de template est requise');
  }

  // Valider les variables
  if (cleanedConfig.variables) {
    for (const [key, variable] of Object.entries(cleanedConfig.variables)) {
      if (variable.page !== undefined && variable.page < 1) {
        errors.push(`Variable ${key}: le numéro de page doit être >= 1`);
      }
      if (variable.x !== undefined && typeof variable.x !== 'number') {
        errors.push(`Variable ${key}: la position x doit être un nombre`);
      }
      if (variable.y !== undefined && typeof variable.y !== 'number') {
        errors.push(`Variable ${key}: la position y doit être un nombre`);
      }
      if (variable.width !== undefined && (typeof variable.width !== 'number' || variable.width <= 0)) {
        errors.push(`Variable ${key}: la largeur doit être un nombre positif`);
      }
      if (variable.height !== undefined && (typeof variable.height !== 'number' || variable.height <= 0)) {
        errors.push(`Variable ${key}: la hauteur doit être un nombre positif`);
      }
      if (variable.page !== undefined && cleanedConfig.pages.length > 0 && variable.page > cleanedConfig.pages.length) {
        errors.push(`Variable ${key}: la page ${variable.page} n'existe pas (${cleanedConfig.pages.length} pages disponibles)`);
      }
    }
  }

  // Valider les zones de texte
  if (cleanedConfig.text_zones) {
    for (const [key, zone] of Object.entries(cleanedConfig.text_zones)) {
      if (zone.page !== undefined && zone.page < 1) {
        errors.push(`Zone de texte ${key}: le numéro de page doit être >= 1`);
      }
      if (zone.page !== undefined && cleanedConfig.pages.length > 0 && zone.page > cleanedConfig.pages.length) {
        errors.push(`Zone de texte ${key}: la page ${zone.page} n'existe pas (${cleanedConfig.pages.length} pages disponibles)`);
      }
      if (zone.width !== undefined && (typeof zone.width !== 'number' || zone.width <= 0)) {
        errors.push(`Zone de texte ${key}: la largeur doit être un nombre positif`);
      }
      if (zone.height !== undefined && (typeof zone.height !== 'number' || zone.height <= 0)) {
        errors.push(`Zone de texte ${key}: la hauteur doit être un nombre positif`);
      }
    }
  }

  // Valider les zones d'images
  if (cleanedConfig.image_zones) {
    for (const [key, zone] of Object.entries(cleanedConfig.image_zones)) {
      if (zone.page !== undefined && zone.page < 1) {
        errors.push(`Zone d'image ${key}: le numéro de page doit être >= 1`);
      }
      if (zone.page !== undefined && cleanedConfig.pages.length > 0 && zone.page > cleanedConfig.pages.length) {
        errors.push(`Zone d'image ${key}: la page ${zone.page} n'existe pas (${cleanedConfig.pages.length} pages disponibles)`);
      }
      if (zone.width !== undefined && (typeof zone.width !== 'number' || zone.width <= 0)) {
        errors.push(`Zone d'image ${key}: la largeur doit être un nombre positif`);
      }
      if (zone.height !== undefined && (typeof zone.height !== 'number' || zone.height <= 0)) {
        errors.push(`Zone d'image ${key}: la hauteur doit être un nombre positif`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

