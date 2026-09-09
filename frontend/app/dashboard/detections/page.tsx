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

    // Call backend API to persist in server memory
    try {
      await ghostnetApi.createCleanupMission(missionPayload);
    } catch {
      // ignore
    }

    // Update target status in current list
    setTargets((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, status: 'Mission Dispatched' } : t))
    );

    router.push('/dashboard/cleanup');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans rounded-none">
      {/* ── Top Header Toolbar Card (0 Curves, Solid Ocean Theme) ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#075A73] flex items-center justify-center text-white shadow-none">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#0E232B]">
              Live Acoustic Target Detections
            </h1>
            <span className="text-xs text-[#526E78] font-medium">
              Real-time classified marine debris returns across surveyed corridors
            </span>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] text-xs font-semibold flex items-center gap-2">
            <span className="text-[#526E78]">TOTAL MASS:</span>
            <span className="text-[#0E232B] font-bold">42.6 t</span>
          </div>
          <div className="pill-badge-red text-xs py-1 px-2.5 rounded-none">
            <span>2 Critical Snags Active</span>
          </div>
        </div>
      </div>

      {/* ── Main View: Target Feed + Inspector (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-none">
        {/* Left: Searchable Target List (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 space-y-4 rounded-none">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B8C9CC]">
            <div className="flex items-center gap-2 bg-[#E5EDEE] rounded-none px-3 py-1.5 w-72 border border-[#B8C9CC]">
              <Search className="w-3.5 h-3.5 text-[#849EAA]" />
              <input
                type="text"
                placeholder="Search target ID, label, vessel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#0E232B] placeholder-[#849EAA] outline-none font-medium rounded-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-3 py-1.5 rounded-none text-xs font-bold capitalize transition-all ${
                    filterSeverity === s
                      ? 'bg-[#075A73] text-white shadow-none border border-[#075A73]'
                      : 'bg-[#E5EDEE] text-[#526E78] hover:bg-[#B8C9CC] border border-[#B8C9CC]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* List Cards */}
          <div className="space-y-2.5">
            {filteredTargets.map((target) => {
              const isSelected = target.id === selectedTargetId;

              return (
                <div
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`p-3.5 rounded-none cursor-pointer transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#E5EDEE] border-[#075A73] shadow-none'
                      : 'bg-white hover:bg-[#F2F6F7] border-[#B8C9CC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-none flex items-center justify-center font-bold text-xs ${
                        target.severity === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : target.severity === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-[#E5EDEE] text-[#075A73] border border-[#B8C9CC]'
                      }`}
                    >
                      <Crosshair className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[#0E232B]">{target.id}</span>
                        <span className="text-xs font-semibold text-[#2A434D]">{target.label}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-[#526E78] font-medium">
                        <span>{target.vessel}</span>
                        <span>·</span>
                        <span>{target.depth}m Depth</span>
                        <span>·</span>
                        <span>{target.area_m2} m² Area</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 text-right">
                    <div className="px-2 py-0.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] text-xs font-black text-[#0E232B]">
                      {(target.confidence * 100).toFixed(0)}% Conf
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#075A73]' : 'text-[#849EAA]'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Target Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-4 rounded-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#B8C9CC]">
              <div className="space-y-0.5">
                <span className="text-xs font-black font-mono text-[#0E232B]">{selectedTarget.id}</span>
                <span className="text-xs font-bold text-[#2A434D] block">{selectedTarget.label}</span>
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
            <div className="p-3.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-[#075A73] uppercase tracking-wider block">
                Target Geolocation
              </span>
              <div className="grid grid-cols-2 gap-2 text-[#2A434D]">
                <div>
                  <span className="text-[10px] text-[#526E78] block">LATITUDE</span>
                  <span className="font-bold text-[#0E232B]">{selectedTarget.lat.toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#526E78] block">LONGITUDE</span>
                  <span className="font-bold text-[#0E232B]">{selectedTarget.lon.toFixed(6)}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#526E78] block">DEPTH</span>
                  <span className="font-bold text-[#0E232B]">{selectedTarget.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#526E78] block">FOOTPRINT</span>
                  <span className="font-bold text-[#0E232B]">{selectedTarget.area_m2} m²</span>
                </div>
              </div>
            </div>

            {/* Mission Dispatch Status */}
            <div className="p-3.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] space-y-2 text-xs">
              <span className="text-[10px] font-bold text-[#075A73] uppercase tracking-wider block">
                Recovery Mission
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[#526E78] font-medium">Status:</span>
                <span className="pill-badge-ocean">{selectedTarget.status}</span>
              </div>
              <div className="flex justify-between text-[#2A434D]">
                <span>Assigned Unit:</span>
                <span className="font-bold text-[#0E232B]">{selectedTarget.vessel}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Status Cycle, See on Map & Add to Cleanup Mission */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => cycleStatus(selectedTarget.id)}
              className={`w-full text-xs justify-center rounded-none ${
                selectedTarget.status === 'Cleared'
                  ? 'btn-pill-filter'
                  : 'btn-primary-dark'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${
                selectedTarget.status === 'Cleared' ? 'text-emerald-700' : 'text-emerald-300'
              }`} />
              <span>{
                selectedTarget.status === 'Unassigned'
                  ? 'Dispatch Cleanup Mission'
                  : selectedTarget.status === 'Mission Dispatched'
                  ? 'Mark as Cleared'
                  : 'Reopen Mission'
              }</span>
            </button>

            {/* Direct See on Survey Map Action */}
            <button
              onClick={() => seeOnMap(selectedTarget)}
              className="w-full btn-primary justify-center text-xs rounded-none"
              title="Navigate to this target on the Survey Google Map"
            >
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>See on Survey Map</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white ml-0.5" />
            </button>

            {/* Add to Cleanup Missions Button */}
            <button
              onClick={() => dispatchToCleanupMission(selectedTarget)}
              className="w-full px-3.5 py-2 rounded-none bg-[#075A73] hover:bg-[#054356] text-white text-xs font-bold shadow-none transition-all flex items-center justify-center gap-1.5 border border-[#075A73]"
              title="Add this location to Cleanup Missions board"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add to Cleanup Missions</span>
              <ArrowRight className="w-3.5 h-3.5 text-white ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
