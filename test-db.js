const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔍 Testing connection to:", supabaseUrl);
  
  // Test 1: Ping Auth (Public endpoint)
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) console.warn("⚠️ Auth Session Warning:", authError.message);
  else console.log("✅ Auth Endpoint: Reachable");

  // Test 2: Try to query 'users' table (Should return empty or error if RLS blocks anon read without login)
  const { data: userData, error: userError } = await supabase.from('users').select('count', { count: 'exact', head: true });
  
  if (userError) {
    if (userError.code === 'PGRST301') {
      console.log("✅ Database Tables: Found (RLS correctly blocking anonymous read - Expected!)");
    } else {
      console.error("❌ Database Error:", userError.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Database Tables: Accessible");
  }

  console.log("\n🎉 SUCCESS: Boss Factory Brain is Connected!");
}

testConnection();
