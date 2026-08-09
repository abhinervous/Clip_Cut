import React, { useState, useRef } from 'react';
import { ClipItem } from '../types';
import {
  Play,
  Pause,
  Download,
  Share2,
  Plus,
  Trash2,
  Sparkles,
  Film,
  Check,
  Volume2,
  VolumeX,
  FileVideo,
  Youtube
} from 'lucide-react';

interface VideoPreviewProps {
  clip: ClipItem | null;
  onNewClip: () => void;
  onDeleteClip?: (id: string) => void;
  onCopyShareLink: (url: string) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  clip,
  onNewClip,
  onDeleteClip,
  onCopyShareLink,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || clip?.durationSeconds || 30);
    }
  };

  const handleShare = () => {
    if (!clip) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#clip-${clip.id}`;
    onCopyShareLink(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const currentCaption =
    clip?.captions?.find((c) => currentTime >= c.start && currentTime <= c.end)?.text ||
    (clip?.enableSubtitles ? clip?.title : null);

  const getAspectRatioClasses = () => {
    if (!clip) return 'w-[300px] h-[533px]';
    switch (clip.aspectRatio) {
      case '1:1':
        return 'w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]';
      case '16:9':
        return 'w-full max-w-[640px] aspect-video';
      case 'custom':
        return 'w-[320px] h-[480px] sm:w-[360px] sm:h-[540px]';
      case '9:16':
      default:
        return 'w-[280px] h-[500px] sm:w-[320px] sm:h-[568px]';
    }
  };

  if (!clip) {
    return (
      <div className="flex-1 bg-slate-900/60 rounded-[32px] border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[520px]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)] pointer-events-none" />

        <div className="w-[280px] h-[480px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 text-center group">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-2">Clip Preview Studio</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Upload a video file or paste a YouTube URL on the generator panel to render your custom clip with subtitles.
          </p>

          <div className="absolute bottom-16 left-4 right-4 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 text-yellow-400 italic shadow-xl">
            "Burned English subtitles & custom aspect ratios..."
          </div>
        </div>

        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-slate-800 flex items-center gap-1.5 text-slate-400">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> READY FOR CLIP CREATION
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Main Player Container */}
      <div className="flex-1 bg-slate-900/80 rounded-[32px] border border-slate-800 relative overflow-hidden flex items-center justify-center p-4 min-h-[520px]">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_50%,#6366f1,transparent_70%)] pointer-events-none" />

        <div className={`${getAspectRatioClasses()} bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative group flex items-center justify-center`}>
          {clip.status === 'processing' ? (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Processing {clip.durationSeconds}s Clip</h4>
                <p className="text-[11px] text-slate-400 mt-1">Applying FFmpeg filters & rendering subtitles</p>
              </div>
              <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${clip.progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={clip.clipUrl}
                poster={clip.thumbnailUrl}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
                loop
                playsInline
              />

              {clip.enableSubtitles && currentCaption && (
                <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none transition-all">
                  <span
                    className={`inline-block backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-2xl border ${
                      clip.subtitleStyle === 'cyber-cyan'
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-cyan-500/30'
                        : clip.subtitleStyle === 'white-minimal'
                        ? 'bg-slate-950/90 text-white border-white/30'
                        : 'bg-slate-950/80 text-yellow-400 border-yellow-400/30 shadow-yellow-500/20'
                    }`}
                  >
                    "{currentCaption}"
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={togglePlay}
                className={`absolute w-14 h-14 bg-slate-950/60 backdrop-blur-md rounded-full border border-slate-700 flex items-center justify-center text-white cursor-pointer transition-all duration-200 ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 scale-105'
                }`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={togglePlay} className="text-white hover:text-indigo-400 p-1">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex-1 mx-3 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-indigo-500 h-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono text-slate-300 mr-2">
                  00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:{clip.durationSeconds}
                </span>

                <button type="button" onClick={toggleMute} className="text-white hover:text-indigo-400 p-1">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Top Floating Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <span className="bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-slate-800 flex items-center gap-1.5 text-slate-200">
            {clip.sourceType === 'file' ? <FileVideo className="w-3.5 h-3.5 text-indigo-400" /> : <Youtube className="w-3.5 h-3.5 text-red-400" />}
            {clip.sourceType === 'file' ? 'LOCAL VIDEO' : 'YOUTUBE'}
          </span>
          <span className="bg-indigo-600/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-400/20 text-white font-mono">
            {clip.durationSeconds}s
          </span>
          <span className="bg-purple-600/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-purple-400/20 text-white">
            {clip.aspectRatio === 'custom' && clip.customWidth && clip.customHeight ? `${clip.customWidth}x${clip.customHeight}` : clip.aspectRatio}
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="h-16 flex gap-3">
        {/* Download MP4 */}
        <a
          href={clip.downloadUrl}
          download
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-slate-100 hover:bg-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Download MP4</span>
        </a>

        {/* Share Link */}
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-slate-100 hover:bg-slate-800 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Share Link</span>
            </>
          )}
        </button>

        {/* Create Another Clip */}
        <button
          type="button"
          onClick={onNewClip}
          title="Create another clip"
          className="w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {onDeleteClip && (
          <button
            type="button"
            onClick={() => onDeleteClip(clip.id)}
            title="Delete clip"
            className="w-12 bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
