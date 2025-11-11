import { supabase } from '@/integrations/supabase/client';
import type { ReportTextTemplate, Evolution } from '@/types/gbp-reports';

/**
 * Récupère les templates pour une catégorie et un contexte donnés
 */
export async function getTemplates(
  category: ReportTextTemplate['category'],
  context?: ReportTextTemplate['context']
): Promise<ReportTextTemplate[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('rapport_text_templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category);

  if (context) {
    query = query.eq('context', context);
  }

  const { data, error } = await query.order('is_default', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors de la récupération des templates: ${error.message}`);
  }

  return data || [];
}

/**
 * Suggère un template en fonction de l'évolution
 */
export async function suggestTemplate(
  evolution: Evolution,
  category: ReportTextTemplate['category']
): Promise<ReportTextTemplate | null> {
  let context: ReportTextTemplate['context'];

  if (evolution.percentage >= 50) {
    context = 'positive_high';
  } else if (evolution.percentage >= 10) {
    context = 'positive_moderate';
  } else if (evolution.percentage <= -10) {
    context = 'negative';
  } else {
    context = 'stable';
  }

  const templates = await getTemplates(category, context);
  return templates.find(t => t.is_default) || templates[0] || null;
}

/**
 * Remplit un template avec les variables
 */
export function fillTemplate(
  template: string,
  variables: {
    X?: number;
    Y?: number;
    Z?: number;
    percentage?: number;
    period?: string;
    daily_avg?: number;
    monthly_avg?: number;
  }
): string {
  let filled = template;

  if (variables.X !== undefined) {
    filled = filled.replace(/{X}/g, variables.X.toLocaleString('fr-FR'));
  }
  if (variables.Y !== undefined) {
    filled = filled.replace(/{Y}/g, variables.Y.toLocaleString('fr-FR'));
  }
  if (variables.Z !== undefined) {
    filled = filled.replace(/{Z}/g, variables.Z.toLocaleString('fr-FR'));
  }
  if (variables.percentage !== undefined) {
    const sign = variables.percentage >= 0 ? '+' : '';
    filled = filled.replace(/{percentage}/g, `${sign}${variables.percentage.toFixed(1)}`);
  }
  if (variables.period) {
    filled = filled.replace(/{period}/g, variables.period);
  }
  if (variables.daily_avg !== undefined) {
    filled = filled.replace(/{daily_avg}/g, variables.daily_avg.toFixed(1));
  }
  if (variables.monthly_avg !== undefined) {
    filled = filled.replace(/{monthly_avg}/g, variables.monthly_avg.toFixed(1));
  }

  return filled;
}

/**
 * Insère les templates par défaut pour un utilisateur
 */
export async function insertDefaultTemplates(userId: string): Promise<void> {
  const { error } = await supabase.rpc('insert_default_report_templates', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Erreur lors de l'insertion des templates: ${error.message}`);
  }
}

/**
 * Vérifie si l'utilisateur a des templates, sinon les insère
 */
export async function ensureDefaultTemplates(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const templates = await getTemplates('vue_ensemble');
  if (templates.length === 0) {
    await insertDefaultTemplates(user.id);
  }
}


