'use client';

import { useState } from 'react';
import Panel from '@/components/ui/Panel';
import MapContainer from '@/components/ui/MapContainer';
import TargetDetailDrawer from '@/components/dashboard/TargetDetailDrawer';
import SeverityBadge from '@/components/ui/SeverityBadge';
import { MOCK_TARGETS } from '@/lib/mockData';

export default function DetectionCenter() {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(MOCK_TARGETS[0].id);

  const selectedTarget = MOCK_TARGETS.find(t => t.id === selectedTargetId) || null;

  return (
    <div className="w-full h-full relative flex">
      {/* Background Map - Heatmap Style (Screenshot 4 Reference) */}
      <div className="absolute inset-0 z-0 bg-[#0d1017]">
         <MapContainer showGrid={false} className="opacity-60">
            {/* Fake Heatmap Overlay */}
            <div className="absolute top-1/4 left-1/4 w-[40%] h-[50%] bg-orange-600/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute top-1/3 left-1/2 w-[30%] h-[40%] bg-red-600/20 blur-[100px] rounded-full pointer-events-none"></div>
         </MapContainer>
      </div>

      {/* Floating Top Left KPI (Threat Tonnage style) */}
      <Panel className="absolute top-6 left-6 w-64 z-10 bg-[#0a0f18]/80 backdrop-blur-md border border-red-500/20 rounded-md" noPadding>
         <div className="p-3 border-b border-red-500/10">
           <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Total Detection Mass</h3>
         </div>
         <div className="p-4 flex items-end gap-3">
           <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
           </div>
           <div className="flex flex-col">
             <span className="text-3xl font-bold text-white">41.7 t</span>
             <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Estimated Debris</span>
           </div>
         </div>
      </Panel>

      {/* Floating Bottom Left Chart */}
      <Panel className="absolute bottom-6 left-6 w-[320px] h-48 z-10 bg-[#0a0f18]/80 backdrop-blur-md rounded-md" noPadding>
         <div className="p-4 flex flex-col h-full">
            <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-2">Detection Trend</h3>
            <div className="flex-1 relative flex items-end w-full border-b border-l border-white/10 pb-1 pl-1">
               {/* Fake Area Chart */}
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0 100 L0 80 Q20 40 40 70 T70 30 T100 50 L100 100 Z" fill="rgba(239,68,68,0.2)" />
                  <path d="M0 80 Q20 40 40 70 T70 30 T100 50" fill="none" stroke="#ef4444" strokeWidth="2" />
               </svg>
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
               <span>00:00</span>
               <span>06:00</span>
               <span>12:00</span>
               <span>18:00</span>
            </div>
         </div>
      </Panel>

      {/* Target Detail Drawer OR Dense Target List depending on selection */}
      <div className="absolute right-0 top-0 h-full flex z-40">
        
        {/* Dense Threat List (Screenshot 4 Reference) */}
        <Panel className="w-72 h-full bg-[#0d141e]/95 border-l border-white/5 rounded-none shadow-2xl transition-transform" noPadding>
          <div className="p-4 border-b border-white/5 bg-[#121b29]">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase flex items-center justify-between">
              Active Detections
              <span className="text-[9px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">{MOCK_TARGETS.length} Total</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_TARGETS.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTargetId(t.id)}
                className={`p-3 flex items-start gap-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedTargetId === t.id ? 'bg-white/5 border-l-2 border-l-teal-500' : 'border-l-2 border-l-transparent'}`}
              >
                <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 mt-0.5 ${t.status === 'Critical' ? 'bg-red-500/10 border-red-500/30' : t.status === 'Moderate' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-teal-500/10 border-teal-500/30'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.status === 'Critical' ? '#ef4444' : t.status === 'Moderate' ? '#f97316' : '#2dd4bf'} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-slate-200">{t.type}</span>
                    <span className="text-[9px] font-mono text-slate-500">{t.timestamp.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">{t.code}</span>
                    <span className={t.status === 'Critical' ? 'text-red-400' : t.status === 'Moderate' ? 'text-orange-400' : 'text-teal-400'}>{(t.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">
                    {t.lat} / {t.lon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* The Detail Drawer expanding from the list */}
        {selectedTargetId && (
          <div className="w-80 h-full relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
             <TargetDetailDrawer 
                target={selectedTarget} 
                onClose={() => setSelectedTargetId(null)} 
             />
          </div>
        )}
      </div>

    </div>
  );
}
