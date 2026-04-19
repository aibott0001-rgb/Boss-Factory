'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { encrypt } from '../../lib/crypto'

interface ApiKey {
  id: string
  provider: string
  status: string
  last_tested_at: string | null
}

export default function KeyMasterDashboard() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [provider, setProvider] = useState('groq')
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    // In a real app, we would filter by user_id from auth
    const { data, error } = await supabase.from('api_credentials').select('*')
    if (data) setKeys(data)
  }

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const encryptedKey = encrypt(apiKeyValue)
    
    const { error } = await supabase.from('api_credentials').insert({
      provider,
      encrypted_key: encryptedKey,
      status: 'active',
      last_tested_at: new Date().toISOString()
    })

    if (!error) {
      alert('Key added and encrypted successfully!')
      setApiKeyValue('')
      fetchKeys()
    } else {
      alert('Error adding key: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">🔑 KeyMaster Command Center</h1>
      
      {/* Add Key Form */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Add New API Key</h2>
        <form onSubmit={handleAddKey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
            >
              <option value="groq">Groq</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key Value</label>
            <input 
              type="password" 
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Encrypting & Saving...' : 'Save Key'}
          </button>
        </form>
      </div>

      {/* Keys List */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Active Keys</h2>
        {keys.length === 0 ? (
          <p className="text-slate-400">No keys found. Add one above!</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-2">Provider</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Last Tested</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-slate-700/50">
                  <td className="py-3 capitalize">{key.provider}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${key.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-sm">{key.last_tested_at ? new Date(key.last_tested_at).toLocaleDateString() : 'Never'}</td>
                  <td className="py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Test</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
