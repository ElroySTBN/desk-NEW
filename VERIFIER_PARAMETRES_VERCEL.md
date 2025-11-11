# ⚙️ Vérifier les Paramètres de Déploiement Vercel

## 📋 Checklist Complète

### 1. Vérifier la Connexion Git

1. Allez sur Vercel → votre projet → **Settings** → **Git**
2. Vérifiez que :
   - ✅ **Connected Repository** : `ElroySTBN/desk-NEW`
   - ✅ **Production Branch** : `main`
   - ✅ **Status** : **Connected** (coche verte)

### 2. Vérifier les Déploiements Automatiques

1. Allez sur Vercel → votre projet → **Settings** → **Git**
2. Cherchez la section **"Automatic deployments"** ou **"Deployment settings"**
3. Vérifiez que :
   - ✅ **"Automatic deployments from Git"** est activé (toggle ON)
   - ✅ La branche `main` est configurée pour les déploiements automatiques

**Si vous ne voyez pas cette option :**
- Vérifiez que le dépôt est bien connecté
- Vérifiez que vous êtes sur le bon projet Vercel

### 3. Vérifier les Branches Surveillées

1. Allez sur Vercel → votre projet → **Settings** → **Git**
2. Cherchez la section **"Production Branch"** ou **"Branches"**
3. Vérifiez que :
   - ✅ **Production Branch** : `main`
   - ✅ Les autres branches peuvent être configurées pour Preview deployments

### 4. Vérifier les Variables d'Environnement

1. Allez sur Vercel → votre projet → **Settings** → **Environment Variables**
2. Vérifiez que toutes les variables sont présentes :
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `TELEGRAM_BOT_TOKEN`
   - ✅ `TELEGRAM_CHAT_ID`
   - ✅ `RESEND_API_KEY`
3. Vérifiez que chaque variable est active pour **Production**

### 5. Vérifier les Paramètres de Build

1. Allez sur Vercel → votre projet → **Settings** → **General**
2. Vérifiez que :
   - ✅ **Framework Preset** : `Vite`
   - ✅ **Build Command** : `npm run build`
   - ✅ **Output Directory** : `dist`
   - ✅ **Install Command** : `npm install`
   - ✅ **Root Directory** : `./` (vide ou `./`)

### 6. Vérifier les Déploiements Récents

1. Allez sur Vercel → votre projet → **Deployments**
2. Vérifiez les déploiements récents :
   - ✅ Y a-t-il des déploiements récents ?
   - ✅ Quel est leur statut (Ready, Building, Error) ?
   - ✅ Y a-t-il des déploiements déclenchés par des pushes GitHub ?

---

## 🎯 Paramètres à Vérifier Spécifiquement

### Production Branch

**Doit être :** `main`

**Comment vérifier :**
1. Vercel → **Settings** → **Git**
2. Vérifiez que **Production Branch** est `main`
3. Si ce n'est pas le cas, changez-le et sauvegardez

### Automatic Deployments

**Doit être :** Activé (ON)

**Comment vérifier :**
1. Vercel → **Settings** → **Git**
2. Cherchez **"Automatic deployments from Git"**
3. Le toggle doit être **ON** (vert)
4. Si ce n'est pas le cas, activez-le

### Git Repository

**Doit être :** `ElroySTBN/desk-NEW`

**Comment vérifier :**
1. Vercel → **Settings** → **Git**
2. Vérifiez que le dépôt est bien `ElroySTBN/desk-NEW`
3. Si ce n'est pas le cas, reconnectez-le

---

## 🔍 Vérifications Avancées

### Vérifier les Logs de Déploiement

1. Allez sur Vercel → votre projet → **Deployments**
2. Cliquez sur un déploiement
3. Ouvrez l'onglet **"Build Logs"**
4. Vérifiez s'il y a des erreurs

### Vérifier les Événements GitHub

1. Allez sur GitHub : https://github.com/ElroySTBN/desk-NEW
2. Allez dans **Settings** → **Integrations** → **GitHub Apps**
3. Vérifiez que **Vercel** apparaît dans la liste
4. Cliquez sur **Vercel** pour voir les détails

### Vérifier les Permissions GitHub

1. Allez sur GitHub : https://github.com/settings/installations
2. Cliquez sur **Vercel**
3. Vérifiez que :
   - ✅ Le dépôt `desk-NEW` est dans la liste
   - ✅ Les permissions sont correctes

---

## ✅ Checklist Complète

- [ ] Le dépôt est bien connecté : `ElroySTBN/desk-NEW`
- [ ] La Production Branch est `main`
- [ ] Les déploiements automatiques sont activés
- [ ] Toutes les variables d'environnement sont configurées
- [ ] Les paramètres de build sont corrects
- [ ] L'intégration GitHub App est autorisée
- [ ] Le dépôt est dans les permissions de Vercel

---

## 🐛 Si un Paramètre est Incorrect

### Changer la Production Branch

1. Vercel → **Settings** → **Git**
2. Changez **Production Branch** en `main`
3. Sauvegardez

### Activer les Déploiements Automatiques

1. Vercel → **Settings** → **Git**
2. Activez **"Automatic deployments from Git"**
3. Sauvegardez

### Reconnecter le Dépôt

1. Vercel → **Settings** → **Git**
2. Déconnectez le dépôt
3. Reconnectez-le
4. Autorisez Vercel sur GitHub

---

## 📝 Notes

- ⚠️ **Tous les paramètres doivent être corrects** pour que les déploiements automatiques fonctionnent
- 🔄 **Parfois, il faut sauvegarder les paramètres** même s'ils semblent corrects
- ✅ **Un déploiement manuel initial** peut être nécessaire pour activer l'automatisation

