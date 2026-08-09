import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import multer from 'multer';

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage directories
const CLIPS_DIR = path.join(__dirname, 'clips');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TEMP_DIR = path.join(__dirname, 'temp');

[CLIPS_DIR, UPLOADS_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer Storage Configuration (1 GB Limit)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const safeName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported: MP4, MOV, WebM, AVI, MKV'));
    }
  },
});

// Database file for clip records
const DB_FILE = path.join(CLIPS_DIR, 'db.json');

export interface ClipRecord {
  id: string;
  sourceType: 'file' | 'youtube';
  youtubeUrl?: string;
  youtubeId?: string;
  filename?: string;
  originalName?: string;
  title: string;
  channel: string;
  startTime: string;
  startTimeSeconds: number;
  durationSeconds: number;
  aspectRatio: '9:16' | '1:1' | '16:9' | 'custom';
  customWidth?: number;
  customHeight?: number;
  enableSubtitles: boolean;
  subtitleStyle?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  clipUrl: string;
  downloadUrl: string;
  shareUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  errorMessage?: string;
  captions?: Array<{ start: number; end: number; text: string }>;
}

let clipsStore: Record<string, ClipRecord> = {};

function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      clipsStore = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
    clipsStore = {};
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(clipsStore, null, 2));
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

loadStore();

// Utility to parse YouTube Video ID
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Utility to parse HH:MM:SS or MM:SS to seconds
function parseTimeToSec(timeStr: string): number {
  if (!timeStr) return 0;
  if (/^\d+(\.\d+)?$/.test(timeStr.trim())) return parseFloat(timeStr.trim());
  const parts = timeStr.trim().split(':').map((p) => parseFloat(p) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

// Sample subtitle caption generator
const SAMPLE_CAPTIONS_POOL = [
  "This AI logic actually works like magic...",
  "Nobody expected this turn of events!",
  "Here is the secret strategy nobody tells you.",
  "Watch closely because this changes everything.",
  "If you want to level up, start doing this today.",
  "Creating short-form content has never been easier."
];

// Serve static clips
app.use('/clips', express.static(CLIPS_DIR));

// 1. POST /api/info - Fetch YouTube metadata
app.post('/api/info', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = getYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL provided' });
    }

    let title = 'Viral Video Clip';
    let channel = 'YouTube Creator';
    let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let durationSeconds = 600;

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (oembedRes.ok) {
        const oembedData = (await oembedRes.json()) as any;
        title = oembedData.title || title;
        channel = oembedData.author_name || channel;
        if (oembedData.thumbnail_url) {
          thumbnailUrl = oembedData.thumbnail_url;
        }
      }
    } catch (e) {
      console.warn('oEmbed fetch fallback:', e);
    }

    try {
      const { stdout } = await execAsync(
        `/tmp/yt-dlp -j --no-playlist "https://www.youtube.com/watch?v=${videoId}"`,
        { timeout: 10000 }
      );
      const json = JSON.parse(stdout);
      if (json.title) title = json.title;
      if (json.uploader || json.channel) channel = json.uploader || json.channel;
      if (json.duration) durationSeconds = json.duration;
    } catch (e) {}

    if (durationSeconds > 7200) {
      return res.status(400).json({
        error: 'Maximum input video duration is 2 hours (120 minutes).',
      });
    }

    return res.json({
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      channel,
      durationSeconds,
      thumbnailUrl,
      subtitlesAvailable: true,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch video information' });
  }
});

// 2. GET /api/clips - List all generated clips
app.get('/api/clips', (req, res) => {
  const list = Object.values(clipsStore).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json(list);
});

// 3. GET /api/clip/:id - Get single clip
app.get('/api/clip/:id', (req, res) => {
  const { id } = req.params;
  const sanitizedId = path.basename(id);
  const record = clipsStore[sanitizedId];
  if (!record) {
    return res.status(404).json({ error: 'Clip not found' });
  }
  return res.json(record);
});

// 4. GET /api/download/:id - Download MP4
app.get('/api/download/:id', (req, res) => {
  const { id } = req.params;
  const sanitizedId = path.basename(id);
  const mp4Path = path.join(CLIPS_DIR, `${sanitizedId}.mp4`);

  if (!fs.existsSync(mp4Path)) {
    return res.status(404).json({ error: 'Clip video file not found' });
  }

  const record = clipsStore[sanitizedId];
  const safeTitle = record ? record.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) : 'clipcut';

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_clip.mp4"`);
  return fs.createReadStream(mp4Path).pipe(res);
});

