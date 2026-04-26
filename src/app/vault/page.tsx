"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Rocket, DollarSign, Clock, Zap, Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Define the Template type
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  revenue_model?: string;
  difficulty?: string;
  estimated_setup?: string;
  projected_roi?: string;
  tech_stack?: any[];
}

export default function VaultGallery() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Deployment State
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [deployMessage, setDeployMessage] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    console.log("🚀 Fetching templates from Supabase...");
    const { data, error } = await supabase.from('templates').select('*');
    
    if (error) {
      console.error("❌ Supabase Error:", error);
    } else {
      console.log("✅ Templates loaded:", data?.length);
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleDeploy = async (template: Template) => {
    // 1. Strict Validation
    if (!template || !template.id || !template.name) {
      console.error("❌ Validation Failed:", template);
      alert("Error: Missing template details.");
      return;
    }

    setDeployingId(template.id);
    setDeployStatus('idle');
    setDeployMessage('🚀 Initializing deployment sequence...');

    try {
      // 2. Prepare Payload
      const payload = { template };
      console.log("📡 Sending Payload:", payload);

      const response = await fetch('/api/deploy-venture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📥 API Response:", result);

      // 3. Handle Success (Check for 'success' flag OR 'url')
      if (response.ok && (result.success || result.url || result.repoName)) {
        setDeployStatus('success');
        const strategy = result.strategy === 'github-actions' ? 'via GitHub Actions' : 'Direct Deploy';
        setDeployMessage(`✅ Success! ${result.message} (${strategy})`);
        
        // Open Repo/URL if available
        const targetUrl = result.url || `https://github.com/aibott0001-rgb/${result.repoName}`;
        if (targetUrl) {
          setTimeout(() => window.open(targetUrl, '_blank'), 1500);
        }
      } else {
        // 4. Handle API Error
        throw new Error(result.error || 'Deployment failed');
      }

    } catch (err: any) {
      console.error("💥 Deployment Error:", err);
      setDeployStatus('error');
      setDeployMessage(`❌ Error: ${err.message}`);
    } finally {
      setDeployingId(null);
      setTimeout(() => {
        setDeployStatus('idle');
        setDeployMessage('');
      }, 8000);
    }
  };

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            The Vault
          </h1>
          <p className="text-slate-400 text-lg">1,000+ Validated Money-Making Blueprints</p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-4 text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Search opportunities (e.g., 'SaaS', 'Crypto', 'AI')..." 
            className="w-full bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Notification */}
        {deployMessage && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-2xl border flex items-center gap-3 animate-fade-in-down ${
            deployStatus === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' :
            deployStatus === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' :
            'bg-blue-900/90 border-blue-500 text-blue-100'
          }`}>
            {deployStatus === 'success' ? <CheckCircle /> : deployStatus === 'error' ? <AlertCircle /> : <Loader2 className="animate-spin" />}
            <span className="font-medium">{deployMessage}</span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <p className="text-xl">No templates found matching "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((template) => (
              <div key={template.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 flex flex-col">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-500/20">
                    {template.category || 'General'}
                  </span>
                  <Zap className="text-yellow-500 fill-yellow-500/20" size={20} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-grow">
                  {template.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <DollarSign size={14} /> ROI
                    </div>
                    <div className="text-green-400 font-bold text-sm truncate">{template.projected_roi || 'Unknown'}</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Clock size={14} /> Setup
                    </div>
                    <div className="text-white font-bold text-sm truncate">{template.estimated_setup || 'Unknown'}</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleDeploy(template)}
                  disabled={deployingId === template.id}
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                    deployingId === template.id
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-600/30'
                  }`}
                >
                  {deployingId === template.id ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket size={20} /> Deploy Now
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
