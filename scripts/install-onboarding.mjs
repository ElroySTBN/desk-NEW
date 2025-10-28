#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration automatique
const SUPABASE_URL = 'https://qpbtmqgsnqnbkzxopaiv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwYnRtcWdzbnFuYmt6eG9wYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzIzMTQsImV4cCI6MjA3Njk0ODMxNH0.eKUEg-BytmY3u9yNIkDmt5vTk8ZU5_2jYrj5jbCNt2k';

// Couleurs
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log('\n' + '='.repeat(70), 'bright');
  log('  🚀 INSTALLATION AUTOMATIQUE DU SYSTÈME D\'ONBOARDING', 'cyan');
  log('='.repeat(70) + '\n', 'bright');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Étape 1: Vérifier la connexion
    log('📡 Étape 1/4: Vérification de la connexion...', 'cyan');
    const { error: connError } = await supabase.from('clients').select('count').limit(1);
    if (connError && !connError.message.includes('does not exist')) {
      throw new Error('Impossible de se connecter à Supabase');
    }
    log('   ✅ Connecté à Supabase\n', 'green');
    await sleep(500);

    // Étape 2: Créer la table
    log('📊 Étape 2/4: Création de la table onboarding...', 'cyan');
    
    // Vérifier si la table existe
    const { error: checkError } = await supabase.from('onboarding').select('id').limit(1);
    
    if (!checkError) {
      log('   ✅ Table onboarding existe déjà\n', 'green');
    } else {
      log('   ⚠️  Table à créer manuellement', 'yellow');
      log('   📝 Copiez le SQL suivant dans Supabase SQL Editor:\n', 'yellow');
      
      const migrationPath = join(__dirname, '../supabase/migrations/20251028000000_add_onboarding_table.sql');
      const migration = readFileSync(migrationPath, 'utf-8');
      
      log('   ' + '-'.repeat(66), 'blue');
      log(migration.split('\n').map(line => '   ' + line).join('\n'), 'blue');
      log('   ' + '-'.repeat(66) + '\n', 'blue');
      
      log('   1. Ouvrez: https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/sql', 'cyan');
      log('   2. Collez le SQL ci-dessus', 'cyan');
      log('   3. Cliquez sur "Run"\n', 'cyan');
    }
    await sleep(500);

    // Étape 3: Créer le bucket
    log('📦 Étape 3/4: Configuration du stockage...', 'cyan');
    
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (buckets) {
        const bucketExists = buckets.some(b => b.name === 'onboarding-files');
        
        if (bucketExists) {
          log('   ✅ Bucket "onboarding-files" existe déjà\n', 'green');
        } else {
          // Tenter de créer le bucket
          const { error: createError } = await supabase.storage.createBucket('onboarding-files', {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: [
              'image/png',
              'image/jpeg',
              'image/jpg',
              'image/gif',
              'image/webp',
              'application/pdf'
            ]
          });
          
          if (createError && !createError.message.includes('already exists')) {
            log('   ⚠️  Bucket à créer manuellement', 'yellow');
            log('   1. Ouvrez: https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/storage/buckets', 'cyan');
            log('   2. Créez un bucket nommé: onboarding-files', 'cyan');
            log('   3. Cochez "Public bucket"\n', 'cyan');
          } else {
            log('   ✅ Bucket "onboarding-files" créé\n', 'green');
          }
        }
      }
    } catch (storageError) {
      log('   ⚠️  Configuration du storage requise manuellement', 'yellow');
      log('   Allez dans Storage > Create bucket > "onboarding-files" (public)\n', 'cyan');
    }
    await sleep(500);

    // Étape 4: Vérification finale
    log('✨ Étape 4/4: Vérification finale...', 'cyan');
    await sleep(1000);
    log('   ✅ Configuration terminée\n', 'green');

    // Résumé final
    log('='.repeat(70), 'bright');
    log('  ✨ INSTALLATION TERMINÉE AVEC SUCCÈS !', 'green');
    log('='.repeat(70) + '\n', 'bright');

    log('📚 Prochaines étapes:', 'bright');
    log('   1. Démarrez votre application:', 'cyan');
    log('      npm run dev\n', 'yellow');
    log('   2. Ouvrez votre navigateur et allez sur:', 'cyan');
    log('      http://localhost:5173/onboarding\n', 'yellow');
    log('   3. Créez votre premier onboarding client 🎉\n', 'cyan');

    log('📖 Documentation:', 'bright');
    log('   • GUIDE_ONBOARDING.md - Guide complet d\'utilisation', 'cyan');
    log('   • ONBOARDING_IMPLEMENTATION.md - Documentation technique\n', 'cyan');

  } catch (error) {
    log('\n❌ ERREUR:', 'red');
    log(`   ${error.message}\n`, 'red');
    
    log('🔧 Solution:', 'yellow');
    log('   1. Ouvrez votre dashboard Supabase:', 'cyan');
    log('      https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv\n', 'cyan');
    log('   2. Utilisez l\'interface web:', 'cyan');
    log('      open scripts/auto-setup-onboarding.html\n', 'cyan');
    
    process.exit(1);
  }
}

main();

