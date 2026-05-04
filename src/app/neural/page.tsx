"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Brain, Sparkles, Send, Loader2, AlertCircle, CheckCircle, 
  Trash2, Edit2, Copy, ArrowUp, ArrowDown, Save, X 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Idea {
  id: string;
  user_id: string;
  idea_text: string;
  ai_score?: number;
  ai_verdict?: string;
  ai_category?: string;
  ai_tags?: any[];
  ai_reasoning?: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const init = async () => {
      const {  { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/neural');
        return;
      }

      setUser(user);
      await loadIdeas(user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const loadIdeas = async (userId: string) => {
    const { data, error } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setIdeas(data);
  };

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

      const { data, error } = await supabase.from('brain_dumps').insert([newIdea]).select().single();
      if (!error && data) {
        setIdeas([data, ...ideas]);
        setInput('');
      }
    } catch (err) {
      alert('Failed to analyze idea.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete?")) return;
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

  const handleDuplicate = async (idea: Idea) => {
    const duplicate = { ...idea, id: undefined, created_at: new Date().toISOString() } as Partial<Idea>;
    const { data, error } = await supabase.from('brain_dumps').insert([duplicate]).select().single();
    if (!error && data) setIdeas([data, ...ideas]);
  };

  const moveIdea = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === ideas.length - 1)) return;
    const newIdeas = [...ideas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newIdeas[index], newIdeas[targetIndex]] = [newIdeas[targetIndex], newIdeas[index]];
    setIdeas(newIdeas);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Neural Console</h1>
          <p className="text-slate-500">Turn thoughts into validated business ventures.</p>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your next big idea..." className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none h-32 p-4" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyze(); } }} />
            <div className="flex justify-between items-center px-4 pb-2">
              <span className="text-xs text-slate-400">{input.length} chars</span>
              <button onClick={handleAnalyze} disabled={analyzing || !input.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">
                {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} {analyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="text-blue-500" /> Your Ideas</h2>
          {ideas.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"><p className="text-slate-500">No ideas yet.</p></div>
          ) : (
            <div className="grid gap-4">
              {ideas.map((idea, index) => (
                <div key={idea.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      {idea.ai_score !== undefined && idea.ai_score !== null && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${(idea.ai_score || 0) >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>Score: {idea.ai_score}</div>
                      )}
                      {idea.ai_verdict && <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{idea.ai_verdict}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveIdea(index, 'up')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ArrowUp size={16}/></button>
                      <button onClick={() => moveIdea(index, 'down')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ArrowDown size={16}/></button>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                      {editingId === idea.id ? (
                        <>
                          <button onClick={() => saveEdit(idea.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded"><Save size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><X size={16}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(idea)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Edit2 size={16}/></button>
                          <button onClick={() => handleDuplicate(idea)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Copy size={16}/></button>
                          <button onClick={() => handleDelete(idea.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Trash2 size={16}/></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    {editingId === idea.id ? (
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3" rows={3} />
                    ) : (
                      <p className="text-lg leading-relaxed whitespace-pre-wrap">{idea.idea_text}</p>
                    )}
                    {idea.ai_reasoning && !editingId && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 flex gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-500" />
                        <span>{idea.ai_reasoning}</span>
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
