# 🚀 Guide Complet : Créer un Nouveau Projet Vercel

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Un compte Vercel (gratuit) : [vercel.com](https://vercel.com)
- ✅ Un compte GitHub avec le dépôt `ElroySTBN/raisedesk-production`
- ✅ Un compte Supabase avec votre projet configuré
- ✅ Les clés API nécessaires (voir section Variables d'environnement)

---

## 🎯 Étape 1 : Créer un Nouveau Projet Vercel

### 1.1 Accéder à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte (GitHub, Google, ou email)
3. Si c'est votre première fois, créez un compte gratuit

### 1.2 Créer un Nouveau Projet

1. Cliquez sur **"Add New..."** (bouton en haut à droite)
2. Sélectionnez **"Project"**
3. Vous verrez la liste de vos dépôts GitHub
4. **Si vous ne voyez pas votre dépôt** :
   - Cliquez sur **"Adjust GitHub App Permissions"**
   - Autorisez Vercel à accéder à tous vos dépôts ou sélectionnez `raisedesk-production`
   - Revenez à la page précédente

5. **Trouvez et sélectionnez** : `ElroySTBN/raisedesk-production`
6. Cliquez sur **"Import"**

---

## ⚙️ Étape 2 : Configurer le Projet

### 2.1 Configuration Automatique

Vercel devrait **détecter automatiquement** que c'est un projet Vite. Vérifiez que vous voyez :

- **Framework Preset** : `Vite` (ou détecté automatiquement)
- **Root Directory** : `./` (laissez vide)
- **Build Command** : `npm run build` (devrait être pré-rempli)
- **Output Directory** : `dist` (devrait être pré-rempli)
- **Install Command** : `npm install` (devrait être pré-rempli)

**⚠️ Si ces valeurs ne sont pas correctes, modifiez-les manuellement.**

### 2.2 NE CLIQUEZ PAS ENCORE SUR "DEPLOY" !

On doit d'abord configurer les variables d'environnement.

---

## 🔐 Étape 3 : Configurer les Variables d'Environnement

### 3.1 Accéder aux Variables d'Environnement

1. Sur la page de configuration du projet, cherchez la section **"Environment Variables"**
2. Ou cliquez sur **"Environment Variables"** dans le menu latéral

### 3.2 Ajouter les Variables OBLIGATOIRES

Ces variables sont **nécessaires** pour que l'application fonctionne :

#### Variable 1 : `VITE_SUPABASE_URL`

1. Cliquez sur **"Add"** ou **"Add New"**
2. **Name** : `VITE_SUPABASE_URL`
3. **Value** : Votre Project URL Supabase
   - Allez sur [supabase.com](https://supabase.com) → votre projet
   - Settings → API
   - Copiez la **Project URL** (ex: `https://xxxxxxxxxxxxx.supabase.co`)
4. **Environments** : Cochez **Production**, **Preview**, et **Development**
5. Cliquez sur **"Save"**

#### Variable 2 : `VITE_SUPABASE_PUBLISHABLE_KEY`

1. Cliquez sur **"Add"** ou **"Add New"**
2. **Name** : `VITE_SUPABASE_PUBLISHABLE_KEY`
3. **Value** : Votre anon public key Supabase
   - Toujours dans Supabase → Settings → API
   - Copiez la **anon public** key (commence par `eyJhbGci...`)
4. **Environments** : Cochez **Production**, **Preview**, et **Development**
5. Cliquez sur **"Save"**

### 3.3 Ajouter les Variables OPTIONNELLES

Ces variables sont nécessaires pour les **fonctionnalités avancées** (cron jobs, notifications, emails) :

#### Variable 3 : `SUPABASE_SERVICE_ROLE_KEY` (pour les cron jobs)

1. Cliquez sur **"Add"** ou **"Add New"**
2. **Name** : `SUPABASE_SERVICE_ROLE_KEY`
3. **Value** : Votre service role key Supabase
   - Toujours dans Supabase → Settings → API
   - Copiez la **service_role** key (⚠️ GARDEZ-LA SECRÈTE !)
4. **Environments** : Cochez **Production** uniquement (pas besoin en preview/dev)
5. Cliquez sur **"Save"**

#### Variable 4 : `TELEGRAM_BOT_TOKEN` (pour les notifications)

1. Cliquez sur **"Add"** ou **"Add New"**
2. **Name** : `TELEGRAM_BOT_TOKEN`
3. **Value** : Votre token Telegram Bot
   - Si vous n'avez pas encore de bot, créez-en un avec [@BotFather](https://t.me/BotFather) sur Telegram
   - Envoyez `/newbot` et suivez les instructions
   - Copiez le token fourni (format : `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. **Environments** : Cochez **Production** uniquement
5. Cliquez sur **"Save"**

#### Variable 5 : `TELEGRAM_CHAT_ID` (pour les notifications)

1. Cliquez sur **"Add"** ou **"Add New"**
2. **Name** : `TELEGRAM_CHAT_ID`
3. **Value** : Votre Chat ID Telegram
   - Envoyez un message à [@userinfobot](https://t.me/userinfobot) sur Telegram
   - Il vous donnera votre Chat ID (un nombre comme `123456789`)
4. **Environments** : Cochez **Production** uniquement
5. Cliquez sur **"Save"**

#### Variable 6 : `RESEND_API_KEY` (pour l'envoi d'emails)

1. Cliquez sur **"Add"** ou **"Add New"**
2. **Name** : `RESEND_API_KEY`
3. **Value** : Votre clé API Resend
   - Allez sur [resend.com](https://resend.com)
   - Créez un compte ou connectez-vous
   - Allez dans API Keys
   - Créez une nouvelle clé API
   - Copiez la clé (commence par `re_...`)
4. **Environments** : Cochez **Production** uniquement
5. Cliquez sur **"Save"**

---

## 🚀 Étape 4 : Déployer le Projet

### 4.1 Lancer le Déploiement

1. Une fois toutes les variables ajoutées, revenez en haut de la page
2. Cliquez sur **"Deploy"**
3. ⏳ Attendez 2-3 minutes que le déploiement se termine

### 4.2 Vérifier le Déploiement

1. Vous verrez les logs de build en temps réel
2. Si tout se passe bien, vous verrez :
   - ✅ "Building..."
   - ✅ "Installing dependencies..."
   - ✅ "Building application..."
   - ✅ "Deploying..."
   - ✅ "Ready" (avec une URL)

3. **Si vous voyez des erreurs** :
   - Regardez les logs pour identifier le problème
   - Vérifiez que toutes les variables d'environnement sont correctes
   - Vérifiez que le build fonctionne localement : `npm run build`

---

## ✅ Étape 5 : Vérifier que Tout Fonctionne

### 5.1 Vérifier le Déploiement Automatique

1. Dans Vercel → votre projet → **Settings** → **Git**
2. Vérifiez que :
   - ✅ Le dépôt est bien connecté : `ElroySTBN/raisedesk-production`
   - ✅ La branche est `main`
   - ✅ Le statut est **"Connected"**

3. **Vérifier le webhook GitHub** :
   - Allez sur GitHub : https://github.com/ElroySTBN/raisedesk-production/settings/hooks
   - Vous devriez voir un webhook Vercel
   - Le statut doit être **"Active"**

### 5.2 Tester le Déploiement Automatique

1. Faites un petit changement dans votre code (ou laissez-moi le faire)
2. Committez et poussez sur GitHub
3. Allez dans Vercel → **Deployments**
4. Vous devriez voir un **nouveau déploiement** se lancer automatiquement

### 5.3 Accéder à Votre Application

1. Dans Vercel → votre projet → **Deployments**
2. Cliquez sur le dernier déploiement (celui avec ✅ "Ready")
3. Cliquez sur l'**URL** (ex: `raisedesk-production.vercel.app`)
4. Votre application devrait s'ouvrir !

---

## 📝 Résumé des Variables d'Environnement

### Variables OBLIGATOIRES (pour que l'app fonctionne)
- ✅ `VITE_SUPABASE_URL` - URL de votre projet Supabase
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Clé publique Supabase (anon key)

### Variables OPTIONNELLES (pour les fonctionnalités avancées)
- ⚙️ `SUPABASE_SERVICE_ROLE_KEY` - Pour les cron jobs (génération factures, notifications)
- ⚙️ `TELEGRAM_BOT_TOKEN` - Pour les notifications Telegram
- ⚙️ `TELEGRAM_CHAT_ID` - Pour recevoir les notifications Telegram
- ⚙️ `RESEND_API_KEY` - Pour l'envoi d'emails automatiques

**Note** : L'application fonctionnera sans les variables optionnelles, mais certaines fonctionnalités (cron jobs, notifications) ne marcheront pas.

---

## 🐛 Dépannage

### Le déploiement échoue

1. **Vérifiez les logs de build** dans Vercel → Deployments → Build Logs
2. **Erreur "Module not found"** → Vérifiez que `package.json` est correct
3. **Erreur "Environment variable missing"** → Vérifiez que toutes les variables obligatoires sont configurées
4. **Erreur de build TypeScript** → Vérifiez les erreurs dans les logs

### Le déploiement automatique ne fonctionne pas

1. **Vérifiez le webhook GitHub** : https://github.com/ElroySTBN/raisedesk-production/settings/hooks
2. **Reconnectez le projet** : Vercel → Settings → Git → Disconnect → Reconnect
3. **Vérifiez les permissions GitHub** : Autorisez Vercel à accéder au dépôt

### L'application ne fonctionne pas après déploiement

1. **Vérifiez les variables d'environnement** : Toutes les variables obligatoires sont-elles présentes ?
2. **Vérifiez les logs runtime** : Vercel → Deployments → Runtime Logs
3. **Testez localement** : `npm run dev` pour voir si ça fonctionne en local

---

## 🎉 C'est Terminé !

Votre application devrait maintenant être déployée et fonctionner correctement. Chaque fois que vous pousserez du code sur GitHub, Vercel déploiera automatiquement la nouvelle version.

**Besoin d'aide ?** Consultez les logs dans Vercel ou contactez le support Vercel.

