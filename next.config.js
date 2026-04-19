/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure environment variables are available at build time if needed, 
  // but primarily we rely on runtime env for dynamic pages
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
  },
};
module.exports = nextConfig;
