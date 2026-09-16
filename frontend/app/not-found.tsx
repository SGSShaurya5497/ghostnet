import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-screen h-screen bg-[#050810] text-slate-100 flex flex-col items-center justify-center font-sans p-6">
      <div className="cyber-card p-10 max-w-md w-full flex flex-col items-center text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-teal-500/30 shadow-lg shadow-teal-500/20">
          <img src="/ghostnet-logo.png" alt="GhostNet Logo" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
            404 // HYDROGRAPHIC EXCEPTION
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight pt-1">
            Sector Not Found
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-sans">
          The requested hydrographic coordinate or survey module does not exist in the active chart database.
        </p>
        <Link
          href="/dashboard"
          className="btn-primary text-xs w-full justify-center mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to AI Workstation</span>
        </Link>
      </div>
    </div>
  );
}
