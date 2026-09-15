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
  Zap,
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
    lat: 11.560889,
    lon: 79.800671,
  },
  {
    mission_id: 'MSN-2039',
    target_id: 'GNET-8815',
    target_label: 'Snagged Trawl Net on Reef',
    stage: 'In Recovery',
    assigned_vessel: 'ROV-TRITON-X',
    priority: 'Critical',
    est_mass_kg: 620,
    lat: 13.325614,
    lon: 80.410923,
  },
  {
    mission_id: 'MSN-2035',
    target_id: 'GNET-8819',
    target_label: 'Abandoned Polypropylene Line',
    stage: 'Identified',
    assigned_vessel: 'AUV-NEPTUNE-02',
    priority: 'High',
    est_mass_kg: 180,
    lat: 11.856251,
    lon: 79.880480,
  },
  {
    mission_id: 'MSN-2028',
    target_id: 'GNET-8809',
    target_label: 'Submerged Crab Trap Cage',
    stage: 'Cleared',
    assigned_vessel: 'RV-OCEANUS',
    priority: 'Medium',
    est_mass_kg: 95,
    lat: 17.633693,
    lon: 83.328583,
  },
];

const STAGES = ['Identified', 'Dispatched', 'In Recovery', 'Cleared'] as const;

export default function CleanupMissionsPage() {
  const [missions, setMissions] = useState<CleanupMission[]>(INITIAL_MISSIONS);
  const [loading, setLoading] = useState(false);
  const [newlyDispatchedId, setNewlyDispatchedId] = useState<string | null>(null);

  const loadMissions = () => {
    setLoading(true);
    ghostnetApi
      .getCleanupMissions()
      .then((res) => {
        const data = res?.missions || [];
        if (data && data.length > 0) {
          try {
            const rawDispatched = sessionStorage.getItem('ghostnet_dispatched_mission');
            if (rawDispatched) {
              sessionStorage.removeItem('ghostnet_dispatched_mission');
              const newMission: CleanupMission = JSON.parse(rawDispatched);
              setNewlyDispatchedId(newMission.mission_id);
              const existingIdx = data.findIndex((m) => m.target_id === newMission.target_id);
              if (existingIdx >= 0) {
                data[existingIdx] = newMission;
                setMissions([...data]);
              } else {
                setMissions([newMission, ...data]);
              }
              setLoading(false);
              return;
            }
          } catch {
            // ignore
          }

          setMissions(data);
        }
        setLoading(false);
      })
      .catch(() => {
        try {
          const rawDispatched = sessionStorage.getItem('ghostnet_dispatched_mission');
          if (rawDispatched) {
            sessionStorage.removeItem('ghostnet_dispatched_mission');
            const newMission: CleanupMission = JSON.parse(rawDispatched);
            setNewlyDispatchedId(newMission.mission_id);
            setMissions((prev) => {
              const existingIdx = prev.findIndex((m) => m.target_id === newMission.target_id);
              if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = newMission;
                return updated;
              }
              return [newMission, ...prev];
            });
          }
        } catch {
          // ignore
        }
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
        let nextStage = m.stage;
        if (direction === 'next' && currIdx < STAGES.length - 1) {
          nextStage = STAGES[currIdx + 1];
        }
        if (direction === 'prev' && currIdx > 0) {
          nextStage = STAGES[currIdx - 1];
        }

        ghostnetApi.updateCleanupMissionStage(missionId, nextStage).catch(() => {});

        return { ...m, stage: nextStage };
      })
    );
  };

  const totalMass = missions.reduce((acc, m) => acc + m.est_mass_kg, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-gray-100">
      {/* ── Top Header Toolbar Card ── */}
      <div className="cyber-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-[#2DD4BF]/30">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Marine Debris Salvage & Recovery Board
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40">
                KANBAN PIPELINE
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Automated dispatch grid & vessel staging for ghost net extraction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold flex items-center gap-2">
            <span className="text-gray-400">TOTAL TARGET MASS:</span>
            <span className="text-[#2DD4BF] font-bold font-mono text-sm">{(totalMass / 1000).toFixed(2)} t</span>
          </div>
          <button
            onClick={loadMissions}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-[#2DD4BF]/20 text-gray-300 hover:text-[#2DD4BF] border border-white/10 hover:border-[#2DD4BF]/40 transition-all duration-300"
            title="Refresh Missions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Live Operational Status Banner ── */}
      <div className="cyber-card p-4 text-xs flex items-start gap-3.5 border-l-4 border-l-emerald-500">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Operations Active
            </span>
            <span className="font-bold text-white">Synchronized with Maritime Salvage Fleet</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Target tracking, stage transitions (Identified &rarr; Dispatched &rarr; In Recovery &rarr; Cleared), and autonomous vessel allocations are actively synchronized.
          </p>
        </div>
      </div>

      {/* ── Kanban Board Stages (Grid of 4 Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAGES.map((stage) => {
          const stageMissions = missions.filter((m) => m.stage === stage);

          return (
            <div key={stage} className="cyber-card p-5 flex flex-col justify-between min-h-[500px] space-y-4">
              <div className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
                      {stage}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold">
                      {stageMissions.length}
                    </span>
                  </div>
                </div>

                {/* Mission Cards inside Stage */}
                <div className="space-y-3">
                  {stageMissions.map((m) => {
                    const isNew = m.mission_id === newlyDispatchedId;

                    return (
                      <div
                        key={m.mission_id}
                        className={`cyber-card-interactive p-4 space-y-3 transition-all duration-300 ${
                          isNew
                            ? 'border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/20 bg-[#2DD4BF]/10'
                            : 'hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold font-mono text-[#2DD4BF]">{m.mission_id}</span>
                            {isNew && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#2DD4BF] text-white text-[9px] font-extrabold animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <span
                            className={
                              m.priority === 'Critical'
                                ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : m.priority === 'High'
                                ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }
                          >
                            {m.priority}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-sm font-bold text-white block">{m.target_label}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <span className="text-gray-300">{m.assigned_vessel}</span>
                            <span>·</span>
                            <span className="text-gray-300">{m.est_mass_kg} kg</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-gray-400">
                          <span>{m.lat.toFixed(4)}°N, {m.lon.toFixed(4)}°E</span>
                          {/* Stage transition buttons */}
                          <div className="flex items-center gap-1">
                            {stage !== 'Identified' && (
                              <button
                                onClick={() => moveMission(m.mission_id, 'prev')}
                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[#2DD4BF]/40 hover:text-[#2DD4BF] text-xs font-bold text-white transition-colors"
                              >
                                ←
                              </button>
                            )}
                            {stage !== 'Cleared' && (
                              <button
                                onClick={() => moveMission(m.mission_id, 'next')}
                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[#2DD4BF]/40 hover:text-[#2DD4BF] text-xs font-bold text-white transition-colors"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {stageMissions.length === 0 && (
                    <div className="py-12 text-center text-xs text-gray-500 font-medium border-2 border-dashed border-white/10 rounded-xl">
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
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-[#2DD4BF]/50 text-gray-400 hover:text-[#2DD4BF] text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white/5 hover:bg-[#2DD4BF]/10"
                >
                  <Plus className="w-4 h-4 text-[#2DD4BF]" />
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

