"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  Flame,
  Waves,
  Zap,
  PieChart,
  ArrowLeft,
} from "lucide-react";

export default function SurveyAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

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
              <BarChart3 className="w-4 h-4 text-zinc-300" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Survey Analytics & Telemetry
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              Insights
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Historical detection volume metrics, acoustic signal confidence distributions, and fleet productivity indexing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            {(["7D", "30D", "90D", "ALL"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md transition-all font-mono ${
                  timeRange === r
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Area Surveyed</span>
            <Waves className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            1,482 <span className="text-xs font-normal text-zinc-500 font-mono">km²</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs previous month</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Total Gear Resolved</span>
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            348 <span className="text-xs font-normal text-zinc-500 font-mono">nets</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">Recovery Rate: 84.6%</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Mean Model Confidence</span>
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            94.8%
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">ONNX YOLOv8-Oceanis Precision</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Debris Extracted</span>
            <Flame className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            28.4 <span className="text-xs font-normal text-zinc-500 font-mono">tons</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">100% Recycled & Manifested</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Detection Volume Over Time Bar Chart */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              Detection Frequency (Weekly)
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">TARGETS / WEEK</span>
          </div>

          <div className="h-60 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-zinc-800">
            {[
              { label: "W1", count: 28, height: "45%" },
              { label: "W2", count: 42, height: "65%" },
              { label: "W3", count: 35, height: "55%" },
              { label: "W4", count: 64, height: "92%" },
              { label: "W5", count: 51, height: "78%" },
              { label: "W6", count: 48, height: "72%" },
              { label: "W7", count: 70, height: "100%" },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono text-zinc-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.count}
                </span>
                <div
                  className="w-full bg-zinc-700 hover:bg-zinc-500 rounded-t transition-all"
                  style={{ height: bar.height }}
                />
                <span className="text-[10px] font-mono text-zinc-500">{bar.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Peak Detection: <strong className="text-zinc-200">Week 7 (70 targets)</strong></span>
            <span className="text-emerald-400 font-medium">+34% Convergence</span>
          </div>
        </div>

        {/* Gear Breakdown by Debris Classification */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-3.5 h-3.5 text-zinc-400" />
              Gear Material Classification
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">DISTRIBUTION</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { name: "Polypropylene Drift Gillnets", pct: 48, count: 167, color: "bg-zinc-200" },
              { name: "Trawl Webbing & Codends", pct: 26, count: 90, color: "bg-zinc-400" },
              { name: "Fish Aggregation Devices (dFADs)", pct: 16, count: 56, color: "bg-zinc-600" },
              { name: "Pelagic Longline Braids & Hooks", pct: 10, count: 35, color: "bg-zinc-700" },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">{cat.name}</span>
                  <span className="font-mono text-zinc-400">
                    <strong className="text-zinc-100">{cat.pct}%</strong> ({cat.count} units)
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 mt-2 font-mono">
            Primary hazard: Synthetic polymer degradation in 0-50m surface layer.
          </div>
        </div>
      </div>
    </div>
  );
}
