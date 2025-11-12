import { supabase } from "@/integrations/supabase/client";
import { sendEmail, replaceEmailVariables, EMAIL_TEMPLATES } from "./emailService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  montant_mensuel?: number | null;
  date_anniversaire_abonnement?: string | null;
}

/**
 * Generate invoice number using database function
 */
async function generateInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase.rpc("generate_invoice_number");
  
  if (error) {
    // Fallback if function doesn't exist
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .like("invoice_number", `FACT-${year}-${month}-%`);
    
    const nextNumber = (count || 0) + 1;
    return `FACT-${year}-${month}-${String(nextNumber).padStart(4, "0")}`;
  }
  
  return data || `FACT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-0001`;
}

/**
 * Create invoice for a client
 */
export async function createInvoiceForClient(client: Client) {
  if (!client.montant_mensuel || !client.email) {
    throw new Error("Client must have montant_mensuel and email configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const invoiceNumber = await generateInvoiceNumber();
  const today = new Date();
  const montantHT = Number(client.montant_mensuel);
  const tvaRate = 20;
  const tva = montantHT * (tvaRate / 100);
  const montantTTC = montantHT + tva;

  // Create invoice in database
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id: client.id,
      invoice_number: invoiceNumber,
      amount_ht: montantHT,
      amount_ttc: montantTTC,
      tva_rate: tvaRate,
      date: today.toISOString().split("T")[0],
      status: "en_attente",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  return invoice;
}

/**
 * Send invoice email to client
 */
export async function sendInvoiceEmail(client: Client, invoiceNumber: string, montantTTC: number) {
  if (!client.email) {
    throw new Error("Client has no email address");
  }

  const emailContent = replaceEmailVariables(
    EMAIL_TEMPLATES.INVOICE.html,
    {
      "CLIENT_NAME": client.company || client.name,
      "INVOICE_NUMBER": invoiceNumber,
      "MONTH": format(new Date(), "MMMM yyyy", { locale: fr }),
      "AMOUNT": montantTTC.toLocaleString("fr-FR"),
    }
  );

  const subject = replaceEmailVariables(
    EMAIL_TEMPLATES.INVOICE.subject,
    {
      "INVOICE_NUMBER": invoiceNumber,
    }
  );

  await sendEmail({
    to: client.email,
    subject: subject,
    html: emailContent,
    clientId: client.id,
    type: "invoice",
  });
}

/**
 * Main function: Create invoice + send email
 */
export async function generateAndSendInvoice(client: Client) {
  try {
    // 1. Create invoice
    const invoice = await createInvoiceForClient(client);
    
    // 2. Send email
    await sendInvoiceEmail(
      client,
      invoice.invoice_number,
      Number(invoice.amount_ttc)
    );

    return {
      success: true,
      invoice,
      message: `Facture ${invoice.invoice_number} créée et envoyée à ${client.email}`,
    };
  } catch (error: any) {
    console.error("Error in generateAndSendInvoice:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get clients whose invoice is due today (anniversary date)
 */
export async function getClientsDueToday(): Promise<Client[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .eq("statut", "actif")
    .not("date_anniversaire_abonnement", "is", null)
    .not("montant_mensuel", "is", null)
    .not("email", "is", null);

  if (!clients) return [];

  const today = new Date();
  const todayDay = today.getDate();

  // Filter clients whose date_anniversaire_abonnement day matches today
  return clients.filter((client) => {
    if (!client.date_anniversaire_abonnement) return false;
    const anniversaryDate = new Date(client.date_anniversaire_abonnement);
    return anniversaryDate.getDate() === todayDay;
  });
}

/**
 * Process all invoices due today (to be called manually or via cron)
 */
export async function processInvoicesDueToday() {
  const clients = await getClientsDueToday();
  
  const results = {
    total: clients.length,
    success: 0,
    errors: [] as string[],
  };

  for (const client of clients) {
    const result = await generateAndSendInvoice(client);
    if (result.success) {
      results.success++;
    } else {
      results.errors.push(`${client.name}: ${result.error}`);
    }
  }

  return results;
}


