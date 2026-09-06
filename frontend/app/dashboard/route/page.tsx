"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Route,
  Compass,
  Navigation,
  Wind,
  Clock,
  Fuel,
  Play,
  Download,
  Maximize2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  swathCoverageKm2: number;
  eta: string;
  action: "SONAR_SWEEP" | "ROV_DIVE" | "NET_SALVAGE" | "WAYPOINT_TRANSIT";
}

const mockWaypoints: Waypoint[] = [
  {
    id: "WP-01",
    name: "Departure Anchor Point",
    lat: 34.62,
    lng: -142.35,
    swathCoverageKm2: 0,
    eta: "00:00 (START)",
    action: "WAYPOINT_TRANSIT",
  },
  {
    id: "WP-02",
    name: "North Gyre Vortex Leg 1",
    lat: 34.78,
    lng: -142.15,
    swathCoverageKm2: 42.5,
    eta: "+02h 15m",
    action: "SONAR_SWEEP",
  },
  {
    id: "WP-03",
    name: "Target Clust-84 Dive Site",
    lat: 34.82,
    lng: -141.92,
    swathCoverageKm2: 18.2,
    eta: "+04h 40m",
    action: "NET_SALVAGE",
  },
  {
    id: "WP-04",
    name: "Thermocline Drift Swath",
    lat: 34.65,
    lng: -141.74,
    swathCoverageKm2: 38.0,
    eta: "+07h 10m",
    action: "SONAR_SWEEP",
  },
  {
    id: "WP-05",
    name: "Sanctuary Perimeter Sweep",
    lat: 34.48,
    lng: -142.05,
    swathCoverageKm2: 52.4,
    eta: "+10h 30m",
    action: "ROV_DIVE",
  },
];

export default function RoutePlanningPage() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(mockWaypoints);
  const [selectedWp, setSelectedWp] = useState<Waypoint>(mockWaypoints[1]);
  const [lawnmowerSpacingNm, setLawnmowerSpacingNm] = useState<number>(1.2);
  const [driftAdjustment, setDriftAdjustment] = useState<boolean>(true);
  const [isComputing, setIsComputing] = useState(false);

  const totalCoverage = waypoints.reduce((acc, wp) => acc + wp.swathCoverageKm2, 0);

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
              <Route className="w-4 h-4 text-zinc-300" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Route Planning & Swath Generator
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              Autopilot
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Lawnmower trajectory generation, drift-compensated vector waypoints, and fuel-optimized swath routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsComputing(true);
              setTimeout(() => setIsComputing(false), 900);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isComputing ? "animate-spin" : ""}`} />
            Recalculate Path
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Total Planned Swath</span>
            <Navigation className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            {totalCoverage.toFixed(1)} <span className="text-xs font-normal text-zinc-500 font-mono">km²</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-mono">99.4% Overlap Guarantee</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Estimated Mission Duration</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            10.5 <span className="text-xs font-normal text-zinc-500 font-mono">hours</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">Cruise Speed: 8.5 kn</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Current Drift Offset</span>
            <Wind className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            +1.8 <span className="text-xs font-normal text-zinc-500 font-mono">kn @ 054°</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">Eulerian Vector Active</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Projected Fuel Burn</span>
            <Fuel className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            142 <span className="text-xs font-normal text-zinc-500 font-mono">liters</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-mono">-22% vs standard survey</div>
        </div>
      </div>

      {/* Main Grid: Left Route Visualizer + Right Waypoint List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Route Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">
                Swath Trajectory Simulation
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                ACTIVE
              </span>
            </div>

            <button className="p-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-all border border-zinc-700/40">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Trajectory Canvas */}
          <div className="relative w-full flex-1 min-h-[380px] rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            <svg className="absolute inset-0 w-full h-full">
              {/* Lawnmower Survey Swath Lines */}
              <path
                d="M100,120 L240,120 L240,160 L100,160 L100,200 L240,200 L240,240 L100,240"
                fill="none"
                stroke="#71717a"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                className="opacity-60"
              />

              {/* Waypoint Interconnect Line */}
              <path
                d="M120,320 L280,180 L460,110 L620,240 L700,310"
                fill="none"
                stroke="#e4e4e7"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Sonar Swath Coverage Envelope */}
              <polygon
                points="110,330 270,170 450,100 630,230 710,300 690,320 610,250 470,120 290,190 130,310"
                fill="#ffffff"
                fillOpacity="0.04"
              />

              {/* Waypoint Pins */}
              {[
                { x: 120, y: 320, label: "WP-01", name: "Departure" },
                { x: 280, y: 180, label: "WP-02", name: "North Gyre" },
                { x: 460, y: 110, label: "WP-03", name: "Dive Site" },
                { x: 620, y: 240, label: "WP-04", name: "Drift Swath" },
                { x: 700, y: 310, label: "WP-05", name: "Perimeter" },
              ].map((wp) => (
                <g key={wp.label} className="cursor-pointer">
                  <circle cx={wp.x} cy={wp.y} r="6" fill="#18181b" stroke="#e4e4e7" strokeWidth="2" />
                  <text x={wp.x + 10} y={wp.y + 4} fill="#d4d4d8" fontSize="10" fontFamily="monospace" fontWeight="500">
                    {wp.label}: {wp.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Configuration Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span className="font-medium">Track Spacing</span>
                <span className="text-zinc-200 font-mono">{lawnmowerSpacingNm} NM</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={lawnmowerSpacingNm}
                onChange={(e) => setLawnmowerSpacingNm(Number(e.target.value))}
                className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Drift Vector Compensation</span>
                <span className="text-[10px] text-zinc-500 font-mono">Eulerian dynamic offset</span>
              </div>
              <button
                onClick={() => setDriftAdjustment(!driftAdjustment)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all border ${
                  driftAdjustment
                    ? "bg-zinc-800 border-zinc-600 text-zinc-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
              >
                {driftAdjustment ? "ENABLED" : "DISABLED"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Waypoints Schedule */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Route className="w-3.5 h-3.5 text-zinc-400" />
              Waypoints
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">{waypoints.length} LEGS</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {waypoints.map((wp) => {
              const isSelected = selectedWp.id === wp.id;
              return (
                <div
                  key={wp.id}
                  onClick={() => setSelectedWp(wp)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-600 shadow-sm"
                      : "bg-zinc-900/50 border-zinc-800/70 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">{wp.name}</span>
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {wp.eta}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-zinc-400">
                    <span>{wp.action}</span>
                    <span>Coverage: <strong className="text-zinc-200">{wp.swathCoverageKm2} km²</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 space-y-2 mt-auto">
            <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5 fill-current" />
              Upload Path to Autopilot
            </button>
            <button className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Export GPX / KML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
