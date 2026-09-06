"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Radio,
  Eye,
  Activity,
  Maximize2,
  Minimize2,
  TrendingUp,
  Compass,
  AlertTriangle,
  Layers,
  Search,
  Bell,
  Settings,
  User,
  Sliders,
  Sparkles,
  ChevronDown,
  X,
  Crosshair,
  Wifi,
  Lock,
  ArrowUpRight,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface ThreatCard {
  id: string;
  category: string;
  subCode: string;
  score: string;
  metricLabel: string;
  metricValue: string;
  trend: string;
  trendPositive: boolean;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "STABLE";
  iconType: "shield" | "radar" | "vessel" | "sonar" | "reef" | "drone";
}

const mockThreatFeed: ThreatCard[] = [
  {
    id: "TH-01",
    category: "URBAN / GYRE CORRIDOR",
    subCode: "073",
    score: "7.007",
    metricLabel: "Drift Velocity",
    metricValue: "865.9 NM/24h",
    trend: "+4.3%",
    trendPositive: false,
    severity: "CRITICAL",
    iconType: "shield",
  },
  {
    id: "TH-02",
    category: "SUBMERGED GHOST NET CLUSTER",
    subCode: "002",
    score: "740.32",
    metricLabel: "Acoustic Mass",
    metricValue: "4.00 m³/hit",
    trend: "3.13%",
    trendPositive: false,
    severity: "CRITICAL",
    iconType: "sonar",
  },
  {
    id: "TH-03",
    category: "DARK VESSEL RADAR SIGNATURE",
    subCode: "041",
    score: "1.2",
    metricLabel: "Unmatched Track",
    metricValue: "+42.409 lat",
    trend: "+0.8%",
    trendPositive: false,
    severity: "HIGH",
    iconType: "vessel",
  },
  {
    id: "TH-04",
    category: "DEEP TRENCH THERMOCLINE",
    subCode: "002",
    score: "214.8-7",
    metricLabel: "Backscatter",
    metricValue: "-18.4 dB",
    trend: "0.5%",
    trendPositive: true,
    severity: "MEDIUM",
    iconType: "radar",
  },
  {
    id: "TH-05",
    category: "CORAL REEF MPA THREAT INDEX",
    subCode: "022",
    score: "21136.3",
    metricLabel: "Proximity",
    metricValue: "0.8 km",
    trend: "+4.5%",
    trendPositive: false,
    severity: "CRITICAL",
    iconType: "reef",
  },
  {
    id: "TH-06",
    category: "FLEET RECOVERY DISPATCH",
    subCode: "047",
    score: "234.497",
    metricLabel: "Active Units",
    metricValue: "4 Tasked",
    trend: "0.8%",
    trendPositive: true,
    severity: "STABLE",
    iconType: "drone",
  },
];

