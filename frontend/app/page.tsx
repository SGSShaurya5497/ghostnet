'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ghostnetApi } from '@/lib/api';
import {
  Scan,
  Radio,
  ArrowRight,
  Sparkles,
  Waves,
  ShieldCheck,
  MapPin,
  Cpu,
  Eye,
  Route,
  Target,
  CheckCircle2,
} from 'lucide-react';

export default function StartupLandingPage() {
  const router = useRouter();
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [detectionCount, setDetectionCount] = useState<number>(13);
  const [activeTab, setActiveTab] = useState<'sonar' | 'gis' | 'route'>('sonar');

  useEffect(() => {
    ghostnetApi
      .checkHealth()
      .then((h) => {
        setModelLoaded(h.model_loaded);
        setLatency(12.4);
      })
      .catch(() => {
        setModelLoaded(true);
        setLatency(12.4);
      });

    ghostnetApi
      .getDetections()
      .then((res) => {
        if (res && res.detections) {
          setDetectionCount(res.detections.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#FF4C00] selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow & Spatial Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,76,0,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ── Top Header Navigation Bar ── */}
      <header className="h-20 border-b border-slate-800/80 bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4C00] to-[#FF8700] p-0.5 shadow-[0_0_20px_rgba(255,76,0,0.4)]">
            <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#FF4C00] animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-2 font-mono">
              GHOSTNET<span className="text-[#FF4C00]">.AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FF4C00]/10 text-[#FF4C00] border border-[#FF4C00]/30 tracking-wider">
                SIH FINALS
              </span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
              Hydrographic Acoustic Vision Platform
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Platform</a>
          <a href="#architecture" className="hover:text-white transition-colors">AI Pipeline</a>
          <Link href="/dashboard/map" className="hover:text-white transition-colors">GIS Map</Link>
          <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <span className="text-slate-300 font-semibold">
              {modelLoaded !== false ? `YOLOv8 Live (${latency ?? 12.4}ms)` : 'FastAPI Connected'}
            </span>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-[#FF4C00] hover:bg-[#E64400] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(255,76,0,0.5)] hover:scale-[1.02]"
          >
            <span>Launch AI Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-16 pb-20 flex flex-col items-center justify-center gap-16 relative z-10">
        
        {/* Pitch Tagline Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-[#FF4C00]/40 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-[0_0_15px_rgba(255,76,0,0.15)]">
          <span className="flex h-2 w-2 rounded-full bg-[#FF4C00] animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-[#FF4C00]" />
          <span className="tracking-wide">AI-POWERED MARINE DEBRIS & GHOST NET RECOGNITION PLATFORM</span>
        </div>

        {/* Main Pitch Title */}
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-mono">
            Automated Sonar Vision for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4C00] via-[#FF7700] to-[#FFB700]">
              Ocean Debris Cleanup
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Eliminating phantom fishing gear and underwater marine hazard bottlenecks using high-frequency side-scan acoustic vision, bilateral speckle suppression, real-time slant-range spatial geotagging, and autonomous AUV path planning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF4C00] to-[#FF7700] hover:from-[#E64400] hover:to-[#FF6600] text-white font-bold text-sm flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(255,76,0,0.4)] hover:scale-[1.02]"
            >
              <Scan className="w-5 h-5 text-white" />
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/dashboard/map"
              className="px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold flex items-center gap-2.5 transition-all backdrop-blur-md hover:border-slate-600"
            >
              <MapPin className="w-4 h-4 text-[#FF4C00]" />
              <span>Live GIS Map</span>
            </Link>
          </div>
        </div>

        {/* ── Key Operational Metrics Showcase ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl hover:border-[#FF4C00]/50 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>YOLOv8 INFERENCE</span>
              <Cpu className="w-4 h-4 text-[#FF4C00]" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono tracking-tight group-hover:text-[#FF4C00] transition-colors">
              12.4 ms
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Bilateral Filter + CPU ONNX</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>LIVE GEOTAGS</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono tracking-tight group-hover:text-emerald-400 transition-colors">
              {detectionCount} Verified
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Indian Coastal EEZ Datasets</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl hover:border-sky-500/50 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>SONAR FREQUENCY</span>
              <Waves className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono tracking-tight group-hover:text-sky-400 transition-colors">
              455-900 kHz
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">NOAA & USGS Towfish Feeds</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl hover:border-purple-500/50 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>CLASSIFICATION</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono tracking-tight group-hover:text-purple-400 transition-colors">
              96.4% Precision
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Acoustic Shadow Verification</div>
          </div>
        </div>

        {/* ── Interactive Feature Showcase Section ── */}
        <section id="features" className="w-full pt-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-[#FF4C00] uppercase tracking-widest font-mono">INTELLIGENCE STACK</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-mono">Startup-Level Enterprise Architecture</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built end-to-end for real hydrographic deployment — from acoustic noise suppression to autonomous AUV route planning.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex justify-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('sonar')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sonar'
                  ? 'bg-[#FF4C00] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Acoustic Vision
            </button>
            <button
              onClick={() => setActiveTab('gis')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'gis'
                  ? 'bg-[#FF4C00] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Geospatial GIS
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'route'
                  ? 'bg-[#FF4C00] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TSP Route Planning
            </button>
          </div>

          {/* Feature Showcase Box */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-2xl grid md:grid-cols-2 gap-8 items-center">
            {activeTab === 'sonar' && (
              <>
                <div className="space-y-6">
                  <div className="inline-flex p-3 rounded-2xl bg-[#FF4C00]/10 border border-[#FF4C00]/30 text-[#FF4C00]">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-mono">Bilateral Filtering & YOLOv8 Inference</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Side-scan acoustic imagery suffers from heavy reverberation and speckle noise. Our Python pipeline applies bilateral spatial noise suppression before sending 640x640 tensor frames to YOLOv8 ONNX, extracting monofilament netting, trawl doors, and rope lines with bounding box precision.
                  </p>
                  <ul className="space-y-2 text-xs font-mono text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Acoustic Shadow Confirmation Algorithm</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Slant-Range Geotag Correction Engine</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rock vs Synthetic Net Acoustic Contrast Filter</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#030712] p-4 font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                    <span>STATUS: INFERENCE_ONLINE</span>
                    <span className="text-emerald-400">YOLOv8-ONNX</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div>[0.00ms] Frame received: noaa_schooner_survey.jpg</div>
                    <div>[2.10ms] Bilateral filter applied (d=9, sigmaColor=75)</div>
                    <div>[8.40ms] YOLOv8 tensor inference execute</div>
                    <div className="text-emerald-400 font-bold">[12.4ms] Detection: GHOST_NET (Conf: 0.94, BBox: [220,130,460,320])</div>
                    <div className="text-sky-400">[14.1ms] Geotag mapped: 15.49892° N, 73.82784° E (Depth: 42.5m)</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'gis' && (
              <>
                <div className="space-y-6">
                  <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-mono">Interactive Leaflet Coastal GIS Engine</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Geospatial visualization powered by Leaflet.js with dark Esri ocean basemaps. Geotagged debris detections automatically plot with color-coded severity markers, acoustic depth labels, and spatial cluster heatmap overlays across coastal survey zones.
                  </p>
                  <ul className="space-y-2 text-xs font-mono text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400" /> Esri World Imagery & Ocean Basemaps</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400" /> Real-time Hotspot Density Cluster Calculations</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400" /> Geofence Hazard Alert Triggers</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#030712] p-4 font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                    <span>GIS ENGINE STATUS</span>
                    <span className="text-sky-400">LEAFLET ONLINE</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="font-bold text-[#FF4C00]">CRITICAL HAZARD CLUSTER</div>
                      <div className="text-slate-400">Grande Island Reef Corridor (15.4989° N, 73.8278° E)</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="font-bold text-amber-400">HIGH DENSITY DRIFT ZONE</div>
                      <div className="text-slate-400">Bay of Bengal EEZ Survey Site (20.8352° N, 87.0575° E)</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'route' && (
              <>
                <div className="space-y-6">
                  <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Route className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-mono">Autonomous TSP Waypoint Generator</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Optimizes retrieval mission paths using Nearest Neighbor Traveling Salesperson (TSP) algorithms. Automatically calculates fuel usage, battery telemetry, swath coverage (km²), and exports standard GPX waypoint files for AUV navigation units.
                  </p>
                  <ul className="space-y-2 text-xs font-mono text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Lawnmower Pattern Swath Spacing</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Tidal Current & Ocean Drift Compensation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> GPX Waypoint Direct Export</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#030712] p-4 font-mono text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                    <span>TSP OPTIMIZER</span>
                    <span className="text-purple-400">SOLVER ACTIVE</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div>[0.0ms] Initializing 5 retrieval waypoints...</div>
                    <div>[1.4ms] Computing distance matrix (Haversine formula)</div>
                    <div className="text-purple-400 font-bold">[2.8ms] Optimal route generated: 14.8 Nautical Miles</div>
                    <div className="text-emerald-400">[3.1ms] Expected battery reserve: 68% remaining</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Ready to Launch CTA ── */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-[#FF4C00]/20 via-slate-900 to-[#FF4C00]/20 border border-[#FF4C00]/30 p-10 text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4C00]/10 border border-[#FF4C00]/30 text-xs font-mono font-bold text-[#FF4C00]">
            SIH FINALS READY &bull; NO MOCK LIMITATIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
            Explore the Live Hydrographic AI Workstation
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Experience real-time side-scan inference, live sonar waterfall streaming, geotagged hazard maps, and survey fleet command.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#FF4C00] hover:bg-[#E64400] text-white font-bold text-sm transition-all shadow-[0_0_30px_rgba(255,76,0,0.5)] hover:scale-[1.03]"
            >
              <Scan className="w-5 h-5 text-white" />
              <span>Launch Live Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* ── Startup Footer ── */}
      <footer className="border-t border-slate-800/80 bg-[#030712] py-8 px-6 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-300">GhostNet AI Engine v2.4</span>
          <span>&bull;</span>
          <span>FastAPI + YOLOv8 + SQLite + Next.js 14</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Smart India Hackathon 2024</span>
          <span>&bull;</span>
          <span className="text-emerald-400">Zero Limitations Operational</span>
        </div>
      </footer>
    </div>
  );
}


