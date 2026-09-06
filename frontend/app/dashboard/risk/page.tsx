"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Fish,
  Compass,
  Ship,
  RefreshCw,
  FileCheck,
  Zap,
  ArrowLeft,
} from "lucide-react";

interface RiskZone {
  id: string;
  name: string;
  region: string;
  riskScore: number;
  threatLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "GUARDED";
  mammalCollisionProb: number;
  propellerFoulingRisk: number;
  coralReefProximityKm: number;
  activeNetsInZone: number;
  lastAssessed: string;
}

const mockRiskZones: RiskZone[] = [
  {
    id: "RZ-HAWAII-01",
    name: "Papahānaumokuākea Sanctuary Boundary",
    region: "North Pacific",
    riskScore: 92,
    threatLevel: "CRITICAL",
    mammalCollisionProb: 88,
    propellerFoulingRisk: 94,
    coralReefProximityKm: 1.4,
    activeNetsInZone: 28,
    lastAssessed: "10 mins ago",
  },
  {
    id: "RZ-CORAL-04",
    name: "Torres Strait Navigation Chokepoint",
    region: "Coral Sea",
    riskScore: 84,
    threatLevel: "CRITICAL",
    mammalCollisionProb: 76,
    propellerFoulingRisk: 89,
    coralReefProximityKm: 0.8,
    activeNetsInZone: 19,
    lastAssessed: "24 mins ago",
  },
  {
    id: "RZ-MED-09",
    name: "Pelagos Marine Mammal Sanctuary",
    region: "Ligurian Sea",
    riskScore: 71,
    threatLevel: "HIGH",
    mammalCollisionProb: 82,
    propellerFoulingRisk: 61,
    coralReefProximityKm: 8.2,
    activeNetsInZone: 14,
    lastAssessed: "45 mins ago",
  },
  {
    id: "RZ-GULF-03",
    name: "Campeche Deep Bank Drift Corridor",
    region: "Gulf of Mexico",
    riskScore: 58,
    threatLevel: "ELEVATED",
    mammalCollisionProb: 44,
    propellerFoulingRisk: 68,
    coralReefProximityKm: 14.5,
    activeNetsInZone: 11,
    lastAssessed: "2 hours ago",
  },
  {
    id: "RZ-AZOR-07",
    name: "Mid-Atlantic Hydrothermal Trench",
    region: "North Atlantic",
    riskScore: 36,
    threatLevel: "GUARDED",
    mammalCollisionProb: 25,
    propellerFoulingRisk: 39,
    coralReefProximityKm: 42.0,
    activeNetsInZone: 5,
    lastAssessed: "5 hours ago",
  },
];

