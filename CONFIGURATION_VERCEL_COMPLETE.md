# 🔧 Configuration Vercel Complète - Guide Étape par Étape

## 📋 Vos Variables d'Environnement

Voici toutes vos variables configurées :

### Variables OBLIGATOIRES (nécessaires pour que l'app fonctionne)

1. **VITE_SUPABASE_URL**
   ```
   https://ujmouuxpkqmaslpgdfwz.supabase.co
   ```

2. **VITE_SUPABASE_PUBLISHABLE_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbW91dXhwa3FtYXNscGdkZnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTY4OTMsImV4cCI6MjA3ODMzMjg5M30.OchN7fa2RVyzafpcj__voddwYEd0rbMTDkZIlew8EII
   ```

### Variables OPTIONNELLES (pour fonctionnalités avancées)

3. **SUPABASE_SERVICE_ROLE_KEY** (pour les cron jobs)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbW91dXhwa3FtYXNscGdkZnd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Njg5MywiZXhwIjoyMDc4MzMyODkzfQ.I4D-prT2lbMzEk2wT68hizs6ru9rrg8-4gg-iR_p7rU
   ```

4. **TELEGRAM_BOT_TOKEN** (pour les notifications Telegram)
   ```
   8050751388:AAEgJoj0pPe8w8Os4meloJmVEYT01YlDebA
   ```

5. **TELEGRAM_CHAT_ID** (pour recevoir les notifications)
   ```
   5043202178
   ```

6. **RESEND_API_KEY** (pour l'envoi d'emails automatiques)
   ```
   re_aZMs7BiX_PLYUW25iupZhsv2Qd8N8qbDG
   ```

---

## 🚀 Instructions Exactes pour Configurer Vercel

### Étape 1 : Créer le Nouveau Projet Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New"** → **"Project"**
3. Dans la liste des dépôts, **trouvez et sélectionnez** : `ElroySTBN/desk-NEW`
4. Cliquez sur **"Import"**

### Étape 2 : Vérifier la Configuration du Projet

Vercel devrait détecter automatiquement que c'est un projet Vite. Vérifiez que :

- ✅ **Framework Preset** : `Vite` (détecté automatiquement)
- ✅ **Root Directory** : `./` (laissez vide)
- ✅ **Build Command** : `npm run build`
- ✅ **Output Directory** : `dist`
- ✅ **Install Command** : `npm install`

**⚠️ Ne cliquez PAS encore sur "Deploy" !**

### Étape 3 : Ajouter les Variables d'Environnement

**Sur la page de configuration du projet**, avant de déployer :

