/**
 * Parses time string like "01:20", "1:20:30", or "80" into total seconds.
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  
  // If user entered plain number
  if (/^\d+(\.\d+)?$/.test(timeStr.trim())) {
    return Math.max(0, parseFloat(timeStr.trim()));
  }

  const parts = timeStr.trim().split(':').map(p => parseFloat(p) || 0);
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return 0;
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatSecondsToTime(seconds: number, includeHours = false): string {
  const secs = Math.max(0, Math.floor(seconds));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (h > 0 || includeHours) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Extract YouTube Video ID from standard YouTube links
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Patterns for standard watch, shorts, embed, generate link
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const id = extractYouTubeId(url);
  if (id) return true;
  
  // Allow direct mp4 / video links for testing flexibility
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (/\.(mp4|webm|mov|mkv)($|\?)/i.test(url)) return true;
  }
  return false;
}
