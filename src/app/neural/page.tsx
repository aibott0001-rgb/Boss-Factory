"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Brain, Zap, Save, Trash2, Edit2, Copy, ArrowUp, ArrowDown, 
  Star, AlertCircle, CheckCircle, Loader2, LogIn, Plus, X 
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
  ai_tags?: any;
  ai_reasoning?: string;
  status: string;
  created_at: string;
}

export default function NeuralConsole() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form State
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Data State
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // 1. Auth & Load Data
  useEffect(() => {
    const init = async () => {
      const {  { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadIdeas(user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadIdeas = async (userId: string) => {
    const { data, error } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) setIdeas(data);
  };

  // 2. AI Analysis
  const handleAnalyze = async () => {
    if (!input.trim()) return alert("Please enter an idea!");
    if (!user) return router.push('/login');

    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: input }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const analysis = await res.json();

      // Save to DB
      const { data, error } = await supabase.from('brain_dumps').insert([{
        user_id: user.id,
        idea_text: input,
        ai_score: analysis.score,
        ai_verdict: analysis.verdict,
        ai_category: analysis.category,
        ai_tags: analysis.tags,
        ai_reasoning: analysis.reasoning,
        status: 'analyzed'
      }]).select();

      if (error) throw error;
      if (data) {
        setIdeas([data[0], ...ideas]);
        setInput('');
        alert("✅ Idea analyzed and saved!");
      }
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // 3. CRUD Operations
  const handleDelete = async (id: string) => {
    if(!confirm("Delete this idea?")) return;
    const { error } = await supabase.from('brain_dumps').delete().eq('id', id);
    if (!error) setIdeas(ideas.filter(i => i.id !== id));
  };

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.idea_text);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from('brain_dumps').update({ idea_text: editText }).eq('id', id);
    if (!error) {
      setIdeas(ideas.map(i => i.id === id ? { ...i, idea_text: editText } : i));
      setEditingId(null);
    }
  };

  const duplicateIdea = async (idea: Idea) => {
    const { error } = await supabase.from('brain_dumps').insert([{
      user_id: user.id,
      idea_text: idea.idea_text + " (Copy)",
      status: 'inbox'
    }]);
    if (!error) {
      const { data } = await supabase.from('brain_dumps').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (data) setIdeas([...data, ...ideas]);
    }
  };

  const moveIdea = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === ideas.length - 1)) return;
    
    const newIdeas = [...ideas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newIdeas[index], newIdeas[targetIndex]] = [newIdeas[targetIndex], newIdeas[index]];
    setIdeas(newIdeas);
    // Note: To persist order, you'd need an 'order_index' column in DB. 
    // For now, this reorders locally.
  };

  const rankIdea = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('brain_dumps').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setIdeas(ideas.map(i => i.id === id ? { ...i, status: newStatus } : i));
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /> Loading Neural Console...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Neural Console
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {user ? `Logged in as ${user.email}` : "Guest Mode (Login to save)"}
            </p>
          </div>
          {!user && (
            <button onClick={() => router.push('/login')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
              <LogIn size={18} /> Login
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-slate-500">New Idea Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your next big venture..."
            className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            disabled={!user}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!user || analyzing || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Zap className="fill-white" />}
              {analyzing ? 'Analyzing...' : 'Analyze & Save'}
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-purple-500" /> Your Ideas ({ideas.length})
          </h2>
          
          {ideas.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
              No ideas yet. Start thinking!
            </div>
          ) : (
            ideas.map((idea, idx) => (
              <div key={idea.id} className={`bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 shadow-sm transition-all ${
                idea.status === 'top-priority' ? 'border-green-500 ring-2 ring-green-500/20' :
                idea.status === 'archived' ? 'border-slate-300 dark:border-slate-700 opacity-70' :
                'border-blue-500'
              }`}>
                
                {/* Content */}
                {editingId === idea.id ? (
                  <div className="space-y-3">
                    <textarea 
                      value={editText} 
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(idea.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-600 text-white rounded text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        idea.ai_score && idea.ai_score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        idea.ai_score ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        Score: {idea.ai_score || 'N/A'}
                      </span>
                      {idea.ai_verdict && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{idea.ai_verdict}</span>
                      )}
                    </div>
                    <p className="text-lg mb-3 whitespace-pre-wrap">{idea.idea_text}</p>
                    
                    {idea.ai_reasoning && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <strong>AI Insight:</strong> {idea.ai_reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Toolbar */}
                {editingId !== idea.id && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button onClick={() => startEdit(idea)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500" title="Edit"><Edit2 size={18} /></button>
                    <button onClick={() => duplicateIdea(idea)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500" title="Duplicate"><Copy size={18} /></button>
                    
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    
                    <button onClick={() => moveIdea(idx, 'up')} disabled={idx===0} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 disabled:opacity-30"><ArrowUp size={18} /></button>
                    <button onClick={() => moveIdea(idx, 'down')} disabled={idx===ideas.length-1} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 disabled:opacity-30"><ArrowDown size={18} /></button>
                    
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    <button onClick={() => rankIdea(idea.id, idea.status === 'top-priority' ? 'analyzed' : 'top-priority')} 
                      className={`p-2 rounded flex items-center gap-1 text-sm font-bold ${
                        idea.status === 'top-priority' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-slate-500 hover:bg-slate-100'
                      }`}>
                      <Star size={18} className={idea.status === 'top-priority' ? 'fill-current' : ''} />
                      {idea.status === 'top-priority' ? 'Ranked' : 'Rank'}
                    </button>

                    <div className="flex-1"></div>

                    <button onClick={() => handleDelete(idea.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500"><Trash2 size={18} /></button>
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
