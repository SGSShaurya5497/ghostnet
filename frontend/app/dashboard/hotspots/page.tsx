'use client';

import React, { useState } from 'react';
import {
  Flame,
  Layers,
  Filter,
  RefreshCw,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Compass,
  Sparkles,
  Maximize2,
  Download,
  Calendar,
  Waves,
  CheckCircle2,
} from 'lucide-react';

interface HotspotCluster {
  id: string;
  name: string;
  lat: number;
  lng: number;
  density: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectedNets: number;
  debrisVolumeM3: number;
  driftVelocityKn: number;
  lastUpdated: string;
  radiusKm: number;
}

const mockClusters: HotspotCluster[] = [
  {
    id: 'CL-01-PAC',
    name: 'Subtropical Gyre Vortex Alpha',
    lat: 34.821,
    lng: -142.189,
    density: 94,
    riskLevel: 'CRITICAL',
    detectedNets: 42,
    debrisVolumeM3: 3120,
    driftVelocityKn: 1.8,
    lastUpdated: '4 mins ago',
    radiusKm: 18.5,
  },
  {
    id: 'CL-02-KER',
    name: 'Kuroshio Extension Convergence',
    lat: 31.402,
    lng: 148.914,
    density: 88,
    riskLevel: 'CRITICAL',
    detectedNets: 36,
    debrisVolumeM3: 2540,
    driftVelocityKn: 2.4,
    lastUpdated: '12 mins ago',
    radiusKm: 14.2,
  },
  {
    id: 'CL-03-MED',
    name: 'Tyrrhenian Trench Eddies',
    lat: 39.118,
    lng: 13.452,
    density: 76,
    riskLevel: 'HIGH',
    detectedNets: 21,
    debrisVolumeM3: 1480,
    driftVelocityKn: 0.9,
    lastUpdated: '28 mins ago',
    radiusKm: 9.8,
  },
  {
    id: 'CL-04-IND',
    name: 'Seychelles Oceanic Ridge',
    lat: -4.679,
    lng: 55.492,
    density: 63,
    riskLevel: 'MEDIUM',
    detectedNets: 15,
    debrisVolumeM3: 940,
    driftVelocityKn: 1.1,
    lastUpdated: '1 hour ago',
    radiusKm: 7.4,
  },
  {
    id: 'CL-05-COR',
    name: 'Great Barrier Seaward Shelf',
    lat: -17.842,
    lng: 149.201,
    density: 41,
    riskLevel: 'LOW',
    detectedNets: 7,
    debrisVolumeM3: 410,
    driftVelocityKn: 0.6,
    lastUpdated: '3 hours ago',
    radiusKm: 5.1,
  },
];

