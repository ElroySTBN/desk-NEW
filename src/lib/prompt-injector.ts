import { Database } from "@/types/database.types";

type BrandDna = Database['public']['Tables']['brand_dna']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface PromptContext {
    client: Client;
    dna: BrandDna;
}

export const injectPrompt = (template: string, context: PromptContext): string => {
    let prompt = template;

    // Helper to safely get nested properties
    const get = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
    };

    // Replace standard placeholders
    // Format: ${client.name}, ${dna.tone_of_voice.style}, etc.

    // 1. Client Basic Info
    prompt = prompt.replace(/\${client\.name}/g, context.client.name || '');
    prompt = prompt.replace(/\${client\.company}/g, (context.client as any).company || context.client.name || ''); // Assuming company might be in name or separate

    // 2. Brand DNA - Tone of Voice
    const toneStyle = (context.dna.tone_of_voice as any)?.style || 'professionnel';
    prompt = prompt.replace(/\${dna\.tone_of_voice}/g, toneStyle);

    // 3. Brand DNA - Target Avatar
    const avatarDesc = (context.dna.target_avatar as any)?.description || 'clients potentiels';
    prompt = prompt.replace(/\${dna\.target_avatar}/g, avatarDesc);

    // 4. Brand DNA - Services
    const services = (context.dna.services_focus as any)?.list || []; // Assuming structure
    const servicesStr = Array.isArray(services) ? services.join(', ') : JSON.stringify(services);
    prompt = prompt.replace(/\${dna\.services}/g, servicesStr);

    // 5. Key Info
    const keyInfo = (context.dna.key_info as any) || {};
    prompt = prompt.replace(/\${dna\.key_info}/g, JSON.stringify(keyInfo));

    return prompt;
};

export const PROMPT_TEMPLATES = {
    LINKEDIN_POST: `
    Agis comme un expert en marketing digital pour ${"${client.company}"}.
    Ton audience cible est : ${"${dna.target_avatar}"}.
    Ton ton doit être : ${"${dna.tone_of_voice}"}.
    
    Rédige un post LinkedIn engageant sur l'un de nos services principaux : ${"${dna.services}"}.
    Utilise une structure AIDA (Attention, Intérêt, Désir, Action).
    Ajoute 3-5 hashtags pertinents.
  `,
    GMB_POST: `
    Rédige un post Google My Business pour ${"${client.company}"}.
    Cible : ${"${dna.target_avatar}"}.
    Ton : ${"${dna.tone_of_voice}"}.
    
    Le post doit être court (max 150 mots), informatif et inciter à l'action (Appeler ou Visiter).
    Mets en avant notre expertise locale.
  `
};