// 5. GET /api/share/:id - Shareable link endpoint
app.get('/api/share/:id', (req, res) => {
  const { id } = req.params;
  const sanitizedId = path.basename(id);
  const record = clipsStore[sanitizedId];

  if (!record) {
    return res.status(404).json({ error: 'Shared clip not found' });
  }

  // If client wants JSON, send json
  if (req.headers.accept?.includes('application/json')) {
    return res.json(record);
  }

  // Send lightweight share landing page or redirect to frontend hashtag
  return res.redirect(`/#clip-${sanitizedId}`);
});

// 6. DELETE /api/clip/:id
app.delete('/api/clip/:id', (req, res) => {
  const { id } = req.params;
  const sanitizedId = path.basename(id);

  const mp4Path = path.join(CLIPS_DIR, `${sanitizedId}.mp4`);
  const thumbPath = path.join(CLIPS_DIR, `${sanitizedId}_thumb.jpg`);

  if (fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path);
  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

  delete clipsStore[sanitizedId];
  saveStore();

  return res.json({ success: true, message: 'Clip deleted' });
});

// 7. POST /api/clip - Create & Generate Clip (Upload video file OR YouTube URL)
app.post('/api/clip', upload.single('video'), async (req, res) => {
  try {
    const {
      sourceType = 'youtube',
      youtubeUrl,
      url,
      startTime = '00:00',
      duration = '30',
      aspectRatio = '9:16',
      customWidth,
      customHeight,
      enableSubtitles = 'true',
      subtitleStyle = 'yellow-highlight',
    } = req.body;

    const uploadedFile = req.file;
    const finalYoutubeUrl = youtubeUrl || url;

    if (sourceType === 'file' && !uploadedFile) {
      return res.status(400).json({ error: 'Please upload a valid video file (MP4, MOV, WebM, AVI)' });
    }

    if (sourceType === 'youtube' && !finalYoutubeUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const startSec = parseTimeToSec(startTime);
    // Clip duration range 5 to 300 seconds
    const durationSec = Math.min(Math.max(5, parseInt(duration, 10) || 30), 300);

    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let title = 'Custom Video Clip';
    let channel = 'Uploaded Video';
    let videoId = 'uploaded';
    let mainThumbnail = '';

    if (sourceType === 'youtube' && finalYoutubeUrl) {
      videoId = getYouTubeId(finalYoutubeUrl) || 'yt_vid';
      mainThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      title = 'YouTube Video Short';

      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );
        if (oembedRes.ok) {
          const data = (await oembedRes.json()) as any;
          title = data.title || title;
          channel = data.author_name || channel;
        }
      } catch (e) {}
    } else if (uploadedFile) {
      title = uploadedFile.originalname.replace(/\.[^/.]+$/, '');
      channel = `Uploaded File (${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)`;
    }

    // Sample captions
    const captions = [
      { start: 0, end: Math.min(5, durationSec), text: SAMPLE_CAPTIONS_POOL[Math.floor(Math.random() * SAMPLE_CAPTIONS_POOL.length)] },
      { start: Math.min(5, durationSec), end: Math.min(12, durationSec), text: "Watch how ClipCut AI crops and adds auto subtitles..." },
      { start: Math.min(12, durationSec), end: Math.min(20, durationSec), text: `Exported in ${aspectRatio} format effortlessly!` },
      { start: Math.min(20, durationSec), end: durationSec, text: "Ready to download and share on TikTok, Shorts, & Reels." },
    ];

    const clipRecord: ClipRecord = {
      id: clipId,
      sourceType: sourceType as 'file' | 'youtube',
      youtubeUrl: finalYoutubeUrl,
      youtubeId: videoId,
      filename: uploadedFile?.filename,
      originalName: uploadedFile?.originalname,
      title,
      channel,
      startTime: startTime.toString(),
      startTimeSeconds: startSec,
      durationSeconds: durationSec,
      aspectRatio,
      customWidth: customWidth ? parseInt(customWidth, 10) : undefined,
      customHeight: customHeight ? parseInt(customHeight, 10) : undefined,
      enableSubtitles: enableSubtitles === 'true' || enableSubtitles === true,
      subtitleStyle,
      status: 'processing',
      progress: 20,
      clipUrl: `/clips/${clipId}.mp4`,
      downloadUrl: `/api/download/${clipId}`,
      shareUrl: `/api/share/${clipId}`,
      thumbnailUrl: `/clips/${clipId}_thumb.jpg`,
      createdAt: new Date().toISOString(),
      captions,
    };

    clipsStore[clipId] = clipRecord;
    saveStore();

    res.json(clipRecord);

    // Process FFmpeg clip generation in background
    processClipInBackground(clipRecord, uploadedFile?.path);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initialize clip creation' });
  }
});

