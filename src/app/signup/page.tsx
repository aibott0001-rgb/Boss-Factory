"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Github, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ 
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
    });
    if (error) setMessage({ type: 'error', text: error.message });
    else { setMessage({ type: 'success', text: 'Account created! Check email to verify.' }); setTimeout(() => router.push('/login'), 2000); }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
    });
    if (error) { setMessage({ type: 'error', text: error.message }); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex bg-purple-600 p-3 rounded-xl mb-4"><Brain size={32} /></div>
          <h1 className="text-2xl font-bold mb-2">Join Boss Factory</h1>
          <p className="text-slate-400">Start your empire</p>
        </div>
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="CEO Email" required className="w-full bg-slate-950 border border-slate-700 rounded p-3" />
          <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : <Mail size={20}/>} {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <div className="my-6 border-t border-slate-800"></div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleSocialLogin('github')} className="bg-slate-800 hover:bg-slate-700 py-3 rounded flex items-center justify-center gap-2"><Github size={20}/> GitHub</button>
          <button onClick={() => handleSocialLogin('google')} className="bg-slate-800 hover:bg-slate-700 py-3 rounded flex items-center justify-center gap-2">Google</button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Have an account? <Link href="/login" className="text-purple-400">Sign in</Link></p>
      </div>
    </div>
  );
}
