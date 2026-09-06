'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Fish,
  Compass,
  Ship,
  RefreshCw,
  FileCheck,
  Zap,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface RiskZone {
  id: string;
  name: string;
  region: string;
  riskScore: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'GUARDED';
  mammalCollisionProb: number;
  propellerFoulingRisk: number;
  coralReefProximityKm: number;
  activeNetsInZone: number;
  lastAssessed: string;
}

const INITIAL_RISK_ZONES: RiskZone[] = [
  {
    id: 'RZ-GOA-01',
    name: 'Grande Island Reef Marine Sanctuary',
    region: 'Goa Coastal Shelf',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    mammalCollisionProb: 88,
    propellerFoulingRisk: 94,
    coralReefProximityKm: 1.4,
    activeNetsInZone: 28,
    lastAssessed: '8 mins ago',
  },
  {
    id: 'RZ-MORM-02',
    name: 'Mormugao Deep Navigation Channel',
    region: 'Central Port Corridor',
    riskScore: 84,
    threatLevel: 'CRITICAL',
    mammalCollisionProb: 76,
    propellerFoulingRisk: 89,
    coralReefProximityKm: 0.8,
    activeNetsInZone: 19,
    lastAssessed: '18 mins ago',
  },
  {
    id: 'RZ-AGUADA-03',
    name: 'Aguada Shoals Trawler Convergence',
    region: 'North Estuary Corridor',
    riskScore: 71,
    threatLevel: 'HIGH',
    mammalCollisionProb: 82,
    propellerFoulingRisk: 61,
    coralReefProximityKm: 3.2,
    activeNetsInZone: 14,
    lastAssessed: '32 mins ago',
  },
  {
    id: 'RZ-BAGA-04',
    name: 'Baga Shelf Ridge Drift Corridor',
    region: 'Open Shelf Slope',
    riskScore: 58,
    threatLevel: 'ELEVATED',
    mammalCollisionProb: 44,
    propellerFoulingRisk: 68,
    coralReefProximityKm: 12.5,
    activeNetsInZone: 11,
    lastAssessed: '1 hour ago',
  },
  {
    id: 'RZ-ANJUNA-05',
    name: 'Anjuna Submerged Rocky Outcrop',
    region: 'Northern Bank',
    riskScore: 36,
    threatLevel: 'GUARDED',
    mammalCollisionProb: 25,
    propellerFoulingRisk: 39,
    coralReefProximityKm: 24.0,
    activeNetsInZone: 5,
    lastAssessed: '3 hours ago',
  },
];

