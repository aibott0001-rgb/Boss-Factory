"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Brain, Plus, Loader2 } from 'lucide-react';

export default function NeuralConsole() {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase.from('brain_dumps').select('*').order('created_at', { ascending: false });
      if (data) setIdeas(data);
    } catch (err) {
      console.error("Error loading ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    try {
      const { error } = await supabase.from('brain_dumps').insert([{ 
        content: input, 
        status: 'inbox',
        type: 'text'
      }]);
      if (!error) {
        setInput('');
        loadIdeas();
      } else {
        alert('Error saving: ' + error.message);
      }
    } catch (err) {
      alert('Failed to save idea.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-400 flex items-center gap-3">
          <Brain /> Neural Input Console
        </h1>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your idea here..."
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Capture Idea
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-400">Recent Ideas</h2>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : ideas.length === 0 ? (
            <p className="text-slate-600 italic">No ideas yet. Start typing!</p>
          ) : (
            ideas.map((idea) => (
              <div key={idea.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <span className="text-xs text-blue-400 uppercase font-bold">{idea.status}</span>
                <p className="text-slate-200 mt-2 whitespace-pre-wrap">{idea.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
