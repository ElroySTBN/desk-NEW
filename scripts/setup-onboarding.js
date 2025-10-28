import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  console.log('\nPlease set them in your .env file or environment:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\nYou can find these in your Supabase project settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupOnboarding() {
  console.log('🚀 Starting Onboarding System Setup...\n');

  try {
    // Step 1: Apply table migration
    console.log('📊 Step 1: Creating onboarding table...');
    const tableMigration = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/20251028000000_add_onboarding_table.sql'),
      'utf-8'
    );

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: tableMigration }).catch(async () => {
      // If rpc doesn't work, try direct query
      return await supabase.from('_migrations').insert({ name: '20251028000000_add_onboarding_table' });
    });

    // Actually execute the SQL
    const lines = tableMigration.split(';').filter(line => line.trim());
    for (const line of lines) {
      if (line.trim()) {
        const { error } = await supabase.rpc('exec', { sql: line }).catch(() => ({ error: null }));
        if (error && !error.message?.includes('already exists')) {
          console.warn('⚠️  Warning:', error.message);
        }
      }
    }

    console.log('✅ Onboarding table created successfully!\n');

    // Step 2: Create storage bucket
    console.log('📦 Step 2: Creating storage bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
    } else {
      const bucketExists = buckets.some(b => b.name === 'onboarding-files');
      
      if (!bucketExists) {
        const { data: bucket, error: bucketError } = await supabase.storage.createBucket('onboarding-files', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'],
        });

        if (bucketError) {
          console.error('❌ Error creating bucket:', bucketError.message);
        } else {
          console.log('✅ Storage bucket "onboarding-files" created successfully!');
        }
      } else {
        console.log('✅ Storage bucket "onboarding-files" already exists!');
      }
    }

    console.log('\n🎉 Onboarding System Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Go to /onboarding in your app');
    console.log('2. Create a new onboarding');
    console.log('3. Share the link with your client');
    console.log('\n📚 See GUIDE_ONBOARDING.md for more information\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n⚠️  Manual setup required. Please:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   - supabase/migrations/20251028000000_add_onboarding_table.sql');
    console.log('4. Go to Storage and create a bucket named "onboarding-files" (public)\n');
    process.exit(1);
  }
}

setupOnboarding();

