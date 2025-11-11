/**
 * Service pour envoyer des notifications Telegram
 */

interface TelegramNotification {
  type: 'deadline_rapport' | 'deadline_facture' | 'reponse_avis' | 'tache_urgente' | 'rapport_gbp_manquant' | 'custom';
  clientId?: string;
  clientName?: string;
  taskId?: string;
  taskTitle?: string;
  date?: string;
  message?: string;
  actionUrl?: string;
}

/**
 * Envoie une notification Telegram via Edge Function
 */
export async function sendTelegramNotification(notification: TelegramNotification): Promise<boolean> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
      body: notification,
    });

    if (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error('Error in sendTelegramNotification:', error);
    return false;
  }
}

/**
 * Formate un message de notification selon le type
 */
export function formatNotificationMessage(notification: TelegramNotification): string {
  const emoji = {
    deadline_rapport: '📅',
    deadline_facture: '💰',
    reponse_avis: '⭐',
    tache_urgente: '🚨',
    rapport_gbp_manquant: '📊',
    custom: '🔔',
  }[notification.type] || '🔔';

  let message = `${emoji} RaiseDesk Alert\n\n`;

  if (notification.date) {
    message += `📅 Deadline : ${notification.date}\n`;
  }

  if (notification.clientName) {
    message += `👤 Client : ${notification.clientName}\n`;
  }

  if (notification.taskTitle) {
    message += `📋 Tâche : ${notification.taskTitle}\n`;
  }

  if (notification.message) {
    message += `\n${notification.message}\n`;
  }

  if (notification.actionUrl) {
    message += `\n🔗 [Voir dans RaiseDesk](${notification.actionUrl})`;
  }

  return message;
}

/**
 * Envoie une notification pour une deadline de rapport
 */
export async function notifyReportDeadline(
  clientId: string,
  clientName: string,
  deadlineDate: Date
): Promise<boolean> {
  return sendTelegramNotification({
    type: 'deadline_rapport',
    clientId,
    clientName,
    date: deadlineDate.toLocaleDateString('fr-FR'),
    message: `Rapport mensuel à générer dans 3 jours`,
    actionUrl: `${window.location.origin}/clients/${clientId}`,
  });
}

/**
 * Envoie une notification pour une deadline de facturation
 */
export async function notifyInvoiceDeadline(
  clientId: string,
  clientName: string,
  deadlineDate: Date
): Promise<boolean> {
  return sendTelegramNotification({
    type: 'deadline_facture',
    clientId,
    clientName,
    date: deadlineDate.toLocaleDateString('fr-FR'),
    message: `Facture à générer dans 3 jours`,
    actionUrl: `${window.location.origin}/clients/${clientId}`,
  });
}

/**
 * Envoie une notification pour répondre aux avis Google
 */
export async function notifyReviewReminder(
  clientId: string,
  clientName: string
): Promise<boolean> {
  return sendTelegramNotification({
    type: 'reponse_avis',
    clientId,
    clientName,
    message: `Rappel : répondre aux avis Google de ${clientName}`,
    actionUrl: `${window.location.origin}/clients/${clientId}`,
  });
}

/**
 * Envoie une notification pour une tâche urgente
 */
export async function notifyUrgentTask(
  taskId: string,
  taskTitle: string,
  clientId?: string,
  clientName?: string
): Promise<boolean> {
  return sendTelegramNotification({
    type: 'tache_urgente',
    taskId,
    taskTitle,
    clientId,
    clientName,
    message: `Tâche urgente non complétée depuis hier`,
    actionUrl: clientId 
      ? `${window.location.origin}/clients/${clientId}`
      : `${window.location.origin}/tasks`,
  });
}


