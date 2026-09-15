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
          // Check if user just dispatched a new mission from Live Detections
          try {
            const rawDispatched = sessionStorage.getItem('ghostnet_dispatched_mission');
            if (rawDispatched) {
              sessionStorage.removeItem('ghostnet_dispatched_mission');
              const newMission: CleanupMission = JSON.parse(rawDispatched);
              setNewlyDispatchedId(newMission.mission_id);
              // Deduplicate if already present
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
        // Fallback with session check
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

        // Sync with backend API
        ghostnetApi.updateCleanupMissionStage(missionId, nextStage).catch(() => {});

        return { ...m, stage: nextStage };
      })
    );
  };

  const totalMass = missions.reduce((acc, m) => acc + m.est_mass_kg, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans rounded-none">
      {/* ── Top Header Toolbar Card (0 Curves, Solid Ocean Theme) ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#075A73] flex items-center justify-center text-white shadow-none">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#0E232B]">
              Marine Debris Cleanup & Salvage Operations
            </h1>
            <span className="text-xs text-[#526E78] font-medium">
              Simulated cleanup missions and salvage operations pipeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] text-xs font-semibold flex items-center gap-2">
            <span className="text-[#526E78]">TARGET MASS:</span>
            <span className="text-[#0E232B] font-bold font-mono">{(totalMass / 1000).toFixed(2)} t</span>
          </div>
          <button
            onClick={loadMissions}
            className="p-2 rounded-none bg-[#E5EDEE] hover:bg-[#B8C9CC] text-[#0E232B] transition-colors"
            title="Refresh Missions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Simulated Mission Pipeline Banner ── */}
      <div className="rounded-none border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-none">
        <div className="w-5 h-5 rounded-none bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-none">
              Demo Workflow &bull; Simulated Operations
            </span>
            <span className="font-semibold text-amber-950">No Live Maritime Salvage Dispatching</span>
          </div>
          <p className="text-amber-900 leading-relaxed">
            Target tracking, stage transitions (Identified &rarr; Dispatched &rarr; In Recovery &rarr; Cleared), and vessel assignments operate in demo mode.
            In production, stages interface with port authority logistics, commercial salvage contractor APIs, and maritime dispatch manifests.
        </div>
      </div>

      {/* ── Kanban Board Stages (Grid of 4 Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 rounded-none">
        {STAGES.map((stage) => {
          const stageMissions = missions.filter((m) => m.stage === stage);

          return (
            <div key={stage} className="light-saas-card p-5 flex flex-col justify-between min-h-[500px] space-y-4 rounded-none">
              <div className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#B8C9CC]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E232B]">
                      {stage}
                    </span>
                    <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-bold rounded-none">
                      {stageMissions.length}
                    </span>
                  </div>
                </div>

                {/* Mission Cards inside Stage */}
                <div className="space-y-2.5">
                  {stageMissions.map((m) => {
                    const isNew = m.mission_id === newlyDispatchedId;

                    return (
                      <div
                        key={m.mission_id}
                        className={`p-3.5 rounded-none transition-all space-y-2.5 group border ${
                          isNew
                            ? 'bg-[#E5EDEE] border-[#075A73] ring-1 ring-[#075A73] shadow-none'
                            : 'bg-[#E5EDEE]/50 hover:bg-[#E5EDEE] border-[#B8C9CC]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold font-mono text-[#0E232B]">{m.mission_id}</span>
                            {isNew && (
                              <span className="pill-badge-ocean text-[9px] py-0 px-1.5 font-bold animate-pulse rounded-none">
                                JUST ADDED
                              </span>
                            )}
                          </div>
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

                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-[#2A434D] block">{m.target_label}</span>
                          <div className="flex items-center gap-2 text-[11px] text-[#526E78] font-medium">
                            <span>{m.assigned_vessel}</span>
                            <span>·</span>
                            <span>{m.est_mass_kg} kg</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#B8C9CC] text-[11px] font-mono text-[#526E78]">
                          <span>{m.lat.toFixed(4)}°N, {m.lon.toFixed(4)}°E</span>
                          {/* Stage transition buttons */}
                          <div className="flex items-center gap-1">
                            {stage !== 'Identified' && (
                              <button
                                onClick={() => moveMission(m.mission_id, 'prev')}
                                className="px-2 py-0.5 rounded-none bg-white border border-[#B8C9CC] hover:bg-[#E5EDEE] text-[10px] font-bold text-[#0E232B]"
                              >
                                ←
                              </button>
                            )}
                            {stage !== 'Cleared' && (
                              <button
                                onClick={() => moveMission(m.mission_id, 'next')}
                                className="px-2 py-0.5 rounded-none bg-white border border-[#B8C9CC] hover:bg-[#E5EDEE] text-[10px] font-bold text-[#0E232B]"
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
                    <div className="py-12 text-center text-xs text-[#849EAA] font-medium border-2 border-dashed border-[#B8C9CC] rounded-none">
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
                  className="w-full py-2 rounded-none border border-dashed border-[#B8C9CC] hover:border-[#075A73] text-[#526E78] hover:text-[#075A73] text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#E5EDEE]/50 hover:bg-[#E5EDEE]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#075A73]" />
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
