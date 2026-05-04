import { NextResponse } from 'next/server';
// Do NOT initialize Groq here at the top level!

export const dynamic = 'force-dynamic'; // Force runtime execution

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "No idea provided" }, { status: 400 });
    }

    // ✅ Initialize INSIDE the function so it runs at Runtime, not Build Time
    const Groq = (await import('groq-sdk')).default;
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("❌ GROQ_API_KEY is missing in Vercel Environment Variables");
      return NextResponse.json({ 
        error: "Server configuration error: Missing API Key. Please contact admin." 
      }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Boss Factory CFO. Analyze the business idea and return ONLY valid JSON: { score: number, category: string, tags: string[], verdict: 'GO' | 'NO GO', reasoning: string }"
        },
        {
          role: "user",
          content: `Analyze this idea: ${idea}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