1. Cliquez sur **"Environment Variables"** (ou cherchez l'onglet en bas)

2. **Ajoutez les variables UNE PAR UNE** dans l'ordre suivant :

#### Variable 1 : VITE_SUPABASE_URL

- **Name** : `VITE_SUPABASE_URL`
- **Value** : `https://ujmouuxpkqmaslpgdfwz.supabase.co`
- **Environments** : Cochez **Production**, **Preview**, **Development**
- Cliquez sur **"Add"**

#### Variable 2 : VITE_SUPABASE_PUBLISHABLE_KEY

- **Name** : `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbW91dXhwa3FtYXNscGdkZnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTY4OTMsImV4cCI6MjA3ODMzMjg5M30.OchN7fa2RVyzafpcj__voddwYEd0rbMTDkZIlew8EII`
- **Environments** : Cochez **Production**, **Preview**, **Development**
- Cliquez sur **"Add"**

#### Variable 3 : SUPABASE_SERVICE_ROLE_KEY

- **Name** : `SUPABASE_SERVICE_ROLE_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbW91dXhwa3FtYXNscGdkZnd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Njg5MywiZXhwIjoyMDc4MzMyODkzfQ.I4D-prT2lbMzEk2wT68hizs6ru9rrg8-4gg-iR_p7rU`
- **Environments** : Cochez **Production**, **Preview**, **Development**
- Cliquez sur **"Add"**

#### Variable 4 : TELEGRAM_BOT_TOKEN

- **Name** : `TELEGRAM_BOT_TOKEN`
- **Value** : `8050751388:AAEgJoj0pPe8w8Os4meloJmVEYT01YlDebA`
- **Environments** : Cochez **Production**, **Preview**, **Development**
- Cliquez sur **"Add"**

#### Variable 5 : TELEGRAM_CHAT_ID

- **Name** : `TELEGRAM_CHAT_ID`
- **Value** : `5043202178`
- **Environments** : Cochez **Production**, **Preview**, **Development**
- Cliquez sur **"Add"**

#### Variable 6 : RESEND_API_KEY

- **Name** : `RESEND_API_KEY`
- **Value** : `re_aZMs7BiX_PLYUW25iupZhsv2Qd8N8qbDG`
- **Environments** : Cochez **Production**, **Preview**, **Development**
- Cliquez sur **"Add"**

### Étape 4 : Déployer le Projet

1. Une fois **toutes les 6 variables** ajoutées, vérifiez qu'elles apparaissent toutes dans la liste
2. Cliquez sur **"Deploy"** (bouton en bas de la page)
3. ⏳ **Attendez 2-3 minutes** que le déploiement se termine
4. Une fois terminé, vous verrez un message de succès avec l'URL de votre application

### Étape 5 : Vérifier le Webhook GitHub

1. Allez sur GitHub : https://github.com/ElroySTBN/desk-NEW/settings/hooks
2. Vous devriez voir un **webhook Vercel** créé automatiquement ✅
3. Le webhook devrait avoir l'URL : `https://api.vercel.com/v1/integrations/deploy`
4. Le statut devrait être **"Active"** (coche verte)

### Étape 6 : Tester le Déploiement Automatique

1. Faites un petit changement dans votre code (ou je peux créer un commit de test)
2. Poussez le changement sur GitHub
3. Vérifiez dans Vercel → **Deployments** qu'un nouveau déploiement se déclenche automatiquement

---

## ✅ Checklist de Vérification

Après la configuration, vérifiez :

- [ ] Le projet Vercel est créé et connecté à `desk-NEW`
- [ ] Les 6 variables d'environnement sont configurées
- [ ] Le premier déploiement s'est terminé avec succès
- [ ] Le webhook GitHub est présent et actif
- [ ] L'application est accessible sur l'URL Vercel
- [ ] Le déploiement automatique fonctionne (testez avec un nouveau commit)

---

## 🎯 Résultat Attendu

- ✅ Nouveau projet Vercel propre
- ✅ Connecté au dépôt `desk-NEW`
- ✅ Toutes les variables d'environnement configurées
- ✅ Webhook GitHub créé automatiquement
- ✅ Déploiement automatique fonctionnel
- ✅ Application accessible et fonctionnelle
- ✅ Toutes les fonctionnalités avancées activées (cron jobs, Telegram, emails)

---

## 🆘 Si Problème

### Le webhook n'est toujours pas créé

1. Vérifiez dans GitHub → **Settings** → **Applications** → **Authorized GitHub Apps** que Vercel est autorisé
2. Si nécessaire, réautorisez Vercel lors de la connexion du dépôt
3. Vérifiez que vous avez bien importé le dépôt depuis GitHub (pas créé manuellement)

### Le déploiement échoue

1. Vérifiez les logs de build dans Vercel → **Deployments** → **Build Logs**
2. Vérifiez que toutes les variables d'environnement sont correctes (copier-coller exact)
3. Vérifiez qu'il n'y a pas d'espaces en trop dans les valeurs

### L'application ne fonctionne pas

1. Vérifiez que les variables d'environnement sont correctes
2. Vérifiez les logs runtime dans Vercel → **Deployments** → **Runtime Logs**
3. Vérifiez la console du navigateur pour les erreurs
4. Vérifiez que la base de données Supabase est bien configurée

---

## 📝 Notes Importantes

- ⚠️ **Ne supprimez PAS l'ancien projet Vercel** tout de suite (gardez-le en backup)
- ✅ **Les variables d'environnement** sont maintenant toutes configurées
- 🔒 **L'URL de l'application** sera différente (nouvelle URL Vercel)
- 🎯 **Le domaine personnalisé** (si vous en aviez un) devra être reconfiguré

---

## 🚀 Après la Configuration

Une fois le nouveau projet créé et fonctionnel :

1. ✅ Testez que tout fonctionne correctement
2. ✅ Testez les fonctionnalités avancées (notifications Telegram, etc.)
3. ✅ Si tout est OK, vous pourrez supprimer l'ancien projet Vercel
4. ✅ Configurez les cron jobs dans Vercel si nécessaire

---

## 📞 Support

Si vous rencontrez un problème, notez :
- Le message d'erreur exact
- Les logs de build/runtime
- Ce qui ne fonctionne pas exactement

