"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Rocket, DollarSign, Clock, Zap, Search, Filter } from 'lucide-react';

export default function VaultGallery() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase.from('templates').select('*');
      if (data) setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          The Vault
        </h1>
        <p className="text-slate-400 mb-8">1,000+ Validated Money-Making Blueprints</p>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search opportunities..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full uppercase">{t.category || 'General'}</span>
                  <Zap className="text-yellow-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400">{t.name}</h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-2">{t.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><DollarSign size={14}/> ROI</div>
                    <div className="text-green-400 font-bold">{t.projected_roi || '$0'}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Clock size={14}/> Setup</div>
                    <div className="text-white font-bold">{t.estimated_setup || 'Unknown'}</div>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                  <Rocket size={18} /> Deploy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
