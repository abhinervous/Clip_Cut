import React from 'react';
import { Scissors, Sparkles, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'studio', onTabChange }) => {
  return (
    <nav className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange?.('studio')}>
        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            ClipCut <span className="text-indigo-400 font-extrabold">AI</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PRO
            </span>
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
        <button
          onClick={() => onTabChange?.('studio')}
          className={`hover:text-white transition-colors py-1 relative ${
            activeTab === 'studio' ? 'text-white font-semibold' : ''
          }`}
        >
          Studio Generator
          {activeTab === 'studio' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange?.('history')}
          className={`hover:text-white transition-colors py-1 relative ${
            activeTab === 'history' ? 'text-white font-semibold' : ''
          }`}
        >
          Clip Library
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange?.('features')}
          className={`hover:text-white transition-colors py-1 relative ${
            activeTab === 'features' ? 'text-white font-semibold' : ''
          }`}
        >
          AI Captions & Formats
          {activeTab === 'features' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>12 / 50 Credits</span>
        </div>

        <div className="w-9 h-9 rounded-full border border-white/20 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center font-bold text-indigo-300 text-xs shadow-inner">
          JD
        </div>
      </div>
    </nav>
  );
};
