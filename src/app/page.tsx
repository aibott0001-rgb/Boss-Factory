"use client";

import { useRouter } from 'next/navigation';
import { Brain, Rocket, Shield, ChevronRight, Zap, Lock } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-8 animate-fade-in-up">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 text-blue-300 text-sm font-semibold mb-4">
          <Zap size={16} className="text-yellow-400" />
          <span>AI-Powered Wealth Engine v2.0</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6">
          Build Your <br />
          <span className="text-gradient">Empire Autonomously</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The world's first self-operating business factory. 
          Idea → Analysis → Deployment → Revenue. 
          <span className="text-white font-semibold"> Zero manual labor required.</span>
        </p>

        {/* Feature Grid (Visual Proof) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          <FeatureCard 
            icon={<Brain className="text-blue-400" />}
            title="Neural AI"
            desc="Analyzes ideas in milliseconds."
          />
          <FeatureCard 
            icon={<Rocket className="text-purple-400" />}
            title="Auto-Deploy"
            desc="Launches ventures while you sleep."
          />
          <FeatureCard 
            icon={<Shield className="text-green-400" />}
            title="Secure Vault"
            desc="Military-grade key encryption."
          />
        </div>

        {/* CTA Button */}
        <div className="pt-12">
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary px-10 py-5 rounded-xl text-lg flex items-center gap-3 mx-auto group"
          >
            Enter Command Center
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-4 text-sm text-slate-500">
            <Lock size={12} className="inline mr-1" /> Secure Access • System Operational
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="mb-4 bg-slate-900/50 w-fit p-3 rounded-lg">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}
