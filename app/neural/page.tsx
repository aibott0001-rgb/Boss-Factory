"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Brain } from 'lucide-react';

export default function NeuralConsole() {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('brain_dumps').select('*').order('created_at', { ascending: false });
      if (data) setIdeas(data);
    };
    load();
  }, []);

  const submit = async () => {
    if (!input.trim()) return;
    await supabase.from('brain_dumps').insert([{ content: input, status: 'inbox', type: 'text' }]);
    setInput('');
    window.location.reload(); // Simple reload to refresh list for now
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-400"><Brain /> Neural Console</h1>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-4 text-white mb-4" />
      <button onClick={submit} className="px-6 py-2 bg-blue-600 text-white rounded">Capture Idea</button>
      <div className="mt-8 space-y-4">
        {ideas.map((i: any) => (
          <div key={i.id} className="p-4 border border-slate-800 rounded bg-slate-900">{i.content}</div>
        ))}
      </div>
    </div>
  );
}
