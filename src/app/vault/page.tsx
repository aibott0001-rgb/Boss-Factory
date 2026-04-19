"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VaultPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('templates').select('*');
        if (data) setTemplates(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">The Vault</h1>
      
      {loading ? (
        <p>Loading templates...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t: any) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">{t.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{t.description}</p>
              <div className="text-green-400 font-bold">{t.projected_roi}</div>
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded">
                Deploy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
