"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mic, StopCircle, Image as ImageIcon, Link as LinkIcon, Send, Brain, Loader2 } from 'lucide-react';

export default function NeuralConsole() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define fetchIdeas FIRST so it can be used in useEffect
  const fetchIdeas = async () => {
    const { data, error } = await supabase.from('brain_dumps').select('*').order('created_at', { ascending: false });
    if (data) setIdeas(data);
    setLoading(false);
  };

  // Use useEffect for loading data on mount
  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const { error } = await supabase.from('brain_dumps').insert([{ 
      content: input, 
      status: 'inbox',
      type: 'text'
    }]);

    if (!error) {
      setInput('');
      fetchIdeas(); // Refresh list
    } else {
      alert('Error saving idea: ' + error.message);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput(prev => prev + " [Voice Note Recorded]");
    } else {
      setIsRecording(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setInput(prev => prev + ` [Image Uploaded: ${file.name}]`);
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3 border-b border-slate-800 pb-4">
        <Brain className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Neural Input Console
        </h1>
      </div>

      {/* Input Zone */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-8 shadow-lg shadow-blue-900/10">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your idea, or use voice/image tools below..."
          className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            {/* Voice Button */}
            <button
              onClick={handleVoiceToggle}
              className={`p-3 rounded-lg transition-all ${
                isRecording 
                  ? 'bg-red-500/20 text-red-500 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
            </button>

            {/* Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={24} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Link Button */}
            <button className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
              <LinkIcon size={24} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-semibold transition-all"
          >
            <Send size={20} />
            Capture Idea
          </button>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-400">Recent Brain Dumps</h2>
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-10 text-slate-600 italic">No ideas yet. Speak your first thought!</div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                  idea.status === 'inbox' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                }`}>
                  {idea.status}
                </span>
                <span className="text-xs text-slate-500">{new Date(idea.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-200 whitespace-pre-wrap">{idea.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
