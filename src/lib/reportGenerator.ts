import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MonthlyReportData {
  client_name: string;
  client_company?: string;
  month: string;
  year: number;
  actions: string;
  results: string;
  kpis: Array<{ name: string; value: string }>;
  problems: string;
  improvements: string;
}

export const generateMonthlyReportPDF = (report: MonthlyReportData) => {
  const doc = new jsPDF();

  // En-tête avec couleur RaiseMed.IA
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RaiseMed.IA", 20, 15);

  doc.setFontSize(14);
  doc.text(`Rapport Mensuel - ${report.month} ${report.year}`, 20, 25);

  // Informations client
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(report.client_name, 20, 50);
  
  if (report.client_company) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(report.client_company, 20, 57);
  }

  let currentY = report.client_company ? 70 : 63;

  // Section : Actions Réalisées
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("🎯 Actions Réalisées", 20, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const actionsLines = doc.splitTextToSize(report.actions || "Aucune action renseignée", 170);
  doc.text(actionsLines, 20, currentY + 7);
  currentY += actionsLines.length * 5 + 15;

  // Section : Résultats Obtenus
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("📊 Résultats Obtenus", 20, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const resultsLines = doc.splitTextToSize(report.results || "Aucun résultat renseigné", 170);
  doc.text(resultsLines, 20, currentY + 7);
  currentY += resultsLines.length * 5 + 15;

  // Section : KPIs
  if (report.kpis && report.kpis.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("📈 KPIs du Mois", 20, currentY);
    currentY += 8;

    const kpiData = report.kpis.map(kpi => [kpi.name, kpi.value]);
    
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

    currentY = (doc as any).lastAutoTable.finalY + 12;
  } else {
    currentY += 5;
  }

  // Nouvelle page si nécessaire
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // Section : Problèmes & Solutions
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38); // Rouge pour attirer l'attention
  doc.text("⚠️ Problèmes & Solutions", 20, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const problemsLines = doc.splitTextToSize(
    report.problems || "Aucun problème identifié",
    170
  );
  doc.text(problemsLines, 20, currentY + 7);
  currentY += problemsLines.length * 5 + 15;

  // Nouvelle page si nécessaire
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // Section : Plans d'Amélioration
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246); // Bleu pour les améliorations
  doc.text("💡 Plans d'Amélioration", 20, currentY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const improvementsLines = doc.splitTextToSize(
    report.improvements || "Aucun plan d'amélioration défini",
    170
  );
  doc.text(improvementsLines, 20, currentY + 7);
  currentY += improvementsLines.length * 5 + 15;

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 280, 190, 280);
    
    // Informations de contact
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("RaiseMed.IA | Elroy SITBON", 105, 285, { align: "center" });
    doc.text("Email: contact@raisemed.ia | Tél: 07 82 49 21 24", 105, 290, {
      align: "center",
    });
    
    // Numéro de page
    doc.text(`Page ${i} sur ${pageCount}`, 190, 290, { align: "right" });
  }

  return doc;
};

export const downloadMonthlyReportPDF = (report: MonthlyReportData) => {
  const doc = generateMonthlyReportPDF(report);
  const filename = `Rapport_${report.client_name.replace(/\s+/g, "_")}_${report.month}_${report.year}.pdf`;
  doc.save(filename);
};

export const previewMonthlyReportPDF = (report: MonthlyReportData): string => {
  const doc = generateMonthlyReportPDF(report);
  return doc.output("dataurlstring");
};

