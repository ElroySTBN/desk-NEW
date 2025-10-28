# 🚀 DÉPLOIEMENT - GUIDE ÉTAPE PAR ÉTAPE

## ✅ Prérequis (déjà fait)
- ✅ Code prêt
- ✅ `vercel.json` créé
- ✅ `.gitignore` configuré
- ✅ `.env.example` ajouté

---

## 📋 ÉTAPES À SUIVRE

### **ÉTAPE 1️⃣ : Vérifier Git**

```bash
# Vérifiez que vous êtes sur la branche main
git status

# Si vous voyez des fichiers modifiés, c'est normal
```

---

### **ÉTAPE 2️⃣ : Créer un repo GitHub (si pas déjà fait)**

#### Option A : Vous avez déjà un repo GitHub
→ Passez à l'étape 3

#### Option B : Vous n'avez pas de repo GitHub

1. Allez sur https://github.com
2. Cliquez sur **"New repository"** (bouton vert)
3. Nom du repo : `raisedesk-io` (ou autre nom)
4. **Public** ou **Private** (votre choix)
5. **NE COCHEZ RIEN D'AUTRE** (pas de README, pas de .gitignore)
6. Cliquez **"Create repository"**

GitHub va vous donner des commandes. **IGNOREZ-LES** et suivez celles ci-dessous.

---

### **ÉTAPE 3️⃣ : Pusher le code sur GitHub**

```bash
# Ajoutez tous les fichiers
git add .

# Commitez
git commit -m "Prêt pour déploiement"

# Si vous n'avez PAS ENCORE de remote GitHub, ajoutez-le :
git remote add origin https://github.com/VOTRE-USERNAME/raisedesk-io.git
# ⚠️ REMPLACEZ "VOTRE-USERNAME" par votre vrai username GitHub

# Si vous avez DÉJÀ un remote, passez directement au push

# Pushez vers GitHub
git push -u origin main

# Si on vous demande un mot de passe, utilisez un Personal Access Token
# (créez-en un sur GitHub > Settings > Developer settings > Personal access tokens)
```

---

### **ÉTAPE 4️⃣ : Créer un compte Vercel**

1. Allez sur https://vercel.com
2. Cliquez **"Sign Up"**
3. Sélectionnez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à GitHub
5. ✅ Compte créé !

---

### **ÉTAPE 5️⃣ : Déployer sur Vercel**

1. Sur Vercel, cliquez **"Add New..." > Project"**
2. Sélectionnez votre repo **`raisedesk-io`**
3. Cliquez **"Import"**

#### Configuration :

- **Framework Preset** : Vite ✅ (détecté automatiquement)
- **Root Directory** : `./` (par défaut)
- **Build Command** : `npm run build` ✅ (détecté automatiquement)
- **Output Directory** : `dist` ✅ (détecté automatiquement)

#### **IMPORTANT : Variables d'environnement**

Avant de déployer, cliquez sur **"Environment Variables"** et ajoutez :

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://qpbtmqgsnqnbkzxopaiv.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Votre clé (dans votre `.env` local) |

**Pour trouver votre clé :**
```bash
# Dans votre terminal, affichez votre .env
cat .env
```

Copiez la valeur de `VITE_SUPABASE_PUBLISHABLE_KEY`

4. Cliquez **"Deploy"** 🚀

---

### **ÉTAPE 6️⃣ : Attendre le déploiement**

Vercel va :
- ✅ Installer les dépendances (2-3 minutes)
- ✅ Builder l'application (1-2 minutes)
- ✅ Déployer

**Total : 3-5 minutes**

---

### **ÉTAPE 7️⃣ : Tester l'application**

1. Vercel va vous donner une URL : `https://raisedesk-io.vercel.app`
2. Cliquez dessus
3. Testez l'onboarding : `https://raisedesk-io.vercel.app/onboarding`
4. ✅ **C'EST EN LIGNE !** 🎉

---

## 📱 Tester sur mobile

1. Ouvrez Safari/Chrome sur votre téléphone
2. Allez sur `https://raisedesk-io.vercel.app`
3. Connectez-vous
4. Créez un onboarding
5. ✅ Tout fonctionne !

---

## 🔄 Mises à jour futures

Pour mettre à jour l'app :

```bash
# Modifiez le code
# ...

# Committez et pushez
git add .
git commit -m "Nouvelle fonctionnalité"
git push

# ✨ Vercel redéploie automatiquement en 2 minutes !
```

---

## 🆘 Problèmes courants

### Erreur "Supabase is not configured"
→ Vérifiez les variables d'environnement dans Vercel
→ Settings > Environment Variables

### Erreur 404 sur les routes
→ `vercel.json` est déjà configuré, ça devrait marcher

### Build failed
→ Regardez les logs dans Vercel
→ Souvent un problème de variables d'environnement

---

## ✅ Checklist finale

- [ ] Code sur GitHub
- [ ] Compte Vercel créé
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] Test sur desktop ✅
- [ ] Test sur mobile ✅

---

## 🎉 Vous avez réussi !

Votre application est maintenant :
- ✅ En ligne 24/7
- ✅ Accessible depuis n'importe où
- ✅ Responsive mobile
- ✅ Auto-déployée à chaque `git push`

**URL à partager** : `https://votre-app.vercel.app/onboarding/form/UUID`

