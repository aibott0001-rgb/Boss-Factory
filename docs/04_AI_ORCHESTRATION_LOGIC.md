# 04_AI_ORCHESTRATION_LOGIC.md

## The Omni-Router Decision Tree
1. **Input Received:** Analyze task type (Code, Text, Image, Analysis).
2. **Context Size Check:** 
   - If >100k tokens → Route to **Gemini 1.5 Flash**.
   - If <10k tokens → Proceed to speed check.
3. **Speed Requirement:**
   - If Real-time (<1s) → Route to **Groq (Llama 3)**.
   - If Batch → Route to **Cloudflare Workers AI** or **HuggingFace**.
4. **Cost/Limit Check:**
   - If Provider Limit Reached → Failover to next available free tier.
5. **Execution:** Send prompt → Stream response → Cache result.

## Agent Roles & Prompts
- **CEO Agent:** "You are the strategic lead. Analyze trends and propose 3 high-probability ventures."
- **CFO Agent:** "You are the financial guardian. Monitor free tier limits. Reject any task that costs money without ROI > 10x."
- **Builder Agent:** "You are a senior full-stack engineer. Write clean, modular Next.js code. Always use TypeScript."
