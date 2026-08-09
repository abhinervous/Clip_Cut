export type AspectRatio = '9:16' | '1:1' | '16:9' | 'custom';
export type SubtitleStyle = 'yellow-highlight' | 'white-minimal' | 'cyber-cyan';
export type ClipSourceType = 'file' | 'youtube';

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  channel: string;
  durationSeconds: number;
  thumbnailUrl: string;
  subtitlesAvailable?: boolean;
}

export interface ClipRequest {
  sourceType: ClipSourceType;
  videoFile?: File;
  youtubeUrl?: string;
  startTime: string; // HH:MM:SS or MM:SS or seconds
  durationSeconds: number; // 5 to 300 seconds
  aspectRatio: AspectRatio;
  customWidth?: number;
  customHeight?: number;
  enableSubtitles: boolean;
  subtitleStyle?: SubtitleStyle;
}

export interface ClipItem {
  id: string;
  sourceType: ClipSourceType;
  youtubeUrl?: string;
  youtubeId?: string;
  filename?: string;
  title: string;
  channel: string;
  startTime: string;
  startTimeSeconds: number;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  customWidth?: number;
  customHeight?: number;
  enableSubtitles: boolean;
  subtitleStyle?: SubtitleStyle;
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  clipUrl: string;
  downloadUrl: string;
  shareUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  errorMessage?: string;
  captions?: Array<{ start: number; end: number; text: string }>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
