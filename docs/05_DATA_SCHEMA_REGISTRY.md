# 05_DATA_SCHEMA_REGISTRY.md

**Status:** 🟢 Defined
**Version:** 1.0 (Genesis)

## Core Tables (Supabase)
- `users`: id, email, settings_json, api_keys (encrypted)
- `brain_dumps`: id, user_id, content_text, media_url, status (inbox/live), tags[]
- `ventures`: id, name, template_id, status, revenue_total, cost_total
- `agents`: id, name, role, current_task_id, logs_json
- `templates`: id, name, category, tech_stack, deploy_script_url
- `financial_logs`: id, venture_id, amount, type (income/expense), timestamp
- `api_credentials`: id, provider, encrypted_key, status, last_tested_at, quota_used

## External API Integrations (The Lake)
- **Finance:** CoinGecko (Crypto), Yahoo Finance (Stocks)
- **Media:** TMDB (Movies), Unsplash (Images)
- **Geo:** OpenStreetMap (Maps), OpenWeather (Weather)
- **AI:** Groq, Gemini, HuggingFace, Cloudflare
