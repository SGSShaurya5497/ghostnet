"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Layers,
  Filter,
  RefreshCw,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Compass,
  Sliders,
  Sparkles,
  Maximize2,
  Download,
  Calendar,
  Waves,
  ArrowLeft,
} from "lucide-react";

interface HotspotCluster {
  id: string;
  name: string;
  lat: number;
  lng: number;
  density: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  detectedNets: number;
  debrisVolumeM3: number;
  driftVelocityKn: number;
  lastUpdated: string;
  radiusKm: number;
}

const mockClusters: HotspotCluster[] = [
  {
    id: "CL-01-PAC",
    name: "Subtropical Gyre Vortex Alpha",
    lat: 34.821,
    lng: -142.189,
    density: 94,
    riskLevel: "CRITICAL",
    detectedNets: 42,
    debrisVolumeM3: 3120,
    driftVelocityKn: 1.8,
    lastUpdated: "4 mins ago",
    radiusKm: 18.5,
  },
  {
    id: "CL-02-KER",
    name: "Kuroshio Extension Convergence",
    lat: 31.402,
    lng: 148.914,
    density: 88,
    riskLevel: "CRITICAL",
    detectedNets: 36,
    debrisVolumeM3: 2540,
    driftVelocityKn: 2.4,
    lastUpdated: "12 mins ago",
    radiusKm: 14.2,
  },
  {
    id: "CL-03-MED",
    name: "Tyrrhenian Trench Eddies",
    lat: 39.118,
    lng: 13.452,
    density: 76,
    riskLevel: "HIGH",
    detectedNets: 21,
    debrisVolumeM3: 1480,
    driftVelocityKn: 0.9,
    lastUpdated: "28 mins ago",
    radiusKm: 9.8,
  },
  {
    id: "CL-04-IND",
    name: "Seychelles Oceanic Ridge",
    lat: -4.679,
    lng: 55.492,
    density: 63,
    riskLevel: "MEDIUM",
    detectedNets: 15,
    debrisVolumeM3: 940,
    driftVelocityKn: 1.1,
    lastUpdated: "1 hour ago",
    radiusKm: 7.4,
  },
  {
    id: "CL-05-COR",
    name: "Great Barrier Seaward Shelf",
    lat: -17.842,
    lng: 149.201,
    density: 41,
    riskLevel: "LOW",
    detectedNets: 7,
    debrisVolumeM3: 410,
    driftVelocityKn: 0.6,
    lastUpdated: "3 hours ago",
    radiusKm: 5.1,
  },
];

