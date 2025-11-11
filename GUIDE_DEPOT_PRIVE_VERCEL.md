# 🔒 Guide Complet : Connecter Dépôt Privé GitHub à Vercel

## 🎯 Le Problème

Vercel ne montre pas la branche "main" quand vous connectez un dépôt GitHub privé. C'est un problème de **permissions GitHub**.

## ✅ SOLUTION COMPLÈTE (Étape par Étape)

### ÉTAPE 1 : Autoriser Vercel sur GitHub (LE PLUS IMPORTANT)

1. **Allez sur GitHub** : https://github.com/settings/installations
   - Ou : GitHub → Votre photo de profil (en haut à droite) → **Settings** → **Developer settings** (menu de gauche, tout en bas) → **GitHub Apps** → **Installed GitHub Apps**

2. **Cherchez "Vercel"** dans la liste des applications installées
   - Vous devriez voir "Vercel" avec un logo

3. **Cliquez sur "Configure"** à côté de Vercel

4. **Dans la section "Repository access"**, vous avez 3 options :
   - ✅ **"All repositories"** (recommandé pour simplifier)
   - ✅ **"Only select repositories"** (plus sécurisé, mais il faut ajouter manuellement)
   - ❌ **"Only select repositories"** avec `desk-NEW` pas dans la liste (PROBLÈME)

5. **Si `desk-NEW` n'est pas dans la liste** :
   - Cliquez sur **"Select repositories"** (ou le bouton pour modifier)
   - Une liste de vos dépôts s'affiche
   - **Cherchez `desk-NEW`** dans la liste
   - **Cochez la case** à côté de `desk-NEW`
   - Cliquez sur **"Save"** ou **"Install"**

6. **Vérifiez les permissions** :
   - Vercel doit avoir les permissions : **Contents** (Read), **Metadata** (Read), **Pull requests** (Read), etc.
   - Si certaines permissions manquent, cliquez sur **"Save"** pour les mettre à jour

### ÉTAPE 2 : Vérifier que la Branche "main" Existe sur GitHub

1. **Allez sur votre dépôt** : https://github.com/ElroySTBN/desk-NEW

2. **Cliquez sur le menu des branches** (en haut à gauche, à côté du nom du dépôt)
   - Vous devriez voir une liste des branches
   - **Vérifiez que `main` est dans la liste**

3. **Si `main` n'est pas la branche par défaut** :
   - **Settings** → **Branches** (menu de gauche)
   - Dans **"Default branch"**, changez pour `main`
   - Cliquez sur **"Update"**
   - Confirmez en tapant le nom de la branche

### ÉTAPE 3 : Reconnecter le Dépôt dans Vercel

1. **Vercel** → Votre projet → **Settings** → **Git**

2. **Si le dépôt est déjà connecté** :
   - Cliquez sur **"Disconnect"** (ou les trois points → **"Disconnect"**)
   - Confirmez la déconnexion
   - Attendez 5-10 secondes

3. **Cliquez sur "Connect Git Repository"**
   - Un menu s'affiche avec les options : GitHub, GitLab, Bitbucket
   - **Sélectionnez "GitHub"**

4. **GitHub vous demande d'autoriser Vercel** :
   - Si c'est la première fois, vous verrez une page d'autorisation GitHub
   - **IMPORTANT** : Cochez la case pour autoriser l'accès au dépôt `desk-NEW`
   - Si vous ne voyez pas `desk-NEW` dans la liste, c'est que vous devez d'abord faire l'Étape 1
   - Cliquez sur **"Authorize Vercel"** ou **"Install"**

5. **Une fois autorisé, retournez sur Vercel** :
   - Vous devriez voir une liste de vos dépôts GitHub
   - **Cherchez `desk-NEW`** dans la liste
   - Si vous ne le voyez pas, actualisez la page (F5)

6. **Sélectionnez `desk-NEW`** :
   - Vercel devrait maintenant afficher les branches disponibles
   - **Vous devriez voir `main` dans la liste**
   - Si vous ne voyez pas `main`, essayez de rafraîchir (F5) ou attendez 30 secondes

7. **Sélectionnez la branche `main`** (si elle apparaît)

8. **Cliquez sur "Import"** ou **"Deploy"**

### ÉTAPE 4 : Vérifier le Déploiement

1. **Vercel** → **Deployments**
   - Un nouveau déploiement devrait se déclencher automatiquement
   - Attendez 2-3 minutes que le déploiement se termine

