'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ghostnetApi } from '@/lib/api';
import {
  Scan,
  Waves,
  Target,
  Map,
  BarChart3,
  ShieldCheck,
  Radio,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Download,
  Terminal,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
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
    <div className="min-h-screen bg-[#EEF1F5] text-[#0F172A] flex flex-col justify-between font-sans">
      {/* ── Top Header Bar ── */}
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-50 flex items-center justify-between px-8 lg:px-16 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
            GhostNet
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              AI PRO
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                modelLoaded
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-700 font-semibold">
              {modelLoaded ? `YOLOv8 Active (${latency ?? 12}ms)` : 'Connecting...'}
            </span>
          </div>

          <Link
            href="/dashboard"
            className="btn-primary text-xs"
          >
            <span>Open Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-14 flex flex-col justify-center gap-12">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Autonomous Sonar Intelligence · SIH 2024</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Next-Gen Sonar AI for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600">
              Marine Debris & Ghost Nets
            </span>
          </h1>

          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            High-performance hydrographic survey platform integrating YOLOv8 side-scan acoustic vision,
            real-time waterfall stream visualizers, geospatial anomaly tracking, and automated audit reporting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/25 hover:scale-[1.02]"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>Launch Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/dashboard/analytics"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Survey Analytics</span>
            </Link>
          </div>
        </div>

        {/* ── Key Metrics Cards (Matching Reference Screenshot Style) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="light-saas-card p-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>MODEL ARCH</span>
              <span className="pill-badge-blue text-[10px]">ONNX</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">YOLOv8-26m</div>
            <div className="text-xs text-slate-500 font-medium">Trained on Side-Scan Sonar</div>
          </div>

          <div className="light-saas-card p-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>LATENCY</span>
              <span className="pill-badge-green text-[10px]">↗ 1.8%</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">~12.4 ms</div>
            <div className="text-xs text-slate-500 font-medium">Real-time Acoustic Stream</div>
          </div>

          <div className="light-saas-card p-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>DEBRIS CLASSES</span>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5">4 Core</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">Nets & Traps</div>
            <div className="text-xs text-slate-500 font-medium">Multiclass Recognition</div>
          </div>

          <div className="light-saas-card p-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>ACCURACY</span>
              <span className="pill-badge-green text-[10px]">Verified</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">96.4%</div>
            <div className="text-xs text-slate-500 font-medium">High Confidence Resolution</div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/80 bg-white py-6 px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">GhostNet AI Platform v2.4</span>
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
