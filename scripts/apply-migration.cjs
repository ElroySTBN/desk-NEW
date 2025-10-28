#!/usr/bin/env node

/**
 * Script d'application automatique de la migration
 * Ajoute les champs fiscaux (SIRET, TVA, Adresse) à la table clients
 */

const https = require('https');

const SUPABASE_URL = 'https://qpbtmqgsnqnbkzxopaiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwYnRtcWdzbnFuYmt6eG9wYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzIzMTQsImV4cCI6MjA3Njk0ODMxNH0.eKUEg-BytmY3u9yNIkDmt5vTk8ZU5_2jYrj5jbCNt2k';

// Lire la clé SERVICE_ROLE depuis l'environnement ou utiliser ANON
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

console.log('\n🔧 Migration Base de Données - RaiseMed OS\n');
console.log('📝 Ajout des champs fiscaux à la table clients...\n');

const migrationSQL = `
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS siret TEXT,
  ADD COLUMN IF NOT EXISTS tva_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;
`;

// Tenter d'exécuter via l'API REST PostgREST
const executeQuery = (query) => {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    
    const data = JSON.stringify({ sql: query });
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          reject({ success: false, statusCode: res.statusCode, message: body });
        }
      });
    });

    req.on('error', (error) => {
      reject({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
};

// Méthode alternative : Vérifier si les colonnes existent déjà
const checkColumns = () => {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/clients?limit=1', SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (Array.isArray(data) && data.length > 0) {
            const hasNewColumns = 'siret' in data[0] && 'tva_number' in data[0];
            resolve(hasNewColumns);
          } else {
            // Pas de données, on ne peut pas vérifier
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
};

// Fonction principale
(async () => {
  try {
    console.log('🔍 Vérification des colonnes existantes...\n');
    
    const hasColumns = await checkColumns();
    
    if (hasColumns) {
      console.log('✅ Les colonnes sont déjà présentes dans la base de données !');
      console.log('\n📊 Colonnes disponibles :');
      console.log('   • siret');
      console.log('   • tva_number');
      console.log('   • billing_address');
      console.log('   • postal_code');
      console.log('   • city');
      console.log('\n🎉 Vous pouvez maintenant importer vos clients !\n');
      process.exit(0);
    }
    
    console.log('⚠️  Les colonnes ne sont pas encore présentes.\n');
    console.log('🚀 Tentative d\'application automatique de la migration...\n');
    
    await executeQuery(migrationSQL);
    
    console.log('✅ Migration appliquée avec succès !\n');
    console.log('📊 Colonnes ajoutées :');
    console.log('   • siret');
    console.log('   • tva_number');
    console.log('   • billing_address');
    console.log('   • postal_code');
    console.log('   • city');
    console.log('\n🎉 Vous pouvez maintenant importer vos clients !\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration automatique.\n');
    
    if (error.statusCode === 404) {
      console.log('⚠️  La fonction exec_sql n\'est pas disponible.\n');
    } else if (error.message) {
      console.log(`Détails : ${error.message}\n`);
    }
    
    console.log('📋 SOLUTION : Migration manuelle requise\n');
    console.log('Suivez ces étapes :\n');
    console.log('1. Allez sur : https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/editor');
    console.log('2. Connectez-vous à votre compte Supabase');
    console.log('3. Copiez et collez ce code SQL :\n');
    console.log('─────────────────────────────────────────────────────');
    console.log(migrationSQL.trim());
    console.log('─────────────────────────────────────────────────────\n');
    console.log('4. Cliquez sur "Run" pour exécuter');
    console.log('5. Une fois terminé, relancez ce script pour vérifier\n');
    
    process.exit(1);
  }
})();

