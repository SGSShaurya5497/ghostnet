'use client';

import React, { useState } from 'react';
import {
  Map,
  Compass,
  Layers,
  Search,
  Filter,
  Download,
  Crosshair,
  ChevronDown,
  ArrowUpRight,
  ShieldAlert,
  Ship,
  Navigation,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
} from 'lucide-react';

interface ClusterPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  depth: number;
  targets: number;
  severity: 'critical' | 'high' | 'medium';
  area_m2: number;
}

const SURVEY_CLUSTERS: ClusterPin[] = [
  {
    id: 'CL-01',
    name: 'Grande Island Reef Snag Zone',
    lat: 15.4989,
    lon: 73.8278,
    depth: 42.5,
    targets: 8,
    severity: 'critical',
    area_m2: 340,
  },
  {
    id: 'CL-02',
    name: 'Mormugao Deep Shipping Channel',
    lat: 15.412,
    lon: 73.791,
    depth: 58.0,
    targets: 5,
    severity: 'high',
    area_m2: 190,
  },
  {
    id: 'CL-03',
    name: 'Aguada Shoal Trawl Clump',
    lat: 15.553,
    lon: 73.864,
    depth: 31.2,
    targets: 3,
    severity: 'medium',
    area_m2: 85,
  },
];

export default function HydrographicMapPage() {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(SURVEY_CLUSTERS[0].id);
  const [layerMode, setLayerMode] = useState<'bathymetry' | 'debris' | 'corridors'>('debris');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dispatchedClusterId, setDispatchedClusterId] = useState<string | null>(null);

  const selectedCluster = SURVEY_CLUSTERS.find((c) => c.id === selectedClusterId) ?? SURVEY_CLUSTERS[0];

  const handleRouteVessel = () => {
    setDispatchedClusterId(selectedClusterId);
    setTimeout(() => setDispatchedClusterId(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Map className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Hydrographic Survey & Geospatial Map
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Georeferenced acoustic debris clusters and bathymetric swath corridors
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {(['debris', 'bathymetry', 'corridors'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayerMode(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  layerMode === l ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {l} Layer
              </button>
            ))}
          </div>

          <button className="btn-pill-filter">
            <span>All Sectors</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── Main Map Viewport & Telemetry Sidebar (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
            <span>SECTOR: GOA CONTINENTAL SHELF (IN-WEST)</span>
            <span className="pill-badge-green text-[10px]">GPS FIX: 12 SATELLITES</span>
          </div>

          {/* Interactive Simulated Hydrographic Canvas */}
          <div className="h-[440px] w-full rounded-2xl bg-slate-950 relative overflow-hidden shadow-inner flex items-center justify-center select-none">
            {/* Bathymetry depth contours (vector curved lines) */}
            <svg viewBox="0 0 800 440" className="absolute inset-0 w-full h-full opacity-40">
              <path d="M 0 100 Q 200 150 400 120 T 800 180" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="6 4" />
              <path d="M 0 200 Q 250 240 500 210 T 800 290" fill="none" stroke="#0284C7" strokeWidth="2" />
              <path d="M 0 300 Q 300 320 600 280 T 800 380" fill="none" stroke="#0369A1" strokeWidth="2.5" />
              <text x="720" y="170" fill="#38BDF8" fontSize="11" fontFamily="monospace">-20m</text>
              <text x="720" y="280" fill="#38BDF8" fontSize="11" fontFamily="monospace">-40m</text>
              <text x="720" y="370" fill="#38BDF8" fontSize="11" fontFamily="monospace">-60m</text>
            </svg>

            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />

            {/* Survey Vessel Icon */}
            <div className="absolute top-1/3 left-1/4 flex flex-col items-center gap-1 z-20">
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg animate-pulse">
                <Ship className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-bold font-mono shadow-md">
                RV-OCEANUS (4.2 kt)
              </span>
            </div>

            {/* Debris Cluster Pins on Map */}
            {SURVEY_CLUSTERS.map((cluster, idx) => {
              const isSelected = cluster.id === selectedClusterId;
              const positions = [
                { top: '48%', left: '45%' },
                { top: '72%', left: '62%' },
                { top: '25%', left: '75%' },
              ];
              const pos = positions[idx] || { top: '50%', left: '50%' };

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  style={pos}
                  className="absolute cursor-pointer flex flex-col items-center gap-1 z-20 group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xl transition-transform group-hover:scale-110 ${
                      cluster.severity === 'critical'
                        ? 'bg-red-500 text-white ring-4 ring-red-500/30'
                        : cluster.severity === 'high'
                        ? 'bg-amber-500 text-white ring-4 ring-amber-500/30'
                        : 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                    }`}
                  >
                    {cluster.targets}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-md transition-all ${
                      isSelected ? 'bg-white text-slate-900 ring-2 ring-blue-500' : 'bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    {cluster.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}

            {/* Map HUD Overlay */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono border border-slate-700/50 flex items-center gap-3">
              <span>LAT: 15.4989° N</span>
              <span>·</span>
              <span>LON: 73.8278° E</span>
              <span>·</span>
              <span>DATUM: WGS-84</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Covered Swath Area: 14.8 km²</span>
            <span>Bathymetric Gradient: 1.4° Slope</span>
          </div>
        </div>

        {/* Right Telemetry & Cluster Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="light-saas-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                CLUSTER TELEMETRY
              </span>
              <span
                className={
                  selectedCluster.severity === 'critical'
                    ? 'pill-badge-red'
                    : selectedCluster.severity === 'high'
                    ? 'pill-badge-amber'
                    : 'pill-badge-green'
                }
              >
                {selectedCluster.severity.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">{selectedCluster.name}</h3>
              <span className="text-xs text-slate-400 font-mono">{selectedCluster.id} · {selectedCluster.targets} Target Returns</span>
            </div>

            {/* Cluster Stats Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                  <span className="font-bold text-slate-900">{selectedCluster.lat}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                  <span className="font-bold text-slate-900">{selectedCluster.lon}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">DEPTH</span>
                  <span className="font-bold text-slate-900">{selectedCluster.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">EST. DEBRIS AREA</span>
                  <span className="font-bold text-slate-900">{selectedCluster.area_m2} m²</span>
                </div>
              </div>
            </div>

            {/* Assigned Survey Fleet */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Survey Fleet
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Primary Vessel:</span>
                <span className="font-bold text-slate-900">RV-OCEANUS</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Support AUV:</span>
                <span className="font-bold text-slate-900">AUV-NEPTUNE-02</span>
              </div>
            </div>

            {dispatchedClusterId === selectedClusterId ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>RV-OCEANUS Routed to {selectedCluster.name.split(' ')[0]}</span>
              </div>
            ) : (
              <button
                onClick={handleRouteVessel}
                className="w-full btn-primary-dark text-xs justify-center"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Route Survey Vessel to Cluster</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
