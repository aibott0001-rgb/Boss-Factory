"use client";

import { useState } from "react";
import NeuralInput from "../../components/NeuralInput";
import { Key, Brain, Plus } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"keys" | "ideas">("keys");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
          Boss Factory Command Center
        </h1>
        <p className="text-slate-400 text-lg">Manage your AI keys and capture million-dollar ideas</p>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-4">
        <button
          onClick={() => setActiveTab("keys")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "keys"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
          }`}
        >
          <Key className="w-5 h-5" />
          KeyMaster Vault
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "ideas"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
          }`}
        >
          <Brain className="w-5 h-5" />
          Neural Input
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "keys" ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center">
            <Key className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">KeyMaster Vault</h2>
            <p className="text-slate-400 mb-6">Your API keys are securely stored and ready.</p>
            <p className="text-sm text-slate-500">(Key list view coming in next update)</p>
          </div>
        ) : (
          <NeuralInput />
        )}
      </div>
    </div>
  );
}
