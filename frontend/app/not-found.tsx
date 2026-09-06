import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-screen h-screen bg-[#EEF1F5] text-slate-900 flex flex-col items-center justify-center font-sans p-6">
      <div className="light-saas-card p-10 max-w-md w-full flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">404 — Sector Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
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
