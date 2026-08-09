export type AspectRatio = '9:16' | '1:1' | '16:9';

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
  url: string;
  startTime: string; // HH:MM:SS or MM:SS or seconds string
  durationSeconds: number; // default 30
  aspectRatio: AspectRatio;
  enableSubtitles: boolean;
  subtitleStyle?: 'yellow-highlight' | 'cyber-cyan' | 'classic-minimal';
}

export interface ClipItem {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  channel: string;
  startTime: string;
  startTimeSeconds: number;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  enableSubtitles: boolean;
  subtitleStyle?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  clipUrl: string;
  downloadUrl: string;
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
