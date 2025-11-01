# 🧪 Instructions de Test - Configuration Funnel

## ✅ CE QUI A ÉTÉ CORRIGÉ

J'ai supprimé l'utilisation de `useCallback` dans `FunnelSetup.tsx` et `FunnelContentFlow.tsx` qui causait une boucle infinie de chargement.

### Changements techniques :
- **FunnelSetup.tsx** : `loadData` est maintenant directement dans `useEffect`
- **FunnelContentFlow.tsx** : `loadConfig` est maintenant directement dans `useEffect`
- Dépendances de `useEffect` simplifiées pour éviter les re-renders infinis

## 📋 TEST À FAIRE MANUELLEMENT

### 1. Test local
1. Ouvrez http://localhost:8080
2. Connectez-vous si nécessaire
3. Allez dans **Entreprises** → cliquez sur une entreprise
4. Cliquez sur **"Configuration Funnel"** (ou "Campagne d'avis")
5. **✅ RÉSULTAT ATTENDU** : La page se charge correctement, SANS spinner infini

### 2. Vider le cache du navigateur
Si vous voyez encore des anciennes erreurs :
1. **Chrome/Edge** : `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
2. **Firefox** : `Cmd+Shift+R` (Mac) ou `Ctrl+F5` (Windows)
3. **Safari** : `Cmd+Option+R`

### 3. Vérifier la console du navigateur
1. Ouvrez DevTools (`F12` ou `Cmd+Option+I`)
2. Onglet "Console"
3. **✅ RÉSULTAT ATTENDU** : Aucune erreur rouge concernant `FunnelSetup` ou `FunnelContentFlow`

### 4. Test de sauvegarde
1. Sur la page "Configuration Funnel", modifiez quelques champs
2. Cliquez sur **"Suivant"** ou **"Enregistrer"**
3. **✅ RÉSULTAT ATTENDU** : Sauvegarde réussie, pas de spinner infini

### 5. Test du déploiement en ligne
Le code a été commité et pushé. Vercel devrait déployer automatiquement.
1. Attendez 1-2 minutes pour le déploiement Vercel
2. Allez sur votre URL Vercel
3. Répétez les tests 1-4

## 🐛 SI ÇA NE MARCHE TOUJOURS PAS

### Vérifier le code actuel
```bash
# Voir les dernières modifications
git log --oneline -5

# Voir les fichiers modifiés
git diff HEAD~1 src/pages/FunnelSetup.tsx
git diff HEAD~1 src/pages/FunnelContentFlow.tsx
```

### Vérifier le serveur local
```bash
# Voir les logs du serveur
tail -f logs.txt  # Si vous avez des logs

# Vérifier que le serveur tourne
curl http://localhost:8080
```

### Consulter les logs Vercel (si déployé)
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet `raisedesk-production`
3. Onglet "Deployments"
4. Cliquez sur le dernier déploiement
5. Onglet "Function Logs" ou "Build Logs"

### Consulter les logs Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez le projet `mnmvgtakjmboeubjtwhn`
3. Onglet "Logs" → "Postgres Logs" ou "API Logs"

## 📊 STATUS ATTENDU

- ✅ Build local : OK (vérifié avec `npm run build`)
- ✅ Pas d'erreurs de lint
- ✅ Code pushé sur GitHub
- ⏳ Déploiement Vercel : En cours (1-2 minutes)
- ⏳ Tests manuels : À faire

## 🔍 DÉBOGAGE AVANCÉ

### Erreur "Could not find the table 'review_funnel_config'"
➡️ Migration manquante : Exécutez `20251102000001_create_review_funnel_config.sql` dans Supabase SQL Editor

### Erreur "Could not find the column 'custom_url_slug'"
➡️ Migration manquante : Exécutez les migrations dans l'ordre depuis `MIGRATIONS_TO_APPLY.md`

### Page complètement blanche
➡️ Ouvrez la console du navigateur (`F12`) et regardez les erreurs JavaScript

### Spinner infini
➡️ Videz complètement le cache du navigateur (`Cmd+Shift+R`)

