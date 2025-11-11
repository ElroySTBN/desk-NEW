# 🔐 Guide Complet : Variables d'Environnement

## 📋 Vue d'Ensemble

Ce document liste toutes les variables d'environnement nécessaires pour faire fonctionner RaiseDesk TDAH, avec des instructions détaillées pour trouver chaque valeur.

---

## ✅ Variables OBLIGATOIRES

Ces variables sont **nécessaires** pour que l'application fonctionne. Sans elles, l'app ne pourra pas se connecter à Supabase.

### 1. `VITE_SUPABASE_URL`

**Description** : L'URL de votre projet Supabase

**Où la trouver** :
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Dans la section **Project URL**, copiez l'URL
   - Format : `https://xxxxxxxxxxxxx.supabase.co`

**Exemple** :
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

**Où l'ajouter** :
- ✅ Vercel → Settings → Environment Variables
- ✅ Fichier `.env.local` (pour développement local)

**Environments** : Production, Preview, Development

---

### 2. `VITE_SUPABASE_PUBLISHABLE_KEY`

**Description** : La clé publique (anon key) de votre projet Supabase. Cette clé est sûre à exposer côté client.

**Où la trouver** :
1. Toujours dans Supabase → **Settings** → **API**
2. Dans la section **Project API keys**
3. Copiez la clé **anon public** (pas la service_role !)
   - Format : Commence par `eyJhbGci...` (JWT token)

**Exemple** :
```
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Où l'ajouter** :
- ✅ Vercel → Settings → Environment Variables
- ✅ Fichier `.env.local` (pour développement local)

**Environments** : Production, Preview, Development

---

## ⚙️ Variables OPTIONNELLES

Ces variables sont nécessaires pour les **fonctionnalités avancées**. L'application fonctionnera sans elles, mais certaines fonctionnalités ne marcheront pas.

### 3. `SUPABASE_SERVICE_ROLE_KEY`

**Description** : La clé service role de Supabase. ⚠️ **GARDEZ CETTE CLÉ SECRÈTE !** Ne l'exposez JAMAIS côté client.

**Utilisation** : 
- Pour les cron jobs (génération automatique de factures)
- Pour les Edge Functions Supabase
- Pour les opérations administratives

**Où la trouver** :
1. Toujours dans Supabase → **Settings** → **API**
2. Dans la section **Project API keys**
3. Copiez la clé **service_role** (⚠️ gardez-la secrète !)
   - Format : Commence par `eyJhbGci...` (JWT token)

**Exemple** :
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Où l'ajouter** :
- ✅ Vercel → Settings → Environment Variables (Production uniquement)
- ❌ **NE PAS** l'ajouter dans `.env.local` (trop risqué)

**Environments** : Production uniquement (pas besoin en preview/dev)

**⚠️ Sécurité** : Cette clé donne un accès complet à votre base de données. Ne la partagez JAMAIS et ne la commitez JAMAIS dans Git.

---

### 4. `TELEGRAM_BOT_TOKEN`

**Description** : Le token de votre bot Telegram pour envoyer des notifications.

**Utilisation** : Notifications proactives (deadlines, factures, tâches urgentes)

**Où la trouver** :

**Si vous n'avez pas encore de bot** :
1. Ouvrez Telegram et cherchez [@BotFather](https://t.me/BotFather)
2. Envoyez la commande `/newbot`
3. Suivez les instructions :
   - Donnez un nom à votre bot (ex: "RaiseDesk Notifications")
   - Donnez un username à votre bot (ex: "raisedesk_bot")
4. BotFather vous donnera un token
   - Format : `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

