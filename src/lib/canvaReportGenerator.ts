import jsPDF from 'jspdf';
import type { GBPReportData } from '@/types/gbp-reports';
import type { GBPTemplateConfig, LogoPlacement, TextPlacement, ScreenshotPlacement } from './gbpTemplateConfig';
import { generateAllAnalysisTexts } from './textTemplateEngine';

/**
 * Génère un rapport PDF depuis un template Canva
 * Utilise la configuration simplifiée avec coordonnées fixes
 */

/**
 * Charge une image depuis une URL avec gestion CORS améliorée
 * Utilise fetch pour contourner les problèmes CORS
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  try {
    // Essayer d'abord avec fetch pour contourner CORS
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
      img.src = objectUrl;
    });
  } catch (error) {
    // Fallback : charger directement (peut échouer avec CORS)
    console.warn('Fetch failed, trying direct load:', error);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}

/**
 * Génère un rapport PDF depuis un template Canva
 * Utilise la configuration simplifiée avec pages multiples
 */
export async function generateCanvaReportPDF(
  reportData: GBPReportData,
  templateConfig: GBPTemplateConfig
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Générer les analyses avec les templates de textes
  const analysisTexts = generateAllAnalysisTexts(reportData, templateConfig.text_templates);
  
  // Mettre à jour les données du rapport avec les analyses générées
  const reportDataWithAnalysis: GBPReportData = {
    ...reportData,
    kpis: {
      vue_ensemble: {
        ...reportData.kpis.vue_ensemble,
        analysis: analysisTexts.vue_ensemble,
      },
      appels: {
        ...reportData.kpis.appels,
        analysis: analysisTexts.appels,
      },
      clics_web: {
        ...reportData.kpis.clics_web,
        analysis: analysisTexts.clics_web,
      },
      itineraire: {
        ...reportData.kpis.itineraire,
        analysis: analysisTexts.itineraire,
      },
    },
  };

  // Charger les images de template (une par page, 5 pages : couverture + 4 catégories)
  const templateImages: HTMLImageElement[] = [];
  for (const pageUrl of templateConfig.pages) {
    try {
      const img = await loadImage(pageUrl);
      templateImages.push(img);
    } catch (error) {
      console.error(`Erreur lors du chargement de la page ${pageUrl}:`, error);
      throw new Error(`Impossible de charger la page de template: ${pageUrl}`);
    }
  }
  
  if (templateImages.length === 0) {
    throw new Error('Aucune page de template chargée');
  }

  // Vérifier qu'on a exactement 5 pages
  if (templateImages.length !== 5) {
    throw new Error(`Le template doit avoir exactement 5 pages (actuellement ${templateImages.length})`);
  }

  // Catégories dans l'ordre des pages 2-5
  const categories: Array<'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire'> = ['vue_ensemble', 'appels', 'clics_web', 'itineraire'];
  const categoryPages = [2, 3, 4, 5];

  // Pour chaque page du template
  for (let pageIndex = 0; pageIndex < templateImages.length; pageIndex++) {
    const pageNumber = pageIndex + 1;
    
    if (pageIndex > 0) {
      doc.addPage();
    }

    const templateImg = templateImages[pageIndex];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Calculer les dimensions pour que l'image remplisse la page
    // On suppose que le template a les dimensions A4 (210x297mm à 96 DPI)
    // Les coordonnées dans la config sont en pixels du template original
    const imgWidth = templateImg.width;
    const imgHeight = templateImg.height;
    const imgAspectRatio = imgWidth / imgHeight;
    const pageAspectRatio = pageWidth / pageHeight;

    let finalWidth = pageWidth;
    let finalHeight = pageHeight;
    let x = 0;
    let y = 0;

    if (imgAspectRatio > pageAspectRatio) {
      // L'image est plus large que la page
      finalHeight = pageWidth / imgAspectRatio;
      y = (pageHeight - finalHeight) / 2;
    } else {
      // L'image est plus haute que la page
      finalWidth = pageHeight * imgAspectRatio;
      x = (pageWidth - finalWidth) / 2;
    }

    // Dessiner le template comme fond
    doc.addImage(
      templateImg,
      'PNG',
      x,
      y,
      finalWidth,
      finalHeight
    );

    // Calculer le facteur d'échelle pour convertir les pixels du template vers mm du PDF
    const scaleX = finalWidth / imgWidth;
    const scaleY = finalHeight / imgHeight;

    // Page 1 : Placer le logo si configuré
    if (pageNumber === 1 && templateConfig.logo_placement && reportData.client.logo_url) {
      try {
        const logoImg = await loadImage(reportData.client.logo_url);
        const logo = templateConfig.logo_placement;
        
        // Convertir les coordonnées
        const logoX = x + (logo.x * scaleX);
        const logoY = y + (logo.y * scaleY);
        const logoWidth = logo.width * scaleX;
        const logoHeight = logo.height * scaleY;

        // Ajouter le logo
        doc.addImage(
          logoImg,
          'PNG',
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
      } catch (error) {
        console.error('Erreur lors du chargement du logo:', error);
      }
    }

    // Pages 2-5 : Placer les screenshots et textes d'analyse pour chaque catégorie
    if (pageNumber >= 2 && pageNumber <= 5) {
      const categoryIndex = pageNumber - 2;
      const category = categories[categoryIndex];
      
      if (!category) continue;

      // Placer le screenshot pour cette catégorie
      const screenshotPlacement = templateConfig.screenshot_placements[category];
      if (screenshotPlacement && screenshotPlacement.page === pageNumber) {
        const screenshotUrl = reportData.screenshots[category];
        if (screenshotUrl) {
          try {
            const screenshotImg = await loadImage(screenshotUrl);
            
            // Convertir les coordonnées
            const screenshotX = x + (screenshotPlacement.x * scaleX);
            const screenshotY = y + (screenshotPlacement.y * scaleY);
            const screenshotWidth = screenshotPlacement.width * scaleX;
            const screenshotHeight = screenshotPlacement.height * scaleY;

            // Ajouter le screenshot
            doc.addImage(
              screenshotImg,
              'PNG',
              screenshotX,
              screenshotY,
              screenshotWidth,
              screenshotHeight
            );
          } catch (error) {
            console.error(`Erreur lors du chargement de la capture ${category}:`, error);
          }
        }
      }

      // Placer le texte d'analyse pour cette catégorie
      const textPlacement = templateConfig.text_placements[category];
      if (textPlacement && textPlacement.page === pageNumber) {
        const analysisText = reportDataWithAnalysis.kpis[category].analysis;
        if (analysisText) {
          // Configuration du texte
          const fontSize = textPlacement.fontSize || 12;
          const color = textPlacement.color || '#000000';
          const align = textPlacement.align || 'left';

          doc.setFontSize(fontSize);
          
          // Convertir la couleur hex en RGB
          const rgb = hexToRgb(color);
          if (rgb) {
            doc.setTextColor(rgb.r, rgb.g, rgb.b);
          } else {
            doc.setTextColor(0, 0, 0);
          }

          // Convertir les coordonnées
          const textX = x + (textPlacement.x * scaleX);
          const textY = y + (textPlacement.y * scaleY);
          const textWidth = textPlacement.width * scaleX;
          const textHeight = textPlacement.height * scaleY;

          // Pour jsPDF, on doit gérer le texte multi-lignes manuellement
          const lines = doc.splitTextToSize(analysisText, textWidth);
          let currentY = textY;
          
          for (const line of lines) {
            if (line.trim() && currentY < textY + textHeight) {
              const textOptions: any = {
                align: align,
                maxWidth: textWidth,
              };
              
              doc.text(line, textX, currentY, textOptions);
              currentY += fontSize * 0.35; // Espacement entre lignes
            }
          }
        }
      }
    }

    // Remplir les variables obsolètes (pour compatibilité avec anciens templates)
    if (templateConfig.variables) {
      for (const [varName, varConfig] of Object.entries(templateConfig.variables)) {
        if (varConfig.page !== pageNumber) continue;

        // Cette logique est conservée pour compatibilité mais ne devrait plus être utilisée
        // avec le nouveau format (logo_placement et text_placements)
        console.warn(`Variable ${varName} utilise l'ancien format. Utilisez logo_placement et text_placements à la place.`);
      }
    }
  }

  // Retourner le PDF comme Blob
  return doc.output('blob');
}

/**
 * Convertit une couleur hex en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}


/**
 * Génère un rapport avec le template par défaut si aucun template Canva n'est configuré
 */
export async function generateDefaultReportPDF(
  reportData: GBPReportData
): Promise<Blob> {
  // Utiliser le générateur react-pdf existant comme fallback
  // On importe dynamiquement pour éviter les dépendances circulaires
  const { generateGBPReportPDF } = await import('./gbpReportGenerator');
  return generateGBPReportPDF(reportData);
}

