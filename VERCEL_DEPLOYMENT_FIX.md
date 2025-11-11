# 🔧 Guide de Résolution - Déploiement Vercel

## ⚠️ Solution Recommandée : Créer un Nouveau Projet

**Si vous n'avez pas de webhook GitHub ou si le déploiement automatique ne fonctionne pas**, la solution la plus simple est de **créer un nouveau projet Vercel depuis zéro**.

👉 **Consultez le guide complet** : [`NOUVEAU_PROJET_VERCEL.md`](./NOUVEAU_PROJET_VERCEL.md)

Ce guide vous explique étape par étape comment :
- Créer un nouveau projet Vercel
- Le connecter à GitHub
- Configurer toutes les variables d'environnement
- Vérifier que le déploiement automatique fonctionne

---

## 🔧 Guide de Résolution - Projet Existant

Si vous préférez réparer votre projet existant, suivez ces étapes :

### Étape 1 : Vérifier la connexion GitHub dans Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Ouvrez votre projet `raisedesk-production`
3. Allez dans **Settings** → **Git**
4. Vérifiez que :
   - Le dépôt est bien `ElroySTBN/raisedesk-production`
   - La branche est `main`
   - Le statut est "Connected"

### Étape 2 : Reconnecter le projet (si nécessaire)

Si le statut n'est pas "Connected" ou si vous voyez des erreurs :

1. Dans Vercel → **Settings** → **Git**
2. Cliquez sur **"Disconnect"** (en bas de la page)
3. Confirmez la déconnexion
4. Cliquez sur **"Connect Git Repository"**
5. Sélectionnez **GitHub** comme provider
6. Autorisez Vercel si demandé
7. Sélectionnez le dépôt `ElroySTBN/raisedesk-production`
8. Cliquez sur **"Import"**

### Étape 3 : Vérifier la configuration du projet

1. Dans Vercel → **Settings** → **General**
2. Vérifiez que :
   - **Framework Preset** : `Vite` (ou détecté automatiquement)
   - **Root Directory** : `./` (laissez vide ou mettez `./`)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

### Étape 4 : Vérifier les variables d'environnement

1. Dans Vercel → **Settings** → **Environment Variables**
2. Vérifiez que ces variables sont configurées :

   **Variables OBLIGATOIRES** (nécessaires pour que l'app fonctionne) :
   - ✅ `VITE_SUPABASE_URL` - URL de votre projet Supabase
   - ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Clé publique Supabase (anon key)

   **Variables OPTIONNELLES** (pour les fonctionnalités avancées) :
   - ⚙️ `SUPABASE_SERVICE_ROLE_KEY` - Pour les cron jobs (génération factures, notifications)
   - ⚙️ `TELEGRAM_BOT_TOKEN` - Pour les notifications Telegram
   - ⚙️ `TELEGRAM_CHAT_ID` - Pour recevoir les notifications Telegram
   - ⚙️ `RESEND_API_KEY` - Pour l'envoi d'emails automatiques

3. Pour chaque variable, cochez au moins **Production**

**📋 Guide détaillé** : Voir [`NOUVEAU_PROJET_VERCEL.md`](./NOUVEAU_PROJET_VERCEL.md) section "Étape 3" pour savoir où trouver chaque valeur.

### Étape 5 : Vérifier les webhooks GitHub

1. Allez sur GitHub : https://github.com/ElroySTBN/raisedesk-production/settings/hooks
2. Vérifiez qu'il y a un webhook Vercel
3. Si absent ou en erreur :
   - Dans Vercel, reconnectez le projet (Étape 2)
   - Le webhook sera recréé automatiquement

### Étape 6 : Forcer un nouveau déploiement

**Option A : Via Vercel Dashboard (recommandé)**

1. Dans Vercel → **Deployments**
2. Cliquez sur **"..."** (trois points) sur le dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Ou cliquez sur **"Deploy"** → **"Deploy Latest Commit"**

**Option B : Via un nouveau commit (automatique)**

Un commit de test a été créé. Vercel devrait détecter le push automatiquement.

### Étape 7 : Vérifier les logs de déploiement

1. Dans Vercel → **Deployments**
2. Cliquez sur le déploiement en cours
3. Ouvrez l'onglet **"Build Logs"**
4. Vérifiez s'il y a des erreurs :
   - ❌ Erreurs de build → Vérifiez les erreurs TypeScript
   - ❌ Erreurs d'installation → Vérifiez `package.json`
   - ❌ Erreurs de variables → Vérifiez les variables d'environnement

## ✅ Checklist de Vérification

Avant de considérer que c'est résolu, vérifiez :

- [ ] Le projet est connecté à GitHub dans Vercel
- [ ] Les variables d'environnement sont configurées
- [ ] Le webhook GitHub est présent et fonctionnel
- [ ] Un nouveau déploiement a été déclenché
- [ ] Le build se termine sans erreur
- [ ] L'application est accessible sur l'URL Vercel

## 🐛 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs de build** dans Vercel → Deployments → Build Logs
2. **Testez le build localement** :
   ```bash
   npm install
   npm run build
   ```
3. **Vérifiez que le fichier `vercel.json` est présent** à la racine du projet
4. **Contactez le support Vercel** si le problème persiste

## 📝 Notes

- Le fichier `vercel.json` a été créé avec une configuration minimale pour Vite
- Les routes API dans `api/` seront automatiquement détectées par Vercel
- Les cron jobs peuvent être configurés plus tard via l'interface Vercel

## 📚 Guides Complémentaires

- **Créer un nouveau projet Vercel** : [`NOUVEAU_PROJET_VERCEL.md`](./NOUVEAU_PROJET_VERCEL.md)
- **Variables d'environnement détaillées** : [`VARIABLES_ENVIRONNEMENT.md`](./VARIABLES_ENVIRONNEMENT.md)

