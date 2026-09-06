'use client';

import React, { useState } from 'react';
import {
  Route,
  Compass,
  Navigation,
  Wind,
  Clock,
  Fuel,
  Play,
  Download,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  swathCoverageKm2: number;
  eta: string;
  action: 'SONAR_SWEEP' | 'ROV_DIVE' | 'NET_SALVAGE' | 'WAYPOINT_TRANSIT';
}

const MOCK_WAYPOINTS: Waypoint[] = [
  {
    id: 'WP-01',
    name: 'Departure Anchor (Mormugao)',
    lat: 15.412,
    lng: 73.791,
    swathCoverageKm2: 0,
    eta: '00:00 (START)',
    action: 'WAYPOINT_TRANSIT',
  },
  {
    id: 'WP-02',
    name: 'Grande Island Reef Swath Leg 1',
    lat: 15.4989,
    lng: 73.8278,
    swathCoverageKm2: 42.5,
    eta: '+02h 15m',
    action: 'SONAR_SWEEP',
  },
  {
    id: 'WP-03',
    name: 'Snagged Net Recovery Target Site',
    lat: 15.441,
    lng: 73.782,
    swathCoverageKm2: 18.2,
    eta: '+04h 40m',
    action: 'NET_SALVAGE',
  },
  {
    id: 'WP-04',
    name: 'Aguada Shoals High-Res Swath',
    lat: 15.553,
    lng: 73.864,
    swathCoverageKm2: 38.0,
    eta: '+07h 10m',
    action: 'SONAR_SWEEP',
  },
  {
    id: 'WP-05',
    name: 'Baga Shelf Perimeter Deep Dive',
    lat: 15.568,
    lng: 73.742,
    swathCoverageKm2: 52.4,
    eta: '+10h 30m',
    action: 'ROV_DIVE',
  },
];

export default function RoutePlanningPage() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(MOCK_WAYPOINTS);
  const [selectedWp, setSelectedWp] = useState<Waypoint>(MOCK_WAYPOINTS[1]);
  const [lawnmowerSpacingNm, setLawnmowerSpacingNm] = useState<number>(1.2);
  const [driftAdjustment, setDriftAdjustment] = useState<boolean>(true);
  const [isComputing, setIsComputing] = useState(false);
  const [transmitted, setTransmitted] = useState(false);
  const [exported, setExported] = useState(false);

  const totalCoverage = waypoints.reduce((acc, wp) => acc + wp.swathCoverageKm2, 0);

  const handleRecalculate = () => {
    setIsComputing(true);
    setTimeout(() => setIsComputing(false), 800);
  };

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3000);
  };

  const handleExport = () => {
    setExported(true);
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GhostNet AI Planner">
${waypoints
  .map(
    (wp) =>
      `  <wpt lat="${wp.lat}" lon="${wp.lng}"><name>${wp.id}: ${wp.name}</name><cmt>${wp.action}</cmt></wpt>`
  )
  .join('\n')}
</gpx>`;
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghostnet-route-waypoints-${Date.now()}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Route className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Autonomous Route Planning & Swath Generator
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Lawnmower trajectory generation, drift-compensated vector waypoints, and fuel-optimized swath routing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-pill-filter"
          >
            {exported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exported GPX</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export GPX Waypoints</span>
              </>
            )}
          </button>

          <button
            onClick={handleRecalculate}
            disabled={isComputing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200/80"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isComputing ? 'animate-spin' : ''}`} />
            <span>Recalculate Path</span>
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Planned Swath</span>
            <Navigation className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalCoverage.toFixed(1)} <span className="text-xs font-normal text-slate-400">km²</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold font-mono">
            99.4% Overlap Guarantee
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Mission Duration</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            10.5 <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Cruise Speed: 8.5 kn
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Current Drift Offset</span>
            <Wind className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            +1.8 <span className="text-xs font-normal text-slate-400">kn @ 054°</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Eulerian Vector Active
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Projected Fuel Burn</span>
            <Fuel className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            142 <span className="text-xs font-normal text-slate-400">liters</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold font-mono">
            -22% vs standard survey
          </div>
        </div>
      </div>

      {/* ── Main Grid: Left Trajectory Canvas + Right Waypoint List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Visualizer (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Swath Trajectory Simulation
              </span>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-bold">
                AUTONOMOUS SIMULATION
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={driftAdjustment}
                  onChange={(e) => setDriftAdjustment(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span>Drift Compensation</span>
              </label>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative w-full h-[400px] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center select-none shadow-inner">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #64748B 1px, transparent 1px), linear-gradient(to bottom, #64748B 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />

            <svg className="absolute inset-0 w-full h-full">
              {/* Lawnmower Survey Swath Lines */}
              <path
                d="M100,120 L240,120 L240,160 L100,160 L100,200 L240,200 L240,240 L100,240"
                fill="none"
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-50"
              />

              {/* Waypoint Interconnect Line */}
              <path
                d="M120,320 L280,180 L460,110 L620,240 L700,310"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Sonar Swath Coverage Envelope */}
              <polygon
                points="110,330 270,170 450,100 630,230 710,300 690,320 610,250 470,120 290,190 130,310"
                fill="#38BDF8"
                fillOpacity="0.08"
              />

              {/* Waypoint Pins */}
              {waypoints.map((wp, i) => {
                const coords = [
                  { x: 120, y: 320 },
                  { x: 280, y: 180 },
                  { x: 460, y: 110 },
                  { x: 620, y: 240 },
                  { x: 700, y: 310 },
                ];
                const c = coords[i % coords.length];
                const isSelected = selectedWp.id === wp.id;

                return (
                  <g
                    key={wp.id}
                    onClick={() => setSelectedWp(wp)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? '#2563EB' : '#0F172A'}
                      stroke={isSelected ? '#93C5FD' : '#38BDF8'}
                      strokeWidth="2"
                    />
                    <text
                      x={c.x + 12}
                      y={c.y + 4}
                      fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {wp.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Lawnmower Track Spacing</span>
                <span className="font-mono text-slate-900 font-bold">{lawnmowerSpacingNm} NM</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={lawnmowerSpacingNm}
                onChange={(e) => setLawnmowerSpacingNm(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Over-the-ground track speed: <strong className="text-slate-800">4.5 knots</strong>
            </span>
          </div>
        </div>

        {/* Right Sidebar: Selected Waypoint Dossier (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-slate-400" />
                Waypoint Sequence
              </h2>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-mono font-bold">
                {waypoints.length} LEGS
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {waypoints.map((wp) => {
                const isSelected = selectedWp.id === wp.id;

                return (
                  <div
                    key={wp.id}
                    onClick={() => setSelectedWp(wp)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-900">{wp.id}</span>
                      <span className="text-[10px] font-mono text-slate-500">{wp.eta}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium truncate mt-0.5">{wp.name}</div>
                  </div>
                );
              })}
            </div>

            {/* Selected Waypoint Telemetry */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Leg Coordinates
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">LAT</span>
                  <span className="font-bold text-slate-900">{selectedWp.lat}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">LON</span>
                  <span className="font-bold text-slate-900">{selectedWp.lng}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SWATH AREA</span>
                  <span className="font-bold text-slate-900">{selectedWp.swathCoverageKm2} km²</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ACTION</span>
                  <span className="font-bold text-blue-600">{selectedWp.action}</span>
                </div>
              </div>
            </div>
          </div>

          {transmitted ? (
            <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Autopilot Mission Transmitted to Vessel</span>
            </div>
          ) : (
            <button
              onClick={handleTransmit}
              className="w-full btn-primary-dark text-xs justify-center"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transmit Autopilot Mission</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
