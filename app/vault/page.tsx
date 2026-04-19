"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Rocket, Clock, TrendingUp, Code, Search, Filter, Play } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  revenue_model: string;
  difficulty: string;
  estimated_setup: string;
  projected_roi: string;
  tech_stack: string[];
}

export default function VaultGallery() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase.from('templates').select('*');
    if (data) setTemplates(data);
    setLoading(false);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const handleDeploy = (template: Template) => {
    alert(`🚀 DEPLOYING: ${template.name}\n\nBuilder Agent activated.\n(Full automation coming in Phase 3)`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          The Vault
        </h1>
        <p className="text-slate-400">Validated Business Blueprints. One-Click Deployment.</p>
      </div>

      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="text-slate-500" size={20} />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                filterCategory === cat ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-500">Loading blueprints...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-600">No templates found.</div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
              <div className="p-6 border-b border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded uppercase">{template.category}</span>
                  <span className="text-xs text-green-400 flex items-center gap-1"><TrendingUp size={12} /> {template.projected_roi}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{template.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{template.description}</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock size={16} className="text-slate-500" />
                  <span>Setup: <span className="text-white">{template.estimated_setup}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Rocket size={16} className="text-slate-500" />
                  <span>Model: <span className="text-white">{template.revenue_model}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Code size={16} className="text-slate-500" />
                  <div className="flex flex-wrap gap-1">
                    {template.tech_stack.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
                <button onClick={() => handleDeploy(template)} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-semibold transition-all">
                  <Play size={18} fill="currentColor" /> Start Making Money
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
