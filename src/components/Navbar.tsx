"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Brain, LogOut, LayoutDashboard, Key, Zap, Shield, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';

// Initialize Supabase Client once
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Hide navbar on landing page and auth pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') return null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/neural', label: 'Neural', icon: Brain },
    { href: '/vault', label: 'Vault', icon: Zap },
    { href: '/keymaster', label: 'Keys', icon: Key },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;
    
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      window.location.href = '/login'; // Force hard redirect to clear state
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO LINK - SAFE & ISOLATED */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // Just navigate, do NOT logout
              window.location.href = '/dashboard'; // Or keep it as '/' if you want landing page
            }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <Brain className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Boss Factory
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
              title="Sign Out"
            >
              {isLoggingOut ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <LogOut size={18} />
              )}
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => { handleLogout(); setIsOpen(false); }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={20} />
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
