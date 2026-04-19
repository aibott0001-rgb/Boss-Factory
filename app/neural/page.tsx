"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NeuralPage() {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    const { data } = await supabase.from('brain_dumps').select('*').order('created_at', { ascending: false });
    if (data) setIdeas(data);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    await supabase.from('brain_dumps').insert([{ content: input, status: 'inbox', type: 'text' }]);
    setInput('');
    loadIdeas();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Neural Console</h1>
      <textarea 
        className="w-full h-32 bg-slate-900 border border-slate-800 rounded p-4 text-white mb-4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your idea..."
      />
      <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold">
        Capture Idea
      </button>
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-slate-400">Recent Ideas</h2>
        {ideas.map((idea: any) => (
          <div key={idea.id} className="bg-slate-900 border border-slate-800 p-4 rounded">
            <span className="text-xs text-blue-400 uppercase font-bold">{idea.status}</span>
            <p className="text-slate-200 mt-2 whitespace-pre-wrap">{idea.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
