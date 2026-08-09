import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-6 lg:px-8 py-4 bg-black/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          API Status: Operational
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          FFmpeg Cluster: Active
        </div>
      </div>
      <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">
        © 2026 ClipCut AI Pro • Enterprise Grade Video Intelligence
      </div>
    </footer>
  );
};
