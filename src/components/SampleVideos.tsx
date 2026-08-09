import React from 'react';
import { Play, Sparkles, Youtube } from 'lucide-react';

interface SampleVideo {
  title: string;
  category: string;
  url: string;
  suggestedStartTime: string;
  duration: string;
  thumbnail: string;
}

const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    title: "MKBHD - The Future of AI Hardware",
    category: "Tech Review",
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    suggestedStartTime: "00:15",
    duration: "30s",
    thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg"
  },
  {
    title: "Rick Astley - Never Gonna Give You Up",
    category: "Music & Meme",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    suggestedStartTime: "00:42",
    duration: "30s",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  },
  {
    title: "Lofi Girl - Beats to Relax/Study to",
    category: "Lo-Fi Music",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    suggestedStartTime: "01:00",
    duration: "30s",
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"
  },
  {
    title: "Lex Fridman Podcast - AI Deep Dive",
    category: "Podcast",
    url: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    suggestedStartTime: "02:10",
    duration: "30s",
    thumbnail: "https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg"
  }
];

interface SampleVideosProps {
  onSelectSample: (url: string, startTime: string) => void;
}

export const SampleVideos: React.FC<SampleVideosProps> = ({ onSelectSample }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
            Try a 1-Click Sample YouTube Video
          </h3>
        </div>
        <span className="text-[11px] text-white/40">Select a video to pre-fill</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLE_VIDEOS.map((sample, idx) => (
          <div
            key={idx}
            onClick={() => onSelectSample(sample.url, sample.suggestedStartTime)}
            className="group relative bg-white/5 border border-white/10 rounded-xl p-2.5 hover:bg-white/10 hover:border-indigo-500/40 cursor-pointer transition-all duration-200 overflow-hidden"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 mb-2">
              <img
                src={sample.thumbnail}
                alt={sample.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400';
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
              </div>
              <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-indigo-300 border border-white/10">
                {sample.category}
              </div>
              <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/80">
                Start {sample.suggestedStartTime}
              </div>
            </div>

            <div className="px-1">
              <h4 className="text-xs font-semibold text-white/90 truncate group-hover:text-indigo-300 transition-colors">
                {sample.title}
              </h4>
              <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                <Youtube className="w-3 h-3 text-red-500" /> Click to auto-load clip
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
