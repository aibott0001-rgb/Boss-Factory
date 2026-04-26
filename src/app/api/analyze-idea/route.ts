import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Smart Model Fallback List (Ordered by Preference)
const MODEL_PRIORITY = [
  "llama-3.3-70b-versatile", // Current Latest & Greatest
  "llama-3.1-8b-instant",    // Fast Fallback
  "mixtral-8x7b-32768",      // Reliable Legacy
  "gemma2-9b-it"             // Ultimate Fallback
];

async function tryCompletion(messages: any[], temperature: number, max_tokens: number) {
  let lastError: any = null;

  for (const model of MODEL_PRIORITY) {
    try {
      console.log(`🤖 Attempting analysis with model: ${model}...`);
      
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens,
        response_format: { type: "json_object" }
      });

      console.log(`✅ Success with model: ${model}`);
      return { data: completion, modelUsed: model };
      
    } catch (error: any) {
      lastError = error;
      const msg = error?.message || "";
      
      // Only retry if the error is about the model being invalid/decommissioned
      if (msg.includes("decommissioned") || msg.includes("does not exist") || msg.includes("not found")) {
        console.warn(`⚠️ Model ${model} unavailable. Trying next...`);
        continue; 
      }
      
      // If it's a different error (auth, rate limit, json parse), stop immediately
      throw error;
    }
  }
  
  // If all models failed
  throw lastError;
}

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "No idea provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY missing");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const systemPrompt = "You are Boss Factory CFO. Analyze the business idea and return ONLY valid JSON: { score: number, category: string, tags: string[], verdict: 'GO' | 'NO GO', reasoning: string }";
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this idea: ${idea}` }
    ];

    // Execute Smart Retry Logic
    const { data: completion, modelUsed } = await tryCompletion(messages, 0.2, 500);

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");
    
    // Append metadata about which model worked
    analysis._meta = {
      model_used: modelUsed,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("💥 Critical API Error:", error);
    return NextResponse.json({ 
      error: "Analysis failed", 
      details: error.message,
      hint: "Check Groq API Key or Console Status"
    }, { status: 500 });
  }
}
