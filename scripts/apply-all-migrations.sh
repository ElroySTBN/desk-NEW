#!/bin/bash

# Script pour appliquer toutes les migrations Supabase
# Usage: ./scripts/apply-all-migrations.sh

set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        🗄️  APPLIQUER TOUTES LES MIGRATIONS SUPABASE                 ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo ""
    echo "Installer avec :"
    echo "  npm install -g supabase"
    echo ""
    echo "Puis réessayer ce script."
    exit 1
fi

# Vérifier si on est dans le bon répertoire
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Fichier supabase/config.toml non trouvé."
    echo "Assurez-vous d'être à la racine du projet."
    exit 1
fi

echo "✅ Supabase CLI détecté"
echo "✅ Fichier de config trouvé"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Liste des migrations à appliquer :"
echo ""

ls -1 supabase/migrations/*.sql | while read file; do
    echo "  - $(basename "$file")"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Appliquer toutes les migrations ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé."
    exit 0
fi

echo ""
echo "🔄 Application des migrations..."
echo ""

# Appliquer les migrations
supabase db push

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Migrations appliquées avec succès !"
echo ""
echo "Votre base de données Supabase est maintenant à jour."
echo ""