2. **Vérifiez que le bon commit est déployé** :
   - Cliquez sur le dernier déploiement
   - Regardez le commit hash (devrait être `f33524c` ou similaire)
   - Si c'est un ancien commit, c'est que Vercel n'a pas récupéré les dernières modifications

3. **Vérifiez le titre du dashboard** :
   - Allez sur votre site Vercel
   - Le titre devrait être **"✨ RaiseMed.IA - Dashboard TDAH v2"**
   - Si c'est l'ancien titre, le déploiement n'a pas pris la dernière version

## 🔧 Si Vercel Ne Montre Toujours Pas la Branche "main"

### Solution Alternative 1 : Utiliser la CLI Vercel

1. **Installez Vercel CLI** :
   ```bash
   npm install -g vercel
   ```

2. **Connectez-vous à Vercel** :
   ```bash
   vercel login
   ```

3. **Lie le projet au dépôt GitHub** :
   ```bash
   vercel link
   ```
   - Sélectionnez votre projet Vercel
   - Sélectionnez le dépôt GitHub `desk-NEW`
   - Sélectionnez la branche `main`

4. **Déployez** :
   ```bash
   vercel --prod
   ```

### Solution Alternative 2 : Créer un Déploiement Manuel

1. **Vercel** → **Deployments** → **"Create Deployment"**

2. **Sélectionnez "Import Git Repository"**

3. **Sélectionnez "GitHub"**

4. **Sélectionnez `desk-NEW`**

5. **Vercel devrait maintenant vous permettre de choisir la branche**
   - Si `main` apparaît, sélectionnez-la
   - Si `main` n'apparaît pas, c'est que les permissions GitHub ne sont pas correctes (retour à l'Étape 1)

6. **Cliquez sur "Deploy"**

## 🚨 Vérifications Importantes

### Vérifier les Webhooks GitHub

1. **GitHub** → `desk-NEW` → **Settings** → **Webhooks**

2. **Vous devriez voir un webhook Vercel** :
   - URL : `https://api.vercel.com/v1/integrations/deploy/...`
   - Événements : `push`, `pull_request`, etc.

3. **Si vous ne voyez pas de webhook** :
   - C'est que l'intégration n'est pas complète
   - Reconnectez le dépôt dans Vercel (Étape 3)

4. **Si le webhook est en erreur** :
   - Cliquez sur le webhook
   - Regardez les **"Recent Deliveries"**
   - Si vous voyez des erreurs (rouge), c'est que les permissions ne sont pas correctes

### Vérifier les Autorisations GitHub App

1. **GitHub** → **Settings** → **Developer settings** → **GitHub Apps** → **Installed GitHub Apps**

2. **Cliquez sur "Configure"** à côté de Vercel

3. **Vérifiez que `desk-NEW` est dans la liste des dépôts autorisés**

4. **Si `desk-NEW` n'est pas dans la liste**, ajoutez-le (Étape 1)

## 📝 Checklist Finale

Avant de dire que ça ne fonctionne pas, vérifiez :

- [ ] Vercel a accès au dépôt `desk-NEW` dans GitHub App settings
- [ ] Le dépôt `desk-NEW` est dans la liste des dépôts autorisés
- [ ] La branche `main` existe sur GitHub
- [ ] La branche `main` est la branche par défaut sur GitHub
- [ ] Vous avez déconnecté et reconnecté le dépôt dans Vercel
- [ ] Vous avez autorisé Vercel à accéder au dépôt lors de la reconnexion
- [ ] Un webhook Vercel existe dans les settings GitHub du dépôt
- [ ] Le webhook Vercel n'est pas en erreur

## 💡 Conseil Important

**Le problème vient presque toujours des permissions GitHub.** Si Vercel ne voit pas la branche `main`, c'est que :
1. Vercel n'a pas accès au dépôt privé, OU
2. Les permissions GitHub App ne sont pas à jour

**La solution** : Modifier les autorisations dans GitHub App settings (Étape 1), puis reconnecter le dépôt dans Vercel (Étape 3).

## 🆘 Si Rien ne Fonctionne

1. **Contactez le support Vercel** : https://vercel.com/support
2. **Donnez-leur** :
   - URL du projet Vercel
   - URL du dépôt GitHub
   - Description du problème : "Vercel ne détecte pas la branche main pour dépôt privé"
   - Screenshot de la page GitHub App configuration
   - Screenshot de la page Vercel Settings → Git

3. **En attendant**, utilisez la CLI Vercel pour déployer manuellement


