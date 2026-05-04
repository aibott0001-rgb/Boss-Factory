"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Brain, Zap, Send, Loader2, AlertCircle, CheckCircle, 
  TrendingUp, BarChart3, History, Lock 
} from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface IdeaRecord {
  id: string;
  idea_text: string;
  ai_score?: number;
  ai_verdict?: string;
  ai_category?: string;
  ai_reasoning?: string;
  created_at: string;
}

export default function NeuralConsole() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<IdeaRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Check Auth & Load History on Mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadHistory(user.id);
      } else {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const loadHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) setHistory(data);
  };

  // 2. Handle AI Analysis
  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    if (!user) {
      setError("Please log in to use the Neural Console.");
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Call our internal API route
      const response = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const analysis = await response.json();

      // 3. Save to Database immediately after analysis
      await saveIdea(idea, analysis);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze idea. Check console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Save to Supabase
  const saveIdea = async (text: string, analysis: any) => {
    setIsSaving(true);
    const { error } = await supabase.from('brain_dumps').insert([{
      user_id: user.id,
      idea_text: text,
      ai_score: analysis.score,
      ai_verdict: analysis.verdict,
      ai_category: analysis.category,
      ai_tags: JSON.stringify(analysis.tags),
      ai_reasoning: analysis.reasoning,
      status: 'inbox'
    }]);

    if (error) throw error;

    setSuccessMsg("Idea analyzed & saved successfully!");
    setIdea(''); // Clear input
    
    // Refresh history
    loadHistory(user.id);
    
    setTimeout(() => setSuccessMsg(null), 4000);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-2">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Neural Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Type your raw business idea below. Our AI will score it, analyze market fit, and save it to your vault.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="E.g., An Uber for dog walkers that uses AI to match pets based on personality..."
              className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              disabled={isAnalyzing || isSaving}
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                {user ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle size={14} /> Logged in as {user.email?.split('@')[0]}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500">
                    <Lock size={14} /> Guest Mode (Login to save)
                  </span>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!idea.trim() || isAnalyzing || isSaving || !user}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 ${
                  !user 
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isAnalyzing 
                      ? 'bg-blue-400 cursor-wait'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/30'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="fill-current" /> Analyze Idea
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {(error || successMsg) && (
            <div className={`px-6 py-4 border-t ${
              error 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400' 
                : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900 text-green-600 dark:text-green-400'
            }`}>
              <div className="flex items-center gap-3">
                {error ? <AlertCircle /> : <CheckCircle />}
                <p className="font-medium">{error || successMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs font-bold">
              <History size={16} /> Recent Ideas
            </div>
            
            <div className="grid gap-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      {item.ai_score && (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.ai_score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.ai_score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          Score: {item.ai_score}
                        </span>
                      )}
                      {item.ai_verdict && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {item.ai_verdict}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mb-2">{item.idea_text}</p>
                  {item.ai_reasoning && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      <span className="font-bold">AI Insight:</span> {item.ai_reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
