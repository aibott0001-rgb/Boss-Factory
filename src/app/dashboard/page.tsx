"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Brain, 
  LayoutDashboard, 
  Zap, 
  Activity, 
  Rocket, 
  Key, 
  Lock, 
  Plus, 
  RefreshCw, 
  Terminal, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, highScore: 0, deployed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: total } = await supabase.from('brain_dumps').select('*', { count: 'exact', head: true });
      const { count: highScore } = await supabase.from('brain_dumps').select('*', { count: 'exact', head: true }).gte('score', 80);
      const { count: deployed } = await supabase.from('ventures').select('*', { count: 'exact', head: true });

      setStats({
        total: total || 0,
        highScore: highScore || 0,
        deployed: deployed || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2">
              Command Center
            </h1>
            <p className="text-slate-400">Welcome back, CEO. System is operational.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchStats} className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => router.push('/neural')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Brain size={20} /> New Idea
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Ideas" 
            value={stats.total} 
            icon={Brain} 
            color="from-blue-500 to-cyan-500" 
            trend="+12%" 
          />
          <StatCard 
            title="High Potential" 
            value={stats.highScore} 
            icon={Zap} 
            color="from-purple-500 to-pink-500" 
            trend="Top 10%" 
          />
          <StatCard 
            title="Deployed Ventures" 
            value={stats.deployed} 
            icon={Rocket} 
            color="from-green-500 to-emerald-500" 
            trend="Live" 
          />
          <StatCard 
            title="System Status" 
            value="Online" 
            icon={Activity} 
            color="from-orange-500 to-red-500" 
            trend="Secure" 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Recent Activity & Quick Actions) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Neural Inputs */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="text-blue-400" /> Recent Neural Inputs
                </h2>
                <button onClick={() => router.push('/neural')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
                      <div>
                        <p className="font-medium text-slate-200 group-hover:text-white transition-colors">AI-Powered Niche Site Generator</p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${i === 1 ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                        {i === 1 ? '92 Score' : 'Pending'}
                      </span>
                      <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard 
                title="Deploy Venture" 
                desc="Launch a new business from the Vault" 
                icon={Rocket} 
                color="bg-indigo-600" 
                onClick={() => router.push('/vault')} 
              />
              <ActionCard 
                title="Manage Keys" 
                desc="Securely rotate API credentials" 
                icon={Key} 
                color="bg-emerald-600" 
                onClick={() => router.push('/keymaster')} 
              />
            </div>
          </div>

          {/* Right Column (System Control) */}
          <div className="space-y-8">
            
            {/* System Control Panel */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <LayoutDashboard className="text-purple-400" /> System Control
              </h2>
              
              <div className="space-y-4">
                <div 
                  onClick={() => router.push('/admin/secrets')}
                  className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/30 hover:bg-blue-900/20 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Secret Manager</h3>
                        <p className="text-xs text-blue-200">Rotate Keys & Sync</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-blue-400" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Lock size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-300">Auth System</h3>
                      <p className="text-xs text-slate-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-400">Cloud Status</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Operational
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">AI Engine</span>
                  <span className="text-blue-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Groq Online
                  </span>
                </div>
              </div>
            </div>

            {/* CEO Tip */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Brain size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">CEO Tip</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Use the <strong className="text-blue-400">Secret Manager</strong> to instantly rotate API keys if you suspect a leak. Changes sync to Vercel automatically.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={24} className="text-white" />
        </div>
        <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}
