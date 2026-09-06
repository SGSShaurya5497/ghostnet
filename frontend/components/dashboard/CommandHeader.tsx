'use client';

import { useEffect, useState } from 'react';

export default function CommandHeader() {
  const [timeUtc, setTimeUtc] = useState('');

  useEffect(() => {
    const update = () => setTimeUtc(new Date().toUTCString().slice(17, 25) + ' UTC');
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header className="h-[48px] w-full bg-[#0d131f] border-b border-white/5 flex items-center justify-between px-4 z-20 flex-shrink-0 font-mono text-xs">
      <div className="flex items-center gap-4 text-slate-400">
        <button className="hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_6px_#2dd4bf]"></span>
          <span>OCEANIS SYSTEM - ACTIVE</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 h-full flex items-center">
        <div className="px-6 py-1 bg-[#1e2a3b] text-teal-400 font-bold tracking-widest rounded-sm border border-white/5">
          UNCLASSIFIED
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#0a0f18] border border-white/10 rounded-full px-3 py-1 pl-8 text-xs focus:outline-none focus:border-teal-500/50 w-48 text-white placeholder-slate-600"
          />
          <svg className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        
        <div className="h-4 w-px bg-white/10"></div>
        
        <div className="flex items-center gap-3">
          <button className="hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm1-11h-2v5.25l4.5 2.67.75-1.23-3.25-1.93V8z"/>
            </svg>
          </button>
          <span className="text-teal-400 tracking-wider font-semibold">{timeUtc}</span>
        </div>
      </div>
    </header>
  );
}
