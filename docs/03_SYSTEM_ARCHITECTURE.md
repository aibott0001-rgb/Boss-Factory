# 03_SYSTEM_ARCHITECTURE.md

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
