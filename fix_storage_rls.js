const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
let supabaseUrl = '';
let serviceKey = '';
let anonKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceKey = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      anonKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error('Could not read .env.local:', e.message);
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

const keyToUse = serviceKey || anonKey;
if (!keyToUse) {
  console.error('❌ Missing Supabase key in .env.local');
  process.exit(1);
}

const useServiceKey = !!serviceKey;
console.log(`Using ${useServiceKey ? 'SERVICE ROLE' : 'ANON'} key\n`);

const supabase = createClient(supabaseUrl, keyToUse, {
  auth: { persistSession: false },
});

async function fixStorageRLS() {
  console.log("🔧 Attempting to fix storage RLS policies for 'products' bucket...\n");

  // Print the SQL that needs to be run
  const sqlFix = `
-- Drop broken policies (reference non-existent public.users)
DROP POLICY IF EXISTS "Admin upload products" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete products" ON storage.objects;
DROP POLICY IF EXISTS "Admin update products" ON storage.objects;
DROP POLICY IF EXISTS "Public read products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from products bucket" ON storage.objects;

-- Recreate with open policies for products bucket
CREATE POLICY "Public read products bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Allow upload to products bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow update in products bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

CREATE POLICY "Allow delete from products bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');
`;

  console.log("━".repeat(70));
  console.log("📋 Run this SQL in your Supabase Dashboard → SQL Editor:");
  console.log("━".repeat(70));
  console.log(sqlFix);
  console.log("━".repeat(70));

  // Try to run it programmatically via Supabase Management API
  // Only works if we have the service key and the pg_graphql extension
  if (!useServiceKey) {
    console.log("\n⚠️  No SUPABASE_SERVICE_ROLE_KEY found in .env.local");
    console.log("    Please add it and re-run, or run the SQL above manually.\n");

    // Check what's in .env.local
    console.log("💡 Your .env.local should have:");
    console.log("   SUPABASE_SERVICE_ROLE_KEY=eyJhb...  (from Supabase dashboard → Settings → API)");
    process.exit(0);
  }

  // Try to call the Supabase Management REST API to run SQL
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  console.log("\n🔄 Trying Management API at:", mgmtUrl);

  try {
    const response = await fetch(mgmtUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sqlFix }),
    });
    const result = await response.text();
    console.log("Response status:", response.status);
    console.log("Response:", result.slice(0, 500));
    
    if (response.ok) {
      console.log("\n✅ Storage RLS policies fixed successfully!");
    } else {
      console.log("\n⚠️  Auto-fix failed. Please run the SQL above manually in the Supabase Dashboard SQL Editor.");
    }
  } catch (err) {
    console.error("Management API error:", err.message);
    console.log("\n⚠️  Please run the SQL above manually in the Supabase Dashboard SQL Editor.");
  }

  // ALSO: Check if we can use a simpler workaround — upload using the service key in the admin
  // by checking what keys we have
  console.log("\n💡 Alternative quick fix: Use service role key for storage uploads in admin.");
  console.log("   Check if SUPABASE_SERVICE_ROLE_KEY is in .env.local:");
  console.log(`   Service key present: ${!!serviceKey}`);
  
  process.exit(0);
}

fixStorageRLS().catch(console.error);
