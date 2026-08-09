import React, { useState, useRef } from 'react';
import { Upload, FileVideo, X, CheckCircle2, AlertCircle, Film, Clock } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelected: (file: File | null, durationSeconds: number) => void;
  selectedFile: File | null;
  fileDuration: number;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  selectedFile,
  fileDuration,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remainingSec = Math.floor(sec % 60);
    return `${mins}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const handleFile = (file: File) => {
    setErrorMsg(null);

    const validExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext) && !file.type.startsWith('video/')) {
      setErrorMsg('Invalid file type. Please upload a video file (MP4, MOV, WebM, AVI, MKV).');
      return;
    }

    if (file.size > 1024 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size limit is 1 GB.');
      return;
    }

    // Create object URL to inspect duration
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;

    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration || 0;
      if (dur > 7200) {
        setErrorMsg('Video duration exceeds 2 hours limit.');
        onFileSelected(null, 0);
      } else {
        onFileSelected(file, dur);
      }
    };

    tempVideo.onerror = () => {
      // Fallback if metadata fails to load
      onFileSelected(file, 60);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(null);
    setErrorMsg(null);
    onFileSelected(null, 0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,.mp4,.mov,.webm,.avi,.mkv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900/80'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mb-1">
            Drag & Drop your video file here
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            or <span className="text-indigo-400 hover:underline font-medium">browse files</span> from your device
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            {['.MP4', '.MOV', '.WEBM', '.AVI'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-slate-800 border border-slate-700/60 text-slate-300"
              >
                {fmt}
              </span>
            ))}
            <span className="text-xs text-slate-500 ml-1">Up to 1 GB (2 Hours max)</span>
          </div>
        </div>
      ) : (
        <div className="relative border border-slate-700 rounded-2xl p-4 bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row items-center gap-4">
          {/* Mini video preview */}
          {videoPreviewUrl ? (
            <div className="relative w-full md:w-40 h-28 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-800">
              <video
                src={videoPreviewUrl}
                className="w-full h-full object-cover"
                muted
                onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                onMouseOut={(e) => {
                  const v = e.target as HTMLVideoElement;
                  v.pause();
                  v.currentTime = 0;
                }}
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(fileDuration)}
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <FileVideo className="w-6 h-6" />
            </div>
          )}

          {/* File details */}
          <div className="flex-1 min-w-0 text-left w-full">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-slate-100 truncate">
                {selectedFile.name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>Size: <strong className="text-slate-200">{formatFileSize(selectedFile.size)}</strong></span>
              {fileDuration > 0 && (
                <span>Duration: <strong className="text-slate-200">{formatTime(fileDuration)}</strong></span>
              )}
              <span className="text-indigo-400 font-medium">Ready for Clipping</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Change File
            </button>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
