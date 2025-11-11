# 📘 Guide de Configuration RaiseDesk TDAH

Ce guide vous accompagne pas à pas pour configurer tous les services nécessaires au fonctionnement de RaiseDesk.

---

## ✅ Checklist de Configuration

- [ ] Projet Supabase créé
- [ ] Schéma de base de données exécuté
- [ ] Bot Telegram créé et configuré
- [ ] Compte Resend créé et clé API récupérée
- [ ] Projet Vercel créé
- [ ] Variables d'environnement configurées
- [ ] Application déployée

---

## 1️⃣ Configuration Supabase

### Étape 1 : Créer un nouveau projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"New Project"** ou **"Start your project"**
3. Connectez-vous avec votre compte (ou créez-en un)
4. Remplissez le formulaire :
   - **Name** : `raisedesk-tdah` (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (⚠️ **SAVEZ-LE**, vous en aurez besoin)
   - **Region** : Choisissez la région la plus proche (ex: `West Europe (Paris)`)
   - **Pricing Plan** : Sélectionnez **Free** pour commencer
5. Cliquez sur **"Create new project"**
6. ⏳ Attendez 2-3 minutes que le projet soit créé

### Étape 2 : Récupérer les clés API

1. Une fois le projet créé, allez dans **Settings** (icône ⚙️ en bas à gauche)
2. Cliquez sur **API** dans le menu de gauche
3. Vous verrez deux informations importantes :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key** : Une longue chaîne de caractères commençant par `eyJ...`

4. **📋 COPIEZ ces deux valeurs** et gardez-les de côté (vous en aurez besoin plus tard)

### Étape 3 : Exécuter le schéma de base de données

1. Dans votre projet Supabase, cliquez sur **SQL Editor** (icône 📝 dans le menu de gauche)
2. Cliquez sur **"New query"**
3. Ouvrez le fichier `SETUP_TDAH_V1.sql` dans votre projet
4. **Copiez TOUT le contenu** du fichier
5. **Collez-le** dans l'éditeur SQL de Supabase
6. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)
7. ⏳ Attendez quelques secondes
8. Vous devriez voir un message de succès : `Success. No rows returned`

✅ **Vérification** : Allez dans **Table Editor** (menu de gauche) et vérifiez que vous voyez les tables suivantes :
- `clients`
- `notes`
- `tasks`
- `monthly_reports`
- `invoices`
- `kpis`
- `telegram_notifications`

### Étape 4 : Créer votre utilisateur

1. Allez dans **Authentication** (menu de gauche)
2. Cliquez sur **Users**
3. Cliquez sur **"Add user"** → **"Create new user"**
4. Remplissez :
   - **Email** : Votre adresse email (ex: `votre@email.com`)
   - **Password** : Un mot de passe fort
   - ✅ Cochez **"Auto Confirm User"**
5. Cliquez sur **"Create user"**

✅ **Note** : Vous pourrez vous connecter à l'application avec cet email et ce mot de passe.

---

## 2️⃣ Configuration Bot Telegram

### Étape 1 : Créer le bot

1. Ouvrez l'application **Telegram** sur votre téléphone ou ordinateur
2. Recherchez **@BotFather** dans la barre de recherche
3. Cliquez sur **@BotFather** et démarrez une conversation
4. Envoyez la commande : `/newbot`
5. BotFather vous demandera un nom pour votre bot :
   - Répondez : `RaiseDesk Notifications` (ou le nom de votre choix)
6. BotFather vous demandera un username (doit finir par `bot`) :
   - Répondez : `raisedesk_notifications_bot` (ou un autre nom disponible)
7. BotFather vous donnera un **token** qui ressemble à :
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
8. **📋 COPIEZ ce token** et gardez-le précieusement (vous en aurez besoin)

### Étape 2 : Récupérer votre Chat ID

1. Toujours dans Telegram, recherchez votre bot (avec le nom que vous avez donné)
2. Cliquez sur **"Start"** pour démarrer une conversation avec votre bot
3. Envoyez un message quelconque (ex: `Hello`)
4. Ouvrez votre navigateur et allez sur :
   ```
   https://api.telegram.org/bot<VOTRE_TOKEN>/getUpdates
   ```
   Remplacez `<VOTRE_TOKEN>` par le token que vous avez reçu de BotFather
5. Vous verrez du JSON. Cherchez `"chat":{"id":` et notez le nombre qui suit
   - Exemple : `"chat":{"id":123456789` → votre Chat ID est `123456789`
