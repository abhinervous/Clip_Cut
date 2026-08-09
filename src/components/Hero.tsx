import React, { useState } from 'react';
import { Sparkles, Youtube, ArrowRight, Wand2, ShieldCheck, Film, Subtitles } from 'lucide-react';

interface HeroProps {
  onQuickStart: (url: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickStart }) => {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onQuickStart(inputUrl.trim());
    }
  };

  return (
    <div className="relative py-12 px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* AI Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>ClipCut AI 2.0 • Automatic Subtitles & Custom Aspect Ratios</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 max-w-4xl leading-tight">
        Turn Any YouTube Video into a{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
          30-Second Viral Short
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed font-normal">
        Paste a YouTube link, select a moment, and instantly create a downloadable short clip with auto-generated English subtitles in 9:16, 1:1, or 16:9.
      </p>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-10">
        <div className="relative flex items-center bg-white/5 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <div className="pl-4 pr-2 text-white/40">
            <Youtube className="w-6 h-6 text-red-500/90" />
          </div>
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...)"
            className="w-full bg-transparent border-none text-white text-sm sm:text-base placeholder:text-white/30 focus:outline-none py-3"
            required
          />
          <button
            type="submit"
            className="shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Generate Clip</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Smart 30s Trimming</h4>
            <p className="text-[11px] text-white/50">Custom start time or quick auto clip</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Subtitles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">English Subtitles</h4>
            <p className="text-[11px] text-white/50">Word-by-word viral caption overlay</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">9:16 / 1:1 / 16:9 Formats</h4>
            <p className="text-[11px] text-white/50">Ready for TikTok, Shorts & Reels</p>
          </div>
        </div>
      </div>
    </div>
  );
};
