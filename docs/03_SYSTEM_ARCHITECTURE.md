# 03_SYSTEM_ARCHITECTURE.md

**Status:** 🟢 Defined
**Version:** 1.0 (Genesis)

## High-Level Diagram
[User Device] <-> [Cloudflare CDN] <-> [Next.js App] <-> [Supabase (DB/Auth/Vector)]
                                     |
                                     v
                               [AI Orchestrator]
                                     |
          +--------------------------+--------------------------+
          |                          |                          |
    [Groq/Llama]              [Gemini 1.5]              [Local Ollama]
    (Speed Layer)             (Brain Layer)             (Unlimited Layer)

## Module Isolation Strategy
- Each Venture runs in a isolated Docker container or Serverless Function.
- Shared Resources: DB (Row Level Security), Auth, Vector Store.
- Failure Domain: If Venture A crashes, Venture B remains unaffected.

## Tech Stack Layers
1. **Frontend:** Next.js 16, React 19, Tailwind CSS, Shadcn/UI.
2. **Mobile:** Expo (React Native).
3. **Desktop:** Tauri v2 (Rust).
4. **Backend:** Next.js Server Actions, Cloudflare Workers.
5. **Database:** Supabase (PostgreSQL + Vector).
6. **AI:** LangGraph, AutoGen, Custom Router.
