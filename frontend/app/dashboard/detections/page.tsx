'use client';

import React, { useState } from 'react';
import {
  Target,
  Crosshair,
  MapPin,
  Clock,
  Layers,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface LiveTarget {
  id: string;
  label: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium';
  lat: number;
  lon: number;
  depth: number;
  area_m2: number;
  vessel: string;
  timestamp: string;
  status: 'Unassigned' | 'Mission Dispatched' | 'Cleared';
}

const INITIAL_TARGETS: LiveTarget[] = [
  {
    id: 'GNET-8821',
    label: 'Synthetic Gillnet Cluster',
    confidence: 0.94,
    severity: 'critical',
    lat: 15.4989,
    lon: 73.8278,
    depth: 42.5,
    area_m2: 18.4,
    vessel: 'RV-OCEANUS',
    timestamp: 'Just now',
    status: 'Mission Dispatched',
  },
  {
    id: 'GNET-8819',
    label: 'Abandoned Polypropylene Rope',
    confidence: 0.88,
    severity: 'high',
    lat: 15.512,
    lon: 73.834,
    depth: 38.0,
    area_m2: 8.2,
    vessel: 'AUV-NEPTUNE-02',
    timestamp: '4m ago',
    status: 'Unassigned',
  },
  {
    id: 'GNET-8815',
    label: 'Snagged Trawl Net on Reef',
    confidence: 0.91,
    severity: 'critical',
    lat: 15.441,
    lon: 73.782,
    depth: 54.2,
    area_m2: 26.5,
    vessel: 'RV-OCEANUS',
    timestamp: '12m ago',
    status: 'Mission Dispatched',
  },
  {
    id: 'GNET-8809',
    label: 'Submerged Crab Trap Cage',
    confidence: 0.79,
    severity: 'medium',
    lat: 15.534,
    lon: 73.856,
    depth: 29.8,
    area_m2: 4.1,
    vessel: 'AUV-NEPTUNE-01',
    timestamp: '28m ago',
    status: 'Cleared',
  },
  {
    id: 'GNET-8798',
    label: 'Heavy Monofilament Webbing',
    confidence: 0.85,
    severity: 'high',
    lat: 15.482,
    lon: 73.811,
    depth: 46.0,
    area_m2: 12.0,
    vessel: 'RV-OCEANUS',
    timestamp: '45m ago',
    status: 'Unassigned',
  },
];

const STATUS_CYCLE: LiveTarget['status'][] = ['Unassigned', 'Mission Dispatched', 'Cleared'];

export default function LiveDetectionsFeedPage() {
  const [targets, setTargets] = useState<LiveTarget[]>(INITIAL_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(INITIAL_TARGETS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const selectedTarget = targets.find((t) => t.id === selectedTargetId) ?? targets[0];

  const filteredTargets = targets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vessel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || t.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const cycleStatus = (id: string) => {
    setTargets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const currIdx = STATUS_CYCLE.indexOf(t.status);
        const nextIdx = (currIdx + 1) % STATUS_CYCLE.length;
        return { ...t, status: STATUS_CYCLE[nextIdx] };
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Live Acoustic Target Detections
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Real-time classified marine debris returns across surveyed corridors
            </span>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-2">
            <span className="text-slate-500">TOTAL MASS:</span>
            <span className="text-slate-900 font-bold">42.6 t</span>
          </div>
          <div className="pill-badge-red text-xs py-1 px-3">
            <span>2 Critical Snags Active</span>
          </div>
        </div>
      </div>

      {/* ── Main View: Target Feed + Inspector (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Searchable Target List (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 w-72 border border-slate-200/80">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search target ID, label, vessel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filterSeverity === s ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* List Cards */}
          <div className="space-y-3">
            {filteredTargets.map((target) => {
              const isSelected = target.id === selectedTargetId;

              return (
                <div
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-300 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        target.severity === 'critical'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : target.severity === 'high'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      <Crosshair className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">{target.id}</span>
                        <span className="text-xs font-semibold text-slate-700">{target.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>{target.vessel}</span>
                        <span>·</span>
                        <span>{target.depth}m Depth</span>
                        <span>·</span>
                        <span>{target.area_m2} m² Area</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">
                        {(target.confidence * 100).toFixed(0)}% Conf
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{target.timestamp}</span>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Target Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-black font-mono text-slate-900">{selectedTarget.id}</span>
                <span className="text-xs font-bold text-slate-700 block">{selectedTarget.label}</span>
              </div>
              <span
                className={
                  selectedTarget.severity === 'critical'
                    ? 'pill-badge-red'
                    : selectedTarget.severity === 'high'
                    ? 'pill-badge-amber'
                    : 'pill-badge-green'
                }
              >
                {selectedTarget.severity.toUpperCase()}
              </span>
            </div>

            {/* Geolocation Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Geolocation
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                  <span className="font-bold text-slate-900">{selectedTarget.lat}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                  <span className="font-bold text-slate-900">{selectedTarget.lon}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">DEPTH</span>
                  <span className="font-bold text-slate-900">{selectedTarget.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">FOOTPRINT</span>
                  <span className="font-bold text-slate-900">{selectedTarget.area_m2} m²</span>
                </div>
              </div>
            </div>

            {/* Mission Dispatch Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recovery Mission
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="pill-badge-blue">{selectedTarget.status}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Assigned Unit:</span>
                <span className="font-bold text-slate-900">{selectedTarget.vessel}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => cycleStatus(selectedTarget.id)}
            className={`w-full text-xs justify-center ${
              selectedTarget.status === 'Cleared'
                ? 'btn-pill-filter'
                : 'btn-primary-dark'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${
              selectedTarget.status === 'Cleared' ? 'text-emerald-600' : 'text-emerald-400'
            }`} />
            <span>{
              selectedTarget.status === 'Unassigned'
                ? 'Dispatch Cleanup Mission'
                : selectedTarget.status === 'Mission Dispatched'
                ? 'Mark as Cleared'
                : 'Reopen Mission'
            }</span>
          </button>
        </div>
      </div>
    </div>
  );
}
