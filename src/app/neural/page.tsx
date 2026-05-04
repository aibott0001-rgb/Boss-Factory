"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Brain, Send, Loader2, Zap, AlertCircle, CheckCircle, History } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NeuralConsole() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) loadHistory(user.id);
    };
    getUser();
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

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to save ideas.' });
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setMessage(null);

    try {
      // 1. Call AI API
      const response = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) throw new Error('AI Analysis failed');
      
      const analysis = await response.json();

      // 2. Save to Database
      const { data: savedData, error } = await supabase.from('brain_dumps').insert([{
        user_id: user.id,
        idea_text: idea,
        ai_score: analysis.score,
        ai_verdict: analysis.verdict,
        ai_category: analysis.category,
        ai_tags: analysis.tags,
        ai_reasoning: analysis.reasoning,
        status: 'analyzed'
      }]).select().single();

      if (error) throw error;

      setResult(savedData);
      setMessage({ type: 'success', text: 'Idea analyzed and saved!' });
      setIdea('');
      
      // Refresh history
      loadHistory(user.id);

    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Analysis failed. Check console.' });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
            <Zap size={16} /> AI-Powered Idea Incubator
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Neural Console
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Type your business idea below. Our AI will score it, analyze market potential, and give you a GO/NO-GO verdict instantly.
          </p>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., An Uber for dog walkers that uses AI to match pets with sitters based on personality..."
            className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-slate-500">
              {idea.length} chars
            </span>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !idea.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              {analyzing ? <Loader2 className="animate-spin" /> : <Brain />}
              {analyzing ? 'Analyzing...' : 'Analyze Idea'}
            </button>
          </div>
        </div>

        {/* Message Notification */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400' 
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
            {message.text}
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="text-green-500" /> Analysis Result
              </h3>
              <span className={`px-4 py-1 rounded-full font-bold text-sm ${
                result.ai_verdict === 'GO' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {result.ai_verdict}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-slate-500 mb-1">Profitability Score</div>
                <div className="text-4xl font-black text-blue-600 dark:text-blue-400">{result.ai_score}/100</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Category</div>
                <div className="text-xl font-bold">{result.ai_category}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {result.ai_tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500 mb-2">AI Reasoning</div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.ai_reasoning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History size={20} /> Recent Ideas
            </h3>
            <div className="grid gap-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium truncate">{item.idea_text}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Score: {item.ai_score || 'N/A'} • {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.ai_verdict === 'GO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.ai_verdict || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
