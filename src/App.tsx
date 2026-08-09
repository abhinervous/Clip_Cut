import React, { useState, useEffect } from 'react';
import { ClipItem, ClipRequest, ToastMessage } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SampleVideos } from './components/SampleVideos';
import { ClipGenerator } from './components/ClipGenerator';
import { VideoPreview } from './components/VideoPreview';
import { RecentClips } from './components/RecentClips';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { createClip, fetchRecentClips, deleteClip as apiDeleteClip, fetchClipStatus } from './utils/api';
import { Sparkles, Layers, Subtitles, Film, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [activeClip, setActiveClip] = useState<ClipItem | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hero quick inputs
  const [heroUrl, setHeroUrl] = useState<string>('');
  const [heroStartTime, setHeroStartTime] = useState<string>('00:00');

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load clips history on mount
  const loadClips = async () => {
    const data = await fetchRecentClips();
    setClips(data);
    if (data.length > 0 && !activeClip) {
      setActiveClip(data[0]);
    }
  };

  useEffect(() => {
    loadClips();

    // Check for share link hash e.g. #clip-clip_123
    const hash = window.location.hash;
    if (hash && hash.startsWith('#clip-')) {
      const clipId = hash.replace('#clip-', '');
      fetchClipStatus(clipId)
        .then((sharedClip) => {
          setActiveClip(sharedClip);
          addToast('success', `Loaded shared clip: "${sharedClip.title}"`);
        })
        .catch(() => {
          addToast('error', 'Shared clip not found or expired.');
        });
    }
  }, []);

  // Poll active processing clips
  useEffect(() => {
    const hasProcessing = clips.some((c) => c.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      const updatedList = await fetchRecentClips();
      setClips(updatedList);

      if (activeClip) {
        const found = updatedList.find((c) => c.id === activeClip.id);
        if (found) {
          setActiveClip(found);
          if (found.status === 'completed' && activeClip.status === 'processing') {
            addToast('success', 'Your 30-second clip is ready to preview & download!');
          }
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [clips, activeClip]);

  // Handle hero quick start or sample selection
  const handleQuickStart = (url: string, startTime = '00:00') => {
    setHeroUrl(url);
    setHeroStartTime(startTime);
    setActiveTab('studio');
    addToast('info', 'Loaded YouTube video into Clip Configuration!');

    // Smooth scroll to studio panel
    const studioEl = document.getElementById('studio-generator');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Create clip action
  const handleGenerateClip = async (request: ClipRequest) => {
    setIsGenerating(true);
    addToast('info', 'Initializing video downloader & FFmpeg engine...');

    try {
      const newClip = await createClip(request);
      setClips((prev) => [newClip, ...prev]);
      setActiveClip(newClip);
      addToast('success', 'Clip request queued! Processing video & auto subtitles...');
      setActiveTab('studio');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create clip');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete clip action
  const handleDeleteClip = async (id: string) => {
    try {
      await apiDeleteClip(id);
      setClips((prev) => prev.filter((c) => c.id !== id));
      if (activeClip?.id === id) {
        const remaining = clips.filter((c) => c.id !== id);
        setActiveClip(remaining.length > 0 ? remaining[0] : null);
      }
      addToast('info', 'Clip deleted successfully');
    } catch (err) {
      addToast('error', 'Failed to delete clip');
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans flex flex-col selection:bg-indigo-500 selection:text-white antialiased">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top SaaS Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hero Section */}
      <Hero onQuickStart={(url) => handleQuickStart(url, '00:00')} />

      {/* 1-Click Sample Videos Bar */}
      <SampleVideos onSelectSample={(url, startTime) => handleQuickStart(url, startTime)} />

      {/* Main App Workspace */}
      <main id="studio-generator" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Generator Controls & History */}
            <aside className="lg:col-span-5 flex flex-col gap-6">
              <ClipGenerator
                initialUrl={heroUrl}
                initialStartTime={heroStartTime}
                isGenerating={isGenerating}
                onGenerate={handleGenerateClip}
                onError={(msg) => addToast('error', msg)}
              />

              <RecentClips
                clips={clips}
                activeClipId={activeClip?.id}
                onSelectClip={(c) => setActiveClip(c)}
                onDeleteClip={handleDeleteClip}
              />
            </aside>

            {/* Right Column: Interactive Video Preview Stage */}
            <section className="lg:col-span-7 flex flex-col h-full min-h-[550px]">
              <VideoPreview
                clip={activeClip}
                onNewClip={() => {
                  setHeroUrl('');
                  setActiveClip(null);
                  addToast('info', 'Ready for new YouTube video link');
                }}
                onDeleteClip={handleDeleteClip}
                onCopyShareLink={(shareUrl) => {
                  navigator.clipboard.writeText(shareUrl);
                  addToast('success', 'Shareable clip link copied to clipboard!');
                }}
              />
            </section>
          </div>
        )}

        {/* Clip History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Generated Clips Library ({clips.length})
            </h2>

            {clips.length === 0 ? (
              <p className="text-white/50 text-sm py-8 text-center">No clips generated yet. Paste a YouTube link in the studio!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clips.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => {
                      setActiveClip(clip);
                      setActiveTab('studio');
                    }}
                    className="bg-black/40 border border-white/10 rounded-xl p-3 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative mb-2">
                      <img
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-mono px-1.5 py-0.5 rounded">
                        00:{clip.durationSeconds}s
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{clip.title}</h4>
                    <div className="flex justify-between items-center text-[10px] text-white/50 mt-1">
                      <span>Format: {clip.aspectRatio}</span>
                      <a
                        href={clip.downloadUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        Download MP4
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features Info Tab */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Subtitles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Auto English Captions</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Automatically transcribes and synchronizes word-by-word viral captions with customizable styles (Yellow Highlight, Cyber Cyan, Classic Minimal).
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multi-Format Resizing</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Smart FFmpeg cropping converts landscape videos into 9:16 vertical shorts for TikTok & Reels, 1:1 square for Instagram, or 16:9 for YouTube.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Lightning Fast Export</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Direct MP4 download with instant shareable links for seamless team collaboration and social media publishing.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
