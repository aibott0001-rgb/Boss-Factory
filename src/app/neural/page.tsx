"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Brain, Zap, Save, Trash2, Edit2, Copy, ChevronUp, ChevronDown, 
  Loader2, CheckCircle, AlertCircle, Plus, X, Sparkles, LogIn 
} from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Idea {
  id: string;
  idea_text: string;
  ai_score?: number;
  ai_verdict?: string;
  ai_category?: string;
  ai_tags?: any[];
  ai_reasoning?: string;
  status: string;
  created_at: string;
}

export default function NeuralConsole() {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Starts true to prevent "Guest" flash
  const [ideaText, setIdeaText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // 1. AUTH CHECK (Runs once on mount)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await loadIdeas(user.id);
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false); // Done loading, safe to render now
      }
    };
    checkAuth();
  }, []);

  // 2. LOAD IDEAS
  const loadIdeas = async (userId: string) => {
    const { data, error } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) setIdeas(data);
  };

  // 3. ANALYZE IDEA
  const handleAnalyze = async () => {
    if (!ideaText.trim() || !user) return;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaText }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      // Save to DB
      const { data: newIdea, error } = await supabase
        .from('brain_dumps')
        .insert([{
          user_id: user.id,
          idea_text: ideaText,
          ai_score: data.score,
          ai_verdict: data.verdict,
          ai_category: data.category,
          ai_tags: data.tags,
          ai_reasoning: data.reasoning,
          status: 'inbox'
        }])
        .select()
        .single();

      if (newIdea) {
        setIdeas([newIdea, ...ideas]);
        setIdeaText('');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // 4. CRUD ACTIONS
  const handleDelete = async (id: string) => {
    if(!confirm("Delete this idea?")) return;
    await supabase.from('brain_dumps').delete().eq('id', id);
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const handleDuplicate = async (idea: Idea) => {
    const { data } = await supabase
      .from('brain_dumps')
      .insert([{
        user_id: user.id,
        idea_text: idea.idea_text,
        ai_score: idea.ai_score,
        ai_verdict: idea.ai_verdict,
        status: 'inbox'
      }])
      .select()
      .single();
    
    if (data) setIdeas([data, ...ideas]);
  };

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.idea_text);
  };

  const saveEdit = async (id: string) => {
    await supabase.from('brain_dumps').update({ idea_text: editText }).eq('id', id);
    setIdeas(ideas.map(i => i.id === id ? { ...i, idea_text: editText } : i));
    setEditingId(null);
  };

  const moveIdea = async (index: number, direction: 'up' | 'down') => {
    const newIdeas = [...ideas];
    if (direction === 'up' && index > 0) {
      [newIdeas[index], newIdeas[index - 1]] = [newIdeas[index - 1], newIdeas[index]];
    } else if (direction === 'down' && index < newIdeas.length - 1) {
      [newIdeas[index], newIdeas[index + 1]] = [newIdeas[index + 1], newIdeas[index]];
    }
    setIdeas(newIdeas);
    // Note: Real DB re-ordering would require an 'order' column, this is visual for now
  };

  // --- RENDER ---

  // 1. LOADING STATE (Prevents "Guest" flash)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400 animate-pulse">Securing Neural Link...</p>
        </div>
      </div>
    );
  }

  // 2. GUEST STATE (Only shows if truly logged out)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <Brain className="mx-auto text-slate-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-slate-400 mb-6">Please log in to access your Neural Console and save ideas.</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN APP (User is logged in)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pt-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Neural Console
            </h1>
            <p className="text-slate-400 mt-1">Capture & Analyze Business Ideas</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-900 rounded-full text-green-400 text-sm font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">New Idea Input</label>
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder="Describe your next big venture..."
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !ideaText.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {analyzing ? 'AI Analyzing...' : 'Analyze & Save Idea'}
          </button>
        </div>

        {/* Ideas List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
            <Brain size={20} /> Your Ideas ({ideas.length})
          </h2>
          
          {ideas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No ideas yet. Start analyzing above!
            </div>
          ) : (
            ideas.map((idea, idx) => (
              <div key={idea.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/30 transition-colors group">
                
                {/* Top Bar: Score & Actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    {idea.ai_score && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        idea.ai_score >= 80 ? 'bg-green-900/30 text-green-400 border-green-900' :
                        idea.ai_score >= 50 ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900' :
                        'bg-red-900/30 text-red-400 border-red-900'
                      }`}>
                        Score: {idea.ai_score}
                      </span>
                    )}
                    {idea.ai_verdict && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-900">
                        {idea.ai_verdict}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveIdea(idx, 'up')} className="p-2 hover:bg-slate-800 rounded text-slate-400"><ChevronUp size={18}/></button>
                    <button onClick={() => moveIdea(idx, 'down')} className="p-2 hover:bg-slate-800 rounded text-slate-400"><ChevronDown size={18}/></button>
                    <button onClick={() => startEdit(idea)} className="p-2 hover:bg-blue-900/30 rounded text-blue-400"><Edit2 size={18}/></button>
                    <button onClick={() => handleDuplicate(idea)} className="p-2 hover:bg-purple-900/30 rounded text-purple-400"><Copy size={18}/></button>
                    <button onClick={() => handleDelete(idea.id)} className="p-2 hover:bg-red-900/30 rounded text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>

                {/* Content */}
                {editingId === idea.id ? (
                  <div className="space-y-2">
                    <textarea 
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(idea.id)} className="px-3 py-1 bg-green-600 rounded text-white text-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-700 rounded text-white text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{idea.idea_text}</p>
                )}

                {/* AI Reasoning */}
                {idea.ai_reasoning && (
                  <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-400 italic">
                    <strong className="text-blue-400 not-italic">AI Insight:</strong> {idea.ai_reasoning}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
