import React from 'react';
import { ClipItem } from '../types';
import { Play, Download, Trash2, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface RecentClipsProps {
  clips: ClipItem[];
  activeClipId?: string;
  onSelectClip: (clip: ClipItem) => void;
  onDeleteClip: (id: string) => void;
}

export const RecentClips: React.FC<RecentClipsProps> = ({
  clips,
  activeClipId,
  onSelectClip,
  onDeleteClip,
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-white/60 block font-bold">
          Queue & Recent Clips ({clips.length})
        </label>
        <span className="text-[10px] text-white/40">Auto-saved history</span>
      </div>

      {clips.length === 0 ? (
        <div className="text-center py-6 px-4 bg-black/20 rounded-xl border border-white/5">
          <Clock className="w-6 h-6 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">No clips created yet.</p>
          <p className="text-[10px] text-white/30 mt-0.5">Your generated 30s clips will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {clips.map((clip) => {
            const isActive = clip.id === activeClipId;
            return (
              <div
                key={clip.id}
                onClick={() => onSelectClip(clip)}
                className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-950/50 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Thumbnail / Status */}
                <div className="w-16 h-10 bg-indigo-900/40 rounded-lg overflow-hidden relative shrink-0 border border-white/10">
                  <img
                    src={clip.thumbnailUrl}
                    alt={clip.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${clip.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                  {clip.status === 'processing' ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                  <div className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 rounded text-[8px] font-mono text-white">
                    {clip.durationSeconds}s
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex-1 overflow-hidden">
                  <h5 className="text-[11px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {clip.title}
                  </h5>

                  {clip.status === 'processing' ? (
                    <div>
                      <div className="flex justify-between text-[9px] text-indigo-300 mt-0.5">
                        <span>Processing...</span>
                        <span>{clip.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1 mt-1 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${clip.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : clip.status === 'failed' ? (
                    <p className="text-[9px] text-red-400 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> Failed
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-[9px] text-white/40 mt-0.5">
                      <span className="uppercase font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                        {clip.aspectRatio}
                      </span>
                      <span>Start {clip.startTime}</span>
                    </div>
                  )}
                </div>

                {/* Quick Download / Delete Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {clip.status === 'completed' && (
                    <a
                      href={clip.downloadUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-white/50 hover:text-indigo-300 transition-colors"
                      title="Download MP4"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete clip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
