"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { encrypt } from '@/lib/crypto';
import { Key, Shield, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function KeyMasterPage() {
  const [provider, setProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle');

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
      <h1 className="text-4xl font-bold mb-6 text-blue-400 flex items-center gap-2"><Shield/> KeyMaster Vault</h1>
      <div className="max-w-2xl bg-slate-900 p-6 rounded border border-slate-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="text-blue-400"/> Add New Key</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white">
              <option>Groq</option><option>Google Gemini</option><option>OpenAI</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono"/>
          </div>
          <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-bold">Encrypt & Save</button>
          {status === 'success' && <div className="flex items-center gap-2 text-green-400 bg-green-900/30 p-3 rounded"><CheckCircle size={18}/> Saved Successfully!</div>}
          {status === 'error' && <div className="flex items-center gap-2 text-red-400 bg-red-900/30 p-3 rounded"><AlertCircle size={18}/> Save Failed</div>}
        </div>
      </div>
      <div className="mt-8 max-w-2xl bg-slate-900 p-6 rounded border border-slate-800 text-center">
        <Shield className="w-16 h-16 text-blue-500/50 mx-auto mb-4"/>
        <h3 className="text-xl font-bold text-white mb-2">Military-Grade Encryption</h3>
        <p className="text-slate-400">Your keys are encrypted with AES-256 before saving to the database.</p>
      </div>
    </div>
  );
}
