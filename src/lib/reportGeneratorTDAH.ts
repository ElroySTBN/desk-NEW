import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MonthlyReportData {
  clientId: string;
  clientName: string;
  clientCompany?: string;
  mois: number;
  annee: number;
  kpis?: Array<{ nom_kpi: string; valeur: string }>;
  observations?: string[];
  screenshots?: string[]; // URLs des captures d'écran
}

/**
 * Génère un rapport mensuel PDF adapté TDAH
 * Template épuré avec intégration des observations du mois
 */
export async function generateMonthlyReportPDF(data: MonthlyReportData): Promise<string> {
  const doc = new jsPDF();

  // En-tête avec couleur RaiseMed.IA
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RaiseMed.IA", 20, 15);

  const monthLabel = format(new Date(data.annee, data.mois - 1, 1), "MMMM yyyy", { locale: fr });
  doc.setFontSize(14);
  doc.text(`Rapport Mensuel - ${monthLabel}`, 20, 25);

  // Informations client
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.clientName, 20, 50);
  
  if (data.clientCompany) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(data.clientCompany, 20, 57);
  }

  let currentY = data.clientCompany ? 70 : 63;

  // Section : Observations du mois (auto-remplies depuis les notes)
  if (data.observations && data.observations.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("📝 Observations & Actions menées ce mois", 20, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    data.observations.forEach((obs, idx) => {
      const lines = doc.splitTextToSize(`• ${obs}`, 170);
      if (currentY + lines.length * 5 > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(lines, 20, currentY);
      currentY += lines.length * 5 + 3;
    });
    currentY += 10;
  }

  // Section : KPIs
  if (data.kpis && data.kpis.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("📈 KPIs du Mois", 20, currentY);
    currentY += 8;

    const kpiData = data.kpis.map(kpi => [kpi.nom_kpi, kpi.valeur]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["KPI", "Valeur"]],
      body: kpiData,
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 70, halign: "right", fontStyle: "bold" },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Section : Captures d'écran (si disponibles)
  if (data.screenshots && data.screenshots.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("📸 Captures d'écran", 20, currentY);
    currentY += 15;

    // Note: Pour ajouter des images, il faudrait utiliser html2canvas ou une autre méthode
    // Pour l'instant, on liste juste les URLs
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${data.screenshots.length} capture(s) d'écran disponible(s)`, 20, currentY);
    currentY += 10;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount} - RaiseMed.IA - ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`,
      105,
      287,
      { align: "center" }
    );
  }

  // Générer le PDF et retourner l'URL
  const pdfBlob = doc.output("blob");
  const fileName = `rapport-${data.clientName.toLowerCase().replace(/\s+/g, "-")}-${data.mois}-${data.annee}.pdf`;
  
  // Upload vers Supabase Storage
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const filePath = `reports/${user.id}/${data.clientId}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Enregistrer dans la table monthly_reports
      await supabase.from("monthly_reports").upsert({
        user_id: user.id,
        client_id: data.clientId,
        mois: data.mois,
        annee: data.annee,
        pdf_url: publicUrl,
        date_generation: new Date().toISOString(),
        kpis: data.kpis || [],
      });

      return publicUrl;
    }
  }

  // Fallback: télécharger directement
  doc.save(fileName);
  return "";
}

/**
 * Récupère les observations du mois depuis les notes
 */
export async function getMonthlyObservations(
  clientId: string,
  mois: number,
  annee: number
): Promise<string[]> {
  const startDate = new Date(annee, mois - 1, 1);
  const endDate = new Date(annee, mois, 0, 23, 59, 59);

  const { data: notes } = await supabase
    .from("notes")
    .select("contenu, type")
    .eq("client_id", clientId)
    .gte("date_note", startDate.toISOString())
    .lte("date_note", endDate.toISOString())
    .order("date_note", { ascending: true });

  if (!notes) return [];

  return notes.map(note => {
    const typeLabel = {
      observation: "📝",
      call: "📞",
      insight: "💡",
      alerte: "🚨",
    }[note.type] || "";

    return `${typeLabel} ${note.contenu}`;
  });
}

/**
 * Récupère les KPIs du mois
 */
export async function getMonthlyKPIs(
  clientId: string,
  mois: number,
  annee: number
): Promise<Array<{ nom_kpi: string; valeur: string }>> {
  const startDate = new Date(annee, mois - 1, 1);
  const endDate = new Date(annee, mois, 0, 23, 59, 59);

  const { data: kpis } = await supabase
    .from("kpis")
    .select("nom_kpi, valeur")
    .eq("client_id", clientId)
    .gte("date_mesure", startDate.toISOString().split("T")[0])
    .lte("date_mesure", endDate.toISOString().split("T")[0]);

  if (!kpis) return [];

  return kpis.map(kpi => ({
    nom_kpi: kpi.nom_kpi,
    valeur: kpi.valeur,
  }));
}