**Si vous avez déjà un bot** :
1. Ouvrez Telegram et cherchez [@BotFather](https://t.me/BotFather)
2. Envoyez `/mybots`
3. Sélectionnez votre bot
4. Cliquez sur **API Token**
5. Copiez le token

**Exemple** :
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Où l'ajouter** :
- ✅ Vercel → Settings → Environment Variables
- ✅ Fichier `.env.local` (pour développement local)

**Environments** : Production uniquement (pas besoin en preview/dev)

---

### 5. `TELEGRAM_CHAT_ID`

**Description** : Votre Chat ID Telegram personnel pour recevoir les notifications.

**Utilisation** : Recevoir les notifications du bot Telegram

**Où la trouver** :
1. Ouvrez Telegram et cherchez [@userinfobot](https://t.me/userinfobot)
2. Envoyez n'importe quel message au bot
3. Le bot vous répondra avec votre Chat ID
   - Format : Un nombre (ex: `123456789`)

**Exemple** :
```
TELEGRAM_CHAT_ID=123456789
```

**Où l'ajouter** :
- ✅ Vercel → Settings → Environment Variables
- ✅ Fichier `.env.local` (pour développement local)

**Environments** : Production uniquement (pas besoin en preview/dev)

---

### 6. `RESEND_API_KEY`

**Description** : La clé API Resend pour envoyer des emails automatiques.

**Utilisation** : Envoi automatique de factures et rapports par email

**Où la trouver** :

**Si vous n'avez pas encore de compte** :
1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre email

**Pour obtenir la clé API** :
1. Connectez-vous sur [resend.com](https://resend.com)
2. Allez dans **API Keys** (menu latéral)
3. Cliquez sur **"Create API Key"**
4. Donnez un nom (ex: "RaiseDesk Production")
5. Sélectionnez les permissions (au minimum "Sending access")
6. Cliquez sur **"Add"**
7. **⚠️ IMPORTANT** : Copiez la clé immédiatement, vous ne pourrez plus la voir après !
   - Format : Commence par `re_...`

**Exemple** :
```
RESEND_API_KEY=re_AbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

**Où l'ajouter** :
- ✅ Vercel → Settings → Environment Variables
- ✅ Fichier `.env.local` (pour développement local)

**Environments** : Production uniquement (pas besoin en preview/dev)

---

## 📝 Résumé par Priorité

### 🔴 Priorité 1 - Obligatoires (app ne fonctionne pas sans)
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`

### 🟡 Priorité 2 - Recommandées (fonctionnalités importantes)
- ⚙️ `SUPABASE_SERVICE_ROLE_KEY` - Pour les cron jobs automatiques
- ⚙️ `TELEGRAM_BOT_TOKEN` - Pour les notifications
- ⚙️ `TELEGRAM_CHAT_ID` - Pour recevoir les notifications

### 🟢 Priorité 3 - Optionnelles (fonctionnalités avancées)
- ⚙️ `RESEND_API_KEY` - Pour l'envoi d'emails automatiques

---

## 🔍 Vérification

### Comment vérifier que les variables sont bien configurées ?

**Sur Vercel** :
1. Allez dans Vercel → votre projet → **Settings** → **Environment Variables**
2. Vérifiez que toutes les variables obligatoires sont présentes
3. Vérifiez que les valeurs ne sont pas vides

**En développement local** :
1. Créez un fichier `.env.local` à la racine du projet
2. Copiez le contenu de `env.example`
3. Remplissez les valeurs
4. Redémarrez le serveur de développement : `npm run dev`

---

## 🐛 Dépannage

### L'application ne se connecte pas à Supabase

- ✅ Vérifiez que `VITE_SUPABASE_URL` est correct (commence par `https://`)
- ✅ Vérifiez que `VITE_SUPABASE_PUBLISHABLE_KEY` est la clé **anon**, pas la service_role
- ✅ Vérifiez que les variables sont bien configurées dans Vercel (Production)

### Les notifications Telegram ne fonctionnent pas

- ✅ Vérifiez que `TELEGRAM_BOT_TOKEN` est correct
- ✅ Vérifiez que `TELEGRAM_CHAT_ID` est votre Chat ID personnel
- ✅ Testez le bot en lui envoyant un message sur Telegram

### Les emails ne sont pas envoyés

- ✅ Vérifiez que `RESEND_API_KEY` est correct (commence par `re_`)
- ✅ Vérifiez que votre compte Resend est vérifié
- ✅ Vérifiez les logs dans Resend Dashboard → Logs

---

## 📚 Ressources

- [Documentation Supabase - API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Documentation Telegram Bot API](https://core.telegram.org/bots/api)
- [Documentation Resend](https://resend.com/docs)