export default function HotspotDetectionPage() {
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster>(mockClusters[0]);
  const [filterMinDensity, setFilterMinDensity] = useState<number>(50);
  const [algorithm, setAlgorithm] = useState<"DBSCAN" | "K-MEANS" | "HDBSCAN" | "GAUSSIAN_KDE">("HDBSCAN");
  const [heatKernel, setHeatKernel] = useState<number>(12);
  const [isSimulating, setIsSimulating] = useState(false);

  const filteredClusters = mockClusters.filter((c) => c.density >= filterMinDensity);

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
              <Flame className="w-4 h-4 text-orange-400" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Hotspot Detection
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              HDBSCAN Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous spatial density clustering, convergence modeling, and ghost gear entrapment nodes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Last 72h Window</span>
          </div>

          <button
            onClick={() => {
              setIsSimulating(true);
              setTimeout(() => setIsSimulating(false), 800);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            Re-cluster
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">High-Density Hotspots</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            {filteredClusters.length} <span className="text-xs font-normal text-zinc-500 font-mono">clusters</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3 h-3" />
            <span>+3 new convergence zones</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Aggregated Net Count</span>
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            121 <span className="text-xs font-normal text-zinc-500 font-mono">targets</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Volume: <span className="text-zinc-200">8,490 m³</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Mean Drift Velocity</span>
            <Waves className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            1.72 <span className="text-xs font-normal text-zinc-500 font-mono">knots</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Vector: 042° True North
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Active Algorithm</span>
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">{algorithm}</div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Epsilon: 4.8nm | MinSamples: 4
          </div>
        </div>
      </div>

      {/* Main Grid: Left Heat Map + Right Cluster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Heat Map Display (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          {/* Minimal Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">
                Spatial Heat Matrix
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                σ = {heatKernel}km
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-all border border-zinc-700/40">
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-all border border-zinc-700/40">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Minimalist Map Canvas */}
          <div className="relative w-full flex-1 min-h-[400px] rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden flex items-center justify-center">
            {/* Subtle dot matrix */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #71717a 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Subtle flow streamlines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <path
                d="M-50,120 Q300,80 600,220 T1200,180"
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="1"
                strokeDasharray="4,6"
              />
              <path
                d="M-50,300 Q400,240 800,380 T1400,310"
                fill="none"
                stroke="#71717a"
                strokeWidth="1"
                strokeDasharray="3,5"
              />
            </svg>

            {/* Render Clusters */}
            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster.id === cluster.id;
              const top = `${Math.min(Math.max((45 - cluster.lat) * 2.2, 10), 85)}%`;
              const left = `${Math.min(Math.max((cluster.lng + 180) / 3.6, 10), 85)}%`;

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className="absolute cursor-pointer transition-all duration-200 group z-20"
                  style={{ top, left, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      cluster.riskLevel === "CRITICAL"
                        ? "bg-rose-500/10 border border-rose-500/30"
                        : cluster.riskLevel === "HIGH"
                        ? "bg-amber-500/10 border border-amber-500/30"
                        : "bg-zinc-500/10 border border-zinc-500/30"
                    }`}
                    style={{
                      width: `${Math.max(cluster.density * 1.2, 50)}px`,
                      height: `${Math.max(cluster.density * 1.2, 50)}px`,
                    }}
                  />

                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-medium transition-all ${
                      isSelected
                        ? "bg-white text-zinc-950 ring-2 ring-white/30 scale-110 shadow-lg"
                        : cluster.riskLevel === "CRITICAL"
                        ? "bg-rose-500 text-white"
                        : cluster.riskLevel === "HIGH"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {cluster.detectedNets}
                  </div>

                  <div
                    className={`absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono border backdrop-blur-sm transition-all ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-700 text-zinc-100 opacity-100 shadow-md"
                        : "bg-zinc-950/90 border-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {cluster.name} ({cluster.density}%)
                  </div>
                </div>
              );
            })}

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-[11px] backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <span className="text-zinc-500 font-medium">Density:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-zinc-400">Critical (&gt;85%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-zinc-400">High (70-85%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400">Moderate (&lt;70%)</span>
                </div>
              </div>
              <span className="text-zinc-500 font-mono text-[10px]">WGS-84</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1 font-medium">Clustering Model</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
              >
                <option value="HDBSCAN">HDBSCAN (Hierarchical)</option>
                <option value="DBSCAN">DBSCAN (Spatial Epsilon)</option>
                <option value="GAUSSIAN_KDE">Gaussian KDE</option>
                <option value="K-MEANS">K-Means Centroids</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span className="font-medium">Min Density Threshold</span>
                <span className="text-zinc-200 font-mono">{filterMinDensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={filterMinDensity}
                onChange={(e) => setFilterMinDensity(Number(e.target.value))}
                className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span className="font-medium">Heat Kernel Radius</span>
                <span className="text-zinc-200 font-mono">{heatKernel} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={heatKernel}
                onChange={(e) => setHeatKernel(Number(e.target.value))}
                className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Cluster Dossier */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              Cluster Details
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                selectedCluster.riskLevel === "CRITICAL"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : selectedCluster.riskLevel === "HIGH"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
              }`}
            >
              {selectedCluster.riskLevel}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Identifier
            </span>
            <div className="text-base font-semibold text-zinc-100">{selectedCluster.name}</div>
            <div className="text-xs font-mono text-zinc-400 mt-0.5">{selectedCluster.id}</div>
          </div>

          <div className="space-y-3 bg-zinc-900/80 border border-zinc-800 rounded-lg p-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Entrapment Density</span>
              <span className="text-zinc-100 font-semibold font-mono">{selectedCluster.density} / 100</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-200 rounded-full"
                style={{ width: `${selectedCluster.density}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[10px] text-zinc-500 block">Ghost Nets</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">{selectedCluster.detectedNets} units</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Estimated Volume</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">{selectedCluster.debrisVolumeM3.toLocaleString()} m³</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Drift Velocity</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">{selectedCluster.driftVelocityKn} kn</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Vortex Radius</span>
                <span className="text-xs font-semibold text-zinc-200 font-mono">{selectedCluster.radiusKm} km</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-400">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Centroid GPS</span>
            <div className="flex justify-between text-zinc-300">
              <span>Lat: {selectedCluster.lat}° N</span>
              <span>Lng: {selectedCluster.lng}° W</span>
            </div>
          </div>

          <div className="pt-2 space-y-2 mt-auto">
            <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Dispatch Recovery Sweep
            </button>
            <button className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Export GeoJSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
