"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { encryptKey } from '@/lib/crypto';
import { Key, Shield, Plus, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function KeyMaster() {
  const [provider, setProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    const encrypted = encryptKey(apiKey);
    const { error } = await supabase.from('api_credentials').insert([{
      provider,
      encrypted_key: encrypted,
      name: `${provider} Key`,
      key_type: 'llm',
      status: 'active'
    }]);

    setStatus(error ? 'error' : 'success');
    if (!error) setApiKey('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-float">
        <h1 className="text-5xl font-black neon-text mb-4">KeyMaster Vault</h1>
        <p className="text-slate-400">Securely Manage Your AI Intelligence Keys</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="text-blue-400" /> Add New Key
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Provider</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Groq</option>
                <option>Google Gemini</option>
                <option>OpenAI</option>
                <option>Hugging Face</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02]"
            >
              Encrypt & Save
            </button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg">
                <CheckCircle size={18} /> Key Saved Securely!
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle size={18} /> Save Failed
              </div>
            )}
          </div>
        </div>

        {/* Status Panel */}
        <div className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center text-center">
          <Shield className="w-24 h-24 text-blue-500/50 mb-6 animate-pulse" />
          <h3 className="text-2xl font-bold text-white mb-2">Military-Grade Encryption</h3>
          <p className="text-slate-400 mb-6">Your keys are encrypted with AES-256 before leaving your browser.</p>
          <div className="w-full bg-slate-900/50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>System Status</span>
              <span className="text-green-400">Operational</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
