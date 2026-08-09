import React, { useState, useEffect } from 'react';
import { AspectRatio, ClipRequest, VideoMetadata } from '../types';
import { isValidYouTubeUrl, parseTimeToSeconds, formatSecondsToTime } from '../utils/timeUtils';
import { fetchVideoInfo } from '../utils/api';
import { 
  Youtube, 
  Clock, 
  Sparkles, 
  Maximize2, 
  Subtitles, 
  Scissors, 
  Loader2, 
  Layers, 
  Plus, 
  Check, 
  AlertCircle,
  Smartphone,
  Square,
  Tv
} from 'lucide-react';

interface ClipGeneratorProps {
  initialUrl?: string;
  initialStartTime?: string;
  isGenerating: boolean;
  onGenerate: (request: ClipRequest) => void;
  onError: (msg: string) => void;
}

export const ClipGenerator: React.FC<ClipGeneratorProps> = ({
  initialUrl = '',
  initialStartTime = '00:00',
  isGenerating,
  onGenerate,
  onError,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState<number>(30); // default 30s
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [enableSubtitles, setEnableSubtitles] = useState<boolean>(true);
  const [subtitleStyle, setSubtitleStyle] = useState<'yellow-highlight' | 'cyber-cyan' | 'classic-minimal'>('yellow-highlight');

  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialUrl && initialUrl !== url) {
      setUrl(initialUrl);
      if (isValidYouTubeUrl(initialUrl)) {
        loadMetadata(initialUrl);
      }
    }
  }, [initialUrl]);

  useEffect(() => {
    if (initialStartTime) {
      setStartTime(initialStartTime);
    }
  }, [initialStartTime]);

  const loadMetadata = async (targetUrl: string) => {
    if (!isValidYouTubeUrl(targetUrl)) {
      setMetaError('Please enter a valid YouTube URL');
      setMetadata(null);
      return;
    }

    setIsLoadingMeta(true);
    setMetaError(null);

    try {
      const data = await fetchVideoInfo(targetUrl);
      setMetadata(data);
    } catch (err: any) {
      setMetaError(err.message || 'Could not load video details');
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && (!metadata || metadata.url !== url)) {
      loadMetadata(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        loadMetadata(text);
      }
    } catch (err) {
      // Clipboard access denied
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedUrl = e.dataTransfer.getData('text');
    if (droppedUrl) {
      setUrl(droppedUrl);
      loadMetadata(droppedUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim() || !isValidYouTubeUrl(url)) {
      onError('Please provide a valid YouTube video link');
      return;
    }

    const startSec = parseTimeToSeconds(startTime);
    if (metadata && startSec >= metadata.durationSeconds) {
      onError('Start time cannot exceed total video duration');
      return;
    }

    onGenerate({
      url: url.trim(),
      startTime,
      durationSeconds: duration,
      aspectRatio,
      enableSubtitles,
      subtitleStyle,
    });
  };

  // Adjust start time with quick buttons
  const adjustStartTime = (deltaSec: number) => {
    const currentSec = parseTimeToSeconds(startTime);
    const newSec = Math.max(0, currentSec + deltaSec);
    setStartTime(formatSecondsToTime(newSec, newSec >= 3600));
  };

  const currentStartSec = parseTimeToSeconds(startTime);
  const totalVideoSec = metadata?.durationSeconds || 3600;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Scissors className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Clip Configuration
          </h2>
        </div>
        <span className="text-[11px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          Max video: 2 hours
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 1. YouTube URL Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5 text-red-400" /> YouTube Video Source
            </label>
            <button
              type="button"
              onClick={handlePaste}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Paste Link
            </button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="Paste YouTube link (https://www.youtube.com/watch?v=...)"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 pr-10"
            />
            {isLoadingMeta && (
              <div className="absolute right-3">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
            )}
          </div>

          {metaError && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {metaError}
            </p>
          )}
        </div>

        {/* Video Metadata Card if fetched */}
        {metadata && (
          <div className="flex items-center gap-3 bg-indigo-950/30 border border-indigo-500/20 p-2.5 rounded-xl">
            <img
              src={metadata.thumbnailUrl}
              alt={metadata.title}
              className="w-16 h-10 object-cover rounded-lg border border-white/10 shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{metadata.title}</h4>
              <p className="text-[11px] text-white/50 truncate">{metadata.channel}</p>
            </div>
            <span className="text-[10px] font-mono bg-black/60 px-2 py-1 rounded text-indigo-300 border border-indigo-500/30">
              {formatSecondsToTime(metadata.durationSeconds)}
            </span>
          </div>
        )}

        {/* 2. Start Time & Duration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Time Input */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/60 mb-1.5 block font-bold flex items-center justify-between">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time</span>
              <span className="text-[10px] font-mono text-indigo-300">{formatSecondsToTime(currentStartSec)}</span>
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="00:01:20"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {/* Quick time adjustment pills */}
            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => adjustStartTime(15)}
                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/70 font-mono"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => adjustStartTime(30)}
                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/70 font-mono"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => adjustStartTime(60)}
                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/70 font-mono"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/60 mb-1.5 block font-bold flex items-center justify-between">
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-purple-400" /> Duration</span>
              <span className="text-[10px] font-mono text-purple-300">{duration}s</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[15, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    duration === d
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {d}s {d === 30 ? '(Std)' : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Start Time Scrub Slider */}
        {metadata && (
          <div>
            <input
              type="range"
              min="0"
              max={Math.max(10, metadata.durationSeconds - duration)}
              value={currentStartSec}
              onChange={(e) => {
                const sec = parseInt(e.target.value);
                setStartTime(formatSecondsToTime(sec, metadata.durationSeconds >= 3600));
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40 mt-0.5">
              <span>00:00</span>
              <span>Selected Clip: {formatSecondsToTime(currentStartSec)} - {formatSecondsToTime(currentStartSec + duration)}</span>
              <span>{formatSecondsToTime(metadata.durationSeconds)}</span>
            </div>
          </div>
        )}

        {/* 3. Dimensions / Aspect Ratio Selector */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/60 mb-2 block font-bold flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" /> Video Dimensions / Aspect Ratio
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[11px] font-bold">9:16 Shorts</span>
              <span className="text-[9px] opacity-70">TikTok / Reels</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('1:1')}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                aspectRatio === '1:1'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Square className="w-4 h-4" />
              <span className="text-[11px] font-bold">1:1 Square</span>
              <span className="text-[9px] opacity-70">Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span className="text-[11px] font-bold">16:9 Landscape</span>
              <span className="text-[9px] opacity-70">YouTube Widescreen</span>
            </button>
          </div>
        </div>

        {/* 4. Subtitles Toggle & Subtitle Style */}
        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-yellow-400" />
              <div>
                <span className="text-xs font-bold text-white block">Auto English Subtitles</span>
                <span className="text-[10px] text-white/50">Burn synchronized subtitles onto clip</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableSubtitles(!enableSubtitles)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                enableSubtitles ? 'bg-indigo-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  enableSubtitles ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {enableSubtitles && (
            <div className="flex gap-2 pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSubtitleStyle('yellow-highlight')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  subtitleStyle === 'yellow-highlight'
                    ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50'
                    : 'bg-white/5 text-white/50 border-white/5'
                }`}
              >
                Yellow Highlight
              </button>
              <button
                type="button"
                onClick={() => setSubtitleStyle('cyber-cyan')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  subtitleStyle === 'cyber-cyan'
                    ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50'
                    : 'bg-white/5 text-white/50 border-white/5'
                }`}
              >
                Cyber Cyan
              </button>
              <button
                type="button"
                onClick={() => setSubtitleStyle('classic-minimal')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  subtitleStyle === 'classic-minimal'
                    ? 'bg-white/20 text-white border-white/40'
                    : 'bg-white/5 text-white/50 border-white/5'
                }`}
              >
                Classic Minimal
              </button>
            </div>
          )}
        </div>

        {/* 5. Main Action Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl font-bold text-sm text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Processing Video & Subtitles...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Generate {duration}s Viral Clip</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
