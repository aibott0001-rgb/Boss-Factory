"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Brain, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function NeuralPage() {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    const { data } = await supabase.from('brain_dumps').select('*').order('created_at', { ascending: false });
    if (data) setIdeas(data);
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: input }),
      });

      const data = await res.json();

      if (res.ok) {
        setAnalysisResult(data);
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze'));
      }
    } catch (err) {
      alert('Network error. Is Groq API key set?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    // Save with analysis if available
    const { error } = await supabase.from('brain_dumps').insert([{ 
      content: input, 
      status: 'inbox',
      type: 'text',
      // In a real app, you'd save the analysis JSON to a dedicated column here
    }]);

    if (!error) {
      setInput('');
      setAnalysisResult(null);
      loadIdeas();
    } else {
      alert('Error saving: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-blue-400 flex items-center gap-2">
          <Brain /> Neural Console
        </h1>

        {/* Input Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg">
          <textarea 
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your business idea here..."
          />
          
          <div className="flex gap-3 mt-4">
            {/* THE ANALYZE BUTTON */}
            <button 
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Zap />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Idea'}
            </button>

            <button 
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle /> Save Idea
            </button>
          </div>
        </div>

        {/* Analysis Result Display */}
        {analysisResult && (
          <div className="bg-slate-900 border border-purple-500/50 rounded-xl p-6 mb-6 shadow-lg shadow-purple-900/20 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <Zap className="w-5 h-5" /> AI Analysis
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                analysisResult.verdict === 'GO' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {analysisResult.verdict} ({analysisResult.score}/100)
              </span>
            </div>
            
            <p className="text-slate-300 mb-4">{analysisResult.reasoning}</p>
            
            <div className="flex flex-wrap gap-2">
              {analysisResult.tags?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md border border-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ideas List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-400">Recent Ideas</h2>
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <span className="text-xs text-blue-400 uppercase font-bold">{idea.status}</span>
              <p className="text-slate-200 mt-2 whitespace-pre-wrap">{idea.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
