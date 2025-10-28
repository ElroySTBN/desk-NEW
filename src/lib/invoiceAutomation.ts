import { supabase } from "@/integrations/supabase/client";
import { sendEmail, replaceEmailVariables, EMAIL_TEMPLATES } from "./emailService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  monthly_amount: number | null;
  start_date: string | null;
}

/**
 * Generate invoice number (format: RMD-YYYY-NNN)
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get count of invoices this year
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`);

  const nextNumber = (count || 0) + 1;
  return `RMD-${year}-${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Create invoice for a client
 */
export async function createInvoiceForClient(client: Client) {
  if (!client.monthly_amount || !client.email) {
    throw new Error("Client must have monthly_amount and email configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const invoiceNumber = await generateInvoiceNumber();
  const today = new Date();
  const amountHT = client.monthly_amount;
  const tva = amountHT * 0.20;
  const amountTTC = amountHT + tva;

  // Create invoice in database
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id: client.id,
      invoice_number: invoiceNumber,
      date: today.toISOString().split("T")[0],
      due_date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +15 days
      description: `Services RaiseMed.IA - ${format(today, "MMMM yyyy", { locale: fr })}`,
      amount_ht: amountHT,
      tva_rate: 20,
      tva_amount: tva,
      amount_ttc: amountTTC,
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
export async function sendInvoiceEmail(client: Client, invoiceNumber: string, amount: number) {
  if (!client.email) {
    throw new Error("Client has no email address");
  }

  const emailContent = replaceEmailVariables(
    EMAIL_TEMPLATES.INVOICE.html,
    {
      "CLIENT_NAME": client.company || client.name,
      "INVOICE_NUMBER": invoiceNumber,
      "MONTH": format(new Date(), "MMMM yyyy", { locale: fr }),
      "AMOUNT": amount.toLocaleString("fr-FR"),
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
      invoice.amount_ttc
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
    .eq("status", "actif")
    .not("start_date", "is", null)
    .not("monthly_amount", "is", null)
    .not("email", "is", null);

  if (!clients) return [];

  const today = new Date();
  const todayDay = today.getDate();

  // Filter clients whose start_date day matches today
  return clients.filter((client) => {
    if (!client.start_date) return false;
    const startDate = new Date(client.start_date);
    return startDate.getDate() === todayDay;
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


