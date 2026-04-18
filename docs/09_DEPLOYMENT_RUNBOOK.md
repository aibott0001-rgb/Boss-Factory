# 09_DEPLOYMENT_RUNBOOK.md

## Web (Vercel)
1. Push to `main` branch.
2. Vercel auto-deploys to `boss-factory.vercel.app`.
3. Run DB Migrations: `pnpm db:migrate`.

## Mobile (Stores)
1. `cd apps/mobile && eas build --platform ios`.
2. Submit to TestFlight / Play Console.

## Desktop (Binaries)
1. `cd apps/desktop && pnpm tauri build`.
2. Upload `.exe`, `.dmg`, `.deb` to GitHub Releases.

## Monitoring
- Check Sentry Dashboard for errors.
- Check UptimeRobot for availability.
