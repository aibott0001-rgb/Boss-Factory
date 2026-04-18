# 10_SECURITY_PROTOCOLS.md

## Access Control
- **IP Whitelisting:** Admin dashboard accessible ONLY from pre-approved IPs.
- **Biometric Auth:** Required for mobile app access.
- **Session Timeout:** Auto-logout after 15 mins inactivity.

## Data Protection
- **Encryption:** All sensitive data (API keys) encrypted at rest (AES-256).
- **RLS:** Row Level Security enabled on ALL Supabase tables.
- **Audit Logs:** Every action logged to `13_EXECUTION_LOG_AUDIT.md`.

## Emergency Protocols
- **Kill Switch:** Global button to pause all agents and deployments.
- **Backup:** Daily automated snapshots to Cloudflare R2.
