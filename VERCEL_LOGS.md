# 🐛 GUIDE : VOIR LES LOGS VERCEL

## 📍 Où aller pour voir les logs

### 🌐 Via le Dashboard Web

1. **Accéder au Dashboard**
   - URL : https://vercel.com/dashboard
   - Se connecter avec votre compte

2. **Sélectionner le projet**
   - Cliquer sur **"raisedesk-production"**
   - (ou le nom de votre projet Vercel)

3. **Voir les déploiements**
   - Onglet **"Deployments"** (en haut)
   - Liste de tous les déploiements récents
   - Le dernier devrait être en cours ou terminé

4. **Accéder aux logs**
   - Cliquer sur le **déploiement** en question
   - Onglet **"Runtime Logs"** → Erreurs en production
   - Onglet **"Build Logs"** → Erreurs lors du build
   - Onglet **"Function Logs"** → Logs des fonctions serverless

### 💻 Via la ligne de commande

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter
vercel login

# Voir les logs du dernier déploiement
vercel logs

# Voir les logs d'un déploiement spécifique
vercel logs [deployment-url]

# Suivre les logs en temps réel
vercel logs --follow
```

## 🔍 Types d'erreurs à chercher

### Build Logs (erreurs de compilation)
- ❌ `SyntaxError` → Erreur de syntaxe JavaScript/TypeScript
- ❌ `Module not found` → Import manquant
- ❌ `Type error` → Erreur de type TypeScript
- ❌ `Vite build failed` → Erreur de build

### Runtime Logs (erreurs en production)
- ❌ `404 Not Found` → Route manquante
- ❌ `500 Internal Server Error` → Erreur serveur
- ❌ `Failed to fetch` → Problème de connexion Supabase
- ❌ `Uncaught TypeError` → Erreur JavaScript
- ❌ `Cannot read property` → Propriété undefined

### Function Logs (fonctions serverless)
- ❌ `Edge Function failed` → Erreur dans une fonction edge
- ❌ `Timeout` → Fonction trop longue
- ❌ `Memory limit exceeded` → Trop de mémoire utilisée

## 🐛 Comment déboguer

### 1️⃣ Identifier le problème
```
→ Regarder les logs Build Logs
→ Chercher les lignes en rouge
→ Lire le message d'erreur
```

### 2️⃣ Comprendre le contexte
```
→ Quel commit a causé l'erreur ?
→ Quel fichier est en cause ?
→ Quelle est la ligne exacte ?
```

### 3️⃣ Corriger localement
```
→ Reproduire l'erreur en local
→ Corriger le code
→ Tester en local
→ Push sur GitHub
→ Vercel redéploie automatiquement
```

## 📊 Exemple de logs

### ✅ Build réussi
```
> Running "vercel build"
> Detected framework: Vite
> Building for production...
> ✓ 1234 modules transformed
> ✓ Build completed in 12.34s
> ✓ Deploying to production...
```

### ❌ Build échoué
```
> Running "vercel build"
> Detected framework: Vite
> Building for production...
> × [plugin:vite:react-swc] Expected ',', got ';'
>   98 |     }
>   99 |   };
>      ^
> Syntax Error
```

## 🔗 Liens utiles

- **Dashboard** : https://vercel.com/dashboard
- **Documentation** : https://vercel.com/docs
- **Logs** : https://vercel.com/dashboard/[project]/logs
- **Déploiements** : https://vercel.com/dashboard/[project]/deployments

## ⚡ Commandes rapides

```bash
# Voir le statut du déploiement
vercel ls

# Voir les variables d'environnement
vercel env ls

# Redéployer manuellement
vercel --prod

# Voir les logs en temps réel
vercel logs --follow
```

## 💡 Tips

1. **Toujours vérifier Build Logs en premier**
2. **Les erreurs sont souvent en haut des logs**
3. **Copier-coller l'erreur pour la recherche**
4. **Vérifier que les variables d'environnement sont correctes**
5. **Tester localement avant de pousser**

