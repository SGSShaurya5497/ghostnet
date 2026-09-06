'use client';

export default function CommandStatusBar() {
  return (
    <footer className="h-[32px] w-full bg-[#060a11] border-t border-white/5 flex items-center justify-between px-3 z-20 flex-shrink-0 font-mono text-[10px]">
      <div className="flex items-center gap-3 h-full">
        <div className="flex items-center h-full px-2 border-r border-white/5 text-teal-400 gap-1 bg-teal-900/20">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-6h4v6z"/>
          </svg>
          FPS: 60 (10-121)
        </div>
        <div className="flex items-center h-full px-2 border-r border-white/5 text-green-500 gap-1 bg-green-900/20">
          RAM: 17 MB (0-1450)
        </div>
        <div className="flex items-center h-full px-2 border-r border-white/5 text-purple-400 gap-1 bg-purple-900/20">
          GPU: 341 MB (307-614)
        </div>
        <div className="flex items-center h-full px-2 text-slate-500 gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          SYS_OK
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-500 tracking-wider">
        <span>031° 36.0577' N</span>
        <span>070° 56.3645' W</span>
      </div>
    </footer>
  );
}
