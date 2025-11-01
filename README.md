# 🚀 RaiseDesk V2 - Plateforme de Gestion Client

Plateforme complète de gestion de clients pour agence de marketing digital et gestion Google Business Profile.

## 📋 Fonctionnalités

- **📊 Dashboard** : Vue d'ensemble, alertes automatiques, tâches urgentes, vue business
- **🏢 Organisations** : CRM moderne avec organisations (prospects/clients)
- **👤 Contacts** : Gestion contacts avec liaison aux organisations
- **📝 Onboarding** : 5 sections simplifiées, génération Brand DNA
- **🎨 Bibliothèque de Contenu** : Calendrier, création posts GBP
- **💰 Facturation** : Création rapide en 3 clics
- **📌 Notes Rapides** : Bouton flottant global
- **⭐ Système d'Avis** : Funnel personnalisé, QR codes, tracking employés

## 🚀 Installation

### 1. Prérequis

- Node.js 18+
- Compte Supabase (gratuit)
- Compte GitHub
- Compte Vercel (pour déploiement)

### 2. Clone du projet

```bash
git clone https://github.com/ElroySTBN/raisedesk-production.git
cd raisedesk-production
npm install
```

### 3. Configuration Supabase

1. **Créer un projet** sur [supabase.com](https://supabase.com)
2. **Obtenir les clés** : Settings → API
   - URL: `https://[project-id].supabase.co`
   - Anon key: (public)
3. **Exécuter le SQL** :
   - Supabase → SQL Editor
   - Copier tout le contenu de `SETUP_FINAL_V2.sql`
   - Coller → RUN
4. **Créer un utilisateur** :
   - Authentication → Users → Add user
   - Email: `admin@raisedesk.io`
   - Password: (votre mot de passe)
   - ✅ Auto Confirm User

### 4. Configuration locale

Créer un fichier `.env` :
```bash
VITE_SUPABASE_URL="https://[votre-project-id].supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="[votre-anon-key]"
```

### 5. Lancer en local

```bash
npm run dev
```

Ouvrir http://localhost:8080

## 🚢 Déploiement Vercel

### Option A : Nouveau projet Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. "Add New" → "Import Git Repository"
3. Sélectionner `raisedesk-production`
4. Configure Project :
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment Variables :
   ```
   VITE_SUPABASE_URL=https://[project-id].supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
   ```
6. Deploy !

### Option B : Mettre à jour un projet existant

1. Vercel Dashboard → Settings → Environment Variables
2. Mettre à jour avec les nouvelles clés Supabase
3. Deploy manuel ou push sur GitHub

### ✨ Déploiement automatique

Chaque `git push` sur `main` → déploiement automatique en 2-3 minutes !

## 🗄️ Base de Données

Le fichier `SETUP_FINAL_V2.sql` contient **TOUTES** les tables nécessaires :

- ✅ 20 tables complètes
- ✅ Tous les indexes
- ✅ Tous les triggers
- ✅ RLS policies complètes
- ✅ Permissions PostgREST
- ✅ Vue `contacts_with_organization`

**À exécuter UNE SEULE FOIS** dans Supabase SQL Editor.

## 📂 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── client/         # Client details, tabs
│   ├── dashboard/      # Dashboard & auto-alerts
│   ├── invoices/       # Facturation
│   ├── library/        # Bibliothèque de contenu
│   ├── onboarding/     # Sections onboarding
│   ├── settings/       # Paramètres entreprise
│   └── ui/             # Composants UI (shadcn/ui)
├── pages/              # Pages principales
│   ├── Organizations.tsx
│   ├── Contacts.tsx
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   └── ...
├── integrations/
│   └── supabase/       # Client & types Supabase
├── lib/                # Utilitaires (PDF, etc.)
└── types/              # Types TypeScript
```

## 🔧 Commandes

```bash
npm run dev      # Développement (localhost:8080)
npm run build    # Build production
npm run lint     # Linter
npm run preview  # Prévisualiser le build
```

## 🛠️ Stack Technique

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Déploiement**: Vercel (auto-deploy)
- **Formulaires**: React Hook Form + Zod
- **PDF**: jsPDF + html2canvas
- **QR Codes**: qrcode
- **Dates**: date-fns
- **State**: TanStack Query

## 🔒 Sécurité

- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Isolation des données par utilisateur
- ✅ Pas de service_role key côté client
- ✅ Validation Zod côté client
- ✅ HTTPS uniquement

## 🆘 Dépannage

### Erreur "schema cache"
- ✅ Les permissions PostgREST sont dans `SETUP_FINAL_V2.sql`
- ✅ Exécuter le script complet
- ✅ Attendre 30 secondes après exécution

### Erreur de connexion
- ✅ Vérifier `.env` et variables Vercel
- ✅ Clés correctes de Supabase
- ✅ Projet actif sur Supabase

### Types TypeScript manquants
- ✅ Types inclus dans `src/integrations/supabase/types.ts`
- ✅ Pas besoin de génération automatique

## 📝 Notes

- **Production**: Branche `main` sur Vercel
- **Preview**: Branches `dev`, `feature/*`
- **Base de données**: PostgresSQL sur Supabase
- **Backups**: Automatiques via Supabase

---

**Version** : 2.0.0  
**Dernière mise à jour** : Novembre 2024
