"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Anchor,
  Ship,
  Sparkles,
  ArrowRight,
  X,
  RotateCcw,
  Compass,
  Activity,
  ShieldAlert,
} from "lucide-react";

export default function MainDashboardInteractive() {
  const router = useRouter();

  // Map & Popup State
  const [showPopup, setShowPopup] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedTarget, setSelectedTarget] = useState<string>("Possible Debris Cluster");

  // Environmental Layer Toggles in Right Sidebar
  const [layers, setLayers] = useState({
    vessels: true,
    anomalies: true,
    riskZones: true,
    oceanCurrents: true,
    windLayer: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 h-full flex overflow-hidden gap-4 select-none">
      {/* ── CENTER WORKSPACE: INTERACTIVE MAP + 4 BOTTOM CARDS ── */}
      <main className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Main Tactical Map Canvas Card */}
        <div className="flex-1 bg-[#060e20] border border-cyan-900/40 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Interactive Satellite Oceanic Canvas */}
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1200 600"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Ocean Radial Gradient */}
                <radialGradient id="oceanCenterGrad" cx="55%" cy="40%" r="65%">
                  <stop offset="0%" stopColor="#0a2040" />
                  <stop offset="45%" stopColor="#051329" />
                  <stop offset="100%" stopColor="#030814" />
                </radialGradient>

                {/* Hotspot Pulse Gradient */}
                <radialGradient id="debrisPulseGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>

                {/* Transponder Beacon Gradient */}
                <radialGradient id="beaconPulseGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                </radialGradient>

                {/* Landmass Shading */}
                <linearGradient id="indiaTopoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d2e2b" />
                  <stop offset="50%" stopColor="#0b2422" />
                  <stop offset="100%" stopColor="#081817" />
                </linearGradient>
              </defs>

              {/* Ocean Background */}
              <rect width="1200" height="600" fill="url(#oceanCenterGrad)" />

              {/* Bathymetry Depth Contours */}
              <g stroke="#083344" strokeWidth="0.75" fill="none" opacity="0.45">
                <path d="M-50 120 Q 200 180, 450 140 T 900 220 T 1300 160" />
                <path d="M-50 220 Q 300 320, 600 240 T 1100 340 T 1300 280" />
                <path d="M-50 350 Q 250 480, 550 380 T 950 490 T 1300 420" />
                <path d="M100 50 Q 400 90, 700 30 T 1200 80" />
                <path d="M-50 480 Q 350 560, 750 510 T 1300 580" />
              </g>

              {/* Indian Subcontinent Landmass Vector */}
              <g id="landmass" filter="drop-shadow(0 0 10px rgba(13,46,43,0.8))">
                <path
                  d="M 520,0 L 590,40 L 640,60 L 690,110 L 740,150 L 700,210 L 670,250 L 630,290 L 600,320 L 590,300 L 580,260 L 560,220 L 520,190 L 480,180 L 450,150 L 420,120 L 470,80 L 500,40 Z"
                  fill="url(#indiaTopoGrad)"
                  stroke="#14b8a6"
                  strokeWidth="1.2"
                  opacity="0.85"
                />
                {/* Coastal Glow */}
                <path
                  d="M 520,0 L 590,40 L 640,60 L 690,110 L 740,150 L 700,210 L 670,250 L 630,290 L 600,320 L 590,300 L 580,260 L 560,220 L 520,190 L 480,180 L 450,150 L 420,120 L 470,80 L 500,40 Z"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.5"
                  opacity="0.3"
                  className="animate-pulse"
                />
                {/* Arabian Peninsula & Horn of Africa Hints */}
                <path
                  d="M 120,40 L 220,90 L 260,170 L 220,240 L 160,280 L 110,260 L 80,180 L 60,100 Z"
                  fill="#061c1a"
                  stroke="#0f766e"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Southeast Asia Hints */}
                <path
                  d="M 880,120 L 940,180 L 980,270 L 930,340 L 890,300 L 870,220 L 850,160 Z"
                  fill="#061c1a"
                  stroke="#0f766e"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* India Label */}
                <text
                  x="590"
                  y="180"
                  fill="#5eead4"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="3"
                  opacity="0.75"
                >
                  INDIA
                </text>
              </g>

              {/* Tactical Mesh Network & Coordinate Link Lines */}
              <g stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3,4" opacity="0.5">
                {/* Major routes & sensor baselines */}
                <line x1="280" y1="280" x2="430" y2="240" />
                <line x1="430" y1="240" x2="495" y2="205" />
                <line x1="495" y1="205" x2="630" y2="200" />
                <line x1="630" y1="200" x2="800" y2="280" />
                <line x1="430" y1="240" x2="520" y2="350" />
                <line x1="520" y1="350" x2="630" y2="400" />
                <line x1="630" y1="400" x2="800" y2="280" />
                <line x1="430" y1="240" x2="500" y2="480" />
                <line x1="500" y1="480" x2="630" y2="400" />
                <line x1="280" y1="280" x2="350" y2="180" />
                <line x1="350" y1="180" x2="495" y2="205" />
                <line x1="495" y1="205" x2="400" y2="90" />
                <line x1="400" y1="90" x2="630" y2="200" />
              </g>

              {/* Cyan Animated Oceanic Current Trajectory Streamlines */}
              {layers.oceanCurrents && (
                <g>
                  <path
                    d="M 180,380 C 300,320 400,360 520,350 C 640,340 720,440 850,380"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeDasharray="6,8"
                    opacity="0.85"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="100"
                      to="0"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M 220,190 C 350,220 450,160 580,240 C 700,310 820,240 920,290"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.8"
                    strokeDasharray="4,6"
                    opacity="0.75"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="100"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              )}

              {/* Concentric Radar Sonar Waves at Active Beacon (South Cluster) */}
              <g transform="translate(630, 400)">
                <circle r="60" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.25" />
                <circle r="45" fill="none" stroke="#6366f1" strokeWidth="1.2" opacity="0.45" />
                <circle r="30" fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.65" />
                <circle r="15" fill="none" stroke="#a5b4fc" strokeWidth="2" opacity="0.85" />
                <circle r="80" fill="url(#beaconPulseGrad)" />
                {/* Radial Crosshairs */}
                <line x1="-70" y1="0" x2="70" y2="0" stroke="#818cf8" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3" />
                <line x1="0" y1="-70" x2="0" y2="70" stroke="#818cf8" strokeWidth="0.8" opacity="0.4" strokeDasharray="3,3" />
                {/* Center Glowing Transponder */}
                <circle r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #818cf8)" />
              </g>

              {/* Concentric Radar Waves at Primary Hotspot Target (Arabian Sea) */}
              <g
                transform="translate(430, 240)"
                className="cursor-pointer"
                onClick={() => {
                  setShowPopup(true);
                  setSelectedTarget("Possible Debris Cluster");
                }}
              >
                <circle r="45" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.3" />
                <circle r="32" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.55" />
                <circle r="18" fill="none" stroke="#fb7185" strokeWidth="2" opacity="0.85" />
                <circle r="55" fill="url(#debrisPulseGrad)" />
                {/* Center Target Dot */}
                <circle r="4.5" fill="#ffffff" filter="drop-shadow(0 0 8px #f43f5e)" />
              </g>

              {/* Anomaly Triangles (Rose/Pink) */}
              {layers.anomalies && (
                <g>
                  {/* North Triangle */}
                  <polygon
                    points="400,85 406,97 394,97"
                    fill="#f43f5e"
                    stroke="#ffe4e6"
                    strokeWidth="1"
                    filter="drop-shadow(0 0 6px #f43f5e)"
                  />
                  {/* Central Upper Triangle */}
                  <polygon
                    points="495,200 502,212 488,212"
                    fill="#f43f5e"
                    stroke="#ffe4e6"
                    strokeWidth="1"
                    filter="drop-shadow(0 0 6px #f43f5e)"
                  />
                  {/* Southern Triangle */}
                  <polygon
                    points="640,358 647,370 633,370"
                    fill="#f43f5e"
                    stroke="#ffe4e6"
                    strokeWidth="1"
                    filter="drop-shadow(0 0 6px #f43f5e)"
                  />
                  {/* Bay of Bengal Anomaly */}
                  <polygon
                    points="770,185 777,197 763,197"
                    fill="#f43f5e"
                    stroke="#ffe4e6"
                    strokeWidth="1"
                    filter="drop-shadow(0 0 6px #f43f5e)"
                  />
                  {/* Deep South Anomaly */}
                  <polygon
                    points="530,475 537,487 523,487"
                    fill="#ec4899"
                    stroke="#fdf2f8"
                    strokeWidth="1"
                    filter="drop-shadow(0 0 6px #ec4899)"
                  />
                </g>
              )}

              {/* Vessel Icons / Cyan Triangles */}
              {layers.vessels && (
                <g>
                  <polygon
                    points="500,240 505,250 495,250"
                    fill="#22d3ee"
                    stroke="#cffafe"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 0 5px #22d3ee)"
                  />
                  <polygon
                    points="520,345 526,357 514,357"
                    fill="#22d3ee"
                    stroke="#cffafe"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 0 5px #22d3ee)"
                  />
                  <polygon
                    points="370,190 375,200 365,200"
                    fill="#22d3ee"
                    stroke="#cffafe"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 0 5px #22d3ee)"
                  />
                  <polygon
                    points="800,275 806,287 794,287"
                    fill="#22d3ee"
                    stroke="#cffafe"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 0 5px #22d3ee)"
                  />
                </g>
              )}

              {/* Risk Zones / Amber Indicators */}
              {layers.riskZones && (
                <g>
                  <polygon
                    points="350,215 355,225 345,225"
                    fill="#f59e0b"
                    stroke="#fef3c7"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 0 6px #f59e0b)"
                  />
                  <polygon
                    points="505,420 511,432 499,432"
                    fill="#f59e0b"
                    stroke="#fef3c7"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 0 6px #f59e0b)"
                  />
                </g>
              )}
            </svg>

            {/* Target Popup Overlay matching screenshot */}
            {showPopup && (
              <div
                className="absolute top-44 left-[53%] -translate-x-1/2 w-64 bg-[#08152e]/95 border border-cyan-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-md z-20"
                style={{ animation: "fadeIn 0.2s ease-out" }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {selectedTarget}
                    </h4>
                    <p className="text-[10px] font-mono text-cyan-300/80">
                      Lat 19.4321° N &nbsp; Lon 72.8656° E
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-cyan-950/80 pt-2 text-xs">
                  <span className="text-slate-300 font-medium">Confidence 87%</span>
                  <button
                    onClick={() => router.push("/dashboard/alerts")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-500/40 border border-cyan-400/60 text-cyan-200 text-[11px] font-medium transition-all shadow-sm"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Floating Map HUD Control Overlay (Top Right of Map) */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              title="Zoom In"
              className="p-2 rounded-xl bg-[#09152a]/80 hover:bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 hover:text-white backdrop-blur-md transition-all shadow-md"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              title="Zoom Out"
              className="p-2 rounded-xl bg-[#09152a]/80 hover:bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 hover:text-white backdrop-blur-md transition-all shadow-md"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset View"
              className="p-2 rounded-xl bg-[#09152a]/80 hover:bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 hover:text-white backdrop-blur-md transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPopup(!showPopup)}
              title="Focus Anomaly Target"
              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 hover:text-white backdrop-blur-md transition-all shadow-md"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Map Scale Bar Overlay (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-300/80">100 km</span>
              <div className="w-16 h-1 bg-cyan-400/80 rounded-full shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>
        </div>

        {/* ── 4 BOTTOM KPI TELEMETRY CARDS ── */}
        <div className="grid grid-cols-4 gap-4 h-32 shrink-0">
          {/* Card 1: Ocean Health Index */}
          <div className="bg-[#081226]/90 border border-cyan-900/40 rounded-2xl p-3.5 flex flex-col justify-between backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-300">Ocean Health Index</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-white">72</span>
                <span className="ml-2 text-xs font-mono font-bold text-emerald-400">↑+5%</span>
              </div>
              {/* Cyan Sparkline SVG */}
              <div className="w-24 h-10">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <path
                    d="M0 35 Q 25 10, 45 28 T 80 15 T 100 8"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 35 Q 25 10, 45 28 T 80 15 T 100 8 L 100 40 L 0 40 Z"
                    fill="rgba(34, 211, 238, 0.15)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Area Monitored */}
          <div className="bg-[#081226]/90 border border-cyan-900/40 rounded-2xl p-3.5 flex flex-col justify-between backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-300">Area Monitored</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl font-black font-mono text-white">12,450</span>
                <span className="ml-1 text-xs font-mono text-slate-400">km²</span>
              </div>
              {/* Blue Wave Filled Area SVG */}
              <div className="w-24 h-10">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <path
                    d="M0 30 C 20 38, 40 20, 60 28 C 80 35, 90 15, 100 12"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M0 30 C 20 38, 40 20, 60 28 C 80 35, 90 15, 100 12 L 100 40 L 0 40 Z"
                    fill="rgba(56, 189, 248, 0.2)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Total Anomalies */}
          <div className="bg-[#081226]/90 border border-cyan-900/40 rounded-2xl p-3.5 flex flex-col justify-between backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-300">Total Anomalies</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black font-mono text-white">1,324</span>
              {/* Vibrant Violet-to-Cyan Equalizer Bars */}
              <div className="flex items-end gap-1 h-8">
                <div className="w-1.5 h-3 bg-cyan-400 rounded-t" />
                <div className="w-1.5 h-5 bg-cyan-400 rounded-t" />
                <div className="w-1.5 h-4 bg-teal-400 rounded-t" />
                <div className="w-1.5 h-7 bg-indigo-400 rounded-t" />
                <div className="w-1.5 h-5 bg-indigo-500 rounded-t" />
                <div className="w-1.5 h-8 bg-purple-500 rounded-t" />
                <div className="w-1.5 h-6 bg-pink-500 rounded-t" />
                <div className="w-1.5 h-7 bg-rose-500 rounded-t" />
              </div>
            </div>
          </div>

          {/* Card 4: Cleanup Priority */}
          <div className="bg-[#081226]/90 border border-cyan-900/40 rounded-2xl p-3.5 flex flex-col justify-between backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-300">Cleanup Priority</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-white">18</span>
                <span className="ml-2 text-xs font-mono text-slate-400">Zones</span>
              </div>
              {/* Donut Ring Gauge SVG */}
              <div className="w-10 h-10 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR: LIVE STATS & ENVIRONMENTAL LAYERS ── */}
      <aside className="w-72 h-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl p-4 flex flex-col justify-between shrink-0 backdrop-blur-xl shadow-2xl overflow-y-auto">
        {/* Top Section: Live Stats Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-950/80 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Stats</h3>
            <button className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Live Stats Cards */}
          <div className="space-y-2.5">
            {/* Stat 1: Active Vessels */}
            <div className="p-3 rounded-xl bg-[#060e20] border border-cyan-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white font-mono">24</span>
                  <span className="text-[10px] font-mono text-slate-400">Active Vessels</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Anomalies */}
            <div className="p-3 rounded-xl bg-[#060e20] border border-cyan-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-400/40 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white font-mono">5</span>
                  <span className="text-[10px] font-mono text-slate-400">Anomalies</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Missions */}
            <div className="p-3 rounded-xl bg-[#060e20] border border-cyan-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white font-mono">3</span>
                  <span className="text-[10px] font-mono text-slate-400">Missions</span>
                </div>
              </div>
            </div>

            {/* Stat 4: High-Risk Zones */}
            <div className="p-3 rounded-xl bg-[#060e20] border border-cyan-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white font-mono">12</span>
                  <span className="text-[10px] font-mono text-slate-400">High-Risk Zones</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Environmental Layers */}
        <div className="pt-4 border-t border-cyan-950/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Environmental Layers</h4>

          <div className="space-y-2.5">
            {[
              { key: "vessels" as const, label: "Vessels", color: "bg-cyan-400" },
              { key: "anomalies" as const, label: "Anomalies", color: "bg-rose-500" },
              { key: "riskZones" as const, label: "Risk Zones", color: "bg-purple-500" },
              { key: "oceanCurrents" as const, label: "Ocean Currents", color: "bg-amber-500" },
              { key: "windLayer" as const, label: "Wind Layer", color: "bg-yellow-400" },
            ].map((layer) => (
              <div key={layer.key} className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${layer.color} shadow-sm`} />
                  <span>{layer.label}</span>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleLayer(layer.key)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    layers[layer.key] ? "bg-cyan-500" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white transition-all absolute top-0.5 ${
                      layers[layer.key] ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
