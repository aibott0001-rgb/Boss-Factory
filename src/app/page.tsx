"use client";

import Link from 'next/link';
import { Brain, Zap, Shield, Rocket, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-blue-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          Boss Factory
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-6 py-2 text-sm font-medium bg-white text-slate-950 rounded-full hover:bg-slate-200 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-blue-300 bg-blue-900/30 border border-blue-500/30 rounded-full animate-fade-in-up">
          <Zap size={16} className="fill-blue-400" />
          <span>The Autonomous Wealth Engine is Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 max-w-5xl mx-auto leading-[1.1]">
          Build Empires <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">While You Sleep</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Boss Factory is your AI-powered command center. Generate ideas, analyze markets, and deploy full-stack ventures automatically. No code required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/signup" 
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full text-lg shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Start Building Free
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-lg border border-slate-700 transition-all flex items-center justify-center"
          >
            Access Dashboard
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto text-left">
          <FeatureCard 
            icon={<Brain className="text-purple-400" size={32} />}
            title="Neural Idea Engine"
            desc="AI analyzes market gaps and scores ideas from 0-100 instantly."
          />
          <FeatureCard 
            icon={<Rocket className="text-blue-400" size={32} />}
            title="One-Click Deploy"
            desc="Spin up full SaaS ventures from templates in seconds."
          />
          <FeatureCard 
            icon={<Shield className="text-green-400" size={32} />}
            title="Military-Grade Security"
            desc="Your API keys and data are encrypted with AES-256."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-slate-600 text-sm border-t border-slate-900 mt-20">
        <p>© 2024 Boss Factory. All systems operational.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-colors backdrop-blur-sm">
      <div className="mb-4 bg-slate-950 w-fit p-3 rounded-lg border border-slate-800">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
