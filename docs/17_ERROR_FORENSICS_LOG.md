# 🚨 ERROR FORENSICS LOG (MASTER RECORD)
### *The Central Database of Failures, Fixes, and Lessons Learned*

**Status:** 🟢 **ACTIVE**  
**Last Updated:** $(date)  
**Purpose:** To track every error encountered during development, document the root cause, and store the solution for future auto-healing.

---

## 📖 HOW TO USE (For AI Agents & CEO)
1.  **Pre-Flight Check:** Before coding, scan this file for keywords related to your task (e.g., "Webpack", "Supabase", "Cache").
2.  **Automatic Entry:** The Guardian Script (`scripts/guardian.sh`) appends new entries here when builds fail.
3.  **Manual Resolution:** When an error is fixed, update the entry with:
    - **Resolution Status:** Fixed
    - **Fix Applied:** (Command or Code Snippet)
    - **Prevention:** (How to avoid recurrence)

---

## 📜 LOG ENTRIES (Chronological)

### [ID: ERR-001] Ghost Code / Stale Cache
- **Timestamp:** 2024-04-19 (Early Session)
- **Category:** Build System / Next.js Cache
- **Error Signature:** `SyntaxError: Unexpected token '}'` or `}, [input]);` appearing in build logs despite file being clean on disk.
- **Root Cause:** Next.js development server and `.next` folder held onto old compiled versions of files even after source code was updated. `pkill` alone was insufficient.
- **Resolution Status:** ✅ **FIXED**
- **Fix Applied:** 
  1. Kill all node processes: `pkill -9 -f "node"`
  2. Delete cache folders: `rm -rf .next node_modules/.cache`
  3. Verify file content: `grep -n "error_string" file.tsx` (Ensure it returns nothing)
  4. Rebuild: `npm run build`
- **Prevention:** Always clear `.next` folder when encountering syntax errors that don't match current file content.

### [ID: ERR-002] Crypto Module Import Mismatch
- **Timestamp:** 2024-04-19 (Mid Session)
- **Category:** Dependencies / Webpack
- **Error Signature:** `Module not found: Can't resolve 'crypto-js'` or `export 'encrypt' was not found`.
- **Root Cause:** 
  1. Package `crypto-js` was missing from `package.json`.
  2. Named exports (`import { encrypt }`) did not match CommonJS default export structure of the library.
- **Resolution Status:** ✅ **FIXED**
- **Fix Applied:** 
  1. Install package: `npm install crypto-js @types/crypto-js`
  2. Update `lib/crypto.ts` to use CommonJS require: `const CryptoJS = require('crypto-js');`
  3. Ensure explicit exports: `export const encrypt = ...`
- **Prevention:** Use `require()` for CommonJS libraries in Next.js Edge runtime or ensure `interopDefault` is handled in config.

### [ID: ERR-003] Static Generation vs. Dynamic Data
- **Timestamp:** 2024-04-19 (Late Session)
- **Category:** Next.js Rendering / Supabase
- **Error Signature:** `Error: Missing Supabase environment variables` during `npm run build` on GitHub Actions. `Export encountered errors on paths: /keymaster, /neural`.
- **Root Cause:** Next.js attempted to statically pre-render pages (`/keymaster`, `/neural`, `/vault`) at build time. However, Supabase credentials were not available in the build environment (GitHub Actions), causing the fetch to fail.
- **Resolution Status:** ✅ **FIXED**
- **Fix Applied:** 
  1. Add `export const dynamic = 'force-dynamic';` to the top of `app/keymaster/page.tsx`, `app/neural/page.tsx`, and `app/vault/page.tsx`.
  2. This forces Next.js to skip static generation and render these pages on-demand (server-side) at request time, where env vars are available.
- **Prevention:** Any page fetching data from external APIs (Supabase) at load time MUST be marked as dynamic or use `useEffect` (client-side) for data fetching.

### [ID: ERR-004] Path Alias Resolution Failure
- **Timestamp:** 2024-04-19 (Final Build)
- **Category:** TypeScript / Webpack
- **Error Signature:** `Module not found: Can't resolve '@/lib/supabaseClient'`
- **Root Cause:** The TypeScript path alias `@/*` was not correctly mapped in `tsconfig.json` for the production build environment, causing Webpack to look in the wrong directory.
- **Resolution Status:** ✅ **FIXED**
- **Fix Applied:** 
  1. Verified `tsconfig.json` contains: `"paths": { "@/*": ["./*"] }` inside `compilerOptions`.
  2. Ensured `lib` folder is in the project root, not nested inside `src` (unless `paths` points to `./src/*`).
- **Prevention:** Keep path aliases simple (`@/*` -> `./*`) and ensure folder structure matches the alias exactly.

### [ID: ERR-005] Vercel Deployment Token Error
- **Timestamp:** 2024-04-19 (CI/CD Setup)
- **Category:** GitHub Actions / Secrets
- **Error Signature:** `_ArgError: option requires argument: --token` or `VERCEL_TOKEN is missing!`
- **Root Cause:** GitHub Secret name mismatch (case sensitivity) or empty value. `VERCEL_TOKEN` vs `Vercel_Token`.
- **Resolution Status:** ✅ **FIXED**
- **Fix Applied:** 
  1. Renamed secret in GitHub Settings to exactly `VERCEL_TOKEN`.
  2. Regenerated token in Vercel Dashboard (Full Access).
  3. Added validation step in workflow: `if [ -z "$VERCEL_TOKEN" ]; then exit 1; fi`.
- **Prevention:** Always copy/paste secrets directly from password manager; never type manually. Check for trailing spaces.

### [ID: ERR-006] Vercel "Unexpected Error" on Deploy
- **Timestamp:** 2024-04-19 (Final Deploy)
- **Category:** Vercel Infrastructure
- **Error Signature:** `Build Completed... Uploading... Error: Unexpected error. Please try again later.`
- **Root Cause:** Race condition in Vercel's API when deploying large payloads or corrupt `.vercel` output directory from previous failed runs.
- **Resolution Status:** ✅ **FIXED**
- **Fix Applied:** 
  1. Added `rm -rf .vercel` to workflow before `vercel build`.
  2. Split deployment into distinct steps: `pull` -> `build` -> `deploy --prebuilt`.
  3. Ensured `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correctly set in GitHub Secrets.
- **Prevention:** Always clean `.vercel` folder in CI environments before building.

---

## 🛡️ AUTO-HEALING SCRIPT INTEGRATION
The `scripts/guardian.sh` automatically checks this file for error patterns. If a known error (e.g., "Missing Supabase environment variables") is detected, it will suggest the stored fix immediately.

**End of Forensics Log.**
