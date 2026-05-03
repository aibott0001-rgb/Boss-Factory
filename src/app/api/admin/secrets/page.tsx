"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Plus, Trash2, RefreshCw, Save, AlertCircle, CheckCircle, Key } from 'lucide-react';

interface Secret {
  id: string;
  key_name: string;
  key_value: string; // Will be empty when fetched (security)
  category: string;
  is_active: boolean;
  last_rotated_at: string;
}

export default function SecretsManager() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState({ key_name: '', key_value: '', category: 'AI' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    const { data, error } = await supabase.from('dynamic_secrets').select('*').order('created_at', { ascending: false });
    if (data) setSecrets(data);
    setLoading(false);
  };

  const handleSave = async (secretToSave: Partial<Secret> | null = null) => {
    setStatus('saving');
    
    // If saving a new key from the form
    let payload = [];
    if (secretToSave) {
      payload = [secretToSave];
    } else if (newKey.key_name && newKey.key_value) {
      payload = [{ key_name: newKey.key_name, key_value: newKey.key_value, category: newKey.category }];
    } else {
      // Bulk save existing edited rows could go here, simplified for now to single add
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch('/api/admin/sync-secrets', {
        method: 'POST',
        body: JSON.stringify({ secrets: payload }),
      });
      const result = await res.json();

      if (result.success) {
        setStatus('success');
        setMessage(`✅ ${result.results[0].key_name} saved & synced to Vercel!`);
        setNewKey({ key_name: '', key_value: '', category: 'AI' }); // Reset form
        loadSecrets(); // Refresh list
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 5000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if(!confirm(`Delete ${name}? This cannot be undone.`)) return;
    await supabase.from('dynamic_secrets').delete().eq('id', id);
    loadSecrets();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-blue-500" />
          <h1 className="text-4xl font-bold">Self-Healing Key Vault</h1>
        </div>

        {/* Status Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            status === 'success' ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
          }`}>
            {status === 'success' ? <CheckCircle /> : <AlertCircle />} {message}
          </div>
        )}

        {/* Add New Key Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Add / Rotate Key</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              placeholder="Key Name (e.g. GROQ_API_KEY)" 
              className="bg-slate-950 border border-slate-700 rounded p-3 text-white"
              value={newKey.key_name}
              onChange={e => setNewKey({...newKey, key_name: e.target.value})}
            />
            <input 
              type="password"
              placeholder="Secret Value" 
              className="bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono"
              value={newKey.key_value}
              onChange={e => setNewKey({...newKey, key_value: e.target.value})}
            />
            <select 
              className="bg-slate-950 border border-slate-700 rounded p-3 text-white"
              value={newKey.category}
              onChange={e => setNewKey({...newKey, category: e.target.value})}
            >
              <option>AI</option>
              <option>Database</option>
              <option>Payment</option>
              <option>Email</option>
              <option>Other</option>
            </select>
            <button 
              onClick={() => handleSave(null)}
              disabled={!newKey.key_name || !newKey.key_value || status === 'saving'}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded p-3 flex items-center justify-center gap-2"
            >
              {status === 'saving' ? <RefreshCw className="animate-spin"/> : <Save size={20}/>}
              Save & Sync
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Tip: Adding a key here automatically updates your Live Vercel Production environment instantly.
          </p>
        </div>

        {/* Existing Keys List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2"><Key size={20}/> Active Secrets</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-4">Key Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Last Rotated</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center">Loading vault...</td></tr>
                ) : secrets.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No keys found. Add one above.</td></tr>
                ) : (
                  secrets.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono text-blue-400">{s.key_name}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">{s.category}</span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(s.last_rotated_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        {s.is_active ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle size={14}/> Active</span>
                        ) : (
                          <span className="text-slate-600 text-sm">Inactive</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(s.id, s.key_name)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
