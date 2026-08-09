import { ClipItem, ClipRequest, VideoMetadata } from '../types';

export async function fetchVideoInfo(url: string): Promise<VideoMetadata> {
  const res = await fetch('/api/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to parse video info' }));
    throw new Error(err.error || 'Failed to fetch video information');
  }

  return res.json();
}

export async function createClip(request: ClipRequest): Promise<ClipItem> {
  const res = await fetch('/api/clip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: request.url,
      startTime: request.startTime,
      duration: request.durationSeconds,
      aspectRatio: request.aspectRatio,
      enableSubtitles: request.enableSubtitles,
      subtitleStyle: request.subtitleStyle,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Clip creation failed' }));
    throw new Error(err.error || 'Failed to create video clip');
  }

  return res.json();
}

export async function fetchRecentClips(): Promise<ClipItem[]> {
  try {
    const res = await fetch('/api/clips');
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('Failed to fetch recent clips:', err);
    return [];
  }
}

export async function fetchClipStatus(id: string): Promise<ClipItem> {
  const res = await fetch(`/api/clip/${id}`);
  if (!res.ok) {
    throw new Error('Clip not found');
  }
  return res.json();
}

export async function deleteClip(id: string): Promise<void> {
  await fetch(`/api/clip/${id}`, { method: 'DELETE' });
}
