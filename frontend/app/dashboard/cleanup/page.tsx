"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  ArrowUpDown,
  Ship,
  Sparkles,
  Download,
  TrendingDown,
  Navigation,
  ArrowLeft,
} from "lucide-react";

interface CleanupTarget {
  id: string;
  targetName: string;
  coordinates: string;
  debrisType: "DRIFT_GILLNET" | "TRAWL_FRAGMENT" | "FAD_DEBRIS" | "LONGLINE_BUNDLE";
  estimatedMassKg: number;
  priorityScore: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "SCHEDULED";
  assignedVessel: string | null;
  salvageWindowHrs: number;
  status: "PENDING_DISPATCH" | "IN_TRANSIT" | "RECOVERY_ACTIVE" | "COMPLETED";
}

const mockTargets: CleanupTarget[] = [
  {
    id: "CLN-8401",
    targetName: "Polypropylene Gillnet Mesh #18",
    coordinates: "34°49.2' N, 142°11.3' W",
    debrisType: "DRIFT_GILLNET",
    estimatedMassKg: 1420,
    priorityScore: 96,
    urgency: "CRITICAL",
    assignedVessel: "RV Ocean Sentinel (SV-01)",
    salvageWindowHrs: 6.5,
    status: "RECOVERY_ACTIVE",
  },
  {
    id: "CLN-8402",
    targetName: "Monofilament Trawl Snag Alpha",
    coordinates: "34°38.6' N, 142°05.8' W",
    debrisType: "TRAWL_FRAGMENT",
    estimatedMassKg: 980,
    priorityScore: 89,
    urgency: "CRITICAL",
    assignedVessel: null,
    salvageWindowHrs: 12.0,
    status: "PENDING_DISPATCH",
  },
  {
    id: "CLN-8403",
    targetName: "Anchored Fish Aggregating Device",
    coordinates: "34°22.1' N, 141°58.2' W",
    debrisType: "FAD_DEBRIS",
    estimatedMassKg: 650,
    priorityScore: 78,
    urgency: "HIGH",
    assignedVessel: "USV Nautilus-4",
    salvageWindowHrs: 24.0,
    status: "IN_TRANSIT",
  },
  {
    id: "CLN-8404",
    targetName: "Commercial Tuna Longline Cluster",
    coordinates: "34°15.4' N, 141°42.9' W",
    debrisType: "LONGLINE_BUNDLE",
    estimatedMassKg: 420,
    priorityScore: 65,
    urgency: "MEDIUM",
    assignedVessel: null,
    salvageWindowHrs: 48.0,
    status: "PENDING_DISPATCH",
  },
  {
    id: "CLN-8405",
    targetName: "Submerged Polyethylene Trawl Wing",
    coordinates: "33°58.2' N, 141°30.0' W",
    debrisType: "TRAWL_FRAGMENT",
    estimatedMassKg: 810,
    priorityScore: 54,
    urgency: "SCHEDULED",
    assignedVessel: null,
    salvageWindowHrs: 72.0,
    status: "PENDING_DISPATCH",
  },
];

