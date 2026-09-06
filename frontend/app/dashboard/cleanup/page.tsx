'use client';

import React, { useState, useEffect } from 'react';
import { ghostnetApi, type CleanupMission } from '@/lib/api';
import {
  CheckCircle2,
  Clock,
  Navigation,
  Ship,
  Sparkles,
  Download,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  Layers,
} from 'lucide-react';

const INITIAL_MISSIONS: CleanupMission[] = [
  {
    mission_id: 'MSN-2041',
    target_id: 'GNET-8821',
    target_label: 'Synthetic Gillnet Cluster',
    stage: 'Dispatched',
    assigned_vessel: 'RV-OCEANUS',
    priority: 'Critical',
    est_mass_kg: 340,
    lat: 15.4989,
    lon: 73.8278,
  },
  {
    mission_id: 'MSN-2039',
    target_id: 'GNET-8815',
    target_label: 'Snagged Trawl Net on Reef',
    stage: 'In Recovery',
    assigned_vessel: 'ROV-TRITON-X',
    priority: 'Critical',
    est_mass_kg: 620,
    lat: 15.441,
    lon: 73.782,
  },
  {
    mission_id: 'MSN-2035',
    target_id: 'GNET-8819',
    target_label: 'Abandoned Polypropylene Line',
    stage: 'Identified',
    assigned_vessel: 'AUV-NEPTUNE-02',
    priority: 'High',
    est_mass_kg: 180,
    lat: 15.512,
    lon: 73.834,
  },
  {
    mission_id: 'MSN-2028',
    target_id: 'GNET-8809',
    target_label: 'Submerged Crab Trap Cage',
    stage: 'Cleared',
    assigned_vessel: 'RV-OCEANUS',
    priority: 'Medium',
    est_mass_kg: 95,
    lat: 15.534,
    lon: 73.856,
  },
];

const STAGES = ['Identified', 'Dispatched', 'In Recovery', 'Cleared'] as const;

export default function CleanupMissionsPage() {
  const [missions, setMissions] = useState<CleanupMission[]>(INITIAL_MISSIONS);
  const [loading, setLoading] = useState(false);

  const loadMissions = () => {
    setLoading(true);
    ghostnetApi
      .getCleanupMissions()
      .then((data) => {
        if (data && data.length > 0) setMissions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const moveMission = (missionId: string, direction: 'next' | 'prev') => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.mission_id !== missionId) return m;
        const currIdx = STAGES.indexOf(m.stage as any);
        if (direction === 'next' && currIdx < STAGES.length - 1) {
          return { ...m, stage: STAGES[currIdx + 1] };
        }
        if (direction === 'prev' && currIdx > 0) {
          return { ...m, stage: STAGES[currIdx - 1] };
        }
        return m;
      })
    );
  };

  const totalMass = missions.reduce((acc, m) => acc + m.est_mass_kg, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Marine Debris Cleanup & Salvage Operations
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Autonomous task dispatching and recovery workflow pipeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-2">
            <span className="text-slate-500">TARGET MASS:</span>
            <span className="text-slate-900 font-bold font-mono">{(totalMass / 1000).toFixed(2)} t</span>
          </div>
          <button
            onClick={loadMissions}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Kanban Board Stages (Grid of 4 Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAGES.map((stage) => {
          const stageMissions = missions.filter((m) => m.stage === stage);

          return (
            <div key={stage} className="light-saas-card p-5 flex flex-col justify-between min-h-[500px] space-y-4">
              <div className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {stage}
                    </span>
                    <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-bold">
                      {stageMissions.length}
                    </span>
                  </div>
                </div>

                {/* Mission Cards inside Stage */}
                <div className="space-y-3">
                  {stageMissions.map((m) => (
                    <div
                      key={m.mission_id}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-slate-900">{m.mission_id}</span>
                        <span
                          className={
                            m.priority === 'Critical'
                              ? 'pill-badge-red text-[10px]'
                              : m.priority === 'High'
                              ? 'pill-badge-amber text-[10px]'
                              : 'pill-badge-green text-[10px]'
                          }
                        >
                          {m.priority}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">{m.target_label}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                          <span>{m.assigned_vessel}</span>
                          <span>·</span>
                          <span>{m.est_mass_kg} kg</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                        <span>{m.lat.toFixed(3)}°N</span>
                        {/* Stage transition buttons */}
                        <div className="flex items-center gap-1">
                          {stage !== 'Identified' && (
                            <button
                              onClick={() => moveMission(m.mission_id, 'prev')}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold"
                            >
                              ←
                            </button>
                          )}
                          {stage !== 'Cleared' && (
                            <button
                              onClick={() => moveMission(m.mission_id, 'next')}
                              className="px-2 py-0.5 rounded bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageMissions.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                      No missions in {stage}
                    </div>
                  )}
                </div>
              </div>

              {stage === 'Identified' && (
                <button
                  onClick={() => {
                    const newId = `MSN-${Math.floor(2000 + Math.random() * 900)}`;
                    setMissions((prev) => [
                      ...prev,
                      {
                        mission_id: newId,
                        target_id: 'GNET-AUTO',
                        target_label: 'Newly Detected Monofilament',
                        stage: 'Identified',
                        assigned_vessel: 'RV-OCEANUS',
                        priority: 'High',
                        est_mass_kg: 210,
                        lat: 15.524,
                        lon: 73.842,
                      },
                    ]);
                  }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-900 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Mission Task</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
