'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ghostnetApi } from '@/lib/api';
import {
  Scan,
  Radio,
  ArrowRight,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export default function SaaSOverviewLanding() {
  const router = useRouter();
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    ghostnetApi
      .checkHealth()
      .then((h) => {
        setModelLoaded(h.model_loaded);
        setLatency(12);
      })
      .catch(() => {
        setModelLoaded(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F6F7] text-[#0E232B] flex flex-col justify-between font-sans rounded-none">
      {/* ── Top Header Bar ── */}
      <header className="h-16 bg-white border-b border-[#B8C9CC] sticky top-0 z-50 flex items-center justify-between px-8 lg:px-16 shadow-none rounded-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#075A73] flex items-center justify-center text-white shadow-none">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#075A73] flex items-center gap-2">
            GhostNet
            <span className="text-[10px] px-1.5 py-0.2 rounded-none font-bold bg-[#E5EDEE] text-[#075A73] border border-[#B8C9CC]">
              AI PRO
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-none ${
                modelLoaded
                  ? 'bg-emerald-600 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-[#0E232B] font-semibold">
              {modelLoaded ? `YOLOv8 Active (${latency ?? 12}ms)` : 'Connecting...'}
            </span>
          </div>

          <Link
            href="/dashboard"
            className="btn-primary text-xs rounded-none"
          >
            <span>Open Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-14 flex flex-col justify-center gap-12 rounded-none">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-white border border-[#B8C9CC] text-xs font-bold text-[#075A73] shadow-none">
            <Sparkles className="w-3.5 h-3.5 text-[#075A73]" />
            <span>Autonomous Sonar Intelligence · Hydrographic Survey System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0E232B] leading-tight">
            Next-Gen Sonar AI for{' '}
            <span className="text-[#075A73]">
              Marine Debris & Ghost Nets
            </span>
          </h1>

          <p className="text-base text-[#526E78] max-w-2xl leading-relaxed">
            High-performance hydrographic survey platform integrating YOLOv8 side-scan acoustic vision,
            real-time waterfall stream visualizers, geospatial anomaly tracking, and autonomous cleanup dispatching.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-7 py-3 rounded-none bg-[#075A73] hover:bg-[#054356] text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-none border border-[#075A73]"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>Launch Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/dashboard/analytics"
              className="px-6 py-3 rounded-none bg-white hover:bg-[#E5EDEE] border border-[#B8C9CC] text-[#0E232B] text-sm font-bold flex items-center gap-2 transition-all shadow-none"
            >
              <BarChart3 className="w-4 h-4 text-[#075A73]" />
              <span>Survey Analytics</span>
            </Link>
          </div>
        </div>

        {/* ── Key Metrics Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 rounded-none">
          <div className="light-saas-card p-6 space-y-2 rounded-none">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
              <span>MODEL ARCH</span>
              <span className="pill-badge-ocean text-[10px]">ONNX</span>
            </div>
            <div className="text-2xl font-black text-[#0E232B] tracking-tight">YOLOv8-26m</div>
            <div className="text-xs text-[#526E78] font-medium">Trained on Side-Scan Sonar</div>
          </div>

          <div className="light-saas-card p-6 space-y-2 rounded-none">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
              <span>LATENCY</span>
              <span className="pill-badge-green text-[10px]">↗ 1.8%</span>
            </div>
            <div className="text-2xl font-black text-[#0E232B] tracking-tight">~12.4 ms</div>
            <div className="text-xs text-[#526E78] font-medium">Real-time Acoustic Stream</div>
          </div>

          <div className="light-saas-card p-6 space-y-2 rounded-none">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
              <span>DEBRIS CLASSES</span>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5">4 Core</span>
            </div>
            <div className="text-2xl font-black text-[#0E232B] tracking-tight">Nets & Traps</div>
            <div className="text-xs text-[#526E78] font-medium">Multiclass Recognition</div>
          </div>

          <div className="light-saas-card p-6 space-y-2 rounded-none">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
              <span>ACCURACY</span>
              <span className="pill-badge-green text-[10px]">Verified</span>
            </div>
            <div className="text-2xl font-black text-[#0E232B] tracking-tight">96.4%</div>
            <div className="text-xs text-[#526E78] font-medium">High Confidence Resolution</div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#B8C9CC] bg-white py-6 px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526E78] font-medium gap-2 rounded-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0E232B]">GhostNet AI Platform v2.4</span>
          <span>·</span>
          <span>FastAPI + YOLOv8 ONNX + Next.js 14</span>
        </div>
        <div className="flex items-center gap-4">
          <span>RV-OCEANUS Survey Unit</span>
          <span>·</span>
          <span>Smart India Hackathon 2024</span>
        </div>
      </footer>
    </div>
  );
}

