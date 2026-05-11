"use client";

import { useState, useRef, useEffect } from 'react';
import { Brain, Mic, Image, Send, Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Idea {
  id: string;
  idea_text: string;
  ai_score?: number;
  ai_verdict?: 'GO' | 'NO GO';
  ai_category?: 'SaaS' | 'Content' | 'E-commerce' | 'Service';
  ai_tags?: string[];
  ai_reasoning?: string;
  status: 'pending' | 'analyzed' | 'deployed' | 'failed';
  created_at: string;
}

interface AnalysisResult {
  score: number;
  verdict: 'GO' | 'NO GO';
  category: 'SaaS' | 'Content' | 'E-commerce' | 'Service';
  tags: string[];
  reasoning: string;
}

export default function NeuralInputConsole({ userId }: { userId: string }) {
  const [idea, setIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch recent ideas on mount
  useEffect(() => {
    fetchRecentIdeas();
  }, [userId]);

  const fetchRecentIdeas = async () => {
    try {
      const response = await fetch(`/api/ideas?userId=${userId}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setRecentIdeas(data.ideas);
      }
    } catch (error) {
      console.error('Error fetching recent ideas:', error);
    }
  };

  const analyzeIdea = async () => {
    if (!idea.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // First, save the idea
      const saveResponse = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ideaText: idea.trim()
        })
      });

      const saveData = await saveResponse.json();
      if (!saveData.success) {
        throw new Error(saveData.error);
      }

      // Then analyze it
      const analyzeResponse = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          userId
        })
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) {
        throw new Error(analyzeData.error);
      }

      // Update the idea with analysis results
      const updateResponse = await fetch('/api/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ideaId: saveData.idea.id,
          updates: {
            ai_score: analyzeData.analysis.score,
            ai_verdict: analyzeData.analysis.verdict,
            ai_category: analyzeData.analysis.category,
            ai_tags: analyzeData.analysis.tags,
            ai_reasoning: analyzeData.analysis.reasoning,
            status: 'analyzed'
          }
        })
      });

      if (updateResponse.ok) {
        setAnalysisResult(analyzeData.analysis);
        fetchRecentIdeas(); // Refresh recent ideas
        setIdea(''); // Clear input
      }

    } catch (error: any) {
      setError(error.message || 'Failed to analyze idea');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceRecording = () => {
    // Placeholder for voice recording functionality
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      // In real implementation, this would process voice input
    }, 3000);
  };

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In real implementation, this would upload and process the image
        console.log('Image uploaded:', file);
      }
    };
    input.click();
  };

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case 'GO': return 'text-green-500';
      case 'NO GO': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getVerdictBg = (verdict?: string) => {
    switch (verdict) {
      case 'GO': return 'bg-green-500/10 border-green-500/30';
      case 'NO GO': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="text-purple-500" size={32} />
          <h1 className="text-3xl font-bold text-white">Neural Input Console</h1>
        </div>
        <p className="text-gray-400">
          Transform your ideas into profitable ventures with AI-powered analysis
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Text Input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your business idea... What problem are you solving? Who are your customers? How will you make money?"
              className="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-500">
              {idea.length} characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={analyzeIdea}
              disabled={!idea.trim() || isAnalyzing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Analyze Idea
                </>
              )}
            </button>

            <button
              onClick={startVoiceRecording}
              disabled={isRecording}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <Mic size={20} className={isRecording ? 'text-red-500 animate-pulse' : ''} />
              {isRecording ? 'Recording...' : 'Voice'}
            </button>

            <button
              onClick={handleImageUpload}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <Image size={20} />
              Image
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div className={`bg-slate-900/50 border rounded-xl p-6 backdrop-blur-sm ${getVerdictBg(analysisResult.verdict)}`}>
          <div className="space-y-4">
            {/* Verdict Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {analysisResult.verdict === 'GO' ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <AlertCircle className="text-red-500" size={24} />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">
                    AI Verdict: <span className={getVerdictColor(analysisResult.verdict)}>{analysisResult.verdict}</span>
                  </h3>
                  <p className="text-gray-400">Confidence Score: <span className={getScoreColor(analysisResult.score)}>{analysisResult.score}/100</span></p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{analysisResult.score}</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Category</h4>
                <div className="px-3 py-1 bg-slate-800 rounded-lg text-white">
                  {analysisResult.category}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-800 rounded text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">AI Reasoning</h4>
              <p className="text-gray-300 leading-relaxed">{analysisResult.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Ideas */}
      {recentIdeas.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Recent Ideas
          </h3>
          
          <div className="space-y-3">
            {recentIdeas.map((recentIdea) => (
              <div key={recentIdea.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-300 mb-2 line-clamp-2">{recentIdea.idea_text}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-semibold ${getVerdictColor(recentIdea.ai_verdict)}`}>
                        {recentIdea.ai_verdict || 'Pending'}
                      </span>
                      <span className={getScoreColor(recentIdea.ai_score)}>
                        {recentIdea.ai_score || '--'}/100
                      </span>
                      <span className="text-gray-500">
                        {recentIdea.ai_category || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(recentIdea.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
