import { pdf, Document } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';
import type { GBPReportData } from '@/types/gbp-reports';
import { Page1_Cover } from '@/components/reports/gbp/pdf/Page1_Cover';
import { Page2_VueEnsemble } from '@/components/reports/gbp/pdf/Page2_VueEnsemble';
import { Page3_Appels } from '@/components/reports/gbp/pdf/Page3_Appels';
import { Page4_ClicsWeb } from '@/components/reports/gbp/pdf/Page4_ClicsWeb';
import { Page5_Itineraire } from '@/components/reports/gbp/pdf/Page5_Itineraire';
import { Page6_Monthly } from '@/components/reports/gbp/pdf/Page6_Monthly';

/**
 * Génère un PDF de rapport GBP avec react-pdf/renderer
 */
export async function generateGBPReportPDF(data: GBPReportData): Promise<Blob> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Créer le document PDF avec toutes les pages
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

  // Générer le PDF
  const pdfBlob = await generateGBPReportPDF(reportData);

  // Créer l'enregistrement dans la base de données d'abord pour obtenir l'ID
  const { data: reportRecord, error: insertError } = await supabase
    .from('rapports_gbp')
    .insert({
      user_id: user.id,
      client_id: reportData.client.id,
      type: reportType,
      mois: mois,
      annee: annee,
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
    .single();

  if (insertError) {
    throw new Error(`Erreur lors de l'enregistrement du rapport: ${insertError.message}`);
  }

  // Upload le PDF
  const pdfUrl = await uploadGBPReportPDF(
    pdfBlob,
    reportData.client.id,
    reportRecord.id
  );

  // Mettre à jour le rapport avec l'URL du PDF
  const { error: updateError } = await supabase
    .from('rapports_gbp')
    .update({ pdf_url: pdfUrl })
    .eq('id', reportRecord.id);

  if (updateError) {
    throw new Error(`Erreur lors de la mise à jour du rapport: ${updateError.message}`);
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

