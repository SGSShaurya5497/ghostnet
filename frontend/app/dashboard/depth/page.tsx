'use client';

import React, { useState } from 'react';
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
  CheckCircle2,
} from 'lucide-react';

interface DepthLayer {
  id: string;
  name: string;
  depthRange: string;
  acousticReflectance: number;
  debrisCount: number;
  entanglementRisk: 'CRITICAL' | 'MODERATE' | 'LOW';
  color: string;
  enabled: boolean;
}

const INITIAL_LAYERS: DepthLayer[] = [
  {
    id: 'epipelagic',
    name: 'Epipelagic (Sunlight Zone)',
    depthRange: '0m – 200m',
    acousticReflectance: -18,
    debrisCount: 64,
    entanglementRisk: 'CRITICAL',
    color: '#0284c7',
    enabled: true,
  },
  {
    id: 'mesopelagic',
    name: 'Mesopelagic (Twilight Zone)',
    depthRange: '200m – 1,000m',
    acousticReflectance: -32,
    debrisCount: 29,
    entanglementRisk: 'MODERATE',
    color: '#0369a1',
    enabled: true,
  },
  {
    id: 'bathypelagic',
    name: 'Bathypelagic (Midnight Zone)',
    depthRange: '1,000m – 4,000m',
    acousticReflectance: -54,
    debrisCount: 12,
    entanglementRisk: 'LOW',
    color: '#075985',
    enabled: true,
  },
  {
    id: 'abyssopelagic',
    name: 'Abyssal Plain & Benthic Floor',
    depthRange: '4,000m – 6,000m+',
    acousticReflectance: -72,
    debrisCount: 4,
    entanglementRisk: 'LOW',
    color: '#0c4a6e',
    enabled: false,
  },
];

