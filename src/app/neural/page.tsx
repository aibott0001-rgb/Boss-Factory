"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Brain, Plus, Trash2, Edit2, Copy, ArrowUp, ArrowDown, Save, X, Zap, Loader2, AlertCircle } from 'lucide-react';

// Initialize Client
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
  status: string;
  created_at: string;
}

export default function NeuralPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [input, setInput] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load Ideas on Mount (No Auth Check needed here, Middleware handles it)
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setLoading(true);
    // Fetch ideas for the current user (RLS ensures they only see their own)
    const { data, error } = await supabase
      .from('brain_dumps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error loading ideas:', error);
    else setIdeas(data || []);
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setAnalyzing(true);

    try {
      // 1. Call AI API
      const res = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: input }),
      });

      if (!res.ok) throw new Error('AI Analysis failed');
      
      const analysis = await res.json();

      // 2. Save to DB
      const { data: newIdea, error } = await supabase
        .from('brain_dumps')
        .insert([{
          idea_text: input,
          ai_score: analysis.score,
          ai_verdict: analysis.verdict,
          ai_category: analysis.category,
          ai_tags: analysis.tags,
          ai_reasoning: analysis.reasoning,
          status: 'analyzed'
        }])
        .select()
        .single();

      if (error) throw error;

      setIdeas([newIdea, ...ideas]);
      setInput('');
    } catch (err: any) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this idea?")) return;
    await supabase.from('brain_dumps').delete().eq('id', id);
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const handleDuplicate = async (idea: Idea) => {
    const { data } = await supabase.from('brain_dumps').insert([{
      idea_text: idea.idea_text + " (Copy)",
      status: 'inbox'
    }]).select().single();
    if(data) setIdeas([data, ...ideas]);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === ideas.length - 1)) return;
    
    const newIdeas = [...ideas];
    const temp = newIdeas[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    newIdeas[index] = newIdeas[swapIndex];
    newIdeas[swapIndex] = temp;
    
    setIdeas(newIdeas);
    // Optional: Update 'rank' field in DB here if you have a rank column
  };

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setEditText(idea.idea_text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from('brain_dumps').update({ idea_text: editText }).eq('id', editingId);
    setIdeas(ideas.map(i => i.id === editingId ? { ...i, idea_text: editText } : i));
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            Neural Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Capture, Analyze, and Rank your million-dollar ideas.</p>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your business idea here..."
            className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 transform hover:scale-105"
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Zap />}
              {analyzing ? 'Analyzing...' : 'Analyze Idea'}
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Your Ideas <span className="text-sm font-normal text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">{ideas.length}</span>
          </h2>

          {loading ? (
            <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-blue-500" size={40} /></div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Brain className="mx-auto mb-4 opacity-50" size={48} />
              <p>No ideas yet. Start by analyzing one above!</p>
            </div>
          ) : (
            ideas.map((idea, index) => (
              <div key={idea.id} className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                
                {/* Top Bar: Score & Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    {idea.ai_score && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        idea.ai_score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        idea.ai_score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        Score: {idea.ai_score}
                      </span>
                    )}
                    {idea.ai_verdict && (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {idea.ai_verdict}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMove(index, 'up')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="Move Up"><ArrowUp size={18} /></button>
                    <button onClick={() => handleMove(index, 'down')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="Move Down"><ArrowDown size={18} /></button>
                    <button onClick={() => startEdit(idea)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-500" title="Edit"><Edit2 size={18} /></button>
                    <button onClick={() => handleDuplicate(idea)} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-purple-500" title="Duplicate"><Copy size={18} /></button>
                    <button onClick={() => handleDelete(idea.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </div>

                {/* Content */}
                {editingId === idea.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-blue-500 rounded-lg outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm flex items-center gap-1"><Save size={14}/> Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-600 text-white rounded-md text-sm flex items-center gap-1"><X size={14}/> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{idea.idea_text}</p>
                )}

                {/* AI Insight Footer */}
                {idea.ai_reasoning && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 flex gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{idea.ai_reasoning}</span>
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
