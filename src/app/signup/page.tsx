"use client";
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Github, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signUp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    alert('Account created! Check email to verify.');
    router.push('/login');
    setLoading(false);
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex bg-purple-600 p-3 rounded-xl mb-4"><Brain className="text-white" size={32} /></div>
          <h1 className="text-3xl font-bold mb-2">Join Boss Factory</h1>
          <p className="text-slate-400">Start building your empire</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="CEO Email" required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
          <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : <Mail size={20}/>} {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <div className="my-6 border-t border-slate-800"></div>
        <button onClick={handleGitHubLogin} disabled={loading} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
          <Github size={20} /> Continue with GitHub
        </button>
      </div>
    </div>
  );
}
