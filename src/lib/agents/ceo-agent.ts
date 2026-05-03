import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Initialize Clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runCEOAgent() {
  console.log('🤖 CEO Agent: Starting scan for high-potential ideas...');

  // 1. Fetch pending ideas with score > 80
  const { data: ideas, error } = await supabase
    .from('brain_dumps')
    .select('*')
    .eq('status', 'inbox')
    .gt('score', 80); // Only analyze high scorers

  if (error) {
    console.error('❌ CEO Agent: Failed to fetch ideas', error);
    return;
  }

  if (!ideas || ideas.length === 0) {
    console.log('✅ CEO Agent: No high-potential ideas found. Standing by.');
    return;
  }

  console.log(`🔍 CEO Agent: Found ${ideas.length} promising ideas.`);

  for (const idea of ideas) {
    try {
      // 2. Deep Market Analysis
      console.log(`🧠 Analyzing: "${idea.content}"`);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are the Boss Factory CEO. Decide if this idea (Score: ${idea.score}) should be built NOW.
            Return JSON: { "decision": "BUILD" | "WAIT", "reason": "string", "priority": "HIGH" | "MEDIUM" }`
          },
          { role: 'user', content: idea.content }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');

      if (analysis.decision === 'BUILD') {
        console.log(`🚀 CEO Agent: DECISION -> BUILD "${idea.name || 'New Venture'}"`);
        
        // 3. Update Status to 'approved'
        await supabase
          .from('brain_dumps')
          .update({ 
            status: 'approved', 
            analysis_notes: analysis.reason,
            priority: analysis.priority 
          })
          .eq('id', idea.id);

        // 4. Trigger Deployment (Simulated via API Call to our own endpoint)
        // In a real cron, we would call the deploy API here.
        console.log(`⚡ CEO Agent: Triggering deployment pipeline for ID: ${idea.id}`);
        
        // TODO: Call internal deploy function or webhook here
      } else {
        console.log(`⏸️ CEO Agent: DECISION -> WAIT. Reason: ${analysis.reason}`);
        await supabase
          .from('brain_dumps')
          .update({ status: 'archived', analysis_notes: analysis.reason })
          .eq('id', idea.id);
      }

    } catch (err) {
      console.error(`❌ CEO Agent: Error processing idea ${idea.id}`, err);
    }
  }

  console.log('✅ CEO Agent: Scan complete.');
}