export default function HotspotDetectionPage() {
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster>(mockClusters[0]);
  const [filterMinDensity, setFilterMinDensity] = useState<number>(50);
  const [algorithm, setAlgorithm] = useState<'DBSCAN' | 'K-MEANS' | 'HDBSCAN' | 'GAUSSIAN_KDE'>('HDBSCAN');
  const [heatKernel, setHeatKernel] = useState<number>(12);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const filteredClusters = mockClusters.filter((c) => c.density >= filterMinDensity);

  const handleDispatch = () => {
    setDispatchedId(selectedCluster.id);
    setTimeout(() => setDispatchedId(null), 3000);
  };

  const severityBadge = (level: HotspotCluster['riskLevel']) => {
    switch (level) {
      case 'CRITICAL': return 'pill-badge-red';
      case 'HIGH': return 'pill-badge-amber';
      case 'MEDIUM': return 'pill-badge-blue';
      default: return 'pill-badge-green';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Debris Hotspot Detection Engine
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Autonomous spatial density clustering — {algorithm} algorithm active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last 72h Window</span>
          </div>
          <button
            onClick={() => {
              setIsSimulating(true);
              setTimeout(() => setIsSimulating(false), 800);
            }}
            className="flex items-center gap-2 btn-pill-filter"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Re-cluster</span>
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>HOTSPOT CLUSTERS</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {filteredClusters.length}{' '}
            <span className="text-xs font-normal text-slate-400 font-mono">clusters</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+3 new convergence zones</span>
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>NET COUNT</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            121{' '}
            <span className="text-xs font-normal text-slate-400 font-mono">targets</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Volume: <span className="text-slate-700 font-bold">8,490 m³</span>
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>MEAN DRIFT</span>
            <Waves className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            1.72{' '}
            <span className="text-xs font-normal text-slate-400 font-mono">knots</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Vector: 042° True North</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>ALGORITHM</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight text-sm leading-tight">
            {algorithm}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">ε=4.8nm | MinSamples=4</div>
        </div>
      </div>

      {/* ── Main Grid: Map + Cluster Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heat Map (8 cols) */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Spatial Heat Matrix
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
                σ = {heatKernel}km
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative w-full h-[330px] rounded-2xl bg-[#0c1524] border border-slate-700/60 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Dot matrix grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #475569 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Bathymetry streamlines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <path d="M-50,120 Q300,80 600,220 T1200,180" fill="none" stroke="#475569"
                strokeWidth="1" strokeDasharray="4,6" />
              <path d="M-50,300 Q400,240 800,380 T1400,310" fill="none" stroke="#334155"
                strokeWidth="1" strokeDasharray="3,5" />
              <path d="M-50,480 Q350,420 700,520 T1300,490" fill="none" stroke="#334155"
                strokeWidth="1" strokeDasharray="3,5" />
            </svg>

            {/* Cluster pins */}
            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster.id === cluster.id;
              const topVal = Math.min(Math.max((45 - cluster.lat) * 2.2, 22), 75);
              const leftVal = Math.min(Math.max((cluster.lng + 180) / 3.6, 18), 82);
              const isNearTop = topVal < 32;

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className="absolute cursor-pointer transition-all duration-200 group z-20"
                  style={{ top: `${topVal}%`, left: `${leftVal}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Aura ring */}
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      cluster.riskLevel === 'CRITICAL'
                        ? 'bg-red-500/10 border border-red-500/30'
                        : cluster.riskLevel === 'HIGH'
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : 'bg-slate-500/10 border border-slate-500/30'
                    }`}
                    style={{
                      width: `${Math.max(cluster.density * 1.1, 46)}px`,
                      height: `${Math.max(cluster.density * 1.1, 46)}px`,
                    }}
                  />
                  {/* Center dot */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 ring-2 ring-white/30 scale-110 shadow-lg'
                        : cluster.riskLevel === 'CRITICAL'
                        ? 'bg-red-500 text-white'
                        : cluster.riskLevel === 'HIGH'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-500 text-white'
                    }`}
                  >
                    {cluster.detectedNets}
                  </div>
                  {/* Label - conditionally placed below pin if near top to avoid clipping */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold shadow-md transition-all ${
                      isNearTop ? 'top-8' : '-top-7'
                    } ${
                      isSelected
                        ? 'bg-white text-slate-900 ring-2 ring-blue-400 opacity-100'
                        : 'bg-slate-900/80 text-slate-300 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {cluster.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}

            {/* HUD legend */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl px-3.5 py-1.5 text-[11px]">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 font-medium">Density:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-400">Critical (&gt;85%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-400">High (70-85%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">Moderate (&lt;70%)</span>
                </div>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">WGS-84</span>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1.5 font-bold uppercase tracking-wider">
                Clustering Model
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-400 font-mono shadow-xs"
              >
                <option value="HDBSCAN">HDBSCAN (Hierarchical)</option>
                <option value="DBSCAN">DBSCAN (Spatial Epsilon)</option>
                <option value="GAUSSIAN_KDE">Gaussian KDE</option>
                <option value="K-MEANS">K-Means Centroids</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">
                <span>Min Density Threshold</span>
                <span className="text-slate-900 font-mono">{filterMinDensity}%</span>
              </div>
              <input
                type="range" min="20" max="90"
                value={filterMinDensity}
                onChange={(e) => setFilterMinDensity(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">
                <span>Heat Kernel Radius</span>
                <span className="text-slate-900 font-mono">{heatKernel} km</span>
              </div>
              <input
                type="range" min="5" max="30"
                value={heatKernel}
                onChange={(e) => setHeatKernel(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Cluster Dossier (4 cols) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>CLUSTER DOSSIER</span>
            </div>
            <span className={severityBadge(selectedCluster.riskLevel)}>
              {selectedCluster.riskLevel}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Identifier
            </span>
            <div className="text-sm font-bold text-slate-900">{selectedCluster.name}</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">{selectedCluster.id}</div>
          </div>

          {/* Density gauge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Entrapment Density</span>
              <span className="text-slate-900 font-bold font-mono">{selectedCluster.density} / 100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedCluster.density > 85 ? 'bg-red-500' :
                  selectedCluster.density > 70 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${selectedCluster.density}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Ghost Nets</span>
                <span className="font-bold text-slate-900 font-mono">{selectedCluster.detectedNets} units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Est. Volume</span>
                <span className="font-bold text-slate-900 font-mono">{selectedCluster.debrisVolumeM3.toLocaleString()} m³</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Drift Velocity</span>
                <span className="font-bold text-slate-900 font-mono">{selectedCluster.driftVelocityKn} kn</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Vortex Radius</span>
                <span className="font-bold text-slate-900 font-mono">{selectedCluster.radiusKm} km</span>
              </div>
            </div>
          </div>

          {/* GPS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Centroid GPS
            </span>
            <div className="flex justify-between text-slate-700">
              <span>Lat: {selectedCluster.lat}° N</span>
              <span>Lng: {Math.abs(selectedCluster.lng)}° {selectedCluster.lng < 0 ? 'W' : 'E'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Updated: {selectedCluster.lastUpdated}</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-auto">
            {dispatchedId === selectedCluster.id ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Recovery Sweep Dispatched
              </div>
            ) : (
              <button
                onClick={handleDispatch}
                className="w-full btn-primary-dark text-xs justify-center"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                <span>Dispatch Recovery Sweep</span>
              </button>
            )}
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(selectedCluster, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hotspot-${selectedCluster.id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full btn-pill-filter text-xs justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export GeoJSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
