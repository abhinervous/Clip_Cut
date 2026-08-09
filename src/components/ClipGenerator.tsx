import React, { useState, useEffect } from 'react';
import { AspectRatio, ClipRequest, ClipSourceType, SubtitleStyle, VideoMetadata } from '../types';
import { isValidYouTubeUrl, parseTimeToSeconds, formatSecondsToTime } from '../utils/timeUtils';
import { fetchVideoInfo } from '../utils/api';
import { UploadDropzone } from './UploadDropzone';
import {
  Upload,
  Youtube,
  Clock,
  Sparkles,
  Maximize2,
  Subtitles,
  Scissors,
  Loader2,
  Layers,
  AlertCircle,
  Smartphone,
  Square,
  Tv,
  Settings2,
  Sliders
} from 'lucide-react';

interface ClipGeneratorProps {
  initialUrl?: string;
  initialStartTime?: string;
  isGenerating: boolean;
  onGenerate: (request: ClipRequest) => void;
  onError: (msg: string) => void;
  defaultSourceType?: ClipSourceType;
}

export const ClipGenerator: React.FC<ClipGeneratorProps> = ({
  initialUrl = '',
  initialStartTime = '00:00',
  isGenerating,
  onGenerate,
  onError,
  defaultSourceType = 'file',
}) => {
  const [sourceType, setSourceType] = useState<ClipSourceType>(defaultSourceType);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number>(0);

  // YouTube state
  const [url, setUrl] = useState(initialUrl);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Clip Settings
  const [startTime, setStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState<number>(30); // 15s, 30s, 45s, 60s or custom
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1920);
  const [enableSubtitles, setEnableSubtitles] = useState<boolean>(true);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('yellow-highlight');

  // Sync initial props
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      setSourceType('youtube');
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
    } catch (err) {}
  };

  const handleFileSelected = (file: File | null, durationSec: number) => {
    setSelectedFile(file);
    setFileDuration(durationSec);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === 'file') {
      if (!selectedFile) {
        onError('Please upload or drag & drop a video file first.');
        return;
      }
    } else {
      if (!url.trim() || !isValidYouTubeUrl(url)) {
        onError('Please enter a valid YouTube video link');
        return;
      }
    }

    const startSec = parseTimeToSeconds(startTime);
    const totalDuration = sourceType === 'file' ? fileDuration : metadata?.durationSeconds || 7200;

    if (totalDuration > 0 && startSec >= totalDuration) {
      onError('Start time cannot exceed the total video duration');
      return;
    }

    onGenerate({
      sourceType,
      videoFile: selectedFile || undefined,
      youtubeUrl: url.trim(),
      startTime,
      durationSeconds: duration,
      aspectRatio,
      customWidth: aspectRatio === 'custom' ? customWidth : undefined,
      customHeight: aspectRatio === 'custom' ? customHeight : undefined,
      enableSubtitles,
      subtitleStyle,
    });
  };

  const adjustStartTime = (deltaSec: number) => {
    const currentSec = parseTimeToSeconds(startTime);
    const newSec = Math.max(0, currentSec + deltaSec);
    setStartTime(formatSecondsToTime(newSec, newSec >= 3600));
  };

  const currentStartSec = parseTimeToSeconds(startTime);
  const maxSeek = sourceType === 'file' ? Math.max(10, fileDuration - duration) : metadata ? Math.max(10, metadata.durationSeconds - duration) : 3600;

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-2xl">
      {/* Tab Selector: Upload Video vs YouTube Link */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setSourceType('file')}
          className={`flex-1 py-3 px-4 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sourceType === 'file'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Video File</span>
        </button>

        <button
          type="button"
          onClick={() => setSourceType('youtube')}
          className={`flex-1 py-3 px-4 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sourceType === 'youtube'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-400" />
          <span>YouTube Link</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* SOURCE INPUT SECTION */}
        {sourceType === 'file' ? (
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-400" /> 1. Upload Video File
            </label>
            <UploadDropzone
              onFileSelected={handleFileSelected}
              selectedFile={selectedFile}
              fileDuration={fileDuration}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-400" /> 1. YouTube Video URL
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Paste Link
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="Paste YouTube link (https://www.youtube.com/watch?v=...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 pr-10"
              />
              {isLoadingMeta && (
                <div className="absolute right-3">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>

            {metaError && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {metaError}
              </p>
            )}

            {metadata && (
              <div className="mt-3 flex items-center gap-3 bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl">
                <img
                  src={metadata.thumbnailUrl}
                  alt={metadata.title}
                  className="w-16 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-100 truncate">{metadata.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{metadata.channel}</p>
                </div>
                <span className="text-xs font-mono bg-slate-900 px-2.5 py-1 rounded-md text-indigo-300 border border-indigo-500/30">
                  {formatSecondsToTime(metadata.durationSeconds)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. START TIME & DURATION CONFIGURATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-slate-300 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" /> Start Time
              </label>
              <span className="text-xs font-mono text-indigo-300 font-bold">
                {formatSecondsToTime(currentStartSec)}
              </span>
            </div>

            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="00:01:20 or 80"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />

            {/* Adjustment Pills */}
            <div className="flex gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => adjustStartTime(15)}
                className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => adjustStartTime(30)}
                className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => adjustStartTime(60)}
                className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Clip Duration */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> Duration
              </label>
              <span className="text-xs font-mono text-purple-300 font-bold">
                {duration} Seconds
              </span>
            </div>

            {/* Presets: 15s, 30s, 45s, 60s */}
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 30, 45, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    duration === d
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            {/* Slider for custom duration 5s - 120s */}
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Start Time Scrub Slider if duration known */}
        {(selectedFile || metadata) && maxSeek > 0 && (
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <input
              type="range"
              min="0"
              max={maxSeek}
              value={currentStartSec}
              onChange={(e) => {
                const sec = parseInt(e.target.value, 10);
                setStartTime(formatSecondsToTime(sec, (sourceType === 'file' ? fileDuration : metadata?.durationSeconds || 0) >= 3600));
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>00:00</span>
              <span className="text-indigo-300 font-semibold">
                Range: {formatSecondsToTime(currentStartSec)} – {formatSecondsToTime(currentStartSec + duration)}
              </span>
              <span>
                {formatSecondsToTime(sourceType === 'file' ? fileDuration : metadata?.durationSeconds || 0)}
              </span>
            </div>
          </div>
        )}

        {/* 3. ASPECT RATIO / DIMENSIONS */}
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-400 mb-2 block font-bold flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-indigo-400" /> 3. Video Dimensions / Aspect Ratio
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-bold">9:16 Vertical</span>
              <span className="text-[10px] opacity-70">Shorts / Reels</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('1:1')}
              className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Square className="w-5 h-5" />
              <span className="text-xs font-bold">1:1 Square</span>
              <span className="text-[10px] opacity-70">Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Tv className="w-5 h-5" />
              <span className="text-xs font-bold">16:9 Landscape</span>
              <span className="text-[10px] opacity-70">YouTube HD</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('custom')}
              className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                aspectRatio === 'custom'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-xs font-bold">Custom Dimensions</span>
              <span className="text-[10px] opacity-70">Width x Height</span>
            </button>
          </div>

          {/* Custom Dimension Input fields */}
          {aspectRatio === 'custom' && (
            <div className="mt-3 p-3 bg-slate-950 border border-indigo-500/30 rounded-xl flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Width:</span>
                <input
                  type="number"
                  min="240"
                  max="3840"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value, 10) || 1080)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
              <span className="text-slate-500 font-bold">×</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Height:</span>
                <input
                  type="number"
                  min="240"
                  max="3840"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value, 10) || 1920)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500">px</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. SUBTITLES */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Subtitles className="w-5 h-5 text-yellow-400" />
              <div>
                <span className="text-xs font-bold text-slate-100 block">4. Automatic English Subtitles</span>
                <span className="text-[11px] text-slate-400">Burn synchronized captions into clip</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEnableSubtitles(!enableSubtitles)}
              className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                enableSubtitles ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  enableSubtitles ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {enableSubtitles && (
            <div className="flex gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setSubtitleStyle('yellow-highlight')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  subtitleStyle === 'yellow-highlight'
                    ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Yellow Highlight
              </button>

              <button
                type="button"
                onClick={() => setSubtitleStyle('cyber-cyan')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  subtitleStyle === 'cyber-cyan'
                    ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Cyber Cyan
              </button>

              <button
                type="button"
                onClick={() => setSubtitleStyle('white-minimal')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  subtitleStyle === 'white-minimal'
                    ? 'bg-white/20 text-white border-white/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                White Minimal
              </button>
            </div>
          )}
        </div>

        {/* 5. SUBMIT GENERATE BUTTON */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl font-bold text-sm md:text-base text-white shadow-xl shadow-indigo-500/25 hover:scale-[1.01] active:scale-98 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center gap-2.5 border border-indigo-400/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Processing Clip & Rendering Subtitles...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Create {duration}s Video Clip</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
