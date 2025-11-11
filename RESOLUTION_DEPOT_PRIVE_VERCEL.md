# 🔒 Résolution Problème Dépôt Privé GitHub + Vercel

## 🔍 Diagnostic du Problème

**Symptôme** : Vercel ne montre pas la branche "main" quand vous connectez un dépôt GitHub privé.

**Cause probable** : Vercel (via GitHub App) n'a pas les permissions pour accéder à votre dépôt privé.

## ✅ SOLUTION ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier les Autorisations GitHub App (CRUCIAL)

1. **Allez sur GitHub** : https://github.com/settings/installations
2. Vous verrez la liste des **GitHub Apps** installées
3. **Cherchez "Vercel"** dans la liste
4. **Cliquez sur "Configure"** à côté de Vercel
5. **Vérifiez les permissions** :
   - ✅ **Repository access** : Doit être sur **"All repositories"** OU **"Only select repositories"**
   - Si c'est **"Only select repositories"**, vérifiez que `desk-NEW` est dans la liste
   - Si `desk-NEW` n'est PAS dans la liste, ajoutez-le :
     - Cliquez sur **"Select repositories"**
     - Cherchez `desk-NEW`
     - Cochez la case
     - Cliquez sur **"Save"**

### Étape 2 : Réautoriser Vercel (si nécessaire)

1. **GitHub** → **Settings** → **Applications** → **Authorized GitHub Apps**
2. Cherchez **"Vercel"**
3. Si vous ne le voyez pas, ou si les permissions semblent incorrectes :
   - Cliquez sur **"Revoke"** (révoquer)
   - Puis reconnectez depuis Vercel (voir étape 3)

### Étape 3 : Reconnecter le Dépôt dans Vercel

1. **Vercel** → Votre projet → **Settings** → **Git**
2. Si le dépôt est connecté, cliquez sur **"Disconnect"**
3. Attendez quelques secondes
4. Cliquez sur **"Connect Git Repository"**
5. Sélectionnez **"GitHub"**
6. **IMPORTANT** : Si GitHub vous demande d'autoriser Vercel :
   - Autorisez l'accès
   - **Cochez la case pour donner accès au dépôt privé `desk-NEW`**
   - Cliquez sur **"Authorize"** ou **"Install"**
7. Une fois autorisé, vous devriez voir la liste de vos dépôts
8. **Sélectionnez `ElroySTBN/desk-NEW`**
9. **Vercel devrait maintenant montrer les branches disponibles**, y compris `main`
10. Si vous voyez `main`, sélectionnez-la
11. Cliquez sur **"Import"** ou **"Deploy"**

### Étape 4 : Vérifier la Branche sur GitHub

Parfois, Vercel ne détecte pas la branche si elle n'est pas la branche par défaut sur GitHub.

1. **Allez sur GitHub** : https://github.com/ElroySTBN/desk-NEW
2. Cliquez sur le menu déroulant des branches (en haut à gauche, à côté du nom du dépôt)
3. Vérifiez que `main` est bien la branche sélectionnée
4. Si ce n'est pas `main`, sélectionnez `main`
5. Si `main` n'est pas la branche par défaut :
   - **Settings** → **Branches**
   - Dans **"Default branch"**, changez pour `main`
   - Cliquez sur **"Update"**

### Étape 5 : Vérifier que le Dépôt est Accessible

1. **GitHub** → Votre dépôt `desk-NEW`
2. Vérifiez que vous pouvez voir les fichiers
3. Vérifiez que la branche `main` existe bien
4. Vérifiez que vous avez les dernières modifications (commit `f33524c`)

## 🔧 SOLUTION ALTERNATIVE : Déploiement Manuel

Si les étapes ci-dessus ne fonctionnent pas, vous pouvez créer un déploiement manuel :

### Option A : Déploiement depuis GitHub (Recommandé)

1. **Vercel** → **Deployments**
2. Cliquez sur **"Create Deployment"** (bouton en haut à droite)
3. Sélectionnez **"Import Git Repository"**
4. Sélectionnez **"GitHub"**
5. Autorisez si demandé
6. Sélectionnez `ElroySTBN/desk-NEW`
7. **Vercel devrait maintenant vous permettre de choisir la branche `main`**
8. Sélectionnez `main`
9. Cliquez sur **"Deploy"**

### Option B : Déploiement depuis CLI Vercel

Si l'interface web ne fonctionne pas, utilisez la CLI :

```bash
# Installer Vercel CLI (si pas déjà installé)
npm install -g vercel

# Se connecter à Vercel
vercel login

# Lier le projet au dépôt GitHub
vercel link

# Déployer
vercel --prod
```

## 🎯 Vérifications Finales

Après avoir reconnecté le dépôt :

1. **Vercel** → **Settings** → **Git**
2. Vous devriez voir :
   - Le dépôt `ElroySTBN/desk-NEW` listé
   - Une option pour choisir la branche de production (qui devrait être `main`)
   - Le statut "Connected"

3. **Vercel** → **Deployments**
4. Un nouveau déploiement devrait se déclencher automatiquement
5. Vérifiez que le commit déployé est bien le dernier (`f33524c`)

## 🚨 Si Rien ne Fonctionne

### Vérifier les Webhooks GitHub

1. **GitHub** → `desk-NEW` → **Settings** → **Webhooks**
2. Vous devriez voir un webhook Vercel
3. Si vous ne le voyez pas, c'est que l'intégration n'est pas complète
4. Si vous voyez un webhook mais qu'il est en erreur (rouge), cliquez dessus et vérifiez les erreurs

### Vérifier les Logs Vercel

1. **Vercel** → **Deployments**
2. Cliquez sur le dernier déploiement
3. Regardez les **Build Logs**
4. Vérifiez s'il y a des erreurs liées à Git ou à l'accès au dépôt

### Contacter le Support Vercel

Si après toutes ces étapes, le problème persiste :

1. Allez sur https://vercel.com/support
2. Créez un ticket de support avec :
   - URL du projet Vercel
   - URL du dépôt GitHub (`https://github.com/ElroySTBN/desk-NEW`)
   - Description du problème : "Vercel ne détecte pas la branche main pour un dépôt privé GitHub"
   - Screenshot de la page Settings → Git dans Vercel
   - Screenshot de la page GitHub App configuration

## 📝 Notes Importantes

- **Les dépôts privés nécessitent des autorisations explicites** dans GitHub App
- **Vercel utilise GitHub App**, pas OAuth, pour les dépôts privés
- **La branche doit être visible** dans les paramètres GitHub App pour que Vercel puisse la détecter
- **Parfois, il faut attendre quelques minutes** après avoir modifié les autorisations GitHub pour que Vercel les détecte

## ✅ Checklist Rapide

- [ ] GitHub App Vercel a accès au dépôt `desk-NEW`
- [ ] Le dépôt `desk-NEW` est dans la liste des dépôts autorisés
- [ ] La branche `main` est la branche par défaut sur GitHub
- [ ] Vercel est reconnecté au dépôt après modification des autorisations
- [ ] Un nouveau déploiement s'est déclenché automatiquement
- [ ] Le commit déployé est le dernier (`f33524c`)



