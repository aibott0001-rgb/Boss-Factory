"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider'; // We will create this next
import { 
  Moon, Sun, Monitor, Type, Palette, Shield, 
  LogOut, Save, CheckCircle, AlertCircle, Globe, 
  CreditCard, Bell, Trash2 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Fetch current user data
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
    };
    getUser();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogout = async () => {
    if(!confirm("Are you sure you want to logout?")) return;
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleClearCache = () => {
    if(confirm("This will clear all local settings and cached data. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Platform Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your workspace, appearance, and security.</p>
        </div>

        {/* Notification */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400' 
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* 1. Appearance Settings */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Palette className="text-purple-500" size={24} />
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Theme Toggle */}
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun size={24} className="mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon size={24} className="mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    theme === 'system' 
                      ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-2 ring-slate-500' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Monitor size={24} className="mb-2" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Interface Size</label>
              <div className="flex items-center gap-4">
                <Type size={20} className="text-slate-400" />
                <input 
                  type="range" 
                  min="14" 
                  max="20" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-mono w-8 text-right">{fontSize}px</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Account & Security */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Shield className="text-green-500" size={24} />
            <h2 className="text-xl font-bold">Account & Security</h2>
          </div>
          <div className="p-6 space-y-6">
            
            {/* User Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Logged in as</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {userData?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium">{userData?.email}</div>
                  <div className="text-xs text-slate-500">ID: {userData?.id?.slice(0,8)}...</div>
                </div>
              </div>
            </div>

            {/* API Keys Link */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 dark:text-blue-100">API Key Management</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Rotate your Groq, Supabase, and Vercel keys securely. Changes sync automatically to the cloud.
                </p>
                <button 
                  onClick={() => router.push('/admin/secrets')}
                  className="mt-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Open Secret Manager →
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-red-600 dark:text-red-400 font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={20} /> Danger Zone
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-slate-500">
                  Clear all local cache and reset settings to default.
                </div>
                <button 
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} /> Clear Cache
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-4">
                <div className="text-sm text-slate-500">
                  Sign out of your account on this device.
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20 transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-400 pb-8">
          <p>Boss Factory v2.0.4 • Cloud-Native Edition</p>
          <p className="mt-1">System Status: <span className="text-green-500 font-bold">Operational</span></p>
        </div>

      </div>
    </div>
  );
}
