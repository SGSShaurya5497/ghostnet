"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Waves,
  Activity,
  ArrowDown,
  Anchor,
  ShieldAlert,
  Download,
  Crosshair,
  Volume2,
  Maximize2,
  ArrowLeft,
} from "lucide-react";

interface DepthLayer {
  id: string;
  name: string;
  depthRange: string;
  acousticReflectance: number;
  debrisCount: number;
  entanglementRisk: "CRITICAL" | "MODERATE" | "LOW";
  color: string;
  enabled: boolean;
}

const initialLayers: DepthLayer[] = [
  {
    id: "epipelagic",
    name: "Epipelagic (Sunlight Zone)",
    depthRange: "0m – 200m",
    acousticReflectance: -18,
    debrisCount: 64,
    entanglementRisk: "CRITICAL",
    color: "#e4e4e7",
    enabled: true,
  },
  {
    id: "mesopelagic",
    name: "Mesopelagic (Twilight Zone)",
    depthRange: "200m – 1,000m",
    acousticReflectance: -32,
    debrisCount: 29,
    entanglementRisk: "MODERATE",
    color: "#a1a1aa",
    enabled: true,
  },
  {
    id: "bathypelagic",
    name: "Bathypelagic (Midnight Zone)",
    depthRange: "1,000m – 4,000m",
    acousticReflectance: -54,
    debrisCount: 12,
    entanglementRisk: "LOW",
    color: "#71717a",
    enabled: true,
  },
  {
    id: "abyssopelagic",
    name: "Abyssal Plain & Seabed",
    depthRange: "4,000m – 6,000m+",
    acousticReflectance: -72,
    debrisCount: 4,
    entanglementRisk: "LOW",
    color: "#52525b",
    enabled: false,
  },
];

