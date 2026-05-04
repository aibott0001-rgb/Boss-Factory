"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Brain, Sparkles, Send, Loader2, AlertCircle, CheckCircle, 
  Trash2, Edit2, Copy, ArrowUp, ArrowDown, Save, X, LogIn 
} from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define Types
interface Idea {
  id: string;
  user_id: string;
  idea_text: string;
  ai_score?: number;
  ai_verdict?: string;
  ai_category?: string;
  ai_tags?: any[];
  ai_reasoning?: string; // Fixed: Added missing property
  status?: string;
  created_at: string;
}

export default function NeuralConsole() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // 1. Auth & Load Data on Mount
  useEffect(() => {
    const init = async () => {
      // We trust the Middleware to have redirected us if not logged in.
      // We just try to get the user. If it fails silently, we show loading.

const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadIdeas(user.id);
      } 
      // If no user, we assume Middleware is redirecting us, so we do nothing here.
      
      setLoading(false);
    };
    init();
  }, [router]);

  // Load Ideas from DB
  const loadIdeas = async (userId: string) => {
    const { data, error } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setIdeas(data);
    }
  };

  // 2. Analyze Idea with AI
  const handleAnalyze = async () => {
    if (!input.trim() || !user) return;

    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: input }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysis = await response.json();

      // Save to DB
      const newIdea: Partial<Idea> = {
        user_id: user.id,
        idea_text: input,
        ai_score: analysis.score,
        ai_verdict: analysis.verdict,
        ai_category: analysis.category,
        ai_tags: analysis.tags,
        ai_reasoning: analysis.reasoning,
        status: 'inbox'
      };

      const { data, error } = await supabase
        .from('brain_dumps')
        .insert([newIdea])
        .select()
        .single();

      if (!error && data) {
        setIdeas([data, ...ideas]);
        setInput('');
      }
    } catch (err) {
      alert('Failed to analyze idea. Please try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // 3. CRUD Operations
  
  // Delete
  const handleDelete = async (id: string) => {
    if(!confirm("Delete this idea?")) return;
    const { error } = await supabase.from('brain_dumps').delete().eq('id', id);
    if (!error) {
      setIdeas(ideas.filter(i => i.id !== id));
    }
  };

  // Start Edit
  const startEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.idea_text);
  };

  // Save Edit
  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('brain_dumps')
      .update({ idea_text: editText })
      .eq('id', id);
    
    if (!error) {
      setIdeas(ideas.map(i => i.id === id ? { ...i, idea_text: editText } : i));
      setEditingId(null);
    }
  };

  // Duplicate
  const handleDuplicate = async (idea: Idea) => {
    const duplicate = { ...idea, id: undefined, created_at: new Date().toISOString() } as Partial<Idea>;
    const { data, error } = await supabase.from('brain_dumps').insert([duplicate]).select().single();
    if (!error && data) {
      setIdeas([data, ...ideas]);
    }
  };

  // Move (Simple Up/Down Swap)
  const moveIdea = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === ideas.length - 1)) return;

    const newIdeas = [...ideas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap in UI
    [newIdeas[index], newIdeas[targetIndex]] = [newIdeas[targetIndex], newIdeas[index]];
    setIdeas(newIdeas);

    // In a real app, you would update the 'sort_order' column in DB here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Neural Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Turn thoughts into validated business ventures.
          </p>
        </div>

        {/* Input Area */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your next big idea..."
              className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none h-32 p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
            />
            <div className="flex justify-between items-center px-4 pb-2">
              <span className="text-xs text-slate-400">
                {input.length} chars • Press Enter to analyze
              </span>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !input.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105"
              >
                {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {analyzing ? 'Analyzing...' : 'Analyze Idea'}
              </button>
            </div>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="text-blue-500" /> Your Ideas
            </h2>
            <span className="text-sm text-slate-500">{ideas.length} total</span>
          </div>

          {ideas.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Brain className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
              <p className="text-slate-500">No ideas yet. Start by typing above!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {ideas.map((idea, index) => (
                <div key={idea.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      {idea.ai_score !== null && idea.ai_score !== undefined && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          (idea.ai_score || 0) >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          (idea.ai_score || 0) >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          Score: {idea.ai_score}
                        </div>
                      )}
                      {idea.ai_verdict && (
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {idea.ai_verdict}
                        </span>
                      )}
                    </div>
                    
                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveIdea(index, 'up')} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Move Up"><ArrowUp size={16}/></button>
                      <button onClick={() => moveIdea(index, 'down')} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Move Down"><ArrowDown size={16}/></button>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                      {editingId === idea.id ? (
                        <>
                          <button onClick={() => saveEdit(idea.id)} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Save"><Save size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Cancel"><X size={16}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(idea)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Edit"><Edit2 size={16}/></button>
                          <button onClick={() => handleDuplicate(idea)} className="p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded" title="Duplicate"><Copy size={16}/></button>
                          <button onClick={() => handleDelete(idea.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete"><Trash2 size={16}/></button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {editingId === idea.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-lg leading-relaxed whitespace-pre-wrap">{idea.idea_text}</p>
                    )}

                    {/* AI Insight Footer */}
                    {idea.ai_reasoning && !editingId && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 flex gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-500" />
                        <span>{idea.ai_reasoning}</span>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {idea.ai_tags && idea.ai_tags.length > 0 && !editingId && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {idea.ai_tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
