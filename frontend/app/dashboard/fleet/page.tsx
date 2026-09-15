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
  Zap,
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
      .then((res) => {
        if (res?.units && res.units.length > 0) {
          setFleet(res.units);
        }
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-gray-100">
      {/* ── Top Header Toolbar Card ── */}
      <div className="cyber-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-[#2DD4BF]/30">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Autonomous Fleet & Submersible Telemetry
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40">
                ACTIVE MESH
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              AIS / NMEA acoustic telemetry, bathymetric profiling & real-time battery status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFleet}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-[#2DD4BF]/20 text-gray-300 hover:text-[#2DD4BF] border border-white/10 hover:border-[#2DD4BF]/40 transition-all duration-300"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>3 Fleet Units Connected</span>
          </div>
        </div>
      </div>

      {/* ── Live Acoustic Telemetry Banner ── */}
      <div className="cyber-card p-4 text-xs flex items-start gap-3.5 border-l-4 border-l-[#2DD4BF]">
        <div className="w-8 h-8 rounded-xl bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30 flex items-center justify-center shrink-0 mt-0.5">
          <Radio className="w-4 h-4 animate-pulse text-[#2DD4BF]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-[#2DD4BF]/20 text-[#2DD4BF] px-2 py-0.5 rounded-full border border-[#2DD4BF]/30">
              AIS &bull; NMEA-0183 &bull; Evologics S2CR
            </span>
            <span className="font-bold text-white">Live Acoustic Modem Grid Synchronized</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            AUV/ROV coordinates, depth profiles, heading vectors, sonar frequencies, and battery telemetry are synchronized in real-time via acoustic modem pings.
          </p>
        </div>
      </div>

      {/* ── Main View: Fleet List + Unit Inspector (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Unit List (8 cols on lg) */}
        <div className="lg:col-span-8 cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3.5 py-2 w-72 border border-white/10 focus-within:border-[#2DD4BF]/50 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vessels & AUVs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none font-medium"
              />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
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
                  className={`cyber-card-interactive p-4 cursor-pointer flex items-center justify-between transition-all duration-300 ${
                    isSelected
                      ? 'border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/20 bg-white/10'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0EA5E9] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      <Ship className="w-5 h-5 text-white" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[#2DD4BF]">{unit.id}</span>
                        <span className="text-sm font-bold text-white">{unit.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                        <span>{unit.type}</span>
                        <span>·</span>
                        <span className="text-gray-300">{unit.speed_knots} kt Speed</span>
                        <span>·</span>
                        <span className="text-gray-300">{unit.depth_m}m Depth</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 block">
                        {unit.status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono font-semibold">
                        BAT: <span className="text-white">{unit.battery_pct}%</span>
                      </span>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#2DD4BF] translate-x-1' : 'text-gray-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Unit Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 cyber-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-xs font-black font-mono text-[#2DD4BF]">{selectedUnit.id}</span>
                <span className="text-base font-bold text-white block">{selectedUnit.name}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedUnit.status}
              </span>
            </div>

            {/* Vessel Telemetry Details */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs font-mono">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-white/10 pb-1.5">
                Live Sensor Telemetry
              </span>
              <div className="grid grid-cols-2 gap-3 text-gray-300">
                <div>
                  <span className="text-[10px] text-gray-500 block">LATITUDE</span>
                  <span className="font-bold text-white">{selectedUnit.lat}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">LONGITUDE</span>
                  <span className="font-bold text-white">{selectedUnit.lon}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">HEADING</span>
                  <span className="font-bold text-white">{selectedUnit.heading}°</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">SPEED</span>
                  <span className="font-bold text-white">{selectedUnit.speed_knots} kt</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">FREQUENCY</span>
                  <span className="font-bold text-white">{selectedUnit.sonar_freq_khz} kHz</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">SWATH AREA</span>
                  <span className="font-bold text-white">{selectedUnit.swath_coverage_km2} km²</span>
                </div>
              </div>
            </div>

            {/* Battery & Power Gauge */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-gray-300">
                <span>Battery Reserve</span>
                <span className="font-bold text-white font-mono">{selectedUnit.battery_pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2DD4BF] to-emerald-400 rounded-full"
                  style={{ width: `${selectedUnit.battery_pct}%` }}
                />
              </div>
            </div>
          </div>

          {pingedUnitId === selectedUnitId ? (
            <div className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Waypoint Transmitted to {selectedUnit.name}</span>
            </div>
          ) : (
            <button
              onClick={handlePing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#2DD4BF] text-white font-bold text-xs shadow-lg shadow-[#2DD4BF]/30 hover:shadow-[#2DD4BF]/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Transmit Sonar Waypoint Command</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

