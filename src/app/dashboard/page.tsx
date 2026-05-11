"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Brain, Plus, RefreshCw } from 'lucide-react';
import VentureDashboard from '@/components/dashboard/VentureDashboard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
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
          <p>Loading dashboard...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-white">Venture Dashboard</h1>
              <p className="text-gray-400">Monitor your autonomous wealth generation empire</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/neural')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                New Idea
              </button>
              <button
                onClick={() => router.push('/vault')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all"
              >
                Browse Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <VentureDashboard userId={user.id} />
    </div>
  );
}
