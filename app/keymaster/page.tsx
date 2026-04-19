"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { encrypt } from '@/lib/crypto';
import { Key, Shield, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function KeyMaster() {
  const [provider, setProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!apiKey) return;
    const encrypted = encrypt(apiKey);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-400 flex items-center gap-3">
          <Shield /> KeyMaster Vault
        </h1>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Plus className="text-blue-400" /> Add New Key
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Provider</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all"
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
      </div>
    </div>
  );
}
