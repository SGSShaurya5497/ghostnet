'use client';

import React, { useState, useEffect } from 'react';
import { ghostnetApi, type FleetUnit } from '@/lib/api';
import {
  Navigation,
  Ship,
  Radio,
  Activity,
  Battery,
  Compass,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const FALLBACK_FLEET: FleetUnit[] = [
  {
    id: 'VESSEL-01',
    name: 'RV-OCEANUS',
    type: 'Hydrographic Survey Vessel',
    status: 'Active Survey',
    lat: 15.4989,
    lon: 73.8278,
    heading: 184.2,
    speed_knots: 4.2,
    battery_pct: 98,
    depth_m: 42.5,
    swath_coverage_km2: 14.8,
    sonar_freq_khz: 455,
  },
  {
    id: 'AUV-02',
    name: 'AUV-NEPTUNE-02',
    type: 'Autonomous Underwater Vehicle',
    status: 'Acoustic Pinging',
    lat: 15.441,
    lon: 73.782,
    heading: 92.5,
    speed_knots: 2.8,
    battery_pct: 74,
    depth_m: 54.2,
    swath_coverage_km2: 6.4,
    sonar_freq_khz: 900,
  },
  {
    id: 'ROV-01',
    name: 'ROV-TRITON-X',
    type: 'Remotely Operated Recovery Unit',
    status: 'Standby on Deck',
    lat: 15.4989,
    lon: 73.8278,
    heading: 0.0,
    speed_knots: 0.0,
    battery_pct: 100,
    depth_m: 0.0,
    swath_coverage_km2: 0.0,
    sonar_freq_khz: 0,
  },
];

export default function FleetOperationsPage() {
  const [fleet, setFleet] = useState<FleetUnit[]>(FALLBACK_FLEET);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(FALLBACK_FLEET[0].id);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFleet = () => {
    setLoading(true);
    ghostnetApi
      .getFleet()
      .then((data) => {
        if (data && data.length > 0) setFleet(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const selectedUnit = fleet.find((u) => u.id === selectedUnitId) ?? fleet[0];

  const filteredFleet = fleet.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [pingedUnitId, setPingedUnitId] = useState<string | null>(null);

  const handlePing = () => {
    setPingedUnitId(selectedUnitId);
    setTimeout(() => setPingedUnitId(null), 3000);
  };

  const statusBadgeClass = (status: string) => {
    if (status.toLowerCase().includes('active') || status.toLowerCase().includes('survey')) return 'pill-badge-green';
    if (status.toLowerCase().includes('ping') || status.toLowerCase().includes('acoustic')) return 'pill-badge-blue';
    return 'pill-badge-neutral';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Survey Fleet & Autonomous Submersibles
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Real-time vessel positions, acoustic telemetry, and battery levels
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFleet}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="pill-badge-green text-xs py-1 px-3">
            <span>2 Units Underway</span>
          </div>
        </div>
      </div>

      {/* ── Main View: Fleet List + Unit Telemetry (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Unit List (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 w-72 border border-slate-200/80">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vessels & AUVs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
              />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredFleet.length} UNITS TRACKED
            </span>
          </div>

          <div className="space-y-3">
            {filteredFleet.map((unit) => {
              const isSelected = unit.id === selectedUnitId;

              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-300 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Ship className="w-5 h-5 text-white" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">{unit.id}</span>
                        <span className="text-xs font-bold text-slate-800">{unit.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>{unit.type}</span>
                        <span>·</span>
                        <span>{unit.speed_knots} kt Speed</span>
                        <span>·</span>
                        <span>{unit.depth_m}m Depth</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="space-y-0.5">
                        <span className={`${statusBadgeClass(unit.status)} text-[10px] block`}>{unit.status}</span>
                        <span className="text-[11px] text-slate-400 font-mono font-semibold">BAT: {unit.battery_pct}%</span>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Unit Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-black font-mono text-slate-900">{selectedUnit.id}</span>
                <span className="text-xs font-bold text-slate-700 block">{selectedUnit.name}</span>
              </div>
              <span className={`${statusBadgeClass(selectedUnit.status)} text-xs font-bold`}>
                {selectedUnit.status}
              </span>
            </div>

            {/* Vessel Telemetry Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Sensor Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                  <span className="font-bold text-slate-900">{selectedUnit.lat}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                  <span className="font-bold text-slate-900">{selectedUnit.lon}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">HEADING</span>
                  <span className="font-bold text-slate-900">{selectedUnit.heading}°</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SPEED OVER GROUND</span>
                  <span className="font-bold text-slate-900">{selectedUnit.speed_knots} kt</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">TRANSDUCER FREQ</span>
                  <span className="font-bold text-slate-900">{selectedUnit.sonar_freq_khz} kHz</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SWATH COVERAGE</span>
                  <span className="font-bold text-slate-900">{selectedUnit.swath_coverage_km2} km²</span>
                </div>
              </div>
            </div>

            {/* Battery & Power Gauge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-slate-700">
                <span>Battery & Power Reserve</span>
                <span className="font-bold text-slate-900 font-mono">{selectedUnit.battery_pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${selectedUnit.battery_pct}%` }}
                />
              </div>
            </div>
          </div>

          {pingedUnitId === selectedUnitId ? (
            <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Waypoint Transmitted to {selectedUnit.name}</span>
            </div>
          ) : (
            <button
              onClick={handlePing}
              className="w-full btn-primary-dark text-xs justify-center"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transmit Sonar Waypoint Command</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
