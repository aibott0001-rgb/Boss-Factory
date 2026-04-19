"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Rocket, DollarSign, Clock, Zap, Search } from 'lucide-react';

export default function VaultPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('templates').select('*');
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const filtered = templates.filter((t) => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">The Vault</h1>
      <input 
        className="w-full p-3 bg-slate-900 border border-slate-800 rounded mb-6 text-white"
        placeholder="Search templates..." 
        onChange={(e) => setSearch(e.target.value)} 
      />
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((t: any) => (
            <div key={t.id} className="bg-slate-900 p-6 rounded border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">{t.category || 'General'}</span>
                <Zap size={16} className="text-yellow-400"/>
              </div>
              <h3 className="text-xl font-bold mb-2">{t.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{t.description}</p>
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1"><DollarSign size={14}/> {t.projected_roi}</div>
                <div className="flex items-center gap-1"><Clock size={14}/> {t.estimated_setup}</div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
                <Rocket size={16}/> Deploy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
