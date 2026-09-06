import { SonarTarget } from '@/lib/mockData';
import Panel from '../ui/Panel';
import SeverityBadge from '../ui/SeverityBadge';

interface TargetDetailDrawerProps {
  target: SonarTarget | null;
  onClose: () => void;
}

export default function TargetDetailDrawer({ target, onClose }: TargetDetailDrawerProps) {
  if (!target) return null;

  return (
    <Panel className="w-[340px] h-full border-l border-white/10 absolute right-0 top-0 bg-[#060a12]/95 z-40 rounded-none shadow-2xl backdrop-blur-xl flex flex-col" noPadding>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#0a0f1a]/80">
        <div className="font-mono text-[10px] text-slate-400 font-bold tracking-widest uppercase flex items-center gap-2">
          <div className="w-1.5 h-4 bg-teal-500"></div>
          VESSEL DETAILS: {target.type.toUpperCase()}
        </div>
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-sm" title="Center on Target">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-sm" title="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        
        {/* Synthetic Thumbnail */}
        <div className="w-full h-40 bg-[#030508] border border-white/10 rounded overflow-hidden relative flex flex-col justify-end">
          <div className="absolute inset-0 opacity-30 mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Fake ship/net blob */}
            <div className="w-24 h-8 bg-white/60 blur-sm rounded-[100%] transform rotate-12"></div>
            <div className="w-24 h-8 bg-white/80 blur-[2px] rounded-[100%] transform rotate-12 absolute border border-teal-400"></div>
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          {/* Target Reticle overlay */}
          <div className="absolute inset-0 border border-teal-500/30 m-4 flex items-center justify-center pointer-events-none">
             <div className="w-4 h-[1px] bg-teal-500/50 absolute left-0"></div>
             <div className="w-4 h-[1px] bg-teal-500/50 absolute right-0"></div>
             <div className="w-[1px] h-4 bg-teal-500/50 absolute top-0"></div>
             <div className="w-[1px] h-4 bg-teal-500/50 absolute bottom-0"></div>
          </div>
          <div className="relative z-10 w-full p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center text-[8px] font-mono text-slate-300">
            <span>SATELLITE/SONAR FUSION</span>
            <span>CONF: {(target.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Section: Identification & Status */}
        <div className="flex flex-col gap-2">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between">
            <span>IDENTIFICATION & STATUS</span>
            <span className="text-[#2dd4bf]">---</span>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1.5 font-mono text-[9px]">
            <div className="text-slate-500">MMSI:</div>
            <div className="text-white text-right truncate" title={target.telemetry?.mmsi || 'N/A'}>{target.telemetry?.mmsi || 'N/A'}</div>
            <div className="text-slate-500">CALL SIGN:</div>
            <div className="text-white text-right">{target.code}</div>
            <div className="text-slate-500">STATUS:</div>
            <div className="text-right flex justify-end">
               <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${target.status === 'Critical' || target.status === 'High Risk' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-teal-500/20 text-teal-400 border border-teal-500/50'}`}>
                 {target.status.toUpperCase()}
               </span>
            </div>
            <div className="text-slate-500">DETECTION SOURCE:</div>
            <div className="text-white text-right truncate">{target.telemetry?.detectionSource || 'Sonar'}</div>
            <div className="text-slate-500">CONFIDENCE:</div>
            <div className="text-teal-400 text-right">{(target.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Section: Physical Characteristics */}
        <div className="flex flex-col gap-2">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between">
            <span>PHYSICAL CHARACTERISTICS</span>
            <span className="text-[#2dd4bf]">---</span>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1.5 font-mono text-[9px]">
            <div className="text-slate-500">EST. DIMENSIONS:</div>
            <div className="text-white text-right">{target.area}</div>
            <div className="text-slate-500">EST. GROSS WEIGHT:</div>
            <div className="text-white text-right">{target.telemetry?.estWeight || 'Unknown'}</div>
            <div className="text-slate-500">TARGET TYPE:</div>
            <div className="text-white text-right truncate">{target.type.toUpperCase()}</div>
          </div>
        </div>

        {/* Section: Movement & Timestamps */}
        <div className="flex flex-col gap-2">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between">
            <span>MOVEMENT & TIMESTAMPS</span>
            <span className="text-[#2dd4bf]">---</span>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1.5 font-mono text-[9px]">
            <div className="text-slate-500">LAST DETECTED:</div>
            <div className="text-white text-right truncate">{target.telemetry?.lastDetected || target.timestamp}</div>
            <div className="text-slate-500">FIRST DETECTED:</div>
            <div className="text-white text-right truncate">{target.telemetry?.firstDetected || target.timestamp}</div>
            <div className="text-slate-500">CURRENT SPEED:</div>
            <div className="text-white text-right">{target.telemetry?.currentSpeed || '0.0 kts'}</div>
            <div className="text-slate-500">HEADING (EST):</div>
            <div className="text-white text-right">{target.telemetry?.heading || 'N/A'}</div>
            <div className="text-slate-500">LAST KNOWN POS:</div>
            <div className="text-white text-right">{target.lat}, {target.lon}</div>
          </div>
        </div>

        {/* Section: Analysis Notes */}
        <div className="flex flex-col gap-2">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-1 flex justify-between">
            <span>ANALYSIS NOTES</span>
            <span className="text-[#2dd4bf]">---</span>
          </div>
          <div className="p-2 bg-white/5 border border-white/10 rounded-sm font-mono text-[9px] text-slate-300 leading-relaxed">
            {target.telemetry?.notes || 'No active analysis notes attached to this target.'}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-white/10 bg-[#0a0f1a]/80 flex flex-col gap-2 mt-auto">
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-mono text-[10px] font-bold tracking-widest uppercase transition-colors rounded-sm">
          GENERATE REPORT
        </button>
        <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors rounded-sm">
          FLAG FOR FURTHER REVIEW
        </button>
      </div>
    </Panel>
  );
}
