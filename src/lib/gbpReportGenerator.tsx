import { pdf, Document } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';
import type { GBPReportData } from '@/types/gbp-reports';
import { Page1_Cover } from '@/components/reports/gbp/pdf/Page1_Cover';
import { Page2_VueEnsemble } from '@/components/reports/gbp/pdf/Page2_VueEnsemble';
import { Page3_Appels } from '@/components/reports/gbp/pdf/Page3_Appels';
import { Page4_ClicsWeb } from '@/components/reports/gbp/pdf/Page4_ClicsWeb';
import { Page5_Itineraire } from '@/components/reports/gbp/pdf/Page5_Itineraire';
import { Page6_Monthly } from '@/components/reports/gbp/pdf/Page6_Monthly';
import { generateCanvaReportPDF } from './canvaReportGenerator';
import type { GBPTemplateConfig } from './gbpTemplateConfig';
import { DEFAULT_TEMPLATE_CONFIG, validateTemplateConfig } from './gbpTemplateConfig';

/**
 * Récupère le template Canva configuré pour l'utilisateur
 * Utilise la nouvelle configuration simplifiée
 */
async function getCanvaTemplate(): Promise<GBPTemplateConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: template, error } = await supabase
    .from('gbp_report_templates' as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .maybeSingle() as { data: any; error: any };

  if (error || !template) {
    return null;
  }

  // Migrer depuis l'ancien format si nécessaire
  const templateConfig = template.template_config || {};
  
  // Si l'ancien format existe (template_base_url), le convertir
  if (template.template_base_url && !templateConfig.pages) {
    // Migration depuis l'ancien format
    const config: GBPTemplateConfig = {
      pages: [template.template_base_url], // Utiliser l'URL comme première page
      variables: templateConfig.variable_zones || templateConfig.variables || {},
      screenshot_placements: templateConfig.screenshot_placements || {},
      text_templates: templateConfig.text_templates || {},
      ocr_zones: templateConfig.ocr_zones || {},
    };
    
    // Valider la configuration
    const validation = validateTemplateConfig(config);
    if (!validation.valid) {
      console.warn('Configuration de template invalide:', validation.errors);
      return null;
    }
    
    return config;
  }

  // Nouveau format : utiliser directement template_config
  const config: GBPTemplateConfig = {
    pages: templateConfig.pages || (template.template_base_url ? [template.template_base_url] : []),
    variables: templateConfig.variables || templateConfig.variable_zones || {},
    screenshot_placements: templateConfig.screenshot_placements || {},
    text_templates: templateConfig.text_templates || {},
    ocr_zones: templateConfig.ocr_zones || {},
  };

  // Valider la configuration
  const validation = validateTemplateConfig(config);
  if (!validation.valid) {
    console.warn('Configuration de template invalide:', validation.errors);
    return null;
  }

  // Vérifier qu'au moins une page existe
  if (config.pages.length === 0) {
    return null;
  }

  return config;
}

/**
 * Génère un PDF de rapport GBP
 * Utilise le template Canva si disponible, sinon utilise react-pdf
 */
export async function generateGBPReportPDF(data: GBPReportData): Promise<Blob> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Essayer de récupérer le template Canva
  const canvaTemplate = await getCanvaTemplate();

  if (canvaTemplate) {
    // Utiliser le template Canva
    try {
      return await generateCanvaReportPDF(data, canvaTemplate);
    } catch (error) {
      console.error('Erreur lors de la génération avec le template Canva, fallback sur le template par défaut:', error);
      // Fallback sur le template par défaut
    }
  }

  // Utiliser le template par défaut (react-pdf)
  const pdfDoc = (
    <Document>
      <Page1_Cover client={data.client} />
      <Page2_VueEnsemble data={data} />
      <Page3_Appels data={data} />
      <Page4_ClicsWeb data={data} />
      <Page5_Itineraire data={data} />
      {data.monthlyKpis && <Page6_Monthly data={data} />}
    </Document>
  );

  // Générer le blob PDF
  const blob = await pdf(pdfDoc).toBlob();
  return blob;
}

/**
 * Upload le PDF vers Supabase Storage et retourne l'URL publique
 */
export async function uploadGBPReportPDF(
  pdfBlob: Blob,
  clientId: string,
  reportId: string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const fileName = `rapport-${reportId}.pdf`;
  const filePath = `${user.id}/${clientId}/${fileName}`;

  // Upload vers Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('gbp-reports')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Erreur lors de l'upload du PDF: ${uploadError.message}`);
  }

  // Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('gbp-reports')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Génère et upload le PDF, puis enregistre le rapport dans la base de données
 */
export async function generateAndSaveGBPReport(
  reportData: GBPReportData,
  reportType: '5_mois' | 'mensuel' | 'complet',
  mois: string,
  annee: number
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Générer le PDF d'abord
  const pdfBlob = await generateGBPReportPDF(reportData);

  // Générer un ID temporaire pour le nom de fichier
  const tempReportId = crypto.randomUUID();

  // Upload le PDF AVANT d'insérer dans la base de données
  const pdfUrl = await uploadGBPReportPDF(
    pdfBlob,
    reportData.client.id,
    tempReportId
  );

  // Maintenant insérer dans la base de données avec l'URL du PDF
  const insertResult = await supabase
    .from('rapports_gbp' as any)
    .insert({
      user_id: user.id,
      client_id: reportData.client.id,
      type: reportType,
      mois: mois,
      annee: annee,
      pdf_url: pdfUrl, // Inclure l'URL directement
      kpis: {
        vue_ensemble: reportData.kpis.vue_ensemble,
        appels: reportData.kpis.appels,
        clics_web: reportData.kpis.clics_web,
        itineraire: reportData.kpis.itineraire,
        monthly: reportData.monthlyKpis,
      },
      screenshots: reportData.screenshots,
      created_by: user.id,
    })
    .select()
    .single() as any;

  if (insertResult.error || !insertResult.data?.id) {
    throw new Error(`Erreur lors de l'enregistrement du rapport: ${insertResult.error?.message || 'Aucun ID retourné'}`);
  }

  const reportRecord = insertResult.data;

  // Renommer le fichier avec le vrai ID du rapport
  const finalFileName = `rapport-${reportRecord.id}.pdf`;
  const finalFilePath = `${user.id}/${reportData.client.id}/${finalFileName}`;
  const oldFilePath = `${user.id}/${reportData.client.id}/rapport-${tempReportId}.pdf`;

  // Copier le fichier avec le nouveau nom
  const { error: copyError } = await supabase.storage
    .from('gbp-reports')
    .copy(oldFilePath, finalFilePath);

  if (!copyError) {
    // Supprimer l'ancien fichier
    await supabase.storage
      .from('gbp-reports')
      .remove([oldFilePath]);

    // Mettre à jour l'URL dans la base de données
    const { data: { publicUrl } } = supabase.storage
      .from('gbp-reports')
      .getPublicUrl(finalFilePath);

    if (reportRecord && reportRecord.id) {
      await supabase
        .from('rapports_gbp' as any)
        .update({ pdf_url: publicUrl })
        .eq('id', reportRecord.id);
    }
  }

  return pdfUrl;
}

/**
 * Calcule l'évolution entre deux valeurs
 */
export function calculateEvolution(current: number, previous: number): {
  difference: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} {
  if (previous === 0) {
    return {
      difference: current,
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'stable',
    };
  }

  const difference = current - previous;
  const percentage = ((difference / previous) * 100);
  const direction = percentage > 10 ? 'up' : percentage < -10 ? 'down' : 'stable';

  return {
    difference,
    percentage: Math.abs(percentage),
    direction,
  };
}