export default function DepthAnalysisPage() {
  const [layers, setLayers] = useState<DepthLayer[]>(initialLayers);
  const [selectedDepth, setSelectedDepth] = useState<number>(142);
  const [sonarGain, setSonarGain] = useState<number>(75);
  const [bathymetryResolution, setBathymetryResolution] = useState<"0.5m" | "1.0m" | "5.0m">("0.5m");

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, enabled: !layer.enabled } : layer))
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl text-zinc-100 overflow-y-auto p-4 md:p-6 space-y-6 font-sans backdrop-blur-xl shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyan-950/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white hover:bg-cyan-900/80 text-xs font-mono transition-all mr-1 shadow-sm"
              title="Return to Main Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <span className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300">
              <Layers className="w-4 h-4 text-zinc-300" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Depth & Bathymetry Analysis
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              EM-304 Multibeam
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Multibeam acoustic backscatter, thermocline gradients, and subsea water column slicing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kongsberg EM 304 (30 kHz)</span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export Pointcloud
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Current Sounding Depth</span>
            <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            {selectedDepth} <span className="text-xs font-normal text-zinc-500 font-mono">meters</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Seabed Clearance: <span className="text-emerald-400">+68.4 m</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Thermocline Boundary</span>
            <Waves className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            84.2 <span className="text-xs font-normal text-zinc-500 font-mono">m</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Temp Gradient: <span className="text-zinc-200">-4.2°C / 100m</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Submerged Targets</span>
            <Anchor className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            109 <span className="text-xs font-normal text-zinc-500 font-mono">hits</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            64 targets in 0-200m zone
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Sonar Swath Width</span>
            <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            640 <span className="text-xs font-normal text-zinc-500 font-mono">meters</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Ping Rate: 12 Hz | 432 Beams
          </div>
        </div>
      </div>

      {/* Main Grid: Left Echogram Profile + Right Strata Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Visualizer Canvas (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">
                Backscatter Echogram
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                LIVE SWATH
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-all border border-zinc-700/40">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-all border border-zinc-700/40">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="relative w-full flex-1 min-h-[380px] rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden flex flex-col justify-between p-6">
            {/* Depth Markers Left Axis */}
            <div className="absolute left-3 top-4 bottom-4 flex flex-col justify-between text-[10px] font-mono text-zinc-600 border-r border-zinc-800 pr-2 pointer-events-none">
              <span>0m</span>
              <span>-50m</span>
              <span>-100m</span>
              <span>-150m</span>
              <span>-200m</span>
            </div>

            {/* Depth Slicing Plane Line */}
            <div
              className="absolute left-16 right-4 border-t border-dashed border-zinc-400 flex items-center justify-between text-[10px] font-mono text-zinc-300 pointer-events-none z-10"
              style={{ top: `${(selectedDepth / 220) * 100}%` }}
            >
              <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                Slice: {selectedDepth}m
              </span>
              <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                Lock Active
              </span>
            </div>

            {/* Subsea Topography */}
            <div className="w-full h-full ml-12 relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="seabedGradMinimal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#27272a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#18181b" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,280 Q150,220 300,290 T600,240 T800,320 L800,400 L0,400 Z"
                  fill="url(#seabedGradMinimal)"
                  stroke="#52525b"
                  strokeWidth="1.5"
                />

                {/* Submerged Targets */}
                <g className="cursor-pointer">
                  <circle cx="280" cy="180" r="10" fill="#f43f5e" fillOpacity="0.2" className="animate-pulse" />
                  <circle cx="280" cy="180" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                  <text x="296" y="184" fill="#e4e4e7" fontSize="10" fontFamily="monospace" fontWeight="600">
                    GN-BATHY-84 (118m)
                  </text>
                </g>

                <g className="cursor-pointer">
                  <circle cx="520" cy="140" r="8" fill="#e4e4e7" fillOpacity="0.2" />
                  <circle cx="520" cy="140" r="4" fill="#e4e4e7" stroke="#09090b" strokeWidth="1" />
                  <text x="534" y="144" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
                    GN-BATHY-92 (92m)
                  </text>
                </g>
              </svg>
            </div>

            {/* Depth Slider */}
            <div className="z-20 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex justify-between items-center text-xs text-zinc-300 mb-1.5 font-mono">
                <span>Slice Water Column Depth</span>
                <span className="text-zinc-100 font-semibold">{selectedDepth} m</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={selectedDepth}
                onChange={(e) => setSelectedDepth(Number(e.target.value))}
                className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sonar Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span className="font-medium">Sonar Acoustic Gain</span>
                <span className="text-zinc-200 font-mono">{sonarGain}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sonarGain}
                onChange={(e) => setSonarGain(Number(e.target.value))}
                className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1 font-medium">Grid Resolution</label>
              <div className="flex gap-2">
                {(["0.5m", "1.0m", "5.0m"] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setBathymetryResolution(res)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all border ${
                      bathymetryResolution === res
                        ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-medium"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {res} Grid
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Depth Strata Layers */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              Depth Strata
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">4 ZONES</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  layer.enabled
                    ? "bg-zinc-900/80 border-zinc-700/80 shadow-sm"
                    : "bg-zinc-950/60 border-zinc-850 opacity-40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200">{layer.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      layer.entanglementRisk === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : layer.entanglementRisk === "MODERATE"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    }`}
                  >
                    {layer.entanglementRisk}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono text-zinc-400">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Range</span>
                    <span className="text-zinc-300">{layer.depthRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Backscatter</span>
                    <span className="text-zinc-300">{layer.acousticReflectance} dB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Debris</span>
                    <span className="text-zinc-200 font-semibold">{layer.debrisCount} targets</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Status</span>
                    <span className={layer.enabled ? "text-emerald-400" : "text-zinc-500"}>
                      {layer.enabled ? "ACTIVE" : "MUTED"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 mt-auto">
            <ShieldAlert className="w-3.5 h-3.5" />
            Calibrate Submersible Sonar
          </button>
        </div>
      </div>
    </div>
  );
}
