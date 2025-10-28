# 🚀 Guide de Configuration - RaiseMed OS

Ce guide vous aidera à configurer RaiseMed OS de zéro.

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit)
- Git installé

## 1️⃣ Configuration Supabase

### Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte (gratuit)
3. Créez un nouveau projet
4. Choisissez un nom, mot de passe et région

### Obtenir vos clés API

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Copiez :
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_PUBLISHABLE_KEY)

### Configurer les variables d'environnement

1. À la racine du projet, créez un fichier `.env`
2. Copiez le contenu de `.env.example`
3. Remplacez les valeurs par vos clés Supabase

```bash
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique
```

### Appliquer les migrations

Les migrations créent automatiquement toutes les tables nécessaires.

**Option 1 : Via Supabase CLI (Recommandé)**

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref votre-projet-id

# Pousser les migrations
supabase db push
```

**Option 2 : Manuellement via l'interface Supabase**

1. Allez dans **SQL Editor** dans votre projet Supabase
2. Copiez le contenu de chaque fichier dans `supabase/migrations/` dans l'ordre
3. Exécutez chaque script SQL

### Configurer le Storage (pour les documents clients)

1. Dans Supabase, allez dans **Storage**
2. Créez un nouveau bucket nommé `client-documents`
3. Configurez les politiques RLS :

```sql
-- Politique pour permettre l'upload
CREATE POLICY "Users can upload client documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre le téléchargement
CREATE POLICY "Users can download own client documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre la suppression
CREATE POLICY "Users can delete own client documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 2️⃣ Installation des dépendances

```bash
npm install
```

## 3️⃣ Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 4️⃣ Premier Connexion

1. Ouvrez l'application dans votre navigateur
2. Créez un compte avec votre email
3. Supabase enverra un email de confirmation (vérifiez vos spams)
4. Cliquez sur le lien de confirmation
5. Connectez-vous !

## ✨ Fonctionnalités Principales

### 📊 Dashboard
- Vue d'ensemble de vos clients actifs
- Revenu mensuel et total
- Notifications automatiques (renouvellements, paiements en retard)

### 👥 Gestion Clients
- CRUD complet des clients
- 7 onglets par client :
  - **Informations** : Détails du client
  - **Onboarding** : Checklist complète avec progression
  - **Tâches** : To-do lists personnalisées
  - **KPIs** : Résultats mensuels avec metrics personnalisables
  - **Factures** : Historique des factures du client
  - **Documents** : Stockage de fichiers (contrats, audits, etc.)
  - **Communications** : Timeline des interactions

### 💰 Facturation
- Génération automatique de numéros de facture (RMD-2025-001)
- Création de factures en 2 clics
- **Génération PDF automatique** avec template professionnel RaiseMed.IA
- Copier-coller de templates emails (facture, rappels J+7, J+15)
- Marquer comme payée
- Filtres avancés (client, statut, mois/année)

### 📝 Templates
- **Emails de facturation** : Nouvelle facture, Rappel J+7, Relance J+15
- **Emails d'onboarding** : Bienvenue client, Demande d'infos
- **Emails de reporting** : Rapport mensuel, Anniversaire d'abonnement
- **Emails de prospection** : Cold outreach, Follow-up
- **Template d'audit complet** : Structure professionnelle avec variables

### 🔔 Notifications Automatiques
- Renouvellements d'abonnement (7 jours avant)
- Factures impayées (après 15 jours)
- Rapports mensuels à envoyer

## 🎯 Workflow Recommandé

### Nouveau Client

1. **Créer le client** : Page Clients → Nouveau Client
2. **Onboarding** :
   - Onglet "Onboarding" → Cocher les étapes
   - Ajouter le lien Google Drive
   - Créer les tâches initiales dans l'onglet "Tâches"
3. **Première facture** : Onglet "Factures" → Nouvelle facture
4. **Template email** : Templates → Copier "Bienvenue Nouveau Client"

### Gestion Mensuelle

1. **Créer la facture** : Page Factures → Nouvelle Facture
2. **Télécharger le PDF** : Bouton Download dans la liste
3. **Copier le template email** : Bouton Mail → Template copié dans presse-papier
4. **Envoyer la facture** : Coller dans Gmail + Attacher PDF
5. **Remplir les KPIs** : Onglet "KPIs" du client → Sélectionner le mois
6. **Générer le rapport** : (À venir - génération PDF du rapport mensuel)

### Relances Paiement

1. **Vérifier les notifications** : Dashboard → Notifications
2. **Voir la facture** : Page Factures → Filtrer "En retard"
3. **Copier template J+7 ou J+15** : Page Templates
4. **Envoyer la relance** : Coller dans Gmail

## 🛠️ Personnalisation

### Modifier vos informations dans les factures PDF

Éditez le fichier : `src/lib/pdfGenerator.ts`

Remplacez :
- Votre nom
- Email
- Téléphone
- SIRET
- Informations bancaires (IBAN, BIC)

### Ajouter des templates emails

Éditez le fichier : `src/pages/Templates.tsx`

Ajoutez vos templates dans l'objet `emailTemplates`.

## 📦 Build pour Production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`.

## 🌐 Déploiement

### Sur Netlify

1. Connectez votre repo GitHub
2. Build command : `npm run build`
3. Publish directory : `dist`
4. Ajoutez vos variables d'environnement

### Sur Vercel

1. Importez votre projet
2. Ajoutez vos variables d'environnement
3. Déployez !

### Sur Ionos (votre hébergeur préféré)

1. Buildez localement : `npm run build`
2. Uploadez le contenu du dossier `dist/` via FTP
3. Configurez un fichier `.htaccess` pour le routing SPA :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🆘 Problèmes Fréquents

### "Invalid API credentials"
- Vérifiez que vos clés Supabase sont correctes dans `.env`
- Vérifiez que le fichier `.env` est à la racine du projet

### Les documents ne s'uploadent pas
- Vérifiez que le bucket `client-documents` existe dans Supabase Storage
- Vérifiez les politiques RLS du bucket

### Les notifications ne se génèrent pas
- Les notifications se génèrent automatiquement au chargement du Dashboard
- Vérifiez que vous avez des clients actifs avec dates de début

### Erreur "relation does not exist"
- Les migrations n'ont pas été appliquées
- Suivez la section "Appliquer les migrations"

## 📞 Support

Pour toute question ou problème :
- Vérifiez la documentation Supabase : [docs.supabase.com](https://docs.supabase.com)
- Consultez les logs dans la console du navigateur (F12)

---

**Bon scaling avec RaiseMed OS ! 🚀**

