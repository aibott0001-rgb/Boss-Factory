/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict static export to allow SSR/Dynamic pages
  output: 'standalone', 
  
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
  },
};

module.exports = nextConfig;
