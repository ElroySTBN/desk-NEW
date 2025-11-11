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

    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Telegram configuration missing");
    }

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const results = {
      reportDeadlines: 0,
      invoiceDeadlines: 0,
      reviewReminders: 0,
      urgentTasks: 0,
      errors: [] as string[],
    };

    // 1. Check report deadlines (3 days before end of month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const reportDeadlineDay = lastDayOfMonth - 3;

    if (today.getDate() === reportDeadlineDay) {
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, user_id")
        .eq("status", "actif");

      if (clients) {
        for (const client of clients) {
          // Check if report already exists for this month
          const { data: existingReport } = await supabase
            .from("monthly_reports")
            .select("id")
            .eq("client_id", client.id)
            .eq("mois", currentMonth + 1)
            .eq("annee", currentYear)
            .single();

          if (!existingReport) {
            // Check if notification already sent today
            const { data: existingNotification } = await supabase
              .from("telegram_notifications")
              .select("id")
              .eq("user_id", client.user_id)
              .eq("client_id", client.id)
              .eq("type", "deadline_rapport")
              .gte("sent_at", today.toISOString().split("T")[0])
              .single();

            if (!existingNotification) {
              await sendTelegramNotification(
                TELEGRAM_BOT_TOKEN,
                TELEGRAM_CHAT_ID,
                "📅 RaiseDesk Alert\n\n📅 Deadline : Dans 3 jours\n👤 Client : " + client.name + "\n📋 Action : Générer rapport mensuel"
              );
              results.reportDeadlines++;
            }
          }
        }
      }
    }

    // 2. Check invoice deadlines (3 days before anniversary date)
    const { data: clientsForInvoice } = await supabase
      .from("clients")
      .select("id, name, date_anniversaire_abonnement, user_id")
      .eq("status", "actif")
      .not("date_anniversaire_abonnement", "is", null);

    if (clientsForInvoice) {
      for (const client of clientsForInvoice) {
        if (!client.date_anniversaire_abonnement) continue;

        const anniversaryDate = new Date(client.date_anniversaire_abonnement);
        const threeDaysBefore = new Date(anniversaryDate);
        threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

        if (
          today.toDateString() === threeDaysBefore.toDateString()
        ) {
          // Check if notification already sent today
          const { data: existingNotification } = await supabase
            .from("telegram_notifications")
            .select("id")
            .eq("user_id", client.user_id)
            .eq("client_id", client.id)
            .eq("type", "deadline_facture")
            .gte("sent_at", today.toISOString().split("T")[0])
            .single();

          if (!existingNotification) {
            await sendTelegramNotification(
              TELEGRAM_BOT_TOKEN,
              TELEGRAM_CHAT_ID,
              "💰 RaiseDesk Alert\n\n📅 Deadline : Dans 3 jours\n👤 Client : " + client.name + "\n📋 Action : Générer facture"
            );
            results.invoiceDeadlines++;
          }
        }
      }
    }

    // 3. Check review reminders (every 3 days)
    // This would need a tracking table, simplified here
    const { data: activeClients } = await supabase
      .from("clients")
      .select("id, name, user_id")
      .eq("status", "actif")
      .limit(10); // Check first 10 for demo

    // 4. Check urgent tasks (not completed, overdue by 1 day)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: urgentTasks } = await supabase
      .from("tasks")
      .select("id, title, client_id, user_id, clients!inner(name)")
      .in("status", ["todo", "in_progress"])
      .eq("priority", "urgent")
      .lte("deadline", yesterday.toISOString());

    if (urgentTasks) {
      for (const task of urgentTasks) {
        const { data: existingNotification } = await supabase
          .from("telegram_notifications")
          .select("id")
          .eq("user_id", task.user_id)
          .eq("task_id", task.id)
          .eq("type", "tache_urgente")
          .gte("sent_at", today.toISOString().split("T")[0])
          .single();

        if (!existingNotification) {
          await sendTelegramNotification(
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID,
            "🚨 RaiseDesk Alert\n\n👤 Client : " + (task.clients?.name || "Sans client") + "\n📋 Action : " + task.title + "\n\nTâche urgente non complétée depuis hier"
          );
          results.urgentTasks++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Check deadlines error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
  }
}