export default function CleanupPriorityPage() {
  const [targets, setTargets] = useState<CleanupTarget[]>(mockTargets);
  const [selectedTarget, setSelectedTarget] = useState<CleanupTarget>(mockTargets[0]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isOptimizing, setIsOptimizing] = useState(false);

  const filtered =
    statusFilter === "ALL"
      ? targets
      : targets.filter((t) => t.status === statusFilter);

  const handleDispatch = (id: string) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "IN_TRANSIT",
              assignedVessel: "RV Ocean Sentinel (SV-01)",
            }
          : t
      )
    );
    setSelectedTarget((prev) =>
      prev.id === id
        ? {
            ...prev,
            status: "IN_TRANSIT",
            assignedVessel: "RV Ocean Sentinel (SV-01)",
          }
        : prev
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl text-zinc-100 overflow-y-auto p-4 md:p-6 space-y-6 font-sans backdrop-blur-xl shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyan-950/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white hover:bg-cyan-900/80 text-xs font-mono transition-all mr-1 shadow-sm"
              title="Return to Main Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <span className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300">
              <Trash2 className="w-4 h-4 text-emerald-400" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Cleanup Priority & Salvage Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              Dispatch Ops
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous salvage priority ranking, vessel dispatch scheduling, and net extraction telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsOptimizing(true);
              setTimeout(() => setIsOptimizing(false), 850);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
            Optimize Queue
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Total Salvage Queue</span>
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            4,280 <span className="text-xs font-normal text-zinc-500 font-mono">kg</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">5 High-Priority Target Clusters</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Active Recovery Fleet</span>
            <Ship className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            2 <span className="text-xs font-normal text-zinc-500 font-mono">units deployed</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">RV Sentinel + USV Nautilus</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Avg. Salvage Window</span>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            18.4 <span className="text-xs font-normal text-zinc-500 font-mono">hours remaining</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-2 font-mono">Prior to trench exit</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Projected Extraction Cost</span>
            <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">$14,200</div>
          <div className="text-[11px] text-emerald-400 mt-2 font-mono">-38% via AI route optimization</div>
        </div>
      </div>

      {/* Main Grid: Left Priority Queue Table + Right Target Dispatch Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Priority Table (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">
                Ranked Salvage Queue
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_DISPATCH">Pending Dispatch</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="RECOVERY_ACTIVE">Active Recovery</option>
              </select>
            </div>
          </div>

          {/* Target List */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {filtered.map((item) => {
              const isSelected = selectedTarget.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTarget(item)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-600 shadow-sm"
                      : "bg-zinc-900/50 border-zinc-800/70 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-200 shrink-0">
                      {item.priorityScore}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100">{item.targetName}</span>
                        <span className="text-[10px] font-mono text-zinc-500">({item.id})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-zinc-400 font-mono mt-1">
                        <span>Mass: <strong className="text-zinc-200">{item.estimatedMassKg} kg</strong></span>
                        <span>•</span>
                        <span>Window: <strong className="text-zinc-200">{item.salvageWindowHrs}h</strong></span>
                        <span>•</span>
                        <span>{item.coordinates}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        item.status === "RECOVERY_ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "IN_TRANSIT"
                          ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Selected Dispatch Dossier */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-zinc-400" />
              Extraction Details
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">{selectedTarget.id}</span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Target Designation
            </span>
            <div className="text-base font-semibold text-zinc-100">{selectedTarget.targetName}</div>
            <div className="text-xs font-mono text-zinc-400 mt-0.5">{selectedTarget.debrisType}</div>
          </div>

          {/* Salvage Scoring Breakdown */}
          <div className="space-y-3 bg-zinc-900/80 border border-zinc-800 rounded-lg p-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Priority Score</span>
              <span className="text-zinc-100 font-semibold font-mono">{selectedTarget.priorityScore} / 100</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-200 rounded-full"
                style={{ width: `${selectedTarget.priorityScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block">Mass Estimate</span>
                <span className="text-zinc-200 font-semibold">{selectedTarget.estimatedMassKg} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Salvage Window</span>
                <span className="text-zinc-200 font-semibold">{selectedTarget.salvageWindowHrs}h</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-zinc-500 block">Assigned Unit</span>
                <span className="text-zinc-300">
                  {selectedTarget.assignedVessel || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">GPS Lock</span>
            <span className="text-zinc-300">{selectedTarget.coordinates}</span>
          </div>

          <div className="pt-2 space-y-2 mt-auto">
            {selectedTarget.status === "PENDING_DISPATCH" ? (
              <button
                onClick={() => handleDispatch(selectedTarget.id)}
                className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Salvage Vessel
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Mission Tasked ({selectedTarget.status})
              </div>
            )}
            <button className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Export Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
