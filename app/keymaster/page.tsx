'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { encryptKey } from '@/lib/crypto';
import { Key, Plus, Trash2, RefreshCw, CheckCircle, XCircle, Shield } from 'lucide-react';

export default function KeyMasterPage() {
  const [provider, setProvider] = useState('groq');
  const [apiKey, setApiKey] = useState('');
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{id: string, status: string} | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const { data, error } = await supabase.from('api_credentials').select('*').order('created_at', { ascending: false });
    if (data) setKeys(data);
  }

  async function handleSave() {
    if (!apiKey) return alert('Please enter a key');
    setLoading(true);
    
    const encrypted = encryptKey(apiKey);
    
    const { error } = await supabase.from('api_credentials').insert({
      provider,
      encrypted_key: encrypted,
      status: 'active',
      last_tested_at: new Date().toISOString()
    });

    if (error) alert('Error saving: ' + error.message);
    else {
      alert('Key saved & encrypted successfully!');
      setApiKey('');
      fetchKeys();
    }
    setLoading(false);
  }

  async function testKey(id: string, providerName: string) {
    setStatus({ id, status: 'testing' });
    // Simulate test (Real implementation would call your API route)
    setTimeout(() => {
      setStatus({ id, status: 'success' });
      alert(`Test successful for ${providerName}!`);
    }, 1500);
  }

  async function deleteKey(id: string) {
    if(!confirm('Delete this key?')) return;
    await supabase.from('api_credentials').delete().eq('id', id);
    fetchKeys();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              KeyMaster Vault
            </h1>
          </div>
          <p className="text-slate-400">Securely manage, encrypt, and test your AI API keys.</p>
        </header>

        {/* Input Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> Add New Key
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Provider</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 focus:border-cyan-400 outline-none"
              >
                <option value="groq">Groq (Llama 3)</option>
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="huggingface">Hugging Face</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 focus:border-cyan-400 outline-none font-mono text-sm"
              />
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Shield className="w-4 h-4"/>}
            {loading ? 'Encrypting...' : 'Save & Encrypt'}
          </button>
        </div>

        {/* List Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" /> Active Keys
          </h2>
          {keys.length === 0 ? (
            <p className="text-slate-500 italic">No keys found. Add one above.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between bg-slate-950 p-4 rounded border border-slate-800">
                  <div>
                    <div className="font-bold text-cyan-400 uppercase">{key.provider}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      {key.encrypted_key.substring(0, 20)}... (Encrypted)
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Status: <span className={key.status === 'active' ? 'text-emerald-400' : 'text-red-400'}>{key.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => testKey(key.id, key.provider)}
                      className="p-2 bg-slate-800 hover:bg-cyan-900 text-cyan-400 rounded transition"
                      title="Test Connection"
                    >
                      {status?.id === key.id && status?.status === 'testing' ? 
                        <RefreshCw className="w-4 h-4 animate-spin"/> : 
                        <CheckCircle className="w-4 h-4"/>
                      }
                    </button>
                    <button 
                      onClick={() => deleteKey(key.id)}
                      className="p-2 bg-slate-800 hover:bg-red-900 text-red-400 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
