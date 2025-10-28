import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceData {
  invoice_number: string;
  date: string;
  client_name: string;
  client_company?: string;
  client_email?: string;
  client_phone?: string;
  description: string;
  amount_ht: number;
  tva_rate: number;
  amount_ttc: number;
}

export const generateInvoicePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();
  
  // Logo et en-tête RaiseMed.IA
  doc.setFillColor(16, 185, 129); // Primary color
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RaiseMed.IA", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Agence de Marketing Digital & Google Business Profile", 20, 28);
  
  // Informations RaiseMed.IA
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text("Elroy SITBON", 20, 50);
  doc.text("RaiseMed.IA", 20, 55);
  doc.text("4 Rue Bellanger", 20, 60);
  doc.text("92200 Neuilly-Sur-Seine", 20, 65);
  doc.text("Tél: 07 82 49 21 24", 20, 70);
  doc.text("Email: contact@raisemed.ia", 20, 75);
  
  // FACTURE - Gros titre
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("FACTURE", 150, 50);
  
  // Numéro et date de facture
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${invoice.invoice_number}`, 150, 60);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString("fr-FR")}`, 150, 65);
  
  // Informations client
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À:", 20, 90);
  doc.setFont("helvetica", "normal");
  let clientY = 97;
  doc.text(invoice.client_name, 20, clientY);
  
  if (invoice.client_company) {
    clientY += 5;
    doc.text(invoice.client_company, 20, clientY);
  }
  if (invoice.client_email) {
    clientY += 5;
    doc.text(invoice.client_email, 20, clientY);
  }
  if (invoice.client_phone) {
    clientY += 5;
    doc.text(invoice.client_phone, 20, clientY);
  }
  
  // Tableau des services
  const tableStartY = clientY + 13;
  
  autoTable(doc, {
    startY: tableStartY,
    head: [["Description", "Montant HT"]],
    body: [[invoice.description, `${invoice.amount_ht.toLocaleString("fr-FR")} €`]],
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 50, halign: "right" },
    },
  });
  
  // Calculs
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const tvaAmount = invoice.amount_ht * (invoice.tva_rate / 100);
  
  doc.setFontSize(10);
  doc.text("Montant HT:", 120, finalY);
  doc.text(`${invoice.amount_ht.toLocaleString("fr-FR")} €`, 170, finalY, { align: "right" });
  
  doc.text(`TVA (${invoice.tva_rate}%):`, 120, finalY + 7);
  doc.text(`${tvaAmount.toLocaleString("fr-FR")} €`, 170, finalY + 7, { align: "right" });
  
  // Total TTC en gras
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total TTC:", 120, finalY + 17);
  doc.text(`${invoice.amount_ttc.toLocaleString("fr-FR")} €`, 170, finalY + 17, { align: "right" });
  
  // Conditions de paiement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Conditions de paiement: Règlement sous 15 jours par virement bancaire", 20, finalY + 35);
  doc.text("Pénalités de retard: Taux BCE + 10 points", 20, finalY + 40);
  
  // Informations bancaires
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMATIONS BANCAIRES", 20, finalY + 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Virement bancaire - Coordonnées transmises sur demande", 20, finalY + 56);
  
  // Mentions légales (bas de page)
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("RaiseMed.IA - Elroy SITBON - Micro-entreprise", 105, 278, { align: "center" });
  doc.text("SIRET: 94011372300016 - TVA: FR27940113723", 105, 283, { align: "center" });
  doc.text("TVA non applicable, art. 293 B du CGI", 105, 288, { align: "center" });
  
  return doc;
};

export const downloadInvoicePDF = (invoice: InvoiceData) => {
  const doc = generateInvoicePDF(invoice);
  doc.save(`Facture_${invoice.invoice_number}.pdf`);
};

export const previewInvoicePDF = (invoice: InvoiceData): string => {
  const doc = generateInvoicePDF(invoice);
  return doc.output("dataurlstring");
};

