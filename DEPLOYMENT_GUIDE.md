# Guide de déploiement : Vercel et Supabase

Ce guide explique comment configurer votre application pour qu'elle fonctionne parfaitement en local et sur Vercel.

## Architecture

- **Frontend** : Déployé sur Vercel (automatique)
- **Backend** : Supabase (base de données cloud)
- **Développement local** : Utilise la même base Supabase que Vercel

> ⚠️ **Important** : Votre application locale et Vercel utilisent **la même base de données Supabase**. Les données créées en local apparaîtront sur Vercel et vice versa.

## Configuration initiale (UNE SEULE FOIS)

### 1. Supabase : Configurer la base de données

#### Étape 1 : Ouvrir le SQL Editor dans Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Cliquez sur **"New query"**

#### Étape 2 : Exécuter le script complet de configuration

1. Ouvrez le fichier `supabase/COMPLETE_SETUP.sql` dans votre éditeur
2. **Copiez TOUT le contenu** du fichier (Cmd+A, Cmd+C ou Ctrl+A, Ctrl+C)
3. **Collez** dans le SQL Editor de Supabase
4. Cliquez sur **"Run"** (ou appuyez sur Cmd+Enter / Ctrl+Enter)
5. Attendez que le script se termine (quelques secondes)
6. Vérifiez qu'il n'y a **pas d'erreurs** dans les résultats

#### Étape 3 : (Optionnel) Vérifier que tout est OK

1. Ouvrez le fichier `supabase/VERIFY_SETUP.sql`
2. **Copiez TOUT le contenu** du fichier
3. **Collez** dans un nouveau query dans le SQL Editor de Supabase
4. Cliquez sur **"Run"**
5. Vérifiez que tous les messages affichent ✅ (pas de ❌)

✅ **Félicitations !** Votre base de données est maintenant configurée.

### 2. Vercel : Configuration automatique

**RIEN À FAIRE** - Les déploiements sont automatiques !

Quand vous poussez du code sur GitHub :
- Vercel détecte automatiquement le changement
- Il redéploie votre application automatiquement (2-3 minutes)

#### Variables d'environnement Vercel

Les variables d'environnement sont déjà configurées dans Vercel. Si ce n'est pas le cas :

1. Allez sur [vercel.com](https://vercel.com) → votre projet
2. Cliquez sur **"Settings"** → **"Environment Variables"**
3. Vérifiez que ces variables existent :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `TELEGRAM_BOT_TOKEN` (optionnel)
   - `TELEGRAM_CHAT_ID` (optionnel)
   - `RESEND_API_KEY` (optionnel)

### 3. Développement local : Configuration

#### Étape 1 : Créer le fichier `.env.local`

1. Créez un fichier `.env.local` à la racine du projet (s'il n'existe pas déjà)
2. Ajoutez ces lignes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-anon-publique
```

> 💡 **Où trouver ces valeurs ?** : Supabase → Settings → API

#### Étape 2 : Installer les dépendances (si nécessaire)

```bash
npm install
```

#### Étape 3 : Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173` (ou un autre port affiché dans le terminal).

## Workflow de développement

### Développement local (rapide)

1. **Modifiez votre code** localement
2. **Testez** dans votre navigateur (recharge automatique)
3. **Commitez et poussez** sur GitHub quand vous êtes satisfait
4. Vercel **déploie automatiquement** (2-3 minutes)

### Déploiement sur Vercel

1. **Poussez votre code** sur GitHub :
   ```bash
   git add .
   git commit -m "Votre message"
   git push origin main
   ```

2. **Attendez 2-3 minutes** - Vercel déploie automatiquement

3. **Vérifiez** que tout fonctionne sur votre URL Vercel

## Résolution de problèmes

### Erreur : "Could not find the table 'public.gbp_report_templates'"

**Solution** : Vous n'avez pas exécuté le script `COMPLETE_SETUP.sql` dans Supabase. Suivez l'étape 2 de la section "Supabase : Configurer la base de données".

### Erreur : "column clients.date_anniversaire_abonnement does not exist"

**Solution** : Réexécutez le script `COMPLETE_SETUP.sql` dans Supabase. Il est idempotent (peut être exécuté plusieurs fois sans problème).

### Les données créées en local n'apparaissent pas sur Vercel

**Vérifications** :
1. Vérifiez que votre `.env.local` utilise les **mêmes valeurs** que Vercel
2. Vérifiez que vous êtes connecté avec le **même compte utilisateur** en local et sur Vercel
3. Vérifiez que les politiques RLS sont correctement configurées (le script `COMPLETE_SETUP.sql` les crée)

### Les données créées sur Vercel n'apparaissent pas en local

**Vérifications** :
1. Vérifiez que votre `.env.local` utilise les **mêmes valeurs** que Vercel
2. Vérifiez que vous êtes connecté avec le **même compte utilisateur** en local et sur Vercel
3. **Rechargez la page** dans votre navigateur local (Cmd+R ou F5)

### Redéploiement manuel sur Vercel

Si vous voulez redéployer manuellement :

1. Allez sur [vercel.com](https://vercel.com) → votre projet
2. Cliquez sur **"Deployments"**
3. Cliquez sur les **"..."** du dernier déploiement
4. Cliquez sur **"Redeploy"**

## Vérification rapide

Pour vérifier que tout fonctionne :

1. **En local** :
   - Créez un client → Devrait fonctionner sans erreur
   - Créez un template GBP → Devrait fonctionner sans erreur
   - Générez un rapport GBP → Devrait fonctionner sans erreur

2. **Sur Vercel** :
   - Allez sur votre URL Vercel
   - Connectez-vous avec le même compte
   - Vérifiez que vous voyez les mêmes données qu'en local

## Scripts utiles

### Vérifier l'état de la base de données

Exécutez `supabase/VERIFY_SETUP.sql` dans Supabase SQL Editor pour vérifier que toutes les tables et colonnes existent.

### Réinitialiser complètement la base de données

1. Exécutez `supabase/COMPLETE_SETUP.sql` dans Supabase SQL Editor
2. Le script est idempotent : il peut être exécuté plusieurs fois sans problème

## Support

Si vous rencontrez des problèmes :

1. Vérifiez que vous avez bien exécuté `COMPLETE_SETUP.sql` dans Supabase
2. Exécutez `VERIFY_SETUP.sql` pour vérifier l'état de la base
3. Vérifiez que vos variables d'environnement sont correctes (`.env.local` et Vercel)
4. Vérifiez les logs de Supabase (Dashboard → Logs → Postgres Logs)

## Résumé

- **Supabase** : Exécutez `COMPLETE_SETUP.sql` UNE SEULE FOIS → C'est fait !
- **Vercel** : RIEN À FAIRE → Déploiement automatique
- **Local** : Créez `.env.local` avec vos clés Supabase → `npm run dev`
- **Données** : Partagées entre local et Vercel (même base Supabase)

