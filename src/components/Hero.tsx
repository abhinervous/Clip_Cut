import React, { useState } from 'react';
import { Sparkles, Upload, Youtube, ArrowRight, Wand2, Film, Subtitles, Layers } from 'lucide-react';

interface HeroProps {
  onQuickStart: (url: string) => void;
  onSelectUploadMode: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onQuickStart, onSelectUploadMode }) => {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* AI Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>ClipCut AI • Upload Video Files or YouTube Links</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 max-w-4xl leading-tight">
        Turn Long Videos into{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Viral Short Clips
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed font-normal">
        Upload local MP4, MOV, or WebM files — or paste a YouTube URL. Customize duration, dimensions, and burn English subtitles in seconds.
      </p>

      {/* Quick Actions / Input Box */}
      <div className="w-full max-w-2xl mb-10 space-y-4">
        {/* Upload File Direct CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSelectUploadMode}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold px-7 py-4 rounded-xl text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 border border-indigo-400/20"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Video File (MP4, MOV, WebM)</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-slate-950 px-3 text-xs text-slate-500 uppercase font-mono tracking-widest">or paste url</span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* YouTube URL Bar */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative flex items-center bg-white/5 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="pl-4 pr-2 text-white/40">
              <Youtube className="w-6 h-6 text-red-500/90" />
            </div>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)"
              className="w-full bg-transparent border-none text-white text-sm sm:text-base placeholder:text-white/30 focus:outline-none py-3"
            />
            <button
              type="submit"
              className="shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <span>Use Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full max-w-4xl">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Local Uploads</h4>
            <p className="text-[10px] text-white/50">MP4, MOV, WebM up to 1GB</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Custom Duration</h4>
            <p className="text-[10px] text-white/50">15s, 30s, 45s, 60s or custom</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Subtitles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">English Subtitles</h4>
            <p className="text-[10px] text-white/50">Auto burnt captions with styles</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Custom Ratio</h4>
            <p className="text-[10px] text-white/50">9:16, 1:1, 16:9 or W×H</p>
          </div>
        </div>
      </div>
    </div>
  );
};
