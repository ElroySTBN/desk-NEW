import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Telegram configuration
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error(
        "Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID."
      );
    }

    // Get today's date
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;

    // Only run on the first of the month
    if (!isFirstOfMonth) {
      return new Response(
        JSON.stringify({
          message: "Not the first of the month, skipping check",
          success: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate last month
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    const lastMonthName = monthNames[lastMonth.getMonth()];
    const lastMonthYear = lastMonth.getFullYear();

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name, company, user_id")
      .eq("statut", "actif");

    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No active clients found",
          success: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check which clients don't have a report for last month
    const clientsWithoutReport: string[] = [];

    for (const client of clients) {
      const { data: existingReport, error: reportError } = await supabase
        .from("rapports_gbp")
        .select("id")
        .eq("client_id", client.id)
        .eq("mois", lastMonthName)
        .eq("annee", lastMonthYear)
        .maybeSingle();

      if (reportError && reportError.code !== "PGRST116") {
        console.error(`Error checking report for client ${client.id}:`, reportError);
        continue;
      }

      if (!existingReport) {
        clientsWithoutReport.push(client.company || client.name);
      }
    }

    // Send Telegram notification if there are clients without reports
    if (clientsWithoutReport.length > 0) {
      const message = `🔔 *Rapports mensuels GBP à générer*\n\n` +
        `📅 Période : ${lastMonthName} ${lastMonthYear}\n\n` +
        `📋 Clients concernés :\n` +
        clientsWithoutReport.map(name => `• ${name}`).join('\n') +
        `\n\n🔗 [Accéder à RaiseDesk](https://raisedesk.app/reports/gbp)`;

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const telegramResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (!telegramResponse.ok) {
        const error = await telegramResponse.json();
        throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${clients.length} clients, ${clientsWithoutReport.length} without reports`,
        clientsWithoutReport,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-monthly-gbp-reports:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});



