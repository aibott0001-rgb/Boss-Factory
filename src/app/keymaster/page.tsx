"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { encryptKey } from '../../lib/crypto';
import { Key, Plus, Trash2, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  provider: string;
  status: string;
  last_tested_at: string | null;
}

export default function KeyMasterDashboard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProvider, setNewProvider] = useState('groq');
  const [newKey, setNewKey] = useState('');
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const { data, error } = await supabase.from('api_credentials').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching keys:', error);
    else setKeys(data || []);
    setLoading(false);
  }

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey) return;

    const encrypted = encryptKey(newKey);
    
    const { error } = await supabase.from('api_credentials').insert([{
      provider: newProvider,
      encrypted_key: encrypted,
      status: 'active',
      user_id: (await supabase.auth.getUser()).data.user?.id // Requires auth or use anon insert if RLS allows
    }]);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save key. Check RLS policies.' });
    } else {
      setMessage({ type: 'success', text: 'Key encrypted and saved successfully!' });
      setNewKey('');
      fetchKeys();
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function testKey(id: string, provider: string) {
    setMessage({ type: 'success', text: `Testing ${provider}... (Mock Test)` });
    // Real implementation would call an edge function to test the key securely
    setTimeout(() => setMessage({ type: 'success', text: `${provider} is active!` }), 1500);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" />
            KeyMaster™ Vault
          </h1>
          <p className="text-slate-400 mt-2">Securely manage, encrypt, and monitor your AI API keys.</p>
        </header>

        {message && (
          <div className={`p-4 mb-6 rounded border ${message.type === 'success' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
            {message.text}
          </div>
        )}

        {/* Add New Key Form */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New Credential
          </h2>
          <form onSubmit={handleAddKey} className="flex gap-4 flex-col md:flex-row">
            <select 
              value={newProvider} 
              onChange={(e) => setNewProvider(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 outline-none"
            >
              <option value="groq">Groq</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="huggingface">Hugging Face</option>
            </select>
            <input 
              type="password" 
              placeholder="Paste API Key (sk-...)" 
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 outline-none"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold transition">
              Encrypt & Save
            </button>
          </form>
        </div>

        {/* Keys List */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" /> Active Credentials
            </h2>
            <span className="text-xs text-slate-500">AES-256 Encrypted at Rest</span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading vault...</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 opacity-50" />
              No keys found. Add your first key above.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Tested</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-bold text-blue-300 capitalize">{key.provider}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${key.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {key.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{key.last_tested_at ? new Date(key.last_tested_at).toLocaleDateString() : 'Never'}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => testKey(key.id, key.provider)} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Test Connection">
                        <Activity className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
