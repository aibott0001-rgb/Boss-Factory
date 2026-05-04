import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase to save results
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea, userId } = body;

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // 1. Initialize Groq (Runtime Check for Key)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ GROQ_API_KEY missing in Vercel Env Vars");
      return NextResponse.json({ error: "Server configuration error: Missing AI Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // 2. Call AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Updated to latest stable
      messages: [
        {
          role: "system",
          content: `You are the Boss Factory CFO. Analyze this business idea and return ONLY valid JSON.
          Format: { "score": number (0-100), "category": string, "tags": string[], "verdict": "GO" | "NO GO", "reasoning": string }`
        },
        { role: "user", content: `Analyze this idea: ${idea}` }
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const analysisText = completion.choices[0].message.content || "{}";
    const analysis = JSON.parse(analysisText);

    // 3. Save to Database (If User is Logged In)
    if (userId) {
      await supabase.from('brain_dumps').insert([{
        user_id: userId,
        idea_text: idea,
        ai_score: analysis.score,
        ai_verdict: analysis.verdict,
        ai_category: analysis.category,
        ai_tags: analysis.tags,
        ai_reasoning: analysis.reasoning,
        status: 'analyzed'
      }]);
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("💥 AI Analysis Error:", error);
    return NextResponse.json(
      { error: "Analysis failed: " + (error.message || "Unknown error") }, 
      { status: 500 }
    );
  }
}
