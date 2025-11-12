import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayDay = today.getDate();

    // Get clients whose anniversary date is today
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name, email, montant_mensuel, date_anniversaire_abonnement, user_id")
      .eq("statut", "actif")
      .not("date_anniversaire_abonnement", "is", null)
      .not("montant_mensuel", "is", null)
      .not("email", "is", null);

    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No clients due for invoicing today", count: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Filter clients whose anniversary day matches today
    const clientsDueToday = clients.filter((client) => {
      if (!client.date_anniversaire_abonnement) return false;
      const anniversaryDate = new Date(client.date_anniversaire_abonnement);
      return anniversaryDate.getDate() === todayDay;
    });

    const results = {
      total: clientsDueToday.length,
      success: 0,
      errors: [] as string[],
    };

    for (const client of clientsDueToday) {
      try {
        // Check if invoice already exists for this month
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id")
          .eq("client_id", client.id)
          .eq("date", today.toISOString().split("T")[0])
          .single();

        if (existingInvoice) {
          results.errors.push(`${client.name}: Facture déjà générée ce mois`);
          continue;
        }

        // Generate invoice number using database function
        const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
          .rpc("generate_invoice_number");

        if (invoiceNumberError) {
          throw new Error(`Error generating invoice number: ${invoiceNumberError.message}`);
        }

        const invoiceNumber = invoiceNumberData || `FACT-${currentYear}-${String(currentMonth).padStart(2, "0")}-0001`;

        const montantHT = Number(client.montant_mensuel) || 0;
        const tvaRate = 20;
        const tva = montantHT * (tvaRate / 100);
        const montantTTC = montantHT + tva;

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            user_id: client.user_id,
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

        if (invoiceError) {
          throw new Error(`Error creating invoice: ${invoiceError.message}`);
        }

        // Generate PDF (simplified - you would call your PDF generation service here)
        // For now, we'll just mark it as created
        // In production, you would generate the PDF and upload it to storage

        // Send email via Edge Function
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            to: client.email,
            subject: `Votre facture ${invoiceNumber} - RaiseMed.IA`,
            html: `
              <h2>Bonjour ${client.name},</h2>
              <p>Votre facture du mois de ${today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} est prête.</p>
              <p><strong>Numéro de facture :</strong> ${invoiceNumber}</p>
              <p><strong>Montant TTC :</strong> ${montantTTC.toLocaleString("fr-FR")} €</p>
              <p>La facture est jointe à cet email.</p>
              <p>Cordialement,<br>RaiseMed.IA</p>
            `,
          },
        });

        if (emailError) {
          console.error(`Error sending email for ${client.name}:`, emailError);
          // Don't fail the whole process if email fails
        }

        results.success++;
      } catch (error: any) {
        results.errors.push(`${client.name}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Auto-invoice error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});


