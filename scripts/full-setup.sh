#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════╗
# ║                                                                      ║
# ║     🚀 SCRIPT COMPLET DE SETUP RAISEDESK                            ║
# ║                                                                      ║
# ║     Ce script configure TOUT automatiquement                        ║
# ║                                                                      ║
# ╚══════════════════════════════════════════════════════════════════════╝

set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 CONFIGURATION AUTOMATIQUE RAISEDESK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier Node.js
echo "📋 Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi
step "Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi
step "npm $(npm -v)"

echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --silent
step "Dépendances installées"

echo ""

# Vérifier le fichier .env
echo "🔐 Configuration de l'environnement..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        warning "Fichier .env manquant, copie depuis .env.example"
        cp .env.example .env
    else
        error "Fichier .env manquant et pas de .env.example"
        echo "Créez un fichier .env avec vos clés Supabase"
        exit 1
    fi
fi

# Lire les variables d'environnement
if [ -f ".env" ]; then
    source .env
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
        warning "Variables Supabase manquantes dans .env"
        echo "Configurez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY"
    else
        step "Variables d'environnement configurées"
    fi
fi

echo ""

# Instructions pour Supabase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🗄️  CONFIGURATION SUPABASE"
echo ""
echo "IMPORTANT : Exécutez ce script SQL dans Supabase Dashboard :"
echo ""
echo "   1. Ouvrez : https://supabase.com/dashboard"
echo "   2. Allez dans SQL Editor"
echo "   3. Ouvrez : scripts/complete-database.sql"
echo "   4. Copiez TOUT le contenu"
echo "   5. Collez et exécutez (RUN)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Avez-vous appliqué le script SQL ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    warning "Appliquez le script SQL d'abord !"
    echo ""
    echo "Puis réexécutez : ./scripts/full-setup.sh"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Générer les types
echo "🔧 Génération des types TypeScript..."

if command -v supabase &> /dev/null; then
    ./scripts/generate-types.sh
else
    warning "Supabase CLI non installé, skipping génération types"
    echo "Installez avec : npm install -g supabase"
    echo "Puis exécutez : ./scripts/generate-types.sh"
fi

echo ""

# Build de test
echo "🏗️  Test du build..."
if npm run build > /dev/null 2>&1; then
    step "Build réussi"
else
    error "Le build a échoué"
    exit 1
fi

echo ""

# Final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ CONFIGURATION TERMINÉE !${NC}"
echo ""
echo "Lancez l'app avec :"
echo "  npm run dev"
echo ""
echo "Ouvrez : http://localhost:8080"
echo ""

