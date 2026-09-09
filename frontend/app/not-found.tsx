import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-screen h-screen bg-[#F2F6F7] text-[#0E232B] flex flex-col items-center justify-center font-sans p-6 rounded-none">
      <div className="light-saas-card p-10 max-w-md w-full flex flex-col items-center text-center space-y-4 rounded-none">
        <div className="w-14 h-14 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] flex items-center justify-center text-[#075A73] shadow-none">
          <Compass className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-[#0E232B] tracking-tight">404 — Sector Not Found</h2>
        <p className="text-xs text-[#526E78] max-w-xs leading-relaxed">
          The requested hydrographic coordinate or survey module does not exist in the active chart database.
        </p>
        <Link
          href="/dashboard"
          className="btn-primary text-xs w-full justify-center mt-2 rounded-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to AI Workstation</span>
        </Link>
      </div>
    </div>
  );
}
