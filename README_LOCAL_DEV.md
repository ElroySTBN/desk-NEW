# Développement Local

Ce document explique comment travailler en local pour éviter les temps d'attente des déploiements Vercel.

## Avantages du développement local

- **Temps de réponse instantané** : Les modifications sont visibles immédiatement sans attendre le déploiement
- **Débogage plus facile** : Vous pouvez utiliser les outils de développement du navigateur et les logs console
- **Pas de limites de déploiement** : Vous pouvez tester autant que vous voulez sans épuiser les quotas Vercel

## Prérequis

- Node.js installé (version 18 ou supérieure)
- npm ou yarn installé
- Accès à votre base de données Supabase (les variables d'environnement sont déjà configurées)

## Démarrage du serveur de développement local

1. **Installer les dépendances** (si ce n'est pas déjà fait) :
   ```bash
   npm install
   ```

2. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Ouvrir l'application dans le navigateur** :
   - L'application sera disponible sur `http://localhost:5173` (ou un autre port si 5173 est occupé)
   - Vite affichera l'URL exacte dans le terminal

## Workflow recommandé

1. **Travailler en local** pour développer et tester
2. **Pousser sur GitHub** seulement quand une fonctionnalité est complète et testée
3. **Vercel déploiera automatiquement** depuis la branche `main`

## Commandes utiles

- `npm run dev` : Démarrer le serveur de développement
- `npm run build` : Construire l'application pour la production
- `npm run lint` : Vérifier le code avec ESLint

## Configuration Supabase

Les variables d'environnement Supabase sont déjà configurées dans `.env.local`. 
Assurez-vous que ce fichier existe et contient vos clés Supabase :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Notes importantes

- Les modifications en local n'affectent pas la version déployée sur Vercel
- Vous pouvez tester en local sans impacter les autres utilisateurs
- Les migrations Supabase doivent toujours être appliquées via le dashboard Supabase ou via la CLI Supabase

