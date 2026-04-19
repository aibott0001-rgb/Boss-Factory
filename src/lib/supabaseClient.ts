import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fallback to empty strings to prevent build crash, 
  // but app will not work until env vars are set.
  console.warn('Missing Supabase Env Vars');
}

export const supabase = createClient(
  supabaseUrl || 'https://empty.supabase.co', 
  supabaseAnonKey || 'empty'
);
