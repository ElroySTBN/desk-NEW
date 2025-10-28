#!/usr/bin/env node

/**
 * Script pour appliquer automatiquement les migrations d'onboarding sur Supabase
 * Usage: node scripts/apply-onboarding-migrations.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Charger les variables d'environnement depuis .env
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  const envLocalPath = path.join(__dirname, '../.env.local');
  
  let envFile = null;
  if (fs.existsSync(envLocalPath)) {
    envFile = envLocalPath;
  } else if (fs.existsSync(envPath)) {
    envFile = envPath;
  }

  if (envFile) {
    const envContent = fs.readFileSync(envFile, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log('\n❌ Erreur: Variables d\'environnement manquantes\n', 'red');
  log('Veuillez configurer dans votre fichier .env:', 'yellow');
  log('  VITE_SUPABASE_URL=votre_url_supabase', 'cyan');
  log('  VITE_SUPABASE_PUBLISHABLE_KEY=votre_publishable_key', 'cyan');
  log('\nVous pouvez les trouver dans: Supabase Dashboard > Settings > API\n', 'yellow');
  process.exit(1);
}

// Fonction pour faire une requête HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || body}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({});
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Exécuter une requête SQL via l'API Supabase
async function executeSql(sql) {
  const url = new URL(SUPABASE_URL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  };

  try {
    await makeRequest(options, JSON.stringify({ sql }));
  } catch (error) {
    // Essayer via la méthode alternative
    const altOptions = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };
    
    try {
      await makeRequest(altOptions, JSON.stringify({ query: sql }));
    } catch (altError) {
      // Si les deux méthodes échouent, c'est peut-être que la table existe déjà
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }
}

// Créer un bucket de stockage
async function createStorageBucket() {
  const url = new URL(SUPABASE_URL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: '/storage/v1/bucket',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  };

  const bucketData = JSON.stringify({
    name: 'onboarding-files',
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

  try {
    await makeRequest(options, bucketData);
  } catch (error) {
    if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
      throw error;
    }
  }
}

async function setup() {
  log('\n🚀 Démarrage de la configuration du système d\'onboarding...\n', 'bright');

  try {
    // Étape 1: Créer la table onboarding
    log('📊 Étape 1/3: Création de la table onboarding...', 'cyan');
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251028000000_add_onboarding_table.sql');
    const migration = fs.readFileSync(migrationPath, 'utf-8');
    
    // Séparer et exécuter chaque commande SQL
    const commands = migration
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      try {
        await executeSql(command + ';');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          log(`  ⚠️  Avertissement: ${error.message}`, 'yellow');
        }
      }
    }
    
    log('  ✅ Table créée avec succès!\n', 'green');

    // Étape 2: Créer le bucket de stockage
    log('📦 Étape 2/3: Configuration du stockage de fichiers...', 'cyan');
    
    try {
      await createStorageBucket();
      log('  ✅ Bucket "onboarding-files" créé!\n', 'green');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        log('  ✅ Bucket "onboarding-files" existe déjà!\n', 'green');
      } else {
        throw error;
      }
    }

    // Étape 3: Finalisation
    log('🎉 Étape 3/3: Finalisation...', 'cyan');
    log('  ✅ Configuration terminée!\n', 'green');

    log('━'.repeat(60), 'bright');
    log('\n✨ Système d\'onboarding configuré avec succès!\n', 'green');
    log('Prochaines étapes:', 'bright');
    log('  1. Démarrez votre application: npm run dev', 'cyan');
    log('  2. Allez sur /onboarding', 'cyan');
    log('  3. Créez un nouveau onboarding', 'cyan');
    log('  4. Partagez le lien avec votre client', 'cyan');
    log('\n📚 Consultez GUIDE_ONBOARDING.md pour plus d\'informations\n', 'yellow');
    log('━'.repeat(60), 'bright');
    log('');

  } catch (error) {
    log('\n❌ Erreur lors de la configuration:', 'red');
    log(`   ${error.message}\n`, 'red');
    log('⚠️  Configuration manuelle requise:', 'yellow');
    log('  1. Ouvrez votre dashboard Supabase', 'cyan');
    log('  2. Allez dans SQL Editor', 'cyan');
    log('  3. Copiez-collez le contenu de:', 'cyan');
    log('     supabase/migrations/20251028000000_add_onboarding_table.sql', 'cyan');
    log('  4. Dans Storage, créez un bucket "onboarding-files" (public)\n', 'cyan');
    log('\n💡 Ou utilisez l\'interface web:', 'yellow');
    log('   Ouvrez: scripts/setup-onboarding-manual.html dans votre navigateur\n', 'cyan');
    process.exit(1);
  }
}

setup();

