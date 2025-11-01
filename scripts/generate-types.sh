#!/bin/bash

# Script pour générer automatiquement les types Supabase TypeScript

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        🔧 GÉNÉRATION AUTOMATIQUE DES TYPES SUPABASE                 ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Lire le project ID depuis .env ou config.toml
if [ -f ".env" ]; then
  SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d '=' -f2)
  PROJECT_ID=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
elif [ -f "supabase/config.toml" ]; then
  PROJECT_ID=$(grep "project_id" supabase/config.toml | cut -d '"' -f2)
else
  echo "❌ Impossible de trouver le Project ID"
  echo "Créez un fichier .env ou supabase/config.toml"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Project ID non trouvé"
  echo "Vérifiez votre configuration"
  exit 1
fi

echo "✅ Project ID trouvé : $PROJECT_ID"
echo ""

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI n'est pas installé localement."
    echo ""
    echo "Téléchargez les types manuellement :"
    echo "  npx supabase gen types typescript --project-id $PROJECT_ID > src/integrations/supabase/types.ts"
    echo ""
    exit 1
fi

echo "🔄 Génération des types TypeScript..."
echo ""

# Générer les types
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/integrations/supabase/types.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Types générés avec succès !"
    echo "   Fichier : src/integrations/supabase/types.ts"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la génération des types"
    echo ""
    exit 1
fi

