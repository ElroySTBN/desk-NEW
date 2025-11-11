# 🔑 Variables d'Environnement - Guide Complet

## Variables OBLIGATOIRES (nécessaires pour que l'app fonctionne)

### 1. `VITE_SUPABASE_URL`

**Où la trouver :**
1. Allez sur [supabase.com](https://supabase.com) → votre projet
2. **Settings** → **API**
3. Copiez la **"Project URL"** (ex: `https://xxxxxxxxxxxxx.supabase.co`)

**Valeur :**
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```

---

### 2. `VITE_SUPABASE_PUBLISHABLE_KEY`

**Où la trouver :**
1. Allez sur [supabase.com](https://supabase.com) → votre projet
2. **Settings** → **API**
3. Copiez la **"anon public"** key (commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**Valeur :**
```
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Variables OPTIONNELLES (pour fonctionnalités avancées)

### 3. `SUPABASE_SERVICE_ROLE_KEY` ⚙️

**⚠️ NON nécessaire pour le déploiement de base !**

Cette variable est uniquement nécessaire pour :
- Les cron jobs (génération automatique de factures)
- Les notifications Telegram automatiques
- Les Edge Functions qui nécessitent des privilèges élevés

**L'application fonctionnera sans elle**, seules les automatisations ne fonctionneront pas.

**Où la trouver :**
1. Allez sur [supabase.com](https://supabase.com) → votre projet
2. **Settings** → **API**
3. Copiez la **"service_role"** key (⚠️ GARDEZ-LA SECRÈTE !)
4. Ne l'exposez JAMAIS côté client

**Valeur :**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. `TELEGRAM_BOT_TOKEN` ⚙️

**Nécessaire uniquement pour les notifications Telegram**

**Où la trouver :**
1. Ouvrez Telegram
2. Cherchez **@BotFather**
3. Envoyez `/mybots`
4. Sélectionnez votre bot
5. Cliquez sur **"API Token"**
6. Copiez le token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

**Valeur :**
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

### 5. `TELEGRAM_CHAT_ID` ⚙️

**Nécessaire uniquement pour recevoir les notifications Telegram**

**Où la trouver :**
1. Ouvrez Telegram
2. Cherchez **@userinfobot**
3. Envoyez `/start`
4. Le bot vous donnera votre Chat ID (ex: `123456789`)

**Valeur :**
```
TELEGRAM_CHAT_ID=123456789
```

---

### 6. `RESEND_API_KEY` ⚙️

**Nécessaire uniquement pour l'envoi d'emails automatiques**

**Où la trouver :**
1. Allez sur [resend.com](https://resend.com)
2. Connectez-vous
3. Allez dans **API Keys**
4. Créez une nouvelle clé ou copiez une existante
5. Format: `re_xxxxxxxxxxxxx`

**Valeur :**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## 📋 Configuration dans Vercel

### Comment ajouter les variables :

1. Allez sur [vercel.com](https://vercel.com) → votre projet
2. **Settings** → **Environment Variables**
3. Cliquez sur **"Add New"**
4. Remplissez :
   - **Name** : Le nom de la variable (ex: `VITE_SUPABASE_URL`)
   - **Value** : La valeur de la variable
   - **Environments** : Cochez au moins **Production** (et Preview/Development si nécessaire)
5. Cliquez sur **"Save"**
6. Répétez pour chaque variable

### Variables à cocher pour chaque environnement :

- **Production** : Toutes les variables (obligatoires + optionnelles)
- **Preview** : Toutes les variables (pour tester les PR)
- **Development** : Optionnel (pour développement local)

---

## ✅ Checklist Minimum

Pour que l'application fonctionne, vous devez avoir au minimum :

- [x] `VITE_SUPABASE_URL`
- [x] `VITE_SUPABASE_PUBLISHABLE_KEY`

**C'est tout !** Les autres variables sont optionnelles.

---

## 🎯 Ordre de Priorité

1. **Priorité 1** : Variables obligatoires (app fonctionne)
2. **Priorité 2** : `SUPABASE_SERVICE_ROLE_KEY` (automatisations)
3. **Priorité 3** : Variables Telegram (notifications)
4. **Priorité 4** : `RESEND_API_KEY` (emails automatiques)

---

## 📝 Notes Importantes

- ⚠️ **Ne commitez JAMAIS** les variables d'environnement dans Git
- ✅ Le fichier `.env.local` est dans `.gitignore` (sécurisé)
- ✅ Les variables Vercel sont sécurisées et chiffrées
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` ne doit JAMAIS être exposée côté client

