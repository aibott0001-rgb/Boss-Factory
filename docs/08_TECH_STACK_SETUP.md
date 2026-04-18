# 08_TECH_STACK_SETUP.md

**Status:** 🟢 Defined
**Version:** 1.0 (Genesis)

## Prerequisites
- Node.js 20+, pnpm, Rust (for Tauri), Expo CLI.

## Installation Steps
1. `pnpm install` (Root)
2. `cd apps/web && pnpm dev`
3. `cd apps/mobile && pnpm start`
4. `cd apps/desktop && pnpm tauri dev`

## Environment Variables (.env)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `GOOGLE_GEMINI_KEY`
- `STRIPE_SECRET_KEY`
