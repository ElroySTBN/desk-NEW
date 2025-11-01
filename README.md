# 🚀 RaiseDesk - Plateforme de Gestion Client

Plateforme complète de gestion de clients pour agence de marketing digital et gestion Google Business Profile.

## 📋 Fonctionnalités

### ✅ Déjà Implémenté

- **Dashboard** : Vue d'ensemble, alertes automatiques, tâches urgentes
- **Clients** : Fiches complètes, Brand DNA, historique, KPIs
- **Onboarding** : 5 sections simplifiées, génération Brand DNA
- **Bibliothèque de Contenu** : Calendrier, création posts GBP
- **Facturation** : Création rapide en 3 clics
- **Notes Rapides** : Bouton flottant global
- **Système d'Avis** : Funnel personnalisé, QR codes, tracking

## 🚀 Démarrage Rapide

### 1. Prérequis

- Node.js 18+
- Compte Supabase (gratuit)
- Compte Vercel (pour déploiement)

### 2. Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd raisedesk-io

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase
```

### 3. Configuration Supabase

**Méthode automatique (Recommandée)** :
```bash
./scripts/full-setup.sh
```

**Méthode manuelle** :
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Obtenir les clés API (Settings → API)
3. Dans SQL Editor, exécuter : `scripts/complete-database.sql`
4. Générer les types : `./scripts/generate-types.sh`

### 4. Lancer en local

```bash
npm run dev
```

Ouvrir http://localhost:8080

## 🗄️ Base de Données

### Migrations SQL

**Script unique complet** : `scripts/complete-database.sql`

Ce fichier contient TOUTES les tables nécessaires en un seul script.
Exécutez-le directement dans Supabase SQL Editor.

Pour appliquer :
```bash
# Ouvrir le fichier
open scripts/complete-database.sql

# Copier TOUT le contenu
# Coller dans Supabase → SQL Editor → RUN
```

## 🚢 Déploiement Vercel

Le projet est configuré pour un déploiement automatique sur Vercel.

1. Connecter votre repo GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Chaque push sur `main` déclenche un déploiement automatique

## 📂 Structure

```
src/
├── components/          # Composants React
│   ├── client/         # Composants spécifiques clients
│   ├── dashboard/      # Dashboard & alertes
│   ├── invoices/       # Facturation
│   ├── library/        # Bibliothèque de contenu
│   ├── onboarding/     # Sections onboarding
│   ├── settings/       # Paramètres
│   └── ui/             # Composants UI (shadcn/ui)
├── integrations/
│   └── supabase/       # Client Supabase
├── lib/                # Utilitaires
├── pages/              # Pages principales
└── types/              # Types TypeScript
```

## 🔧 Développement

### Commandes disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build de production
npm run lint         # Linter le code
npm run preview      # Prévisualiser le build
```

### Stack Technique

- **Frontend** : React + TypeScript + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Vercel
- **Formulaires** : React Hook Form + Zod
- **PDF** : jsPDF
- **QR Codes** : qrcode

## 📝 Notes

- Les types Supabase sont auto-générés via CLI
- Les migrations doivent être appliquées dans l'ordre
- Le déploiement Vercel est automatique (GitHub webhook)
- Toutes les données sont stockées sur Supabase

## 🆘 Support

Pour toute question ou problème, vérifier :
1. Les logs Vercel (build errors)
2. Les logs Supabase (erreurs RLS)
3. Console navigateur (erreurs JS)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024
