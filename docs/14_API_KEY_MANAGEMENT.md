# 14_API_KEY_MANAGEMENT.md (KeyMaster)

**Status:** 🟢 Defined
**Version:** 1.0 (Genesis)

## 1. Objective
Provide a zero-maintenance, self-healing system for managing all external API credentials.

## 2. Architecture
- **Secure Storage:** AES-256 encryption at rest in Supabase.
- **Heartbeat Monitor:** Cron job tests every 5 mins (Ping/Models.list).
- **Smart Router:** Load balances across multiple keys; auto-failover on 401/429.

## 3. User Interface
- **List View:** Provider, Masked Key, Status (🟢/🔴), Quota Used.
- **Actions:** Add, Pause, Resume, Delete, Test Now.

## 4. Supported Providers
- **LLMs:** Groq, Gemini, OpenAI, Anthropic, Ollama.
- **Data:** Supabase, Pinecone.
- **Payments:** Stripe, PayPal.
