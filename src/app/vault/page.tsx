"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Brain, ArrowLeft, Home } from 'lucide-react';
import TemplateGallery from '@/components/templates/TemplateGallery';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VaultPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Brain className="text-purple-500 mx-auto mb-4" size={48} />
          <p>Loading Template Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Template Vault</h1>
                <p className="text-gray-400">Choose from 1000+ pre-validated business models</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <Home size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <TemplateGallery userId={user.id} />
      </div>
    </div>
  );
}
