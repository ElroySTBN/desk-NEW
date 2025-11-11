import { supabase } from "@/integrations/supabase/client";

// Get company settings for email signatures
async function getCompanySettings() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return null;
  }
}

// Generate email signature from company settings
async function generateEmailSignature(): Promise<string> {
  const settings = await getCompanySettings();
  
  if (!settings) {
    // Default signature
    return `
      <br>
      <p>Cordialement,</p>
      <p><strong>Elroy SITBON</strong><br>
      RaiseMed.IA<br>
      <a href="mailto:contact@raisemed.ia">contact@raisemed.ia</a></p>
    `;
  }

  // Dynamic signature based on settings
  let signature = '<br><p>Cordialement,</p><p>';
  signature += `<strong>${settings.company_name}</strong><br>`;
  
  if (settings.email) {
    signature += `<a href="mailto:${settings.email}">${settings.email}</a><br>`;
  }
  if (settings.phone) {
    signature += `Tél: ${settings.phone}<br>`;
  }
  if (settings.website) {
    signature += `<a href="${settings.website}">${settings.website}</a>`;
  }
  
  signature += '</p>';
  return signature;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  clientId?: string;
  type?: "invoice" | "report" | "reminder" | "request" | "other";
}

/**
 * Send an email via Supabase Edge Function
 */
