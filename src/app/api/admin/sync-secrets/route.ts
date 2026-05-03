import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// Initialize Supabase Admin Client (Use Service Role Key if possible, or Anon if RLS allows)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Or use Service Role key in env
const supabase = createClient(supabaseUrl, supabaseKey);

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-fallback-key-change-me';

export async function POST(req: Request) {
  try {
    // 1. Parse Body Safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { secrets } = body;

    if (!secrets || !Array.isArray(secrets)) {
      return NextResponse.json({ success: false, error: 'Missing "secrets" array in payload' }, { status: 400 });
    }

    console.log(`🔐 Processing ${secrets.length} secrets...`);

    let syncedCount = 0;

    // 2. Process Each Secret
    for (const secret of secrets) {
      const { name, value, description, status } = secret;

      if (!name || !value) {
        console.warn(`⚠️ Skipping secret without name or value: ${name}`);
        continue;
      }

      // Encrypt Value
      const encryptedValue = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();

      // Upsert into DB
      const { error } = await supabase.from('system_secrets').upsert({
        name: name.trim(),
        value: encryptedValue, // Store encrypted
        description: description || '',
        status: status || 'active',
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'name' // Ensure 'name' is unique in DB schema
      });

      if (error) {
        console.error(`❌ DB Error for ${name}:`, error);
        // Continue trying others instead of failing all
      } else {
        syncedCount++;
        console.log(`✅ Synced: ${name}`);
      }
    }

    // 3. Mock Vercel Sync (Real implementation requires Vercel Token in Env)
    // In a real scenario, you would call the Vercel API here using a stored VERCEL_TOKEN
    console.log('🚀 Simulating Vercel Environment Sync...');

    return NextResponse.json({ 
      success: true, 
      message: 'Secrets updated successfully',
      synced_count: syncedCount 
    });

  } catch (error: any) {
    console.error('💥 Critical API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
