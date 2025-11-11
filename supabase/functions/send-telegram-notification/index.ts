import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramNotificationRequest {
  type: string;
  clientId?: string;
  clientName?: string;
  taskId?: string;
  taskTitle?: string;
  date?: string;
  message?: string;
  actionUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const notification: TelegramNotificationRequest = await req.json();

    // Get environment variables
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.");
    }

    // Format message
    const emoji = {
      deadline_rapport: "📅",
      deadline_facture: "💰",
      reponse_avis: "⭐",
      tache_urgente: "🚨",
      custom: "🔔",
    }[notification.type] || "🔔";

    let message = `${emoji} RaiseDesk Alert\n\n`;

    if (notification.date) {
      message += `📅 Deadline : ${notification.date}\n`;
    }

    if (notification.clientName) {
      message += `👤 Client : ${notification.clientName}\n`;
    }

    if (notification.taskTitle) {
      message += `📋 Action : ${notification.taskTitle}\n`;
    }

    if (notification.message) {
      message += `\n${notification.message}\n`;
    }

    if (notification.actionUrl) {
      message += `\n🔗 ${notification.actionUrl}`;
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    // Log notification in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user_id from client_id if provided
    let userId: string | null = null;
    if (notification.clientId) {
      const { data: client } = await supabase
        .from("clients")
        .select("user_id")
        .eq("id", notification.clientId)
        .single();
      if (client) userId = client.user_id;
    }

    if (userId) {
      await supabase.from("telegram_notifications").insert({
        user_id: userId,
        client_id: notification.clientId || null,
        task_id: notification.taskId || null,
        type: notification.type,
        message: message,
        success: true,
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.result.message_id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Telegram notification error:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});