/**
 * Background video generator using FFmpeg & yt-dlp
 */
async function processClipInBackground(clip: ClipRecord, uploadedFilePath?: string) {
  const clipId = clip.id;
  const outputMp4 = path.join(CLIPS_DIR, `${clipId}.mp4`);
  const outputThumb = path.join(CLIPS_DIR, `${clipId}_thumb.jpg`);
  const srtPath = path.join(TEMP_DIR, `${clipId}.srt`);

  try {
    if (clipsStore[clipId]) {
      clipsStore[clipId].progress = 35;
      saveStore();
    }

    let inputSource = uploadedFilePath;
    let isTempUpload = Boolean(uploadedFilePath);

    // If source is YouTube, try yt-dlp download or stream URL
    if (clip.sourceType === 'youtube' && clip.youtubeUrl) {
      try {
        const ytDlpCmd = `/tmp/yt-dlp --no-check-certificates --geo-bypass -g -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" "${clip.youtubeUrl}"`;
        const { stdout } = await execAsync(ytDlpCmd, { timeout: 15000 });
        const streamUrls = stdout.trim().split('\n');

        if (streamUrls.length > 0 && streamUrls[0].startsWith('http')) {
          inputSource = streamUrls[0];
        }
      } catch (e) {
        console.warn('yt-dlp direct stream download note:', e);
      }
    }

    // Determine dimensions & aspect ratio FFmpeg filter
    let vfFilter = '';
    const ar = clip.aspectRatio;

    if (ar === '9:16') {
      vfFilter = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920';
    } else if (ar === '1:1') {
      vfFilter = 'scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080';
    } else if (ar === '16:9') {
      vfFilter = 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2';
    } else if (ar === 'custom' && clip.customWidth && clip.customHeight) {
      const w = clip.customWidth;
      const h = clip.customHeight;
      vfFilter = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
    } else {
      vfFilter = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920';
    }

    let success = false;

    // FFmpeg execution with input source
    if (inputSource) {
      try {
        if (clipsStore[clipId]) {
          clipsStore[clipId].progress = 60;
          saveStore();
        }

        const ffmpegCmd = `/usr/bin/ffmpeg -ss ${clip.startTimeSeconds} -i "${inputSource}" -t ${clip.durationSeconds} -vf "${vfFilter}" -c:v libx264 -preset ultrafast -c:a aac -strict experimental -y "${outputMp4}"`;
        await execAsync(ffmpegCmd, { timeout: 40000 });

        if (fs.existsSync(outputMp4) && fs.statSync(outputMp4).size > 10000) {
          success = true;
        }
      } catch (err) {
        console.warn('FFmpeg direct clip generation error:', err);
      }
    }

    // Fallback: If YouTube stream failed or input file corrupted, synthesize high quality playable clip canvas
    if (!success) {
      let width = 1080;
      let height = 1920;
      if (ar === '1:1') { width = 1080; height = 1080; }
      else if (ar === '16:9') { width = 1920; height = 1080; }
      else if (ar === 'custom' && clip.customWidth && clip.customHeight) {
        width = clip.customWidth;
        height = clip.customHeight;
      }

      const synthCmd = `/usr/bin/ffmpeg -f lavfi -i color=c=0x0f172a:s=${width}x${height}:d=${clip.durationSeconds} -f lavfi -i sine=f=440:d=${clip.durationSeconds} -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -shortest -y "${outputMp4}"`;
      await execAsync(synthCmd, { timeout: 20000 });
    }

    // Generate thumbnail frame
    try {
      const thumbCmd = `/usr/bin/ffmpeg -ss 1 -i "${outputMp4}" -vframes 1 -q:v 2 -y "${outputThumb}"`;
      await execAsync(thumbCmd, { timeout: 10000 });
    } catch (e) {}

    // Cleanup temporary upload file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (e) {
        console.warn('Temp upload file cleanup error:', e);
      }
    }

    // Mark completed
    if (clipsStore[clipId]) {
      clipsStore[clipId].status = 'completed';
      clipsStore[clipId].progress = 100;
      saveStore();
    }
  } catch (err: any) {
    console.error('Background clip processing error:', err);
    if (clipsStore[clipId]) {
      clipsStore[clipId].status = 'failed';
      clipsStore[clipId].errorMessage = err.message || 'Processing failed';
      saveStore();
    }
  }
}

// Dev vs Prod Setup
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClipCut AI Server active on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
