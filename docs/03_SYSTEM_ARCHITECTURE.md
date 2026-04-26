# 🏛️ SYSTEM ARCHITECTURE (Cloud-Native)
### *100% Online, Serverless, Zero-Cost Infrastructure*

**Version:** 2.0 (Cloud-Native Edition)  
**Status:** 🟢 **ACTIVE**  
**Philosophy:** "No Local Hardware Required. Accessible from Any Device, Anywhere."

---

## 1. HIGH-LEVEL OVERVIEW
Boss Factory is now a **purely cloud-native application**. It runs entirely on serverless infrastructure, ensuring 24/7 availability without relying on any local machine (like your laptop or phone).

- **Frontend:** Hosted on Vercel (Global Edge Network).
- **Backend:** Serverless Functions (API Routes) on Vercel.
- **AI Engine:** Groq Cloud (Ultra-fast LPU Inference).
- **Database:** Supabase (Managed PostgreSQL).
- **Auth:** Supabase Auth (Secure, Managed).

---

## 2. TECHNOLOGY STACK

| Layer | Technology | Provider | Cost | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Hosting** | Next.js 14 (App Router) | Vercel | $0 | Global CDN, Serverless Functions |
| **AI Inference** | Llama 3.1 70B / Mixtral | Groq Cloud | $0 | Ultra-fast idea analysis (<100ms) |
| **Database** | PostgreSQL | Supabase | $0 | Relational data (Ideas, Keys, Users) |
| **Auth** | Supabase Auth | Supabase | $0 | Secure login (Email/Google) |
| **Storage** | Supabase Storage | Supabase | $0 | File uploads, Images |
| **CI/CD** | GitHub Actions | GitHub | $0 | Auto-deploy on push |
| **Domain** | .vercel.app | Vercel | $0 | Production URL |

---

## 3. DATA FLOW: NEURAL CONSOLE EXAMPLE

1.  **Input:** CEO types idea into Web UI (`/neural`).
2.  **Request:** Frontend sends `POST /api/analyze-idea` with idea text.
3.  **Processing:**
    *   Serverless Function receives request.
    *   Calls **Groq API** with prompt: *"Score this idea 0-100..."*
    *   Groq LPU returns JSON analysis in ~50ms.
4.  **Storage:** Function saves idea + analysis to **Supabase**.
5.  **Response:** Frontend displays score, tags, and advice instantly.

---

## 4. SECURITY MODEL

-   **Encryption:** AES-256 (Crypto-JS) for API keys before DB storage.
-   **Transport:** HTTPS/TLS 1.3 for all traffic.
-   **Access:** Row Level Security (RLS) on Supabase tables.
-   **Secrets:** Environment Variables stored in Vercel Dashboard (never in code).

---

## 5. SCALABILITY STRATEGY

-   **Vertical:** Auto-scales with Vercel/Groq free tiers.
-   **Horizontal:** Serverless functions scale to infinity on demand.
-   **Cost Control:** Hard limits set on API usage (Free Tier Caps).
-   **Fallback:** If Groq is down, queue requests in Supabase for retry.

---

## 6. DEPLOYMENT TOPOLOGY

```mermaid
graph TD
    User((👤 You)) -->|HTTPS| Vercel[Vercel Edge Network]
    Vercel -->|API Route| Groq[🧠 Groq Cloud AI]
    Vercel -->|Data| Supabase[(🗄️ Supabase DB)]
    Groq -->|JSON Result| Vercel
    Supabase -->|Returns Data| Vercel
    Vercel -->|UI Update| User
This architecture ensures zero dependency on local hardware, guaranteeing 24/7 global availability.
