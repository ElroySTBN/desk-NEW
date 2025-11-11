# 🚀 Migration vers Nouveau Dépôt GitHub

## Objectif
Créer un nouveau dépôt GitHub propre et y migrer tout le code pour résoudre les problèmes de déploiement automatique Vercel.

## ⚠️ Important : SUPABASE_SERVICE_ROLE_KEY

**Cette variable n'est PAS nécessaire pour le déploiement de base !**

- ✅ L'application fonctionnera sans elle
- ⚙️ Elle est uniquement nécessaire pour les **cron jobs** (génération automatique de factures, notifications Telegram)
- 📝 Vous pourrez l'ajouter plus tard dans Vercel si vous voulez activer ces fonctionnalités

**Le problème de déploiement ne vient PAS de cette variable manquante.**

---

## 📋 Étapes de Migration

### Étape 1 : Créer le Nouveau Dépôt GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur le **"+"** en haut à droite → **"New repository"**
3. Remplissez les informations :
   - **Repository name** : `raisedesk-tdah` (ou un autre nom de votre choix)
   - **Description** : "RaiseDesk - Système de gestion adapté TDAH"
   - **Visibility** : Private (recommandé) ou Public
   - ⚠️ **NE COCHEZ PAS** "Add a README file", "Add .gitignore", ou "Choose a license"
   - Le dépôt doit être **vide**
4. Cliquez sur **"Create repository"**
5. **Copiez l'URL du dépôt** qui s'affiche (ex: `https://github.com/VotreUsername/raisedesk-tdah.git`)

### Étape 2 : Changer le Remote Git

Une fois que vous avez l'URL du nouveau dépôt, dites-moi l'URL et je changerai le remote Git pour vous.

**Exemple d'URL à me donner :**
- `https://github.com/VotreUsername/raisedesk-tdah.git`
- ou `git@github.com:VotreUsername/raisedesk-tdah.git`

### Étape 3 : Pousser le Code

Après avoir changé le remote, je pousserai tout le code vers le nouveau dépôt.

### Étape 4 : Reconnecter Vercel

Une fois le code poussé, suivez ces étapes :

1. Allez sur [vercel.com](https://vercel.com) → votre projet `raisedesk-production`
2. Allez dans **Settings** → **Git**
3. Cliquez sur **"Disconnect"** (en bas de la page)
4. Confirmez la déconnexion
5. Cliquez sur **"Connect Git Repository"**
6. Sélectionnez **GitHub** comme provider
7. Autorisez Vercel si demandé
8. **Sélectionnez le NOUVEAU dépôt** (ex: `raisedesk-tdah`)
9. Cliquez sur **"Import"**
10. Vercel créera automatiquement le webhook GitHub ✅

### Étape 5 : Vérifier les Variables d'Environnement

1. Dans Vercel → **Settings** → **Environment Variables**
2. Vérifiez que ces variables sont présentes :
   - ✅ `VITE_SUPABASE_URL` (OBLIGATOIRE)
   - ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` (OBLIGATOIRE)
   - ⚙️ `SUPABASE_SERVICE_ROLE_KEY` (optionnel - pour cron jobs)
   - ⚙️ `TELEGRAM_BOT_TOKEN` (optionnel)
   - ⚙️ `TELEGRAM_CHAT_ID` (optionnel)
   - ⚙️ `RESEND_API_KEY` (optionnel)

3. Si des variables manquent, ajoutez-les (voir `CONFIGURATION_GUIDE.md`)

### Étape 6 : Déclencher le Premier Déploiement

1. Dans Vercel → **Deployments**
2. Cliquez sur **"Deploy"** → **"Deploy Latest Commit"**
3. Vercel devrait détecter le nouveau dépôt et déployer automatiquement

---

## ✅ Vérifications Finales

Après la migration, vérifiez :

- [ ] Le nouveau dépôt GitHub contient tout le code
- [ ] Vercel est connecté au nouveau dépôt
- [ ] Le webhook GitHub est présent (GitHub → Settings → Webhooks)
- [ ] Un déploiement a été déclenché automatiquement
- [ ] Le build se termine sans erreur
- [ ] L'application est accessible sur l'URL Vercel

---

## 🎯 Résultat Attendu

- ✅ Nouveau dépôt GitHub propre avec tout le code
- ✅ Vercel connecté au nouveau dépôt
- ✅ Webhook GitHub créé automatiquement
- ✅ Déploiement automatique fonctionnel
- ✅ Plus de problèmes de synchronisation

---

## 📝 Notes

- **Tout le code actuel sera préservé** (historique Git, commits, etc.)
- **Vercel et Supabase restent inchangés** (même projet, mêmes variables)
- **Seul le dépôt GitHub change**
- Le nouveau dépôt sera propre, sans les problèmes de l'ancien

---

## 🆘 Si Problème

Si quelque chose ne fonctionne pas :

1. Vérifiez que le nouveau dépôt est bien vide avant de pousser
2. Vérifiez que vous avez les permissions sur le nouveau dépôt
3. Vérifiez les logs de déploiement dans Vercel
4. Contactez-moi avec les détails de l'erreur

