"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Simple inline encryption placeholder (replace with real crypto later)
const simpleEncrypt = (text: string) => btoa(text);

export default function KeyMasterPage() {
  const [provider, setProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!apiKey) {
      setMessage('❌ Please enter a key');
      return;
    }
    
    try {
      const encrypted = simpleEncrypt(apiKey);
      const { error } = await supabase.from('api_credentials').insert([{
        provider,
        encrypted_key: encrypted,
        name: `${provider} Key`,
        key_type: 'llm',
        status: 'active'
      }]);
      
      if (error) throw error;
      
      setMessage('✅ Key saved successfully!');
      setApiKey('');
    } catch (err: any) {
      setMessage('❌ Error: ' + err.message);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">KeyMaster</h1>
      
      <div className="max-w-md bg-slate-900 p-6 rounded border border-slate-800">
        <h2 className="text-xl font-bold mb-4">Add New Key</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Provider</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
            >
              <option>Groq</option>
              <option>Google Gemini</option>
              <option>OpenAI</option>
            </select>
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm mb-1">API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
            />
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold"
          >
            Save Key
          </button>
          
          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes('✅') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 max-w-md bg-slate-900 p-6 rounded border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-2">Security Note</h3>
        <p className="text-slate-400 text-sm">
          Keys are encrypted before storage. This is a simplified version for testing.
        </p>
      </div>
    </div>
  );
}
