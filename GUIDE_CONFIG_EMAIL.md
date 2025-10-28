# 📧 Configuration de l'envoi d'emails - RaiseMed OS

## ✅ Ce qui a été implémenté

1. **Supabase Edge Function** `send-email` pour l'envoi d'emails
2. **Service TypeScript** `emailService.ts` avec templates pré-définis
3. **Archivage automatique** des emails dans la base de données
4. **Onglet Communications** pour visualiser l'historique des emails par client

---

## 🚀 Configuration (5 minutes)

### Étape 1 : Créer un compte Resend (gratuit)

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte (gratuit jusqu'à 3000 emails/mois)
3. Vérifiez votre email

### Étape 2 : Obtenir votre clé API

1. Dans le dashboard Resend, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez-lui un nom (ex: "RaiseMed OS")
4. **Copiez la clé** (elle commence par `re_...`)

### Étape 3 : Configurer Supabase

1. Allez dans votre projet Supabase : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur **Settings** → **Edge Functions**
3. Ajoutez une nouvelle variable d'environnement :
   - **Nom** : `RESEND_API_KEY`
   - **Valeur** : votre clé API Resend (copiée à l'étape 2)
4. Cliquez sur **Save**

### Étape 4 : Déployer l'Edge Function

Dans votre terminal, exécutez :

```bash
cd /Users/elroysitbon/raisedesk-io
npx supabase functions deploy send-email
```

### Étape 5 : Appliquer la migration de la base de données

Exécutez cette commande SQL dans l'éditeur SQL de Supabase :

```sql
-- Create emails table for archiving sent emails
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES public.clients,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_client_id ON public.emails(client_id);
CREATE INDEX idx_emails_sent_at ON public.emails(sent_at DESC);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emails"
  ON public.emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
  ON public.emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📝 Utilisation

### Templates d'emails disponibles

Tous les templates sont dans `/src/lib/emailService.ts` :

1. **INVOICE** : Envoi de facture
2. **REMINDER_7DAYS** : Rappel paiement J+7
3. **REMINDER_15DAYS** : Relance J+15
4. **MONTHLY_REPORT** : Rapport mensuel
5. **REQUEST_INFO** : Demande d'informations

### Comment envoyer un email (exemple)

```typescript
import { sendEmail, replaceEmailVariables, EMAIL_TEMPLATES } from "@/lib/emailService";

// Remplacer les variables
const emailContent = replaceEmailVariables(
  EMAIL_TEMPLATES.INVOICE.html,
  {
    "CLIENT_NAME": "Palma Speak",
    "INVOICE_NUMBER": "RMD-2025-001",
    "MONTH": "Janvier",
    "AMOUNT": "900",
  }
);

// Envoyer l'email
await sendEmail({
  to: "client@example.com",
  subject: "Facture RMD-2025-001 - RaiseMed.IA",
  html: emailContent,
  clientId: "uuid-du-client",
  type: "invoice",
});
```

### Où l'email sera archivé ?

- Automatiquement dans la table `emails` de Supabase
- Visible dans l'onglet **Communications** de chaque client
- Historique complet avec date, sujet, contenu

---

## 🎯 Prochaines étapes

Une fois la configuration terminée, vous pourrez :

✅ Envoyer des emails directement depuis l'app
✅ Consulter l'historique des emails par client
✅ Utiliser les templates pré-définis avec variables
✅ (À venir) Automatisation des envois de factures et rappels

---

## 🆘 En cas de problème

### Erreur "Resend API key not configured"
→ Vérifiez que vous avez bien ajouté `RESEND_API_KEY` dans Supabase Edge Functions settings

### Erreur lors du déploiement
→ Installez Supabase CLI : `npm install -g supabase`
→ Connectez-vous : `npx supabase login`
→ Liez votre projet : `npx supabase link --project-ref VOTRE_PROJECT_REF`

### Les emails ne s'envoient pas
→ Vérifiez dans le dashboard Resend si votre API key est valide
→ Vérifiez les logs de l'Edge Function dans Supabase

---

## 💡 Note importante

**Par défaut, Resend utilise `onboarding@resend.dev` comme expéditeur.**

Pour utiliser votre propre adresse email (ex: `contact@raisemed.ia`) :
1. Ajoutez votre domaine dans Resend
2. Vérifiez le domaine (DNS records)
3. Modifiez la ligne 41 de `/supabase/functions/send-email/index.ts`

**Version gratuite** : 3000 emails/mois (largement suffisant pour démarrer !)


