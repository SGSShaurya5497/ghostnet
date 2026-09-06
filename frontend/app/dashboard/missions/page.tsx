'use client';

import Panel from '@/components/ui/Panel';

export default function MissionsPlaceholder() {
  return (
    <div className="w-full h-full bg-[#0a0f18] p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-wide">Missions / Survey Operations</h1>
      </div>
      <Panel className="flex-1 flex items-center justify-center rounded-xl">
        <div className="text-slate-500 font-mono tracking-widest uppercase">
          Awaiting Reference Screenshots
        </div>
      </Panel>
    </div>
  );
}