export default function GlobalStrategicMapPage() {
  const [selectedThreat, setSelectedThreat] = useState<ThreatCard>(mockThreatFeed[0]);
  const [activeRegion, setActiveRegion] = useState<"GLOBAL" | "AMERICAS" | "EURASIA" | "ASIA_PACIFIC">("GLOBAL");
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="w-full h-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl text-zinc-100 flex flex-col font-sans overflow-hidden select-none backdrop-blur-xl shadow-2xl">
      {/* Top Strategic Global Bar */}
      <header className="h-12 bg-[#0a1428]/90 border-b border-cyan-950/80 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white hover:bg-cyan-900/80 text-xs font-mono transition-all mr-1 shadow-sm"
            title="Return to Main Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-rose-500/20 border border-rose-500/50 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest uppercase text-white">
                  GLOBAL EYE INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  SYSTEM KEY: <strong className="text-zinc-200">SPYK_33:65:18</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800 text-[10px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DEEPWATCH: 00:00:00 (SYNCED)</span>
          </div>
        </div>

        {/* Top Right Controls & Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>WGS-84 ORBITAL</span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <button
              onClick={() => {
                setIsRefreshing(true);
                setTimeout(() => setIsRefreshing(false), 700);
              }}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors">
              <Bell className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200">
              TA
            </div>
            <div className="hidden lg:flex flex-col text-[10px] leading-tight">
              <span className="font-semibold text-zinc-200">T. ARMSTRONG</span>
              <span className="text-zinc-500 font-mono">TACTICAL OPS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Map Body Container */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Central Map Canvas */}
        <div className="flex-1 relative bg-[#070c17] flex items-center justify-center overflow-hidden">
          {/* Detailed Topographic Satellite Shaded World Map SVG */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <svg
              className="w-full h-full object-cover transition-transform duration-500"
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Ocean Background Gradient */}
                <radialGradient id="oceanGlow" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#0b1326" />
                  <stop offset="60%" stopColor="#070c17" />
                  <stop offset="100%" stopColor="#04070e" />
                </radialGradient>

                {/* Heatmap Region Gradients */}
                <radialGradient id="northAmericaHeat" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#ea580c" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="eurasiaHeat" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#b45309" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="eastAsiaHeat" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#dc2626" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
                </radialGradient>

                {/* Land Texture Patterns */}
                <linearGradient id="landTopoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2c372f" />
                  <stop offset="50%" stopColor="#1e2722" />
                  <stop offset="100%" stopColor="#131a17" />
                </linearGradient>

                <linearGradient id="desertTopoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#574c3a" />
                  <stop offset="100%" stopColor="#30281b" />
                </linearGradient>
              </defs>

              {/* Base Ocean Background */}
              <rect width="1600" height="900" fill="url(#oceanGlow)" />

              {/* Latitude/Longitude Coordinate Grid Lines */}
              <g stroke="#1a2638" strokeWidth="0.75" strokeDasharray="4,6" opacity="0.4">
                <line x1="0" y1="225" x2="1600" y2="225" />
                <line x1="0" y1="450" x2="1600" y2="450" />
                <line x1="0" y1="675" x2="1600" y2="675" />
                <line x1="400" y1="0" x2="400" y2="900" />
                <line x1="800" y1="0" x2="800" y2="900" />
                <line x1="1200" y1="0" x2="1200" y2="900" />
              </g>

              {/* Continents Outline Topography */}
              {/* NORTH AMERICA */}
              <g>
                <path
                  d="M160,140 Q220,110 320,130 Q420,110 460,180 Q480,240 460,320 Q440,380 380,420 Q320,440 280,380 Q220,360 180,280 Q140,220 160,140 Z"
                  fill="url(#landTopoGrad)"
                  stroke="#3f4f45"
                  strokeWidth="1"
                />
                {/* North America Orange Heat Overlay */}
                <path
                  d="M220,220 Q340,180 430,240 Q450,330 380,390 Q280,410 240,320 Z"
                  fill="url(#northAmericaHeat)"
                />
              </g>

              {/* GREENLAND */}
              <path
                d="M520,90 Q600,70 660,110 Q650,180 580,200 Q510,180 520,90 Z"
                fill="#d1d5db"
                opacity="0.8"
                stroke="#9ca3af"
                strokeWidth="1"
              />

              {/* SOUTH AMERICA */}
              <path
                d="M360,460 Q440,440 480,520 Q520,600 480,720 Q440,820 400,840 Q380,780 370,680 Q340,580 360,460 Z"
                fill="url(#landTopoGrad)"
                stroke="#3f4f45"
                strokeWidth="1"
              />

              {/* EUROPE */}
              <g>
                <path
                  d="M720,180 Q820,150 880,180 Q900,240 840,280 Q780,300 740,260 Q700,240 720,180 Z"
                  fill="url(#landTopoGrad)"
                  stroke="#4b5d52"
                  strokeWidth="1"
                />
              </g>

              {/* AFRICA */}
              <path
                d="M710,320 Q840,300 900,380 Q940,480 900,620 Q840,720 780,720 Q720,640 700,520 Q680,420 710,320 Z"
                fill="url(#desertTopoGrad)"
                stroke="#63553f"
                strokeWidth="1"
              />

              {/* EURASIA / RUSSIA (Copper/Amber Zone) */}
              <g>
                <path
                  d="M860,120 Q1100,90 1340,140 Q1380,240 1260,300 Q1060,280 920,240 Q840,180 860,120 Z"
                  fill="url(#landTopoGrad)"
                  stroke="#4b5d52"
                  strokeWidth="1"
                />
                <path
                  d="M900,140 Q1120,110 1320,160 Q1300,250 1140,270 Q980,250 900,180 Z"
                  fill="url(#eurasiaHeat)"
                />
              </g>

              {/* EAST ASIA / CHINA (Crimson Heat Overlay) */}
              <g>
                <path
                  d="M1080,280 Q1240,260 1320,340 Q1300,440 1200,460 Q1100,440 1060,360 Z"
                  fill="url(#landTopoGrad)"
                  stroke="#4b5d52"
                  strokeWidth="1"
                />
                <path
                  d="M1100,290 Q1220,270 1300,330 Q1280,420 1180,440 Q1100,410 1100,290 Z"
                  fill="url(#eastAsiaHeat)"
                />
              </g>

              {/* AUSTRALIA */}
              <path
                d="M1240,580 Q1380,560 1440,640 Q1420,740 1320,760 Q1220,720 1240,580 Z"
                fill="url(#desertTopoGrad)"
                stroke="#63553f"
                strokeWidth="1"
              />

              {/* Target Alert Tactical Markers (North America Heat Nodes) */}
              {[
                { x: 300, y: 260, label: "NA-01" },
                { x: 340, y: 290, label: "NA-02" },
                { x: 380, y: 270, label: "NA-03" },
                { x: 320, y: 340, label: "NA-04" },
                { x: 360, y: 350, label: "NA-05" },
                { x: 410, y: 320, label: "NA-06" },
              ].map((pin) => (
                <g key={pin.label} className="cursor-pointer">
                  <circle cx={pin.x} cy={pin.y} r="8" fill="#f97316" fillOpacity="0.4" className="animate-ping" />
                  <circle cx={pin.x} cy={pin.y} r="4" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
                  <path
                    d={`M${pin.x},${pin.y - 10} L${pin.x + 8},${pin.y - 4} L${pin.x - 8},${pin.y - 4} Z`}
                    fill="#f97316"
                    opacity="0.8"
                  />
                </g>
              ))}

              {/* Europe Tactical Shields & Pins */}
              <g className="cursor-pointer">
                <circle cx="780" cy="220" r="10" fill="#f43f5e" fillOpacity="0.3" className="animate-pulse" />
                <rect x="774" y="214" width="12" height="12" rx="2" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
                <path d="M780,217 L780,223 M777,220 L783,220" stroke="#ffffff" strokeWidth="1" />
              </g>

              <g className="cursor-pointer">
                <circle cx="820" cy="250" r="8" fill="#f43f5e" fillOpacity="0.3" />
                <rect x="816" y="246" width="8" height="8" rx="1.5" fill="#e11d48" stroke="#ffffff" strokeWidth="0.8" />
              </g>

              {/* Ocean Drift Vector Streamlines */}
              <path
                d="M480,380 Q620,320 760,440 T1040,400"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3,5"
                opacity="0.4"
              />
              <path
                d="M500,600 Q700,540 900,680 T1200,620"
                fill="none"
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4,6"
                opacity="0.3"
              />
            </svg>
          </div>

          {/* TOP-LEFT HUD OVERLAY: Threat Identification Card */}
          <div className="absolute top-4 left-4 z-20 w-[240px] bg-[#0c1424]/90 border border-zinc-700/80 rounded-xl p-3.5 backdrop-blur-md shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                TOTAL THREAT COVERAGE
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-white font-mono">
                  41.73%
                </div>
                <div className="text-[9px] font-mono text-zinc-400">GLOBAL SENSOR INDEX</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-[10px] font-mono">
              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-orange-400" />
                  THREAT SCORE:
                </span>
                <strong className="text-orange-400">6.424</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-rose-400" />
                  ACTIVE DRIFT:
                </span>
                <strong className="text-zinc-100">1.32%</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  PROXIMITY CRIT:
                </span>
                <strong className="text-amber-400">8.0%</strong>
              </div>
            </div>
          </div>

          {/* TOP-RIGHT MAP HUD OVERLAY: Sector Selector */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#0c1424]/90 border border-zinc-700/80 rounded-lg px-3 py-1.5 backdrop-blur-md shadow-lg text-[11px] font-mono text-zinc-300">
            <span className="text-zinc-400">SECTOR FOCUS:</span>
            <span className="text-white font-bold">PACIFIC / ATLANTIC</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-semibold">DUAL-SWATH</span>
          </div>

          {/* BOTTOM-LEFT HUD OVERLAY: Acoustic Frequency Curve Graph */}
          <div className="absolute bottom-4 left-4 z-20 w-[240px] bg-[#0c1424]/90 border border-zinc-700/80 rounded-xl p-3.5 backdrop-blur-md shadow-2xl space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-[9px] font-mono text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-zinc-300">ACOUSTIC BACKSCATTER</span>
              <span>20 - 120 kHz</span>
            </div>

            {/* Simulated Line Graph with Peak */}
            <div className="h-16 relative flex items-end">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 60">
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,50 Q40,48 60,10 Q80,45 140,48 T200,52 L200,60 L0,60 Z"
                  fill="url(#curveGrad)"
                />
                <path
                  d="M0,50 Q40,48 60,10 Q80,45 140,48 T200,52"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />
                <circle cx="60" cy="10" r="3" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Telemetry numbers grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/80">
              <div>P1: <strong className="text-zinc-200">11.7%</strong></div>
              <div>DEV: <strong className="text-orange-400">82.2 H00</strong></div>
              <div>SWATH: <strong className="text-zinc-200">28.1 NM</strong></div>
              <div>CORR: <strong className="text-emerald-400">8.09%</strong></div>
            </div>
          </div>

          {/* BOTTOM STATUS BAR ON MAP */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0c1424]/90 border border-zinc-700/80 rounded-lg px-3 py-1.5 backdrop-blur-md text-[10px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>REAL-TIME SENSOR ENCRYPTION ACTIVE</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-[#0c1424]/90 border border-zinc-700/80 rounded-lg overflow-hidden backdrop-blur-md text-xs font-mono">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                className="px-2.5 py-1 hover:bg-zinc-800 text-zinc-300 transition-colors"
              >
                -
              </button>
              <span className="px-2 text-[10px] text-zinc-400 border-x border-zinc-800">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
                className="px-2.5 py-1 hover:bg-zinc-800 text-zinc-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT THREAT INTELLIGENCE FEED SIDEBAR */}
        {rightPanelOpen ? (
          <aside className="w-[340px] h-full bg-[#0a1120] border-l border-zinc-800/80 flex flex-col z-20 shrink-0 shadow-2xl">
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#080d19]">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  CURRENT FEED
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {mockThreatFeed.length}
                </span>
              </div>
              <button
                onClick={() => setRightPanelOpen(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tactical Threat Cards Stack */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {mockThreatFeed.map((threat) => {
                const isSelected = selectedThreat.id === threat.id;
                return (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0f172a] border-zinc-500/80 shadow-md ring-1 ring-zinc-500/40"
                        : "bg-[#070d18] border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                            threat.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : threat.severity === "HIGH"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {threat.subCode}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-zinc-200 leading-tight">
                            {threat.category}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-500">{threat.id}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold ${
                          threat.trendPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {threat.trend}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/80 text-[10px] font-mono">
                      <div>
                        <span className="text-zinc-500 block text-[9px]">SCORE</span>
                        <span className="font-bold text-zinc-200">{threat.score}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px]">{threat.metricLabel.toUpperCase()}</span>
                        <span className="font-semibold text-zinc-300">{threat.metricValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Telemetry Matrix */}
            <div className="p-3.5 border-t border-zinc-800 bg-[#080d19] space-y-2 text-[10px] font-mono">
              <div className="grid grid-cols-2 gap-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>HIGH DISCOVERY:</span>
                  <strong className="text-emerald-400">+18.712%</strong>
                </div>
                <div className="flex justify-between">
                  <span>POWER BUFFER:</span>
                  <strong className="text-zinc-200">2.207 V</strong>
                </div>
                <div className="flex justify-between">
                  <span>RADAR ISO:</span>
                  <strong className="text-rose-400">-4.18%</strong>
                </div>
                <div className="flex justify-between">
                  <span>ACOUSTIC GAIN:</span>
                  <strong className="text-zinc-200">45.6 dB</strong>
                </div>
              </div>
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-[#0c1424]/90 border border-zinc-700/80 text-zinc-300 hover:text-white shadow-xl backdrop-blur-md"
            title="Open Threat Feed"
          >
            <Crosshair className="w-4 h-4 text-rose-400" />
          </button>
        )}
      </div>
    </div>
  );
}
