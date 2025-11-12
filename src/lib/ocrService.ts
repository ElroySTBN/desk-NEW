import { createWorker, Worker } from 'tesseract.js';

/**
 * Service OCR pour extraire le texte depuis les images
 * Utilise Tesseract.js pour la reconnaissance optique de caractères
 */

export interface OCRZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

let worker: Worker | null = null;

/**
 * Initialise le worker Tesseract (lazy loading)
 */
async function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('fra'); // Langue française
  }
  return worker;
}

/**
 * Extrait le texte depuis une image complète
 */
export async function extractTextFromImage(
  imageSource: string | File | Blob
): Promise<OCRResult> {
  const worker = await getWorker();
  
  const { data } = await worker.recognize(imageSource);
  
  return {
    text: data.text.trim(),
    confidence: data.confidence || 0,
  };
}

/**
 * Extrait le texte depuis une zone spécifique d'une image
 */
export async function extractTextFromZone(
  imageSource: string | File | Blob,
  zone: OCRZone
): Promise<OCRResult> {
  const worker = await getWorker();
  
  // Tesseract.js permet de définir un rectangle pour l'OCR
  const { data } = await worker.recognize(imageSource, {
    rectangle: {
      top: zone.y,
      left: zone.x,
      width: zone.width,
      height: zone.height,
    },
  });
  
  return {
    text: data.text.trim(),
    confidence: data.confidence || 0,
  };
}

/**
 * Extrait plusieurs valeurs depuis différentes zones d'une image
 */
export async function extractMultipleZones(
  imageSource: string | File | Blob,
  zones: Record<string, OCRZone>
): Promise<Record<string, OCRResult>> {
  const results: Record<string, OCRResult> = {};
  
  for (const [key, zone] of Object.entries(zones)) {
    try {
      results[key] = await extractTextFromZone(imageSource, zone);
    } catch (error) {
      console.error(`Erreur lors de l'extraction de la zone ${key}:`, error);
      results[key] = {
        text: '',
        confidence: 0,
      };
    }
  }
  
  return results;
}

/**
 * Nettoie et parse un nombre depuis le texte OCR
 * Gère les espaces, points, virgules, etc.
 */
export function parseNumberFromOCR(text: string): number | null {
  if (!text) return null;
  
  // Nettoyer le texte : enlever les espaces, garder seulement les chiffres et séparateurs
  const cleaned = text
    .replace(/\s/g, '') // Enlever tous les espaces
    .replace(/[^\d,.-]/g, '') // Garder seulement chiffres, virgules, points, tirets
    .replace(/,/g, '.'); // Remplacer virgules par points
  
  // Extraire le premier nombre trouvé
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const number = parseFloat(match[1]);
    return isNaN(number) ? null : number;
  }
  
  return null;
}

/**
 * Extrait un nombre depuis une zone spécifique
 */
export async function extractNumberFromZone(
  imageSource: string | File | Blob,
  zone: OCRZone
): Promise<number | null> {
  const result = await extractTextFromZone(imageSource, zone);
  return parseNumberFromOCR(result.text);
}

/**
 * Libère les ressources du worker (à appeler quand on n'en a plus besoin)
 */
export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

