# 🐛 GUIDE COMPLET : VOIR LES ERREURS

## 📊 1. ERREURS DANS L'APPLICATION (JavaScript/React)

### 🌐 Dans le Navigateur (Local)

**Ouvrir la console de développement :**

```
Chrome/Edge :
- F12 ou Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- Onglet "Console"

Firefox :
- F12 ou Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- Onglet "Console"

Safari :
- Cmd+Option+C (Mac)
- Onglet "Console"
```

**Ce que vous verrez :**

```
✅ ERRORS en rouge → Erreurs JavaScript
✅ WARNINGS en jaune → Avertissements
✅ NETWORK → Requêtes HTTP échouées
✅ SOURCE → Fichier et ligne exacte
```

**Exemple d'erreur :**
```javascript
Uncaught Error: Cannot read property 'map' of undefined
    at FunnelSetup.tsx:45:12
    → Fichier : src/pages/FunnelSetup.tsx
    → Ligne : 45
    → Problème : Tentative de faire .map() sur undefined
```

### 🔗 Dans Vercel (Production)

**Voir les logs en temps réel :**

1. Aller sur : https://vercel.com/dashboard
2. Sélectionner votre projet
3. Onglet **"Logs"** en haut
4. Filtrer par :
   - **"Error"** → Erreurs uniquement
   - **"Function"** → Erreurs fonctions serverless
   - **"Deployment"** → Logs d'un déploiement spécifique

**Voir les logs d'un déploiement :**

1. Onglet **"Deployments"**
2. Cliquer sur un déploiement
3. Onglet **"Runtime Logs"** → Erreurs en production
4. Onglet **"Function Logs"** → Logs des fonctions

**Types d'erreurs courantes :**

```
❌ 500 Internal Server Error
   → Erreur côté serveur
   → Voir Runtime Logs

❌ 404 Not Found
   → Route manquante
   → Vérifier les routes dans App.tsx

❌ Failed to fetch
   → Problème de connexion Supabase
   → Vérifier les variables d'environnement

❌ Uncaught TypeError
   → Propriété undefined
   → Voir Source dans Console
```

---

## 🗄️ 2. ERREURS DANS SUPABASE (Base de données)

### 📊 Logs SQL (Migrations)

**Voir le résultat d'une migration :**

1. Aller sur : https://supabase.com/dashboard
2. Projet : **mnmvgtakjmboeubjtwhn**
3. SQL Editor (menu gauche)
4. Onglet **"History"** ou **"Logs"**
5. Voir les requêtes récentes

**Ce que vous cherchez :**

```
✅ SUCCESS → Migration appliquée
❌ ERROR → Migration échouée
   → Lire le message d'erreur
   → Copier-coller l'erreur
```

### 🔍 Vérifier les tables

**Voir si une table existe :**

1. Table Editor (menu gauche)
2. Voir toutes les tables
3. Chercher : `review_settings`, `review_funnel_config`, etc.

**Voir la structure d'une table :**

1. Table Editor
2. Cliquer sur une table
3. Onglet **"Columns"** → Colonnes
4. Onglet **"Policies"** → Politiques RLS

**Exemple de vérification :**

```sql
-- Dans SQL Editor, tester :
SELECT * FROM review_funnel_config LIMIT 1;

-- Si table n'existe pas :
ERROR: relation "review_funnel_config" does not exist

-- Si OK :
→ Aucune ligne ou données affichées ✅
```

### 🧪 Tester une requête

**Dans SQL Editor, tester :**

```sql
-- Tester l'accès à une table
SELECT COUNT(*) FROM review_settings;

-- Voir les politiques RLS
SELECT * FROM pg_policies 
WHERE tablename = 'review_settings';

-- Voir les colonnes d'une table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'review_settings';
```

---

## 🔧 3. ERREURS DE BUILD (Vercel)

### 📦 Build Logs

**Voir les erreurs de compilation :**

1. https://vercel.com/dashboard
2. Votre projet
3. Déploiement qui a échoué
4. Onglet **"Build Logs"**

**Erreurs courantes :**

```
❌ SyntaxError
   → Erreur de syntaxe JavaScript/TypeScript
   → Fichier et ligne indiqués

❌ Module not found
   → Import manquant
   → Vérifier les imports

❌ Type error
   → Erreur TypeScript
   → Vérifier les types

❌ Vite build failed
   → Erreur de build
   → Voir détails ci-dessus
```

### 🚀 Déployer manuellement

**Si le déploiement échoue automatiquement :**

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Voir les logs
vercel logs --follow
```

---

## 🐛 4. DÉBUGGER UN PROBLÈME

### Étape 1 : Localiser l'erreur

```
1. Ouvrir Console navigateur (F12)
2. Voir message d'erreur
3. Noter fichier et ligne
4. Cliquer sur le fichier (lien en bleu)
5. Voir le code source
```

### Étape 2 : Comprendre l'erreur

**Erreurs fréquentes :**

```javascript
// Undefined
Cannot read property 'X' of undefined
→ X est undefined
→ Vérifier si la donnée existe

// Null
Cannot read property 'X' of null
→ X est null
→ Vérifier les valeurs nulles

// Network
Failed to fetch
→ Problème connexion
→ Vérifier Supabase variables

