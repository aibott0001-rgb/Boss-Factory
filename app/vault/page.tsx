"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Rocket, TrendingUp, Clock, DollarSign, Search, Filter, Zap } from 'lucide-react';

export default function VaultGallery() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase.from('templates').select('*');
    if (data) setTemplates(data);
  };

  const filtered = templates.filter(t => 
    (filter === 'All' || t.category === filter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-float">
        <h1 className="text-5xl font-black neon-text mb-4">The Vault</h1>
        <p className="text-slate-400 text-lg">1,000+ Validated Money-Making Blueprints</p>
      </div>

      {/* Controls */}
      <div className="glass-card rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 sticky top-4 z-50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search opportunities..." 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === cat 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((template) => (
          <div key={template.id} className="glass-card rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {template.category}
                </span>
                <Zap className="text-yellow-400" size={20} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{template.name}</h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2">{template.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <DollarSign size={14} /> ROI
                  </div>
                  <div className="text-green-400 font-bold">{template.projected_roi}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock size={14} /> Setup
                  </div>
                  <div className="text-white font-bold">{template.estimated_setup}</div>
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                <Rocket size={18} /> Start Making Money
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
