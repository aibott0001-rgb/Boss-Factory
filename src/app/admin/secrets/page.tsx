"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Key, RefreshCw, Save, AlertCircle, CheckCircle, Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface SecretKey {
  id?: string;
  name: string;
  value: string;
  description?: string;
  status?: 'active' | 'inactive' | 'error';
  last_synced_at?: string;
}

export default function AdminSecrets() {
  const [keys, setKeys] = useState<SecretKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('system_secrets').select('*').order('created_at', { ascending: false });
    
    if (error) {
      showMessage('error', `Failed to load keys: ${error.message}`);
    } else {
      setKeys(data || []);
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddKey = () => {
    setKeys([...keys, { name: '', value: '', description: '', status: 'inactive' }]);
  };

  const handleRemoveKey = (index: number) => {
    const newKeys = keys.filter((_, i) => i !== index);
    setKeys(newKeys);
  };

  const handleUpdateKey = (index: number, field: keyof SecretKey, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = { ...newKeys[index], [field]: value };
    setKeys(newKeys);
  };

  // FIX: Accept string OR number
  const toggleVisibility = (identifier: string | number) => {
    const key = String(identifier);
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    const validKeys = keys.filter(k => k.name.trim() !== '' && k.value.trim() !== '');
    if (validKeys.length === 0) {
      showMessage('error', 'Please add at least one valid key pair.');
      setSyncing(false);
      return;
    }

    try {
      const payload = {
        secrets: validKeys.map(k => ({
          name: k.name.trim(),
          value: k.value.trim(),
          description: k.description || '',
          status: 'active' as const
        }))
      };

      const response = await fetch('/api/admin/sync-secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        showMessage('success', `✅ Synced ${result.synced_count} keys to Vercel & DB!`);
        loadKeys();
      } else {
        throw new Error(result.error || 'Sync failed');
      }

    } catch (err: any) {
      console.error('💥 Sync Error:', err);
      showMessage('error', `❌ Sync Failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async (keyName: string, keyValue: string) => {
    if (!keyValue) return showMessage('error', 'Enter a key value first');
    
    showMessage('success', `Testing ${keyName}...`);
    
    try {
      if (keyName.includes('GROQ')) {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${keyValue}` }
        });
        if (res.ok) showMessage('success', `✅ ${keyName} is valid!`);
        else throw new Error('Invalid Groq Key');
      } else {
         showMessage('success', `⚠️ No auto-test for ${keyName}, but saved.`);
      }
    } catch (e: any) {
      showMessage('error', `❌ Test Failed: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
              <Shield className="text-blue-500" /> Secret Manager
            </h1>
            <p className="text-slate-400 mt-2">Manage, Rotate, and Sync API Keys</p>
          </div>
          <button 
            onClick={handleAddKey}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Plus size={20} /> Add Key
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
            {message.text}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-950/50 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Key Name</div>
            <div className="col-span-5">Value</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
            ) : keys.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No keys found. Click "Add Key" to start.</div>
            ) : (
              keys.map((key, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors">
                  <div className="col-span-3">
                    <input 
                      type="text" 
                      placeholder="e.g. GROQ_API_KEY"
                      value={key.name}
                      onChange={(e) => handleUpdateKey(idx, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>

                  <div className="col-span-5 relative">
                    <input 
                      type={showValues[String(key.name || idx)] ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={key.value}
                      onChange={(e) => handleUpdateKey(idx, 'value', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono pr-10"
                    />
                    <button 
                      onClick={() => toggleVisibility(key.name || idx)}
                      className="absolute right-2 top-2 text-slate-500 hover:text-white"
                    >
                      {showValues[String(key.name || idx)] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="col-span-3">
                    {key.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-900">
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        Unsaved
                      </span>
                    )}
                    {key.last_synced_at && (
                      <div className="text-xs text-slate-600 mt-1">
                        Synced: {new Date(key.last_synced_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end gap-2">
                    <button 
                      onClick={() => handleTestConnection(key.name, key.value)}
                      className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={() => handleRemoveKey(idx)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Changes are encrypted before saving.
            </div>
            <button 
              onClick={handleSync}
              disabled={syncing || keys.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              {syncing ? <Loader2 className="animate-spin" /> : <Save />}
              {syncing ? 'Syncing...' : 'Sync Secrets'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
