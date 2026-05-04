"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Moon, Sun, Monitor, Type, Palette, Eye, Shield, LogOut, 
  Save, RotateCcw, CheckCircle, AlertCircle, Database, Globe 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appearance');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Settings State
  const [theme, setTheme] = useState('dark'); // dark, light, auto
  const [fontSize, setFontSize] = useState('normal'); // small, normal, large
  const [contrast, setContrast] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load settings from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bf_theme') || 'dark';
    const savedSize = localStorage.getItem('bf_fontsize') || 'normal';
    const savedContrast = localStorage.getItem('bf_contrast') === 'true';
    
    setTheme(savedTheme);
    setFontSize(savedSize);
    setContrast(savedContrast);
    
    // Apply immediately
    applySettings(savedTheme, savedSize, savedContrast);
  }, []);

  const applySettings = (t: string, s: string, c: boolean) => {
    const root = document.documentElement;
    
    // Theme
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else {
      // Auto
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }

    // Font Size
    root.style.fontSize = s === 'small' ? '14px' : s === 'large' ? '18px' : '16px';

    // Contrast
    if (c) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
  };

  const handleSave = () => {
    setLoading(true);
    localStorage.setItem('bf_theme', theme);
    localStorage.setItem('bf_fontsize', fontSize);
    localStorage.setItem('bf_contrast', String(contrast));
    
    applySettings(theme, fontSize, contrast);
    
    showMessage('success', 'Settings saved successfully!');
    setLoading(false);
  };

  const handleReset = () => {
    setTheme('dark');
    setFontSize('normal');
    setContrast(false);
    localStorage.clear();
    showMessage('success', 'Settings reset to defaults.');
    setTimeout(() => window.location.reload(), 500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'system', label: 'System & Data', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
              <Shield className="text-blue-500" /> Platform Settings
            </h1>
            <p className="text-slate-400 mt-2">Customize your Boss Factory experience</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg flex items-center gap-2 transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-slate-800">
               <a 
                href="/admin/secrets"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Shield size={20} /> Secret Manager
              </a>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Moon size={20} className="text-purple-400"/> Theme Mode
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'light', icon: Sun, label: 'Light' },
                        { id: 'dark', icon: Moon, label: 'Dark' },
                        { id: 'auto', icon: Monitor, label: 'Auto' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setTheme(opt.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                            theme === opt.id 
                              ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                              : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <opt.icon size={24} className="mb-2" />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Type size={20} className="text-blue-400"/> Typography
                    </h3>
                    <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-700">
                      <span className="text-sm text-slate-400">Aa</span>
                      <input 
                        type="range" 
                        min="1" max="3" 
                        value={fontSize === 'small' ? 1 : fontSize === 'normal' ? 2 : 3}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFontSize(val === 1 ? 'small' : val === 2 ? 'normal' : 'large');
                        }}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-lg text-slate-200">Aa</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${contrast ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Eye size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">High Contrast</h4>
                        <p className="text-sm text-slate-400">Boosts text visibility for better readability</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setContrast(!contrast)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${contrast ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${contrast ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Globe size={18} className="text-green-400"/> System Status
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <div className="text-xs text-slate-500">Version</div>
                        <div className="text-sm font-mono text-white">v2.4.0 (Cloud)</div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <div className="text-xs text-slate-500">Latency</div>
                        <div className="text-sm font-mono text-green-400">~45ms</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <button 
                      onClick={handleReset}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw size={18} /> Reset All Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RotateCcw className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