6. **📋 COPIEZ ce Chat ID** et gardez-le

✅ **Note** : Le Chat ID est votre identifiant personnel Telegram. C'est là que vous recevrez les notifications.

---

## 3️⃣ Configuration Resend API

### Étape 1 : Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Cliquez sur **"Sign Up"** (ou **"Get Started"**)
3. Créez un compte avec votre email
4. Vérifiez votre email (vous recevrez un lien de confirmation)

### Étape 2 : Récupérer la clé API

1. Une fois connecté, allez dans **API Keys** (menu de gauche)
2. Cliquez sur **"Create API Key"**
3. Donnez un nom : `RaiseDesk Production`
4. Cliquez sur **"Add"**
5. **📋 COPIEZ la clé API** qui s'affiche (elle commence par `re_...`)
   ⚠️ **ATTENTION** : Cette clé ne s'affichera qu'une seule fois ! Sauvegardez-la.

### Étape 3 : Vérifier votre domaine (optionnel pour plus tard)

Pour l'instant, vous pouvez utiliser l'adresse par défaut `onboarding@resend.dev` pour tester.
Plus tard, vous pourrez ajouter votre propre domaine pour des emails professionnels.

---

## 4️⃣ Configuration Vercel

### Étape 1 : Créer un compte Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"** (recommandé) ou créez un compte avec email
4. Autorisez Vercel à accéder à votre compte GitHub si nécessaire

### Étape 2 : Créer un nouveau projet

1. Une fois connecté, cliquez sur **"Add New..."** → **"Project"**
2. Si votre code est sur GitHub, vous verrez la liste de vos dépôts
3. Sélectionnez le dépôt `raisedesk-production` (ou importez-le si nécessaire)
4. Cliquez sur **"Import"**

### Étape 3 : Configurer le projet

1. Vercel détectera automatiquement les paramètres :
   - **Framework Preset** : Vite (devrait être détecté automatiquement)
   - **Root Directory** : `./` (laissez par défaut)
   - **Build Command** : `npm run build` (devrait être pré-rempli)
   - **Output Directory** : `dist` (devrait être pré-rempli)
2. **Ne cliquez pas encore sur "Deploy"** ! On doit d'abord configurer les variables d'environnement.

### Étape 4 : Ajouter les variables d'environnement

