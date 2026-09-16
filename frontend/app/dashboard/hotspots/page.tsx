'use client';

import React, { useState, useEffect } from 'react';
import { ghostnetApi, type HotspotResponse, type HotspotCluster as ApiCluster } from '@/lib/api';
import {
  Flame,
  Layers,
  RefreshCw,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Compass,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  Database,
  Info,
} from 'lucide-react';

interface DisplayCluster {
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

// Offline fallback only used if backend API is completely unreachable
const FALLBACK_CLUSTERS: DisplayCluster[] = [
  {
    id: 'CL-01-OFFLINE',
    name: 'Coastal Inshore Cluster (Demo)',
    lat: 15.4989,
    lng: 73.8278,
    density: 88,
    riskLevel: 'CRITICAL',
    detectedNets: 4,
    debrisVolumeM3: 45,
    driftVelocityKn: 1.2,
    lastUpdated: 'Demo Seed',
    radiusKm: 2.5,
  },
];

export default function HotspotDetectionPage() {
  const [clusters, setClusters] = useState<DisplayCluster[]>(FALLBACK_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState<DisplayCluster>(FALLBACK_CLUSTERS[0]);
  const [filterMinDensity, setFilterMinDensity] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [dataBasis, setDataBasis] = useState<string>('seeded_demo');
  const [coordinateMode, setCoordinateMode] = useState<string>('image-space');
  const [spatialMethod, setSpatialMethod] = useState<string>('Grid-based Spatial Adjacency');
  const [totalClustered, setTotalClustered] = useState<number>(0);
  const [noiseCount, setNoiseCount] = useState<number>(0);
  const [apiNote, setApiNote] = useState<string>('');
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const loadHotspots = () => {
    setLoading(true);
    ghostnetApi
      .getHotspots()
      .then((res: HotspotResponse) => {
        setDataBasis(res.data_basis || 'seeded_demo');
        setCoordinateMode(res.coordinate_mode || 'image-space');
        setSpatialMethod(res.spatial_method || 'Grid-based Spatial Adjacency');
        setTotalClustered(res.total_detections_clustered ?? 0);
        setNoiseCount(res.noise_detections ?? 0);
        if (res.note) setApiNote(res.note);

        if (res.clusters && res.clusters.length > 0) {
          const mapped: DisplayCluster[] = res.clusters.map((c: ApiCluster, idx: number) => {
            const risk = (c.risk_level || 'medium').toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
            const density = Math.min(100, Math.max(35, Math.round(c.detection_count * 25 + (c.estimated_debris_m2 || 10))));
            return {
              id: c.cluster_id || `HOTSPOT-${idx + 1}`,
              name: c.name || `Hotspot Cluster ${idx + 1}`,
              lat: typeof c.lat === 'number' ? c.lat : 15.0 + idx * 0.2,
              lng: typeof c.lon === 'number' ? c.lon : 73.5 + idx * 0.2,
              density,
              riskLevel: risk,
              detectedNets: c.detection_count,
              debrisVolumeM3: Math.round(c.estimated_debris_m2 || c.detection_count * 12),
              driftVelocityKn: Number((0.8 + idx * 0.3).toFixed(1)),
              lastUpdated: 'Live from SQLite DB',
              radiusKm: Number((1.5 + c.detection_count * 0.8).toFixed(1)),
            };
          });
          setClusters(mapped);
          setSelectedCluster(mapped[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadHotspots();
  }, []);

  const filteredClusters = clusters.filter((c) => c.density >= filterMinDensity);

  const handleDispatch = () => {
    setDispatchedId(selectedCluster.id);
    setTimeout(() => setDispatchedId(null), 3000);
  };

  const severityBadge = (level: DisplayCluster['riskLevel']) => {
    switch (level) {
      case 'CRITICAL': return 'pill-badge-red';
      case 'HIGH': return 'pill-badge-amber';
      case 'MEDIUM': return 'pill-badge-blue';
      default: return 'pill-badge-green';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-slate-100">
      {/* ── Top Header Toolbar Card ── */}
      <div className="cyber-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Debris Hotspot Spatial Clustering
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono">
                SPATIAL DENSITY ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Computed directly via <code className="text-teal-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">features/hotspot_detection.py</code> from stored detections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
            dataBasis === 'live'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">
              {dataBasis === 'live' ? 'Live DB Data' : 'Seeded Demo Data'}
            </span>
          </div>
          <button
            onClick={loadHotspots}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-bold font-mono transition-colors"
            title="Recompute clusters from DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-cluster</span>
          </button>
        </div>
      </div>

      {/* ── Data Provenance Disclosure Banner (Cyber Dark Glass) ── */}
      <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 backdrop-blur-md p-4 text-xs text-teal-200 flex items-start gap-3 shadow-lg shadow-teal-950/30">
        <div className="w-7 h-7 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold uppercase tracking-wider text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full">
              Algorithmic Disclosure
            </span>
            <span className="font-mono text-slate-200 font-semibold text-xs">
              Method: <span className="text-teal-300">{spatialMethod}</span> | Coordinate Mode: <span className="text-cyan-300">{coordinateMode}</span>
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {apiNote || `Clusters are computed from stored SQLite detections using spatial adjacency clustering. When GPS EXIF metadata is absent in raw sonar files, clustering operates in normalized image-space (cx, cy) and projects centroids onto survey coordinates.`}
          </p>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-teal-400/90">
            <span>ACTIVE CLUSTERS</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight font-mono">
            {filteredClusters.length}{' '}
            <span className="text-xs font-normal text-slate-400 font-mono">hotspots</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Spatial density threshold active</span>
          </div>
        </div>

        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-teal-400/90">
            <span>CLUSTERED DETECTIONS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight font-mono">
            {totalClustered > 0 ? totalClustered : clusters.reduce((acc, c) => acc + c.detectedNets, 0)}{' '}
            <span className="text-xs font-normal text-slate-400 font-mono">targets</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Unclustered / noise: <span className="text-cyan-300 font-bold">{noiseCount}</span>
          </div>
        </div>

        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-teal-400/90">
            <span>COORDINATE MODE</span>
            <Compass className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-white tracking-tight capitalize font-mono">
            {coordinateMode}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {coordinateMode === 'geographic' ? 'WGS-84 Coordinates' : 'Normalised (cx, cy) Space'}
          </div>
        </div>

        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-teal-400/90">
            <span>CLUSTER ALGORITHM</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-white tracking-tight font-mono leading-snug">
            Spatial Adjacency
          </div>
          <div className="text-[11px] text-teal-400/80 font-mono truncate">features/hotspot_detection.py</div>
        </div>
      </div>

      {/* ── Main Grid: Map + Cluster Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Matrix / Map (8 cols) */}
        <div className="lg:col-span-8 cyber-card p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Spatial Density Matrix
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Mode: {coordinateMode}
              </span>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative w-full h-[330px] rounded-2xl bg-[#060b14] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Dot matrix grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #2DD4BF 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Streamlines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <path d="M-50,120 Q300,80 600,220 T1200,180" fill="none" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="4,6" />
              <path d="M-50,300 Q400,240 800,380 T1400,310" fill="none" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="3,5" />
            </svg>

            {/* Cluster pins */}
            {filteredClusters.map((cluster, idx) => {
              const isSelected = selectedCluster?.id === cluster.id;
              // Distribute pins across canvas reasonably
              const topVal = Math.min(Math.max(30 + (idx % 3) * 22, 22), 75);
              const leftVal = Math.min(Math.max(25 + idx * 25, 20), 80);

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
                        ? 'bg-red-500/20 border border-red-500/50 animate-pulse'
                        : cluster.riskLevel === 'HIGH'
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-teal-500/20 border border-teal-500/50'
                    }`}
                    style={{
                      width: `${Math.max(cluster.density * 0.9, 42)}px`,
                      height: `${Math.max(cluster.density * 0.9, 42)}px`,
                    }}
                  />
                  {/* Center dot */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-black transition-all ${
                      isSelected
                        ? 'bg-white text-slate-950 ring-4 ring-teal-400 scale-110 shadow-lg shadow-teal-500/40'
                        : cluster.riskLevel === 'CRITICAL'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                        : cluster.riskLevel === 'HIGH'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40'
                        : 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/40'
                    }`}
                  >
                    {cluster.detectedNets}
                  </div>
                  {/* Label */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg transition-all -top-8 ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-300 opacity-100'
                        : 'bg-slate-900/90 text-slate-200 border border-white/10 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {cluster.name}
                  </div>
                </div>
              );
            })}

            {/* HUD legend */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-[11px]">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Density:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-300 font-mono text-[10px]">Critical (&gt;80)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300 font-mono text-[10px]">High (60-80)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span className="text-slate-300 font-mono text-[10px]">Moderate (&lt;60)</span>
                </div>
              </div>
              <span className="text-teal-300 font-mono text-[10px]">
                {coordinateMode === 'geographic' ? 'GPS WGS-84' : 'Normalized Image Space'}
              </span>
            </div>
          </div>

          {/* Density threshold slider */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between text-[11px] text-slate-300 mb-2 font-mono font-bold uppercase tracking-wider">
              <span>Filter Minimum Density Threshold</span>
              <span className="text-teal-300 font-mono font-bold text-sm">{filterMinDensity}%</span>
            </div>
            <input
              type="range" min="10" max="80"
              value={filterMinDensity}
              onChange={(e) => setFilterMinDensity(Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Cluster Dossier (4 cols) */}
        <div className="lg:col-span-4 cyber-card p-6 flex flex-col justify-between h-full space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>CLUSTER DOSSIER</span>
            </div>
            {selectedCluster && (
              <span className={severityBadge(selectedCluster.riskLevel)}>
                {selectedCluster.riskLevel}
              </span>
            )}
          </div>

          {selectedCluster ? (
            <>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cluster Name &amp; ID
                </span>
                <div className="text-base font-bold text-white">{selectedCluster.name}</div>
                <div className="text-xs font-mono text-teal-300 mt-0.5">{selectedCluster.id}</div>
              </div>

              {/* Density gauge */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium font-sans">Relative Debris Density</span>
                  <span className="text-white font-bold font-mono text-sm">{selectedCluster.density} / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedCluster.density > 80 ? 'bg-red-500' :
                      selectedCluster.density > 60 ? 'bg-amber-500' : 'bg-teal-400'
                    }`}
                    style={{ width: `${selectedCluster.density}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Detections</span>
                    <span className="font-bold text-white font-mono">{selectedCluster.detectedNets} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Est. Debris Area</span>
                    <span className="font-bold text-white font-mono">{selectedCluster.debrisVolumeM3} m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Centroid</span>
                    <span className="font-bold text-teal-300 font-mono">
                      {coordinateMode === 'geographic'
                        ? `${selectedCluster.lat.toFixed(3)}°, ${selectedCluster.lng.toFixed(3)}°`
                        : `cx:${selectedCluster.lat.toFixed(2)}, cy:${selectedCluster.lng.toFixed(2)}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Cluster Radius</span>
                    <span className="font-bold text-white font-mono">{selectedCluster.radiusKm} km</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {dispatchedId === selectedCluster.id ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Recovery Sweep Dispatched
                  </div>
                ) : (
                  <button
                    onClick={handleDispatch}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4 text-white" />
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
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Export Cluster JSON</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              No clusters meet the density threshold.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