export default function RiskIntelligencePage() {
  const [zones, setZones] = useState<RiskZone[]>(INITIAL_RISK_ZONES);
  const [selectedZone, setSelectedZone] = useState<RiskZone>(INITIAL_RISK_ZONES[0]);
  const [threatFilter, setThreatFilter] = useState<string>('ALL');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [issuedWarning, setIssuedWarning] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/risk-summary`)
      .then((r) => r.json())
      .catch(() => {});
  }, []);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setZones((prev) =>
        prev.map((z) => ({
          ...z,
          riskScore: Math.min(99, Math.max(20, z.riskScore + Math.floor((Math.random() - 0.5) * 6))),
          lastAssessed: 'Just now',
        }))
      );
      setIsRecalculating(false);
    }, 700);
  };

  const handleIssueWarning = () => {
    setIssuedWarning(true);
    setTimeout(() => setIssuedWarning(false), 4000);
  };

  const filteredZones =
    threatFilter === 'ALL'
      ? zones
      : zones.filter((z) => z.threatLevel === threatFilter);

  const getThreatBadge = (level: RiskZone['threatLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return 'pill-badge-red';
      case 'HIGH':
        return 'pill-badge-amber';
      case 'ELEVATED':
        return 'pill-badge-blue';
      default:
        return 'pill-badge-green';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Risk Intelligence & Threat Matrix
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Real-time ecological impact assessment, megafauna entanglement index, and vessel hazard scoring
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200/80"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Danger Index</span>
          </button>
          <div className="pill-badge-red text-xs py-1 px-3">
            <span>2 Critical Zones</span>
          </div>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Global Threat Severity</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            87.4 <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <span className="pill-badge-red text-[10px]">Critical Chokepoint Alerts</span>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Entanglement Risk</span>
            <Fish className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            79% <span className="text-xs font-normal text-slate-400">probability</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Cetacean & Turtle Migration Path
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Propulsion Hazard</span>
            <Ship className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            91% <span className="text-xs font-normal text-slate-400">propeller risk</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Commercial shipping lanes impacted
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Eco-System Impact</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            Grade A- <span className="text-xs font-normal text-slate-400">severe</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            0.8km proximity to barrier reefs
          </div>
        </div>
      </div>

      {/* ── Main Grid: Left Threat Map + Right Risk Dossier ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Map (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Threat Vector Map
              </span>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-bold">
                TACTICAL OVERLAY
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={threatFilter}
                onChange={(e) => setThreatFilter(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
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
          <div className="relative w-full h-[400px] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center select-none shadow-inner">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #64748B 1px, transparent 1px), linear-gradient(to bottom, #64748B 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />

            {/* Simulated Hazard Polygons */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon
                points="80,60 280,40 340,190 140,210"
                fill="#F43F5E"
                fillOpacity="0.12"
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <polygon
                points="420,160 660,140 700,310 460,290"
                fill="#F59E0B"
                fillOpacity="0.1"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>

            {/* Zone Markers */}
            {filteredZones.map((zone, idx) => {
              const isSelected = selectedZone.id === zone.id;
              const positions = [
                { top: '35%', left: '26%' },
                { top: '60%', left: '68%' },
                { top: '48%', left: '46%' },
                { top: '24%', left: '74%' },
                { top: '72%', left: '32%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className="absolute cursor-pointer transition-all duration-200 group z-10"
                  style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className={`p-2.5 rounded-xl flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-blue-400 text-white shadow-xl scale-105 ring-2 ring-blue-400/40'
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <ShieldAlert
                      className={`w-4 h-4 ${
                        zone.threatLevel === 'CRITICAL'
                          ? 'text-rose-400'
                          : zone.threatLevel === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold leading-tight">{zone.id}</span>
                      <span className="text-[9px] font-mono text-slate-400">
                        Score: {zone.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Warning Banner */}
          <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Advisory:</strong> Commercial vessel navigation in Sector 4 is operating under elevated entanglement risk.
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Risk Zone Breakdown (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-400" />
                Threat Assessment
              </h2>
              <span className={`${getThreatBadge(selectedZone.threatLevel)} text-xs font-bold`}>
                {selectedZone.threatLevel}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Zone Designation
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedZone.name}</div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">{selectedZone.region}</div>
            </div>

            {/* Risk Metrics Breakdown */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Total Danger Index</span>
                  <span className="text-slate-900 font-bold font-mono">{selectedZone.riskScore} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${selectedZone.riskScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Entanglement Index</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedZone.mammalCollisionProb}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${selectedZone.mammalCollisionProb}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">Vessel Propeller Hazard</span>
                  <span className="text-slate-800 font-bold font-mono">{selectedZone.propellerFoulingRisk}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${selectedZone.propellerFoulingRisk}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">REEF PROXIMITY</span>
                <span className="font-bold text-slate-900 font-mono">{selectedZone.coralReefProximityKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">ACTIVE NETS</span>
                <span className="font-bold text-slate-900 font-mono">{selectedZone.activeNetsInZone} targets</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">ASSESSED</span>
                <span className="text-slate-700 font-medium">{selectedZone.lastAssessed}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">STATUS</span>
                <span className="text-emerald-600 font-bold">MPA PROTECTED</span>
              </div>
            </div>
          </div>

          {issuedWarning ? (
            <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>NAVTEX Advisory Transmitted to Fleet</span>
            </div>
          ) : (
            <button
              onClick={handleIssueWarning}
              className="w-full btn-primary-dark text-xs justify-center"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Issue NAVTEX Warning Broadcast</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
