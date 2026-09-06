import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-screen h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-sans">
      <h2 className="text-4xl font-bold mb-2">404 - Not Found</h2>
      <p className="text-sm font-mono text-zinc-400 mb-6">The requested tactical sector or coordinate was not found.</p>
      <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-mono text-xs uppercase font-bold">
        Return to Command Center
      </Link>
    </div>
  );
}