1. Avant de déployer, cliquez sur **"Environment Variables"** (ou cherchez l'onglet)
2. Ajoutez les variables suivantes une par une :

   **Variable 1 :**
   - **Name** : `VITE_SUPABASE_URL`
   - **Value** : Collez votre Project URL de Supabase (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Environments** : Cochez Production, Preview, Development

   **Variable 2 :**
   - **Name** : `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value** : Collez votre anon public key de Supabase
   - **Environments** : Cochez Production, Preview, Development

   **Variable 3 :**
   - **Name** : `TELEGRAM_BOT_TOKEN`
   - **Value** : Collez le token de votre bot Telegram
   - **Environments** : Cochez Production, Preview, Development

   **Variable 4 :**
   - **Name** : `TELEGRAM_CHAT_ID`
   - **Value** : Collez votre Chat ID Telegram
   - **Environments** : Cochez Production, Preview, Development

   **Variable 5 :**
   - **Name** : `RESEND_API_KEY`
   - **Value** : Collez votre clé API Resend
   - **Environments** : Cochez Production, Preview, Development

3. Cliquez sur **"Save"** pour chaque variable

### Étape 5 : Déployer

1. Une fois toutes les variables ajoutées, cliquez sur **"Deploy"**
2. ⏳ Attendez 2-3 minutes que le déploiement se termine
3. Une fois terminé, vous verrez un message de succès avec l'URL de votre application
4. Cliquez sur l'URL pour ouvrir votre application

✅ **Note** : Vercel déploiera automatiquement à chaque fois que vous pousserez du code sur GitHub.

---

## 5️⃣ Configuration Supabase Edge Functions

### Étape 1 : Installer Supabase CLI (optionnel mais recommandé)

Si vous voulez déployer les Edge Functions depuis votre ordinateur :

1. Allez sur [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. Suivez les instructions pour installer Supabase CLI selon votre système d'exploitation

**Alternative** : Vous pouvez aussi déployer les Edge Functions directement depuis l'interface Supabase (voir étape suivante).

### Étape 2 : Configurer les secrets pour Edge Functions

1. Dans votre projet Supabase, allez dans **Settings** → **Edge Functions**
2. Cliquez sur **"Secrets"**
3. Ajoutez les secrets suivants :

   **Secret 1 :**
   - **Name** : `TELEGRAM_BOT_TOKEN`
   - **Value** : Votre token Telegram bot

   **Secret 2 :**
   - **Name** : `TELEGRAM_CHAT_ID`
   - **Value** : Votre Chat ID Telegram

   **Secret 3 :**
   - **Name** : `RESEND_API_KEY`
   - **Value** : Votre clé API Resend

4. Cliquez sur **"Save"** pour chaque secret

### Étape 3 : Déployer les Edge Functions

**Option A : Via Supabase Dashboard (plus simple)**

1. Dans Supabase, allez dans **Edge Functions** (menu de gauche)
2. Pour chaque fonction (`send-telegram-notification`, `check-deadlines`, `auto-invoice`) :
   - Cliquez sur **"Create a new function"**
   - Donnez un nom à la fonction
   - Copiez-collez le code depuis le fichier correspondant dans `supabase/functions/`
   - Cliquez sur **"Deploy"**

**Option B : Via CLI (pour utilisateurs avancés)**

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Déployer une fonction
supabase functions deploy send-telegram-notification
supabase functions deploy check-deadlines
supabase functions deploy auto-invoice
```

### Étape 4 : Configurer les Cron Jobs

1. Dans Supabase, allez dans **Database** → **Cron Jobs** (ou utilisez pg_cron)
2. Créez les cron jobs suivants :

   **Cron 1 : Vérification quotidienne des deadlines**
   - **Schedule** : `0 9 * * *` (tous les jours à 9h)
   - **Function** : `check-deadlines`

   **Cron 2 : Génération automatique des factures**
   - **Schedule** : `0 8 * * *` (tous les jours à 8h)
   - **Function** : `auto-invoice`

   **Note** : Les cron jobs peuvent être configurés via SQL dans le SQL Editor :
   ```sql
   SELECT cron.schedule(
     'check-deadlines-daily',
     '0 9 * * *',
     $$SELECT net.http_post(
       url := 'https://votre-project.supabase.co/functions/v1/check-deadlines',
       headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
     )$$
   );
   ```

---

## 6️⃣ Configuration Locale (.env.local)

### Étape 1 : Créer le fichier .env.local

1. Dans votre projet, créez un fichier nommé `.env.local` à la racine
2. Ouvrez le fichier `.env.local.example` pour voir le template
3. Copiez le contenu et collez-le dans `.env.local`
4. Remplissez les valeurs avec vos propres clés :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

5. Sauvegardez le fichier

⚠️ **IMPORTANT** : Le fichier `.env.local` est dans `.gitignore` et ne sera pas envoyé sur GitHub. C'est normal et sécurisé.

### Étape 2 : Tester en local

1. Ouvrez un terminal dans votre projet
2. Installez les dépendances si ce n'est pas fait :
   ```bash
   npm install
   ```
3. Lancez l'application :
   ```bash
   npm run dev
   ```
4. Ouvrez [http://localhost:8080](http://localhost:8080)
5. Connectez-vous avec l'email et mot de passe que vous avez créés dans Supabase

---

## ✅ Vérification Finale

Une fois tout configuré, vérifiez que :

- [ ] Vous pouvez vous connecter à l'application
- [ ] Vous pouvez créer un client
- [ ] Les notifications Telegram fonctionnent (testez en créant une tâche urgente)
- [ ] Les emails sont envoyés (testez en générant une facture)
- [ ] Le dashboard affiche vos données

---

## 🆘 Dépannage

### Erreur "Invalid API key"
- Vérifiez que vous avez bien copié les clés sans espaces
- Vérifiez que les variables d'environnement sont bien configurées dans Vercel

### Erreur "Row Level Security policy violation"
- Vérifiez que vous êtes bien connecté avec un utilisateur créé dans Supabase
- Vérifiez que le schéma SQL a bien été exécuté

### Les notifications Telegram ne fonctionnent pas
- Vérifiez que vous avez bien démarré une conversation avec votre bot
- Vérifiez que le Chat ID est correct
- Vérifiez que le token du bot est correct

### Les emails ne sont pas envoyés
- Vérifiez que la clé Resend API est correcte
- Vérifiez les logs dans Supabase Edge Functions

---

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes, vérifiez :
1. Les logs dans la console du navigateur (F12)
2. Les logs dans Supabase (Edge Functions → Logs)
3. Les logs dans Vercel (Deployments → Logs)

---

**Félicitations ! 🎉 Votre application RaiseDesk est maintenant configurée et prête à l'emploi !**


