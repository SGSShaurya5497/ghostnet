'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Panel from '@/components/ui/Panel';
import { MOCK_FLEET, FleetVessel } from '@/lib/mockData';

export default function FleetDashboard() {
  const [selectedVesselId, setSelectedVesselId] = useState<string>(MOCK_FLEET[0].id);
  const selectedVessel = MOCK_FLEET.find(v => v.id === selectedVesselId) || MOCK_FLEET[0];

  return (
    <div className="w-full h-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl flex text-white overflow-hidden font-sans backdrop-blur-xl shadow-2xl">
      
      {/* Left Sidebar - Vessel List */}
      <div className="w-[280px] h-full bg-[#070e1c]/80 flex flex-col border-r border-cyan-950/80">
        <div className="p-3 border-b border-cyan-950/80 bg-[#091428]/80 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white hover:bg-cyan-900/80 text-xs font-mono transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <h2 className="text-xs font-bold flex items-center gap-2 text-slate-200">
            <span>Fleet ({MOCK_FLEET.length})</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {MOCK_FLEET.map(vessel => (
            <div 
              key={vessel.id}
              onClick={() => setSelectedVesselId(vessel.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border flex flex-col gap-2 ${selectedVesselId === vessel.id ? 'bg-[#1e293b]/60 border-slate-600' : 'bg-transparent border-transparent hover:bg-white/5'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-[11px] text-slate-200 tracking-wide">{vessel.name}</span>
                  <span className="text-[9px] text-slate-500">{vessel.type}</span>
                </div>
                <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${vessel.status === 'Underway' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-slate-700/50 text-slate-400'}`}>
                  {vessel.status === 'Underway' ? 'NAV' : 'MOO'}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${vessel.activity === 'Active' ? 'bg-[#10b981]' : 'bg-slate-500'}`}></span>
                <span className="text-slate-400">{vessel.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/5 flex gap-2">
           <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold rounded text-slate-300">Settings</button>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 h-full p-4 relative flex flex-col bg-gradient-to-br from-[#0e1628] to-[#040812]">
        
        {/* Main Floating Panel */}
        <div className="flex-1 rounded-2xl bg-[#11192b]/95 border border-white/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#141d33]">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-wider">{selectedVessel.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold tracking-wider border border-[#10b981]/30">
                {selectedVessel.type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>26 May 2023, 10:13:33 UTC</span>
              <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </div>

          {/* Top Dashboard Metrics */}
          <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1.2fr] gap-6 p-6 border-b border-white/5">
            
            {/* VOYAGE INFO */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-slate-500">VOYAGE INFO</span>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-xl font-bold">{selectedVessel.voyage.origin}</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">ETA {selectedVessel.voyage.originEta}</span>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#10b981] px-2 py-0.5 bg-[#10b981]/10 rounded mb-1">Active</span>
                  <div className="w-full h-1 bg-slate-700 rounded-full relative">
                    <div className="absolute top-0 left-0 h-full w-[80%] bg-[#10b981] rounded-full"></div>
                    <div className="absolute top-1/2 left-[80%] w-2 h-2 bg-white rounded-full transform -translate-y-1/2 shadow-[0_0_8px_#10b981]"></div>
                  </div>
                  <div className="w-full flex justify-between mt-2 text-[9px] font-mono text-slate-400">
                    <span>{selectedVessel.voyage.distanceTotal}</span>
                    <span>{selectedVessel.voyage.distanceRem}</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xl font-bold">{selectedVessel.voyage.destination}</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">ETA {selectedVessel.voyage.destinationEta}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white transform rotate-45"><path d="M12 2L4 20L12 17L20 20L12 2Z" fill="currentColor"/></svg>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">{selectedVessel.voyage.heading} <span className="text-xs text-slate-400 font-normal">HDG</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold">{selectedVessel.voyage.speedSog} <span className="text-xs text-slate-400 font-normal">SOG</span></div>
                </div>
                <div className="flex gap-4 ml-auto text-[9px] font-mono">
                  <div className="flex flex-col">
                    <span className="text-slate-500">SAFE SPEED</span>
                    <span className="text-slate-300">{selectedVessel.voyage.safeSpeed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">AVERAGE SPEED</span>
                    <span className="text-slate-300">{selectedVessel.voyage.avgSpeed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VESSEL INFO */}
            <div className="flex flex-col gap-3 border-l border-white/5 pl-6">
              <span className="text-[10px] font-bold tracking-widest text-slate-500">VESSEL INFO</span>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] font-mono mt-1">
                <div className="text-slate-500">IMO</div><div className="text-white text-right">{selectedVessel.vesselInfo.imo}</div>
                <div className="text-slate-500">MMSI</div><div className="text-white text-right">{selectedVessel.vesselInfo.mmsi}</div>
                <div className="text-slate-500">Call sign</div><div className="text-white text-right">{selectedVessel.vesselInfo.callSign}</div>
                <div className="text-slate-500">Flag</div><div className="text-white text-right">{selectedVessel.vesselInfo.flag}</div>
                <div className="text-slate-500">Length / Beam</div><div className="text-white text-right">{selectedVessel.vesselInfo.lengthBeam}</div>
              </div>
            </div>

            {/* SAFETY SCORE */}
            <div className="flex flex-col items-center gap-3 border-l border-white/5 pl-6">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 self-start">SAFETY SCORE</span>
              <div className="relative w-24 h-24 mt-2">
                {/* Circular Gauge Background */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                  {/* Circular Gauge Progress */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={selectedVessel.safetyScore.score > 80 ? '#10b981' : selectedVessel.safetyScore.score > 50 ? '#f59e0b' : '#ef4444'} 
                    strokeWidth="8" 
                    strokeDasharray={`${(selectedVessel.safetyScore.score / 100) * 283} 283`} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{selectedVessel.safetyScore.score}</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold mt-1 ${selectedVessel.safetyScore.score > 80 ? 'text-[#10b981]' : selectedVessel.safetyScore.score > 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                {selectedVessel.safetyScore.status}
              </span>
            </div>

            {/* RECENT VIOLATION */}
            <div className="flex flex-col gap-3 border-l border-white/5 pl-6">
              <span className="text-[10px] font-bold tracking-widest text-slate-500">RECENT VIOLATION</span>
              <div className="flex flex-col gap-2 mt-1 overflow-y-auto max-h-[140px] pr-2">
                {selectedVessel.violations.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic mt-2">No recent violations recorded.</div>
                ) : (
                  selectedVessel.violations.map(v => (
                    <div key={v.id} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <div className="flex flex-col">
                          <span className="text-slate-200">{v.type}</span>
                          <span className="text-slate-500 font-mono text-[8px]">{v.timestamp}</span>
                        </div>
                      </div>
                      {v.hasVideo && (
                        <button className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-slate-300 transition-colors">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          <span>Video</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Visualization (Map & Trajectory) */}
          <div className="flex-1 relative overflow-hidden bg-[#0a101d]">
            {/* Weather Overlay */}
            <div className="absolute top-4 right-4 z-20 bg-[#162032]/90 backdrop-blur border border-white/10 rounded-lg p-3 flex flex-col gap-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{selectedVessel.safetyScore.score}</span>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-200">30° 19°</span>
                  <span className="text-[10px] text-slate-400">HDG SOG</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-300 font-mono">
                <div className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
                  {selectedVessel.weather.temp}
                </div>
                <div className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                  {selectedVessel.weather.wind}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                   5% <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L12 22M12 2L17 7M12 2L7 7" stroke="currentColor" strokeWidth="2"/></svg>
                </div>
              </div>
            </div>

            {/* Simulated Tactical Map Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Fake grid / background */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              {/* Map Context Lines (Coastline/Channels simulation) */}
              <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <path d="M0,800 Q 400,600 600,800 T 1200,600" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5"/>
                <path d="M200,900 Q 500,700 800,900 T 1400,700" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5"/>
              </svg>

              {/* Waypoint History */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <polyline points="20%,80% 35%,65% 50%,50%" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"/>
                 <polyline points="50%,50% 65%,35% 80%,20%" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" opacity="0.4"/>
                 <line x1="50%" y1="50%" x2="60%" y2="40%" stroke="#10b981" strokeWidth="2" />
                 
                 {/* Waypoint Dots */}
                 <circle cx="20%" cy="80%" r="3" fill="#f59e0b" opacity="0.5"/>
                 <circle cx="35%" cy="65%" r="3" fill="#f59e0b" opacity="0.5"/>
                 <circle cx="65%" cy="35%" r="3" fill="#64748b" opacity="0.5"/>
                 <circle cx="80%" cy="20%" r="3" fill="#64748b" opacity="0.5"/>
              </svg>

              {/* Target Labels */}
              <div className="absolute text-[8px] font-mono text-slate-500" style={{ left: '66%', top: '34%' }}>WAYPOINT ALPHA</div>
              <div className="absolute text-[8px] font-mono text-slate-500" style={{ left: '36%', top: '66%' }}>WAYPOINT BRAVO</div>

              {/* Radar Circle */}
              <div className="absolute w-[400px] h-[400px] border border-white/10 rounded-full flex items-center justify-center bg-white/[0.02]">
                <div className="w-[300px] h-[300px] border border-white/5 rounded-full flex items-center justify-center">
                  <div className="w-[200px] h-[200px] border border-white/5 rounded-full"></div>
                </div>
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-white/5"></div>
                <div className="absolute h-full w-[1px] bg-white/5"></div>
              </div>

              {/* Vessel Icon in Center */}
              <div className="absolute z-10 flex flex-col items-center">
                <div className="relative">
                  {/* Heading Vector */}
                  <div className="absolute top-1/2 left-1/2 w-[150px] h-[1px] bg-gradient-to-r from-[#10b981] to-transparent transform origin-left -translate-y-1/2 -rotate-45"></div>
                  
                  {/* Actual Ship SVG */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="transform -rotate-45 text-[#f59e0b] drop-shadow-[0_0_10px_#f59e0b]">
                    <path d="M12 2L4 20L12 17L20 20L12 2Z" fill="currentColor" stroke="#fff" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Controls / Labels */}
            <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] font-mono text-slate-500 uppercase">
              <span>Deep Ocean AI Systems</span>
              <span>Map Render: Active</span>
            </div>
          </div>
        </div>

        {/* Floating Right Side Panels (Trips, Vessels) */}
        <div className="absolute top-6 right-[-240px] w-[280px] h-auto flex flex-col gap-4 transform transition-transform hover:translate-x-[-250px] group">
          <div className="bg-[#11192b]/90 border border-white/10 rounded-l-xl p-4 backdrop-blur shadow-2xl flex flex-col gap-3">
             <div className="flex gap-4 border-b border-white/10 pb-2 text-[10px] font-bold text-slate-400">
               <span className="text-white border-b-2 border-[#10b981] pb-2">Trips</span>
               <span>Vessels</span>
             </div>
             
             {/* Mini Trips List */}
             <div className="flex flex-col gap-2">
               <div className="bg-white/5 p-2 rounded border border-white/5 flex items-center justify-between">
                 <div className="flex flex-col text-[9px] font-mono text-slate-300">
                   <span className="text-white font-bold">LIVE: OKPO → MAS</span>
                   <span>Started: 22 May</span>
                 </div>
                 <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
               </div>
               <div className="bg-white/5 p-2 rounded border border-white/5 flex items-center justify-between opacity-60">
                 <div className="flex flex-col text-[9px] font-mono text-slate-300">
                   <span className="text-white font-bold">PAST: YTN → OKPO</span>
                   <span>Ended: 18 May</span>
                 </div>
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
               </div>
             </div>
             
             <div className="absolute left-[-16px] top-1/2 transform -translate-y-1/2 w-4 h-16 bg-[#11192b]/90 border-y border-l border-white/10 rounded-l flex items-center justify-center cursor-pointer">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
