import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize
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

  // Synchronize playback state
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

  // Find active subtitle caption for current time
  const currentCaption = clip?.captions?.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  )?.text || (clip?.enableSubtitles ? clip?.title : null);

  // Aspect ratio frame size classes
  const getAspectRatioClasses = () => {
    if (!clip) return 'w-[300px] h-[533px]'; // 9:16 default
    switch (clip.aspectRatio) {
      case '1:1':
        return 'w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]';
      case '16:9':
        return 'w-full max-w-[640px] aspect-video';
      case '9:16':
      default:
        return 'w-[280px] h-[500px] sm:w-[320px] sm:h-[568px]';
    }
  };

  if (!clip) {
    return (
      <div className="flex-1 bg-black/60 rounded-[32px] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[500px]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)]" />
        
        {/* Placeholder Frame */}
        <div className="w-[280px] h-[480px] bg-[#111] rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 text-center group">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Clip Preview Studio</h3>
          <p className="text-xs text-white/50 leading-relaxed mb-6">
            Paste a YouTube URL on the left panel and click <strong className="text-indigo-300">Generate Clip</strong> to create your 30s short.
          </p>

          <div className="absolute bottom-16 left-4 right-4 bg-black/80 backdrop-blur px-3 py-2 rounded text-xs font-bold border border-white/20 text-yellow-400 italic shadow-xl">
            "Auto English subtitles & viral 9:16 vertical video..."
          </div>
        </div>

        <div className="absolute top-6 left-6 flex gap-2">
          <span className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1 text-white/60">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> READY FOR INPUT
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Main Player Container */}
      <div className="flex-1 bg-black/60 rounded-[32px] border border-white/10 relative overflow-hidden flex items-center justify-center p-4 min-h-[520px]">
        {/* Ambient Radial Glow */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_50%,#6366f1,transparent_70%)] pointer-events-none" />

        {/* Video Player Card */}
        <div className={`${getAspectRatioClasses()} bg-[#0d0d12] rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative group flex items-center justify-center`}>
          {clip.status === 'processing' ? (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Rendering {clip.durationSeconds}s Clip</h4>
                <p className="text-[11px] text-white/50 mt-1">Applying FFmpeg aspect ratio & captions</p>
              </div>
              <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${clip.progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              {/* HTML5 Video Element */}
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

              {/* Subtitle Overlay Box */}
              {clip.enableSubtitles && currentCaption && (
                <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none transition-all">
                  <span
                    className={`inline-block backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-2xl border ${
                      clip.subtitleStyle === 'cyber-cyan'
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-cyan-500/30'
                        : clip.subtitleStyle === 'classic-minimal'
                        ? 'bg-black/90 text-white border-white/30'
                        : 'bg-black/80 text-yellow-400 border-yellow-400/30 shadow-yellow-500/20'
                    }`}
                  >
                    "{currentCaption}"
                  </span>
                </div>
              )}

              {/* Play / Pause Center Overlay Button */}
              <button
                onClick={togglePlay}
                className={`absolute w-14 h-14 bg-black/40 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center text-white cursor-pointer transition-all duration-200 ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 scale-105'
                }`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
              </button>

              {/* Video Bottom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={togglePlay} className="text-white hover:text-indigo-400 p-1">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex-1 mx-3 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-indigo-500 h-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono text-white/80 mr-2">
                  00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:{clip.durationSeconds}
                </span>

                <button onClick={toggleMute} className="text-white hover:text-indigo-400 p-1">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Top Floating Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <span className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1 text-white">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            LIVE PREVIEW
          </span>
          <span className="bg-indigo-500/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-400/20 text-white font-mono">
            00:{clip.durationSeconds}s
          </span>
          <span className="bg-purple-500/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-purple-400/20 text-white">
            {clip.aspectRatio}
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="h-16 flex gap-3">
        {/* Download MP4 */}
        <a
          href={clip.downloadUrl}
          download
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white hover:bg-white/10 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Download MP4</span>
        </a>

        {/* Share Link */}
        <button
          onClick={handleShare}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer shadow-lg"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Link Copied!</span>
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
          onClick={onNewClip}
          title="Create another clip"
          className="w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Delete button if available */}
        {onDeleteClip && (
          <button
            onClick={() => onDeleteClip(clip.id)}
            title="Delete clip"
            className="w-12 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 rounded-2xl flex items-center justify-center text-white/50 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