// Promise
Unhandled promise rejection
→ Erreur non gérée
→ Vérifier les .catch()
```

### Étape 3 : Ajouter des logs

**Temporairement, ajouter :**

```javascript
console.log('DEBUG:', variable);
console.log('DEBUG:', data);
console.error('ERROR:', error);
```

**Voir dans Console :**

```
DEBUG: { user: {...} }
DEBUG: { config: {...} }
ERROR: Failed to fetch
```

### Étape 4 : Tester avec des données mockées

**Si l'erreur est liée à Supabase :**

```javascript
// Mock les données temporairement
const mockData = {
  id: 'test',
  name: 'Test',
  // ...
};

// Utiliser mockData au lieu de data réelle
console.log('Using mock:', mockData);
```

---

## 🔗 5. LIENS UTILES

### Console navigateur
- **Chrome DevTools** : https://developer.chrome.com/docs/devtools
- **Firefox DevTools** : https://firefox-source-docs.mozilla.org/devtools-user
- **Safari Web Inspector** : https://webkit.org/web-inspector

### Vercel
- **Dashboard** : https://vercel.com/dashboard
- **Logs** : https://vercel.com/dashboard/[project]/logs
- **Deployments** : https://vercel.com/dashboard/[project]/deployments
- **Docs** : https://vercel.com/docs

### Supabase
- **Dashboard** : https://supabase.com/dashboard
- **SQL Editor** : https://supabase.com/dashboard/project/[id]/sql
- **Table Editor** : https://supabase.com/dashboard/project/[id]/editor
- **Logs** : https://supabase.com/dashboard/project/[id]/logs
- **Docs** : https://supabase.com/docs

### PostgreSQL
- **Documentation** : https://www.postgresql.org/docs
- **SQL Reference** : https://www.postgresql.org/docs/current/sql.html

---

## ⚡ 6. COMMANDES RAPIDES

### Terminal

```bash
# Voir les logs Vite
npm run dev

# Voir les logs Vercel
vercel logs --follow

# Tester une connexion
curl https://votre-app.vercel.app

# Linter
npm run lint

# Build local
npm run build
```

### SQL (dans Supabase)

```sql
-- Voir toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Voir les dernières requêtes
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Rafraîchir le cache
NOTIFY pgrst, 'reload schema';
```

---

## 📖 7. FORMAT DES ERREURS

### Erreur Supabase

```
ERROR:  42601: syntax error at or near "NOT"
LINE 71: ADD CONSTRAINT IF NOT EXISTS ...
HINT: Use DROP ... CASCADE to drop the dependent objects too.
```

**Comprendre :**

- **ERROR** : Type d'erreur
- **42601** : Code d'erreur PostgreSQL
- **LINE 71** : Ligne du problème
- **HINT** : Suggestion de correction

### Erreur JavaScript

```
Uncaught TypeError: Cannot read property 'map' of undefined
    at FunnelSetup.tsx:45:12
    at Array.map (<anonymous>)
```

**Comprendre :**

- **Uncaught TypeError** : Type d'erreur
- **Cannot read property 'map'** : Tentative d'accès à une propriété undefined
- **FunnelSetup.tsx:45:12** : Fichier, ligne, colonne
- **Array.map** : Fonction appelée

### Erreur Vercel

```
Build Failed
✗ [plugin:vite:react-swc] Unexpected token
  98 |   };
      ^
Syntax Error
```

**Comprendre :**

- **Build Failed** : Déploiement échoué
- **[plugin:vite:react-swc]** : Outil qui a échoué
- **Unexpected token** : Token inattendu
- **^** : Position exacte
- **Syntax Error** : Erreur de syntaxe

---

## 💡 8. TIPS & TRICKS

### 🌐 Console navigateur

- **Clear console** : `Ctrl+L` ou icône 🚫
- **Filter** : Taper dans la barre de recherche
- **Preserve log** : Garder logs entre recharges
- **Network tab** : Voir requêtes HTTP
- **Sources tab** : Déboguer ligne par ligne

### 🗄️ SQL Editor

- **Auto-complete** : `Ctrl+Space`
- **Run** : `Ctrl+Enter`
- **Format SQL** : Menu "Format"
- **Save** : Sauvegarder requête favorite
- **History** : Voir requêtes précédentes

### 🚀 Vercel

- **Real-time logs** : `vercel logs --follow`
- **Inspect** : Inspecter un déploiement
- **Rollback** : Revenir version précédente
- **Preview** : Voir avant déploiement prod

---

## ❓ 9. BESOIN D'AIDE ?

**Si bloqué :**

1. **Copier l'erreur complète**
   - Depuis console navigateur
   - Depuis logs Vercel
   - Depuis Supabase

2. **Noter le contexte**
   - Quelle action déclenche l'erreur ?
   - Local ou production ?
   - Début ou après X minutes ?

3. **Vérifier les variables**
   - Environnement local : `.env`
   - Vercel : Settings → Environment Variables
   - Supabase : Settings → API

4. **Chercher la solution**
   - Google : `[erreur] [stack]`
   - Stack Overflow
   - Documentation officielle

---

## ✅ 10. CHECKLIST DEBUGGING

```
□ Erreur notée avec détails
□ Console navigateur vérifiée
□ Logs Vercel vérifiés
□ Logs Supabase vérifiés
□ Fichier et ligne identifiés
□ Variables d'environnement OK
□ Connexion Supabase OK
□ Build local réussit
□ Logs temporaires ajoutés
□ Erreur reproduite
□ Solution trouvée
```

