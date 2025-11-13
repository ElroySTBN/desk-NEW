/**
 * Utilitaire pour améliorer les messages d'erreur de base de données
 * Aide à identifier rapidement les problèmes de colonnes ou tables manquantes
 */

interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}

/**
 * Améliore les messages d'erreur Supabase pour être plus explicites
 */
export function improveDatabaseError(error: any): string {
  const errorMessage = error?.message || String(error);
  
  // Erreur : colonne manquante
  if (
    errorMessage.includes('column') &&
    (errorMessage.includes('does not exist') || errorMessage.includes('n\'existe pas'))
  ) {
    const columnMatch = errorMessage.match(/column ["']?(\w+)["']?/i);
    const tableMatch = errorMessage.match(/relation ["']?(\w+)["']?/i) || 
                      errorMessage.match(/table ["']?(\w+)["']?/i);
    
    if (columnMatch && tableMatch) {
      const column = columnMatch[1];
      const table = tableMatch[1];
      return `La colonne "${column}" est manquante dans la table "${table}". Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor pour créer toutes les colonnes nécessaires. Consultez README_FIX_LOCAL.md pour les instructions.`;
    }
    
    if (columnMatch) {
      const column = columnMatch[1];
      return `La colonne "${column}" est manquante dans la base de données. Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor pour créer toutes les colonnes nécessaires. Consultez README_FIX_LOCAL.md pour les instructions.`;
    }
  }
  
  // Erreur : table manquante
  if (
    errorMessage.includes('relation') &&
    errorMessage.includes('does not exist') &&
    !errorMessage.includes('column')
  ) {
    const tableMatch = errorMessage.match(/relation ["']?(\w+)["']?/i) || 
                      errorMessage.match(/table ["']?(\w+)["']?/i) ||
                      errorMessage.match(/["']?(\w+)["']? does not exist/i);
    
    if (tableMatch) {
      const table = tableMatch[1];
      return `La table "${table}" est manquante dans la base de données. Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor pour créer toutes les tables nécessaires. Consultez README_FIX_LOCAL.md pour les instructions.`;
    }
    
    return `Une table est manquante dans la base de données. Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor pour créer toutes les tables nécessaires. Consultez README_FIX_LOCAL.md pour les instructions.`;
  }
  
  // Erreur : Could not find the table
  if (errorMessage.includes('Could not find the table')) {
    const tableMatch = errorMessage.match(/table ["']?([\w.]+)["']?/i);
    
    if (tableMatch) {
      const table = tableMatch[1].replace(/^public\./, '');
      return `La table "${table}" est manquante dans la base de données. Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor pour créer toutes les tables nécessaires. Consultez README_FIX_LOCAL.md pour les instructions.`;
    }
  }
  
  // Erreur : RLS (Row Level Security)
  if (
    errorMessage.includes('row-level security') ||
    errorMessage.includes('RLS') ||
    errorMessage.includes('new row violates row-level security policy')
  ) {
    return `Erreur de sécurité (RLS). Les politiques de sécurité de la base de données ne sont pas correctement configurées. Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor pour créer toutes les politiques RLS nécessaires. Consultez README_FIX_LOCAL.md pour les instructions.`;
  }
  
  // Erreur : permission denied
  if (
    errorMessage.includes('permission denied') ||
    errorMessage.includes('permission denied for')
  ) {
    return `Permission refusée. Vérifiez que les politiques RLS sont correctement configurées. Veuillez exécuter le script COMPLETE_SETUP.sql dans Supabase SQL Editor. Consultez README_FIX_LOCAL.md pour les instructions.`;
  }
  
  // Erreur générique avec détails
  if (error?.details || error?.hint) {
    let improved = errorMessage;
    if (error.details) {
      improved += `\n\nDétails : ${error.details}`;
    }
    if (error.hint) {
      improved += `\n\nIndice : ${error.hint}`;
    }
    return improved;
  }
  
  // Message d'erreur original si on ne peut pas l'améliorer
  return errorMessage;
}

/**
 * Affiche une erreur dans la console avec plus de détails pour le débogage
 */
export function logDatabaseError(error: any, context?: string) {
  console.error(`[DB Error${context ? ` - ${context}` : ''}]`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    error,
  });
}

