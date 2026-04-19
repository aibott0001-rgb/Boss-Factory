import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fallback to empty strings to prevent build crash, 
  // but app will fail at runtime if env vars are missing.
  // This allows the BUILD to pass so we can debug env vars in Vercel.
  console.warn("Warning: Supabase env vars missing during build.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
