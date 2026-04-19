"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { encrypt } from '@/lib/crypto';
import { Shield, Plus, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';

export default function KeyMasterPage() {
  const [provider, setProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle'|'testing'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');

  const testKey = async () => {
    if (!apiKey) return;
    setStatus('testing');
    setMessage('Testing connectivity...');
    
    // Simple fetch test for Groq (can be expanded for other providers)
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      if (response.ok) {
        setStatus('success');
        setMessage('✅ Key is valid! Ready to save.');
        return true;
      } else {
        setStatus('error');
        setMessage('❌ Invalid key or network error.');
        return false;
      }
    } catch (err) {
      setStatus('error');
      setMessage('❌ Network error. Check console.');
      return false;
    }
  };

  const handleSave = async () => {
    if (!apiKey) return;
    
    // Auto-test before save if not already tested successfully
    if (status !== 'success') {
      const isValid = await testKey();
      if (!isValid) return;
    }

    const encrypted = encrypt(apiKey);
    const { error } = await supabase.from('api_credentials').insert([{
      provider,
      encrypted_key: encrypted,
      name: `${provider} Key`,
      key_type: 'llm',
      status: 'active'
    }]);

    if (error) {
      setStatus('error');
      setMessage('❌ Save failed: ' + error.message);
    } else {
      setStatus('success');
      setMessage('✅ Key saved & encrypted securely!');
      setApiKey('');
    }
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
          <Shield className="text-blue-500"/> KeyMaster Vault
        </h1>
        <p className="text-slate-400 mb-8">Securely manage your AI intelligence keys with AES-256 encryption.</p>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="text-blue-400"/> Add New Key</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Groq</option>
                <option>Google Gemini</option>
                <option>OpenAI</option>
                <option>Hugging Face</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-1">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={testKey}
                disabled={!apiKey || status === 'testing'}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {status === 'testing' ? <Loader2 className="animate-spin" size={20}/> : <Zap size={20}/>}
                {status === 'testing' ? 'Testing...' : 'Test Key'}
              </button>
              
              <button 
                onClick={handleSave}
                disabled={!apiKey || status === 'testing'}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all"
              >
                Save Securely
              </button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                status === 'success' ? 'bg-green-900/30 text-green-400 border border-green-900' :
                status === 'error' ? 'bg-red-900/30 text-red-400 border border-red-900' :
                'bg-blue-900/30 text-blue-400 border border-blue-900'
              }`}>
                {status === 'success' ? <CheckCircle className="shrink-0" size={20}/> :
                 status === 'error' ? <AlertCircle className="shrink-0" size={20}/> :
                 <Loader2 className="shrink-0 animate-spin" size={20}/>}
                <span className="text-sm">{message}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
          <Shield className="w-16 h-16 text-blue-500/30 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-white mb-2">Military-Grade Security</h3>
          <p className="text-slate-400 text-sm">Keys are encrypted locally with AES-256 before being sent to the database. Even admins cannot see your raw keys.</p>
        </div>
      </div>
    </div>
  );
}
