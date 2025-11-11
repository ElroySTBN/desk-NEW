import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate PDF from invoice HTML element using html2canvas and jsPDF
 */
export async function generateInvoicePDF(
  invoiceElement: HTMLElement,
  filename: string = "invoice.pdf"
): Promise<Blob> {
  // Use html2canvas to capture the content as an image
  const canvas = await html2canvas(invoiceElement, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL("image/png");

  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add the image to the PDF
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // If content is taller than one page, split across multiple pages
  const pageHeight = pdf.internal.pageSize.getHeight();
  let heightLeft = pdfHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  // Return as blob
  return pdf.output("blob");
}

/**
 * Upload invoice PDF to Supabase Storage
 */
export async function uploadInvoicePDF(
  pdfBlob: Blob,
  invoiceNumber: string,
  userId: string
): Promise<string> {
  const fileName = `invoices/${userId}/${invoiceNumber}.pdf`;

  const { data, error } = await supabase.storage
    .from("invoices")
    .upload(fileName, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded PDF");
  }

  return urlData.publicUrl;
}

/**
 * Generate and save invoice PDF
 */
export async function generateAndSaveInvoicePDF(
  invoiceElement: HTMLElement,
  invoiceNumber: string,
  userId: string
): Promise<string> {
  // Generate PDF
  const pdfBlob = await generateInvoicePDF(invoiceElement, `${invoiceNumber}.pdf`);

  // Upload to Supabase Storage
  const pdfUrl = await uploadInvoicePDF(pdfBlob, invoiceNumber, userId);

  return pdfUrl;
}

