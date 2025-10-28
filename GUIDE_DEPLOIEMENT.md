# 🚀 Guide de Déploiement - RaiseMed.IA

## Déployer votre application en ligne (GRATUIT)

Votre application sera accessible depuis n'importe où : téléphone, ordinateur, tablette.

---

## Option 1 : Vercel (RECOMMANDÉ - Le plus simple)

### ✅ Avantages
- **Gratuit** pour les projets personnels
- Déploiement en **2 minutes**
- URL personnalisée (ex: `raisemedai.vercel.app`)
- HTTPS automatique
- Mises à jour automatiques à chaque push Git
- Excellent pour React/Vite

### 📝 Étapes

#### 1. Créer un compte Vercel
- Allez sur https://vercel.com
- Cliquez "Sign Up"
- **Connectez-vous avec GitHub** (le plus simple)

#### 2. Pousser votre code sur GitHub

Si ce n'est pas déjà fait :

```bash
# Initialisez Git si nécessaire
git init

# Ajoutez tous vos fichiers
git add .

# Faites un commit
git commit -m "Application d'onboarding prête"

# Créez un repo sur GitHub (github.com/new)
# Puis liez-le :
git remote add origin https://github.com/VOTRE-USERNAME/raisedesk-io.git
git branch -M main
git push -u origin main
```

#### 3. Déployer sur Vercel

**Option A : Via le site web** (le plus simple)
1. Allez sur https://vercel.com/new
2. **Importez votre repo GitHub**
3. Vercel détecte automatiquement Vite
4. Cliquez **"Deploy"**
5. **C'EST TOUT !** 🎉

**Option B : Via CLI**
```bash
# Installez Vercel CLI
npm install -g vercel

# Déployez
vercel

# Suivez les instructions
# Vercel détectera automatiquement votre projet Vite
```

#### 4. Configuration des variables d'environnement

Une fois déployé, allez dans les **Settings** de votre projet Vercel :

1. Allez dans **Environment Variables**
2. Ajoutez vos variables Supabase :
   - `VITE_SUPABASE_URL` = `https://qpbtmqgsnqnbkzxopaiv.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `votre_key` (copiez depuis .env)
   - `VITE_SUPABASE_PROJECT_ID` = `qpbtmqgsnqnbkzxopaiv`

3. **Redéployez** (Vercel le fait automatiquement)

#### 5. ✅ Votre app est en ligne !

Votre URL sera : `https://raisedesk-io.vercel.app` (ou personnalisée)

---

## Option 2 : Netlify (Alternative)

### Étapes

1. Allez sur https://netlify.com
2. Sign up avec GitHub
3. "Add new site" → "Import from Git"
4. Sélectionnez votre repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Ajoutez vos variables d'environnement
8. Deploy !

---

## 📱 Test Mobile

Une fois déployé, testez sur votre téléphone :

1. **Ouvrez Safari/Chrome** sur votre iPhone/Android
2. Allez sur `https://votre-app.vercel.app`
3. **Connectez-vous**
4. Testez la création d'onboarding
5. Envoyez-vous le lien par WhatsApp
6. Ouvrez-le sur votre téléphone

**Tout est responsive** ! ✅

---

## 🔗 Générer des liens d'onboarding

Une fois déployé :

1. Allez sur `https://votre-app.vercel.app/onboarding`
2. Créez un onboarding (depuis votre téléphone !)
3. Le lien généré sera automatiquement :
   ```
   https://votre-app.vercel.app/onboarding/form/[UUID]
   ```
4. Copiez et envoyez par WhatsApp/Email/SMS

Le client peut l'ouvrir **directement sur son téléphone** !

---

## ⚡ Mises à jour automatiques

Chaque fois que vous modifiez le code :

```bash
git add .
git commit -m "Amélioration X"
git push
```

→ **Vercel redéploie automatiquement** (en ~2 minutes)

---

## 🌐 Domaine personnalisé (optionnel)

Si vous avez un domaine (ex: `raisemedai.fr`) :

1. Allez dans **Settings** → **Domains** sur Vercel
2. Ajoutez votre domaine
3. Configurez le DNS selon les instructions
4. Votre app sera sur `https://raisemedai.fr` !

---

## 🔒 Sécurité

### HTTPS
- ✅ Vercel/Netlify activent **automatiquement HTTPS**
- Vos données sont chiffrées

### Supabase
- ✅ Les credentials sont en **variables d'environnement**
- Pas exposés dans le code
- RLS activé sur la base de données

---

## 🧪 Checklist avant déploiement

- [ ] Supabase configuré (SQL + Storage)
- [ ] Variables d'environnement copiées
- [ ] Code poussé sur GitHub
- [ ] Compte Vercel créé
- [ ] Projet importé et déployé
- [ ] Variables d'env ajoutées sur Vercel
- [ ] Test de connexion sur l'URL déployée
- [ ] Test mobile (création onboarding)
- [ ] Test lien client (sur téléphone)

---

## 📊 Performance

Vercel optimise automatiquement :
- ✅ **CDN global** (rapide partout dans le monde)
- ✅ **Compression** des assets
- ✅ **Cache** intelligent
- ✅ **Edge functions** pour la rapidité

---

## 💰 Coût

**GRATUIT** pour :
- Projets personnels/startup
- Bandwidth illimité
- Déploiements illimités
- 100 GB-hours/mois

Largement suffisant pour votre usage !

---

## 🆘 Dépannage

### Erreur de build
Si Vercel ne trouve pas les variables :
1. Vérifiez les **Environment Variables** dans Settings
2. Assurez-vous qu'elles commencent par `VITE_`
3. Redéployez

### Page blanche après déploiement
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs
3. Souvent = variables d'environnement manquantes

### Problème de connexion Supabase
1. Vérifiez que les URLs et keys sont correctes
2. Vérifiez que le domaine Vercel est autorisé dans Supabase
   - Supabase Dashboard → Authentication → URL Configuration
   - Ajoutez `https://votre-app.vercel.app`

---

## 🎉 C'est tout !

Votre application sera accessible 24/7, de partout, sur n'importe quel appareil !

**URL type** : `https://raisemedai.vercel.app`

---

**Questions ?** Tout est prêt pour le déploiement ! 🚀