export async function sendEmail(emailData: EmailTemplate) {
  try {
    // Add signature to email if placeholder exists
    let emailHtml = emailData.html;
    if (emailHtml.includes('[SIGNATURE]')) {
      const signature = await generateEmailSignature();
      emailHtml = emailHtml.replace('[SIGNATURE]', signature);
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: emailHtml,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Archive email in database
    if (emailData.clientId) {
      await archiveEmail({
        clientId: emailData.clientId,
        to: emailData.to,
        subject: emailData.subject,
        content: emailHtml,
        type: emailData.type || 'other',
        messageId: data?.messageId,
      });
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Archive sent email in the database (timeline)
 */
async function archiveEmail(emailRecord: {
  clientId: string;
  to: string;
  subject: string;
  content: string;
  type: string;
  messageId?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Insert into emails table
    const { error } = await supabase
      .from('emails')
      .insert({
        user_id: user.id,
        client_id: emailRecord.clientId,
        recipient: emailRecord.to,
        subject: emailRecord.subject,
        content: emailRecord.content,
        type: emailRecord.type,
        message_id: emailRecord.messageId,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error archiving email:', error);
      // Don't throw - archiving failure shouldn't fail the email send
    }
  } catch (error) {
    console.error('Error in archiveEmail:', error);
  }
}

/**
 * Get email templates with variable replacement
 */
export function replaceEmailVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Email templates (à enrichir)
 */
export const EMAIL_TEMPLATES = {
  INVOICE: {
    subject: "Facture [INVOICE_NUMBER] - RaiseMed.IA",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour [CLIENT_NAME],</h2>
        <p>J'espère que tout se passe bien de votre côté.</p>
        <p>Vous trouverez ci-joint la facture <strong>[INVOICE_NUMBER]</strong> pour nos services du mois de <strong>[MONTH]</strong> d'un montant de <strong>[AMOUNT]€ TTC</strong>.</p>
        <p>Le règlement est attendu sous 15 jours par virement bancaire.</p>
        <p>Restant à votre disposition pour toute question.</p>
        [SIGNATURE]
      </div>
    `,
  },
  
  REMINDER_7DAYS: {
    subject: "Rappel - Facture [INVOICE_NUMBER]",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour [CLIENT_NAME],</h2>
        <p>J'espère que vous allez bien.</p>
        <p>Je me permets de vous envoyer un petit rappel concernant la facture <strong>[INVOICE_NUMBER]</strong> d'un montant de <strong>[AMOUNT]€ TTC</strong>, émise le <strong>[DATE]</strong>.</p>
        <p>Si le règlement a déjà été effectué, merci de ne pas tenir compte de ce message.</p>
        <p>Belle journée à vous,</p>
        [SIGNATURE]
      </div>
    `,
  },
  
  REMINDER_15DAYS: {
    subject: "Relance - Facture [INVOICE_NUMBER] en attente",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour [CLIENT_NAME],</h2>
        <p>Je constate que la facture <strong>[INVOICE_NUMBER]</strong> de <strong>[AMOUNT]€ TTC</strong>, émise le <strong>[DATE]</strong>, n'a toujours pas été réglée.</p>
        <p>Merci de bien vouloir procéder au règlement dans les plus brefs délais.</p>
        <p>Je reste disponible pour échanger si besoin.</p>
        [SIGNATURE]
      </div>
    `,
  },
  
  MONTHLY_REPORT: {
    subject: "Rapport mensuel [MONTH] [YEAR] - [CLIENT_NAME]",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour [CLIENT_NAME],</h2>
        <p>Vous trouverez ci-joint votre rapport mensuel pour le mois de <strong>[MONTH] [YEAR]</strong>.</p>
        <p>Ce rapport détaille les actions réalisées, les résultats obtenus et les perspectives pour le mois prochain.</p>
        <p>N'hésitez pas à me contacter si vous avez des questions.</p>
        [SIGNATURE]
      </div>
    `,
  },
  
  REQUEST_INFO: {
    subject: "[CLIENT_NAME] - Demande d'informations pour [MONTH]",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour [CLIENT_NAME],</h2>
        <p>Afin de préparer le contenu du mois de <strong>[MONTH]</strong>, j'aurais besoin des éléments suivants :</p>
        <ul>
          <li>15 visuels/images à publier</li>
          <li>Les sujets de contenu que vous souhaitez mettre en avant</li>
          <li>Confirmation de votre stratégie de contenu pour ce mois</li>
        </ul>
        <p>Vous pouvez déposer les visuels dans votre dossier Google Drive : <a href="[DRIVE_LINK]">[DRIVE_LINK]</a></p>
        <p>Merci de me transmettre ces informations d'ici le <strong>[DEADLINE]</strong>.</p>
        [SIGNATURE]
      </div>
    `,
  },
  
  GBP_REPORT: {
    subject: "Votre rapport mensuel [MONTH] [YEAR] - [CLIENT_NAME]",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour [CLIENT_NAME],</h2>
        <p>Nous avons le plaisir de vous transmettre votre rapport de performances Google Business Profile pour la période <strong>[MONTH] [YEAR]</strong>.</p>
        <p>Vous trouverez en pièce jointe l'analyse détaillée de votre visibilité locale et des interactions avec votre fiche d'établissement.</p>
        <p>Les résultats de ce mois montrent <strong>[INSIGHT]</strong>.</p>
        <p>Restons à votre disposition pour échanger sur ces résultats et les prochaines optimisations à mettre en place.</p>
        [SIGNATURE]
      </div>
    `,
  },
};

/**
 * Envoie un email avec le rapport GBP en pièce jointe
 */
export async function sendGBPReportEmail(
  clientEmail: string,
  pdfUrl: string,
  reportData: {
    clientName: string;
    month: string;
    year: number;
    insight?: string;
  },
  clientId: string
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const template = EMAIL_TEMPLATES.GBP_REPORT;
    const html = replaceEmailVariables(template.html, {
      CLIENT_NAME: reportData.clientName,
      MONTH: reportData.month,
      YEAR: reportData.year.toString(),
      INSIGHT: reportData.insight || 'une évolution positive de votre visibilité locale',
    });

    // Note: L'Edge Function send-email devra gérer les pièces jointes
    // Pour l'instant, on envoie l'URL du PDF dans le corps de l'email
    const htmlWithPdfLink = html.replace(
      'en pièce jointe',
      `en pièce jointe (<a href="${pdfUrl}" target="_blank">Télécharger le rapport</a>)`
    );

    const result = await sendEmail({
      to: clientEmail,
      subject: replaceEmailVariables(template.subject, {
        CLIENT_NAME: reportData.clientName,
        MONTH: reportData.month,
        YEAR: reportData.year.toString(),
      }),
      html: htmlWithPdfLink,
      clientId: clientId,
      type: 'report',
    });

    return result;
  } catch (error) {
    console.error('Error sending GBP report email:', error);
    throw error;
  }
}