export default function RiskIntelligencePage() {
  const [selectedZone, setSelectedZone] = useState<RiskZone>(mockRiskZones[0]);
  const [threatFilter, setThreatFilter] = useState<string>("ALL");
  const [isRecalculating, setIsRecalculating] = useState(false);

  const filteredZones =
    threatFilter === "ALL"
      ? mockRiskZones
      : mockRiskZones.filter((z) => z.threatLevel === threatFilter);

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
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Risk Intelligence Matrix
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              Threat Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time ecological impact assessment, megafauna entanglement index, and vessel propulsion hazard scoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsRecalculating(true);
              setTimeout(() => setIsRecalculating(false), 900);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`} />
            Recalculate Danger Index
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Global Threat Severity</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            87.4 <span className="text-xs font-normal text-zinc-500 font-mono">/ 100</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-2">
            2 Critical Chokepoint Alerts Active
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Entanglement Risk</span>
            <Fish className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            79% <span className="text-xs font-normal text-zinc-500 font-mono">probability</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Humpback & Monk Seal Corridor
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Propulsion Hazard</span>
            <Ship className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            91% <span className="text-xs font-normal text-zinc-500 font-mono">propeller risk</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            Commercial shipping lanes impacted
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Eco-System Impact</span>
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            Grade A- <span className="text-xs font-normal text-zinc-500 font-mono">severe</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">
            0.8km proximity to barrier reefs
          </div>
        </div>
      </div>

      {/* Main Grid: Left Threat Map + Right Risk Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Threat Map (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">
                Threat Vector Map
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                OVERLAY
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={threatFilter}
                onChange={(e) => setThreatFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none font-mono"
              >
                <option value="ALL">All Threat Levels</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Only</option>
                <option value="ELEVATED">Elevated</option>
                <option value="GUARDED">Guarded</option>
              </select>
            </div>
          </div>

          {/* Tactical Canvas */}
          <div className="relative w-full flex-1 min-h-[380px] rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            {/* Simulated Hazard Polygons */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon
                points="120,80 340,60 410,220 180,240"
                fill="#f43f5e"
                fillOpacity="0.06"
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <polygon
                points="480,180 720,160 760,340 520,320"
                fill="#71717a"
                fillOpacity="0.08"
                stroke="#71717a"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            </svg>

            {/* Zone Markers */}
            {filteredZones.map((zone, idx) => {
              const isSelected = selectedZone.id === zone.id;
              const positions = [
                { top: "35%", left: "28%" },
                { top: "60%", left: "68%" },
                { top: "45%", left: "50%" },
                { top: "25%", left: "75%" },
                { top: "70%", left: "30%" },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className="absolute cursor-pointer transition-all duration-200 group z-10"
                  style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={`p-2 rounded-lg flex items-center gap-2 border transition-all ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-500 text-white shadow-md ring-1 ring-zinc-500/50"
                        : "bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        zone.threatLevel === "CRITICAL"
                          ? "text-rose-400"
                          : zone.threatLevel === "HIGH"
                          ? "text-amber-400"
                          : "text-zinc-400"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium leading-tight">{zone.id}</span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        Score: {zone.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Warning Banner */}
          <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Advisory:</strong> Commercial vessel navigation in Sector 4 is operating under elevated entanglement alert.
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Risk Zone Breakdown */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
              Threat Assessment
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                selectedZone.threatLevel === "CRITICAL"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : selectedZone.threatLevel === "HIGH"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
              }`}
            >
              {selectedZone.threatLevel}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Zone Designation
            </span>
            <div className="text-base font-semibold text-zinc-100">{selectedZone.name}</div>
            <div className="text-xs font-mono text-zinc-400 mt-0.5">{selectedZone.region}</div>
          </div>

          {/* Risk Metrics Breakdown */}
          <div className="space-y-3 bg-zinc-900/80 border border-zinc-800 rounded-lg p-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Total Danger Index</span>
                <span className="text-zinc-100 font-semibold font-mono">{selectedZone.riskScore} / 100</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-200 rounded-full"
                  style={{ width: `${selectedZone.riskScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Entanglement Index</span>
                <span className="text-zinc-300 font-mono">{selectedZone.mammalCollisionProb}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 rounded-full"
                  style={{ width: `${selectedZone.mammalCollisionProb}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Vessel Propeller Hazard</span>
                <span className="text-zinc-300 font-mono">{selectedZone.propellerFoulingRisk}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 rounded-full"
                  style={{ width: `${selectedZone.propellerFoulingRisk}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block">Reef Proximity</span>
              <span className="font-semibold text-zinc-200 font-mono">{selectedZone.coralReefProximityKm} km</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Active Nets</span>
              <span className="font-semibold text-zinc-200 font-mono">{selectedZone.activeNetsInZone} targets</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Assessment Age</span>
              <span className="text-zinc-400">{selectedZone.lastAssessed}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Status</span>
              <span className="text-emerald-400 font-medium">MPA PROTECTED</span>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 mt-auto">
            <Zap className="w-3.5 h-3.5" />
            Issue NAVTEX Warning
          </button>
        </div>
      </div>
    </div>
  );
}
