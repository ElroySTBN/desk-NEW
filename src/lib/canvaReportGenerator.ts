import jsPDF from 'jspdf';
import type { GBPReportData } from '@/types/gbp-reports';

/**
 * Génère un rapport PDF depuis un template Canva
 * Supporte les templates PDF et PNG/JPG
 */

export interface VariableZone {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  variable: string;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TemplateConfig {
  template_base_url: string;
  template_type: 'pdf' | 'image';
  pages: Array<{
    type: string;
    template_url?: string; // URL spécifique pour cette page si multi-pages
  }>;
  variable_zones: Record<string, VariableZone>;
  screenshot_placements: Record<string, {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/**
 * Charge une image depuis une URL et retourne un Promise avec l'image
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Convertit un PDF en images (une par page)
 * Note: Pour une implémentation complète, il faudrait utiliser pdfjs-dist
 * Pour l'instant, on suppose que le template est une image unique
 */
async function loadPDFAsImage(pdfUrl: string): Promise<HTMLImageElement[]> {
  // TODO: Implémenter avec pdfjs-dist si nécessaire
  // Pour l'instant, on suppose que c'est une image
  const img = await loadImage(pdfUrl);
  return [img];
}

/**
 * Génère un rapport PDF depuis un template Canva
 */
export async function generateCanvaReportPDF(
  reportData: GBPReportData,
  templateConfig: TemplateConfig
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Charger le template de base
  let templateImages: HTMLImageElement[] = [];
  
  if (templateConfig.template_type === 'pdf') {
    // Si c'est un PDF, on le convertit en images
    templateImages = await loadPDFAsImage(templateConfig.template_base_url);
  } else {
    // Si c'est une image, on la charge directement
    const img = await loadImage(templateConfig.template_base_url);
    templateImages = [img];
  }

  // Pour chaque page du template
  for (let pageIndex = 0; pageIndex < templateImages.length; pageIndex++) {
    if (pageIndex > 0) {
      doc.addPage();
    }

    const templateImg = templateImages[pageIndex];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Calculer les dimensions pour que l'image remplisse la page
    const imgWidth = templateImg.width;
    const imgHeight = templateImg.height;
    const imgAspectRatio = imgWidth / imgHeight;
    const pageAspectRatio = pageWidth / pageHeight;

    let finalWidth = pageWidth;
    let finalHeight = pageHeight;
    let x = 0;
    let y = 0;

    if (imgAspectRatio > pageAspectRatio) {
      // L'image est plus large
      finalHeight = pageWidth / imgAspectRatio;
      y = (pageHeight - finalHeight) / 2;
    } else {
      // L'image est plus haute
      finalWidth = pageHeight * imgAspectRatio;
      x = (pageWidth - finalWidth) / 2;
    }

    // Dessiner le template comme fond
    doc.addImage(
      templateImg.src,
      'PNG',
      x,
      y,
      finalWidth,
      finalHeight
    );

    // Calculer le facteur d'échelle pour les coordonnées
    const scaleX = finalWidth / imgWidth;
    const scaleY = finalHeight / imgHeight;

    // Remplir les variables de texte
    for (const [varName, zone] of Object.entries(templateConfig.variable_zones)) {
      if (zone.page !== pageIndex + 1) continue;

      const value = getVariableValue(varName, reportData);
      if (!value) continue;

      // Convertir les coordonnées du template vers les coordonnées PDF
      const pdfX = x + (zone.x * scaleX);
      const pdfY = y + (zone.y * scaleY);

      // Configuration du texte
      doc.setFontSize(zone.fontSize || 12);
      doc.setTextColor(zone.color || '#000000');
      
      // Alignement
      const textOptions: any = {
        align: zone.align || 'left',
      };

      // Ajouter le texte
      doc.text(value, pdfX, pdfY, textOptions);
    }

    // Ajouter les captures d'écran
    for (const [screenshotType, placement] of Object.entries(templateConfig.screenshot_placements)) {
      if (placement.page !== pageIndex + 1) continue;

      const screenshotUrl = reportData.screenshots[screenshotType as keyof typeof reportData.screenshots];
      if (!screenshotUrl) continue;

      try {
        const screenshotImg = await loadImage(screenshotUrl);
        
        // Convertir les dimensions
        const screenshotX = x + (placement.x * scaleX);
        const screenshotY = y + (placement.y * scaleY);
        const screenshotWidth = placement.width * scaleX;
        const screenshotHeight = placement.height * scaleY;

        doc.addImage(
          screenshotImg.src,
          'PNG',
          screenshotX,
          screenshotY,
          screenshotWidth,
          screenshotHeight
        );
      } catch (error) {
        console.error(`Erreur lors du chargement de la capture ${screenshotType}:`, error);
      }
    }
  }

  // Retourner le PDF comme Blob
  return doc.output('blob');
}

/**
 * Récupère la valeur d'une variable depuis les données du rapport
 */
function getVariableValue(varName: string, reportData: GBPReportData): string | null {
  const parts = varName.split('.');
  
  if (parts[0] === 'client') {
    if (parts[1] === 'name') return reportData.client.name;
    if (parts[1] === 'company') return reportData.client.company || reportData.client.name;
  }
  
  if (parts[0] === 'period') {
    if (parts[1] === 'startMonth') return reportData.period.startMonth;
    if (parts[1] === 'endMonth') return reportData.period.endMonth;
    if (parts[1] === 'year') return reportData.period.year.toString();
  }
  
  if (parts[0] === 'kpis') {
    const kpiType = parts[1] as keyof typeof reportData.kpis;
    const kpi = reportData.kpis[kpiType];
    if (!kpi) return null;
    
    if (parts[2] === 'current') return kpi.current.toString();
    if (parts[2] === 'previous') return kpi.previous.toString();
    if (parts[2] === 'evolution') {
      const diff = kpi.current - kpi.previous;
      const percentage = kpi.previous > 0 
        ? ((diff / kpi.previous) * 100).toFixed(1)
        : '0';
      return `${diff >= 0 ? '+' : ''}${diff} (${diff >= 0 ? '+' : ''}${percentage}%)`;
    }
  }
  
  return null;
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

