import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea, userId } = body;

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // 1. Check for Groq Key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ GROQ_API_KEY missing in environment variables");
      return NextResponse.json({ error: "Server configuration error: Missing AI Key" }, { status: 500 });
    }

    // 2. Call Groq AI
    const groq = new Groq({ apiKey });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert Venture Capitalist and Product Manager. 
          Analyze the following business idea. 
          Return ONLY a valid JSON object with no markdown formatting:
          {
            "score": number (0-100),
            "verdict": "GO" | "NO GO",
            "category": "SaaS" | "Content" | "E-commerce" | "Service",
            "tags": ["tag1", "tag2"],
            "reasoning": "Short explanation of why."
          }`
        },
        { role: "user", content: `Idea: ${idea}` }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const analysisText = completion.choices[0].message.content || "{}";
    const analysis = JSON.parse(analysisText);

    // 3. Save to Database (if user is logged in)
    let savedId = null;
    if (userId) {
      const { data, error } = await supabase
        .from('brain_dumps')
        .insert([{
          user_id: userId,
          idea_text: idea,
          ai_score: analysis.score,
          ai_verdict: analysis.verdict,
          ai_category: analysis.category,
          ai_tags: analysis.tags,
          ai_reasoning: analysis.reasoning,
          status: 'analyzed'
        }])
        .select()
        .single();
      
      if (!error && data) savedId = data.id;
    }

    return NextResponse.json({ 
      success: true, 
      analysis, 
      savedId 
    });

  } catch (error: any) {
    console.error("💥 AI Analysis Error:", error);
    return NextResponse.json({ 
      error: "Failed to analyze idea", 
      details: error.message 
    }, { status: 500 });
  }
}
