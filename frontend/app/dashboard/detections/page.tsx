'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Map,
  Plus,
  ArrowRight,
  Zap,
} from 'lucide-react';

import { ghostnetApi } from '@/lib/api';

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
  status: 'Unassigned' | 'Mission Dispatched' | 'Cleared';
}

const INITIAL_TARGETS: LiveTarget[] = [
  {
    id: 'GNET-8821',
    label: 'Synthetic Gillnet Cluster',
    confidence: 0.94,
    severity: 'critical',
    lat: 11.560889,
    lon: 79.800671,
    depth: 42.5,
    area_m2: 18.4,
    vessel: 'RV-OCEANUS',
    status: 'Mission Dispatched',
  },
  {
    id: 'GNET-8819',
    label: 'Abandoned Polypropylene Rope',
    confidence: 0.88,
    severity: 'high',
    lat: 11.856251,
    lon: 79.880480,
    depth: 38.0,
    area_m2: 8.2,
    vessel: 'AUV-NEPTUNE-02',
    status: 'Unassigned',
  },
  {
    id: 'GNET-8815',
    label: 'Snagged Trawl Net on Reef',
    confidence: 0.91,
    severity: 'critical',
    lat: 13.325614,
    lon: 80.410923,
    depth: 54.2,
    area_m2: 26.5,
    vessel: 'RV-OCEANUS',
    status: 'Mission Dispatched',
  },
  {
    id: 'GNET-8809',
    label: 'Submerged Crab Trap Cage',
    confidence: 0.79,
    severity: 'medium',
    lat: 17.633693,
    lon: 83.328583,
    depth: 29.8,
    area_m2: 4.1,
    vessel: 'AUV-NEPTUNE-01',
    status: 'Cleared',
  },
  {
    id: 'GNET-8798',
    label: 'Heavy Monofilament Webbing',
    confidence: 0.85,
    severity: 'high',
    lat: 20.835254,
    lon: 87.057524,
    depth: 46.0,
    area_m2: 12.0,
    vessel: 'RV-OCEANUS',
    status: 'Unassigned',
  },
];

const STATUS_CYCLE: LiveTarget['status'][] = ['Unassigned', 'Mission Dispatched', 'Cleared'];

export default function LiveDetectionsFeedPage() {
  const router = useRouter();
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

  const seeOnMap = (target: LiveTarget) => {
    try {
      sessionStorage.setItem('ghostnet_focus_target', target.id);
    } catch {
      // ignore
    }
    router.push(`/dashboard/map?targetId=${target.id}`);
  };

  const dispatchToCleanupMission = async (target: LiveTarget) => {
    const missionPayload = {
      mission_id: `MSN-${target.id.replace('GNET-', '')}`,
      target_id: target.id,
      target_label: target.label,
      stage: 'Dispatched',
      assigned_vessel: target.vessel,
      priority: target.severity === 'critical' ? 'Critical' : target.severity === 'high' ? 'High' : 'Medium',
      est_mass_kg: Math.round(target.area_m2 * 18.5),
      lat: target.lat,
      lon: target.lon,
    };

    try {
      sessionStorage.setItem('ghostnet_dispatched_mission', JSON.stringify(missionPayload));
      localStorage.setItem('ghostnet_latest_mission', JSON.stringify(missionPayload));
    } catch {
      // ignore
    }

    try {
      await ghostnetApi.createCleanupMission(missionPayload);
    } catch {
      // ignore
    }

    setTargets((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, status: 'Mission Dispatched' } : t))
    );

    router.push('/dashboard/cleanup');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-gray-100">
      {/* ── Top Header Toolbar Card ── */}
      <div className="cyber-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-[#2DD4BF]/30">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Live Acoustic Target Feed
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40">
                REALTIME DETECTIONS
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Classified YOLOv8 debris acoustic signatures across Indian EEZ corridors
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold flex items-center gap-2">
            <span className="text-gray-400">TOTAL MASS:</span>
            <span className="text-[#2DD4BF] font-bold font-mono">42.6 t</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>2 Critical Snags Active</span>
          </div>
        </div>
      </div>

      {/* ── Main View: Target Feed + Inspector (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Searchable Target List (8 cols on lg) */}
        <div className="lg:col-span-8 cyber-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3.5 py-2 w-72 border border-white/10 focus-within:border-[#2DD4BF]/50 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search target ID, label, vessel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                    filterSeverity === s
                      ? 'bg-[#2DD4BF] text-white shadow-lg shadow-[#2DD4BF]/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
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
                  className={`cyber-card-interactive p-4 cursor-pointer flex items-center justify-between transition-all duration-300 ${
                    isSelected
                      ? 'border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/20 bg-white/10'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        target.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : target.severity === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                      }`}
                    >
                      <Crosshair className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[#2DD4BF]">{target.id}</span>
                        <span className="text-sm font-bold text-white">{target.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                        <span>{target.vessel}</span>
                        <span>·</span>
                        <span className="text-gray-300">{target.depth}m Depth</span>
                        <span>·</span>
                        <span className="text-gray-300">{target.area_m2} m² Area</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-[#2DD4BF] font-mono">
                      {(target.confidence * 100).toFixed(0)}% Conf
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#2DD4BF] translate-x-1' : 'text-gray-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Target Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 cyber-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-xs font-black font-mono text-[#2DD4BF]">{selectedTarget.id}</span>
                <span className="text-base font-bold text-white block">{selectedTarget.label}</span>
              </div>
              <span
                className={
                  selectedTarget.severity === 'critical'
                    ? 'px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedTarget.severity === 'high'
                    ? 'px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }
              >
                {selectedTarget.severity.toUpperCase()}
              </span>
            </div>

            {/* Geolocation Card */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs font-mono">
              <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider block border-b border-white/10 pb-1.5">
                Target Geolocation
              </span>
              <div className="grid grid-cols-2 gap-3 text-gray-300">
                <div>
                  <span className="text-[10px] text-gray-500 block">LATITUDE</span>
                  <span className="font-bold text-white">{selectedTarget.lat.toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">LONGITUDE</span>
                  <span className="font-bold text-white">{selectedTarget.lon.toFixed(6)}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">DEPTH</span>
                  <span className="font-bold text-white">{selectedTarget.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">FOOTPRINT</span>
                  <span className="font-bold text-white">{selectedTarget.area_m2} m²</span>
                </div>
              </div>
            </div>

            {/* Mission Dispatch Status */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider block border-b border-white/10 pb-1.5">
                Recovery Mission
              </span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-400 font-medium">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 font-bold text-[11px]">
                  {selectedTarget.status}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Assigned Unit:</span>
                <span className="font-bold text-white">{selectedTarget.vessel}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => cycleStatus(selectedTarget.id)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{
                selectedTarget.status === 'Unassigned'
                  ? 'Dispatch Cleanup Mission'
                  : selectedTarget.status === 'Mission Dispatched'
                  ? 'Mark as Cleared'
                  : 'Reopen Mission'
              }</span>
            </button>

            <button
              onClick={() => seeOnMap(selectedTarget)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#2DD4BF]/20 text-gray-200 hover:text-white font-bold text-xs border border-white/10 hover:border-[#2DD4BF]/40 transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#2DD4BF]" />
              <span>See on GIS Map</span>
              <ArrowUpRight className="w-4 h-4 text-[#2DD4BF]" />
            </button>

            <button
              onClick={() => dispatchToCleanupMission(selectedTarget)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#2DD4BF] text-white font-bold text-xs shadow-lg shadow-[#2DD4BF]/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add to Cleanup Missions</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