export default function DepthAnalysisPage() {
  const [layers, setLayers] = useState<DepthLayer[]>(INITIAL_LAYERS);
  const [selectedDepth, setSelectedDepth] = useState<number>(142);
  const [sonarGain, setSonarGain] = useState<number>(75);
  const [bathymetryResolution, setBathymetryResolution] = useState<'0.5m' | '1.0m' | '5.0m'>('0.5m');
  const [calibrated, setCalibrated] = useState(false);
  const [exported, setExported] = useState(false);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, enabled: !layer.enabled } : layer))
    );
  };

  const handleExport = () => {
    setExported(true);
    const content = `X,Y,Z,Backscatter_dB,Classification\n15.4989,73.8278,-118,-18.4,GHOST_NET\n15.5120,73.8340,-92,-24.1,ROPE_CLUSTER\n15.4410,73.7820,-142,-31.8,SEABED_DEBRIS`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bathymetry-pointcloud-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExported(false), 2500);
  };

  const handleCalibrate = () => {
    setCalibrated(true);
    setTimeout(() => setCalibrated(false), 3000);
  };

  const activeLayersCount = layers.filter((l) => l.enabled).length;
  const totalDebrisInActive = layers.filter((l) => l.enabled).reduce((sum, l) => sum + l.debrisCount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Depth & Subsea Bathymetry Analysis
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Multibeam acoustic backscatter, thermocline gradients, and subsea water column slicing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold">EM 304 Multibeam (30 kHz)</span>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary-dark text-xs"
          >
            {exported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exported Pointcloud</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Pointcloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Sounding Depth</span>
            <ArrowDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {selectedDepth} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold font-mono">
            Seabed Clearance: +68.4 m
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Thermocline Gradient</span>
            <Waves className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            84.2 <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Temp Gradient: -4.2°C / 100m
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Depth Targets</span>
            <Anchor className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalDebrisInActive} <span className="text-xs font-normal text-slate-400">hits</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            In {activeLayersCount} monitored layers
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Acoustic Swath Width</span>
            <Crosshair className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            640 <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Ping Rate: 12 Hz · 432 Beams
          </div>
        </div>
      </div>

      {/* ── Main Grid: Left Echogram + Right Strata Layers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Echogram Profile (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Backscatter Echogram Water Column
              </span>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-bold">
                LIVE SWATH
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">GAIN: {sonarGain}%</span>
            </div>
          </div>

          {/* Interactive Echogram Canvas */}
          <div className="relative w-full h-[380px] rounded-2xl bg-[#0c1524] border border-slate-700/60 overflow-hidden flex flex-col justify-between p-6 shadow-inner select-none">
            {/* Depth Markers Left Axis */}
            <div className="absolute left-3 top-4 bottom-4 flex flex-col justify-between text-[10px] font-mono text-slate-500 border-r border-slate-800 pr-2 pointer-events-none">
              <span>0m</span>
              <span>-50m</span>
              <span>-100m</span>
              <span>-150m</span>
              <span>-200m</span>
            </div>

            {/* Depth Slicing Plane Line */}
            <div
              className="absolute left-16 right-4 border-t-2 border-dashed border-sky-400 flex items-center justify-between text-[10px] font-mono text-sky-200 pointer-events-none z-10"
              style={{ top: `${(selectedDepth / 220) * 100}%` }}
            >
              <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-sky-500/50 shadow-md">
                Slice: {selectedDepth}m
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-sky-500/50 shadow-md">
                Water Column Lock
              </span>
            </div>

            {/* Subsea Topography */}
            <div className="w-full h-full ml-12 relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="seabedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0369A1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,280 Q150,220 300,290 T600,240 T800,320 L800,400 L0,400 Z"
                  fill="url(#seabedGrad)"
                  stroke="#38BDF8"
                  strokeWidth="2"
                />

                {/* Submerged Targets */}
                <g className="cursor-pointer">
                  <circle cx="280" cy="180" r="10" fill="#EF4444" fillOpacity="0.3" className="animate-ping" />
                  <circle cx="280" cy="180" r="5" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="296" y="184" fill="#F87171" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    GN-BATHY-84 (-118m)
                  </text>
                </g>

                <g className="cursor-pointer">
                  <circle cx="520" cy="140" r="8" fill="#F59E0B" fillOpacity="0.3" />
                  <circle cx="520" cy="140" r="4" fill="#F59E0B" stroke="#ffffff" strokeWidth="1" />
                  <text x="534" y="144" fill="#FCD34D" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    GN-BATHY-92 (-92m)
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Slicing Slider inside Canvas */}
            <div className="z-20 bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md">
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5 font-mono">
                <span>Interactive Sounding Slice Plane</span>
                <span className="text-sky-400 font-bold">{selectedDepth} meters</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={selectedDepth}
                onChange={(e) => setSelectedDepth(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sonar Tuning Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Acoustic Gain Sensitivity</span>
                <span className="font-mono text-slate-900 font-bold">{sonarGain}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sonarGain}
                onChange={(e) => setSonarGain(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Bathymetry Grid Resolution</label>
              <div className="flex gap-2">
                {(['0.5m', '1.0m', '5.0m'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setBathymetryResolution(res)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                      bathymetryResolution === res
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {res} Grid
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Depth Strata Layers (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Depth Strata Layers
              </h2>
              <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-mono font-bold">
                4 ZONES
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px]">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    layer.enabled
                      ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'
                      : 'bg-slate-50 border-slate-200/80 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{layer.name}</span>
                    <span
                      className={
                        layer.entanglementRisk === 'CRITICAL'
                          ? 'pill-badge-red text-[10px]'
                          : layer.entanglementRisk === 'MODERATE'
                          ? 'pill-badge-amber text-[10px]'
                          : 'pill-badge-green text-[10px]'
                      }
                    >
                      {layer.entanglementRisk}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">RANGE</span>
                      <span className="text-slate-700 font-semibold">{layer.depthRange}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">BACKSCATTER</span>
                      <span className="text-slate-700 font-semibold">{layer.acousticReflectance} dB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">DEBRIS COUNT</span>
                      <span className="text-slate-900 font-bold">{layer.debrisCount} targets</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">MONITOR STATE</span>
                      <span className={layer.enabled ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {layer.enabled ? 'ACTIVE' : 'MUTED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {calibrated ? (
            <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Transducer Acoustic Calibration Complete</span>
            </div>
          ) : (
            <button
              onClick={handleCalibrate}
              className="w-full btn-primary-dark text-xs justify-center"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calibrate Submersible Sonar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
