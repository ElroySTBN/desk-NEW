# Configuration des variables d'environnement locales

## Problème

Les identifiants en local ne fonctionnent pas alors qu'ils fonctionnent sur Vercel.

## Solution

Vous devez créer un fichier `.env.local` à la racine du projet avec les mêmes variables que Vercel.

### Étape 1 : Récupérer les variables depuis Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Notez les valeurs de :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Étape 2 : Créer le fichier .env.local

1. À la racine du projet, créez un fichier nommé `.env.local`
2. Ajoutez ces lignes (remplacez les valeurs par celles de Vercel) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-anon-publique
```

### Étape 3 : Redémarrer le serveur

Après avoir créé/modifié `.env.local`, vous devez redémarrer le serveur :

1. Arrêtez le serveur (Ctrl+C dans le terminal)
2. Redémarrez-le : `npm run dev`

### Étape 4 : Vérifier

L'application locale utilisera maintenant les mêmes identifiants que Vercel.

## Structure du fichier .env.local

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important

- Le fichier `.env.local` est dans `.gitignore` et ne sera **pas** commité sur GitHub
- Ne partagez **jamais** ce fichier (il contient des clés secrètes)
- Utilisez **exactement** les mêmes valeurs que Vercel pour avoir les mêmes données

## Vérification rapide

Après avoir créé `.env.local` et redémarré le serveur :
1. Ouvrez http://localhost:8081
2. Connectez-vous avec les mêmes identifiants que sur Vercel
3. Vous devriez voir les mêmes données (clients, templates, etc.)

