"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Mic, Send, Image as ImageIcon, FileText, X, Sparkles, Link as LinkIcon } from "lucide-react";

// 🔧 CONFIGURATION
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const HARDCODED_USER_ID = "00000000-0000-0000-0000-000000000001"; // Replace with your actual User ID

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface NeuralInputProps {
  onSubmitted?: () => void;
}

export default function NeuralInput({ onSubmitted }: NeuralInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<{ type: string; url: string; name: string } | null>(null);
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Detect URLs in text
  useState(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = input.match(urlRegex);
    setDetectedLinks(matches || []);
  }, [input]);

  // Voice Recognition Setup
  const startRecording = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => prev + " " + transcript);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      alert("Voice recognition not supported in this browser. Try Chrome.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle File Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // For now, we'll create a local preview URL
    // In production, upload to Supabase Storage here
    const objectUrl = URL.createObjectURL(file);
    setPreview({
      type: file.type.startsWith("image/") ? "image" : "file",
      url: objectUrl,
      name: file.name,
    });
    setIsUploading(false);
  };

  // Submit to Brain Dumps
  const handleSubmit = async () => {
    if (!input.trim() && !preview) return;

    try {
      const { error } = await supabase.from("brain_dumps").insert({
        user_id: HARDCODED_USER_ID,
        content_text: input,
        media_url: preview?.url || null,
        media_type: preview?.type || (detectedLinks.length > 0 ? "link" : "text"),
        metadata: {
          links: detectedLinks,
          fileName: preview?.name,
        },
        status: "inbox",
      });

      if (error) throw error;

      // Reset form
      setInput("");
      setPreview(null);
      setDetectedLinks([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      if (onSubmitted) onSubmitted();
      alert("✅ Idea captured successfully!");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error saving idea: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Glass Container */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Neural Input Console
            </h3>
          </div>
          <span className="text-xs text-slate-400">Text • Voice • Image • Link</span>
        </div>

        {/* Input Area */}
        <div className="p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your idea, paste a link, or hit the mic to speak..."
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />

          {/* Detected Links */}
          {detectedLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {detectedLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 px-3 py-1.5 rounded-lg text-sm text-blue-300">
                  <LinkIcon className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{link}</span>
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mt-4 relative inline-block">
              {preview.type === "image" ? (
                <img src={preview.url} alt="Preview" className="h-32 rounded-lg border border-slate-600" />
              ) : (
                <div className="h-32 w-48 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => setPreview(null)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="mt-2 text-xs text-slate-400 truncate max-w-[200px]">{preview.name}</p>
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {/* Voice Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-xl transition-all ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-cyan-400"
                }`}
                title="Voice Note"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-cyan-400 rounded-xl transition-all"
                title="Upload Image/File"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!input.trim() && !preview}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-5 h-5" />
              <span>Capture Idea</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
