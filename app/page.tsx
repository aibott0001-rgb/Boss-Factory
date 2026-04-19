"use client";

import { useRouter } from 'next/navigation';
import { Brain, Key, Rocket, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: "Neural Console",
      desc: "Capture ideas via voice, text, or image.",
      icon: <Brain className="w-8 h-8 text-blue-400" />,
      path: "/neural",
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "KeyMaster Vault",
      desc: "Securely manage your AI API keys.",
      icon: <Key className="w-8 h-8 text-purple-400" />,
      path: "/keymaster",
      color: "from-purple-600 to-pink-500"
    },
    {
      title: "The Vault",
      desc: "Browse 1,000+ money-making templates.",
      icon: <Rocket className="w-8 h-8 text-green-400" />,
      path: "/vault",
      color: "from-green-600 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>

      {/* Header */}
      <div className="text-center mb-16 animate-float">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 mb-6">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">System Operational</span>
        </div>
        <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          BOSS FACTORY
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl">
          The Zero-Cost, Omni-Present Autonomous Wealth Engine.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        {features.map((feature) => (
          <button
            key={feature.title}
            onClick={() => router.push(feature.path)}
            className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden"
          >
            {/* Hover Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className="mb-6 bg-slate-950/50 w-fit p-4 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 mb-6">
                {feature.desc}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:text-white">
                Launch Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 text-center text-slate-600 text-sm">
        <p>Built on Free Tier Infrastructure • Self-Evolving • Secure</p>
      </div>
    </div>
  );
}
