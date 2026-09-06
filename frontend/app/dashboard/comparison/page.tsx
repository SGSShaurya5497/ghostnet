"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitCompare,
  Calendar,
  ArrowRight,
  TrendingUp,
  Compass,
  Download,
  ArrowLeft,
} from "lucide-react";

interface SurveySession {
  id: string;
  name: string;
  date: string;
  vessel: string;
  totalDetections: number;
  areaKm2: number;
  meanConfidence: number;
}

const mockSurveys: SurveySession[] = [
  {
    id: "SURV-2026-08-15",
    name: "North Gyre Leg Alpha (T-0)",
    date: "Aug 15, 2026",
    vessel: "RV Ocean Sentinel",
    totalDetections: 48,
    areaKm2: 240,
    meanConfidence: 93.2,
  },
  {
    id: "SURV-2026-09-02",
    name: "North Gyre Leg Bravo (T+18d)",
    date: "Sep 02, 2026",
    vessel: "USV Nautilus-4",
    totalDetections: 62,
    areaKm2: 255,
    meanConfidence: 95.8,
  },
];

export default function SurveyComparisonPage() {
  const [surveyA, setSurveyA] = useState<SurveySession>(mockSurveys[0]);
  const [surveyB, setSurveyB] = useState<SurveySession>(mockSurveys[1]);
  const [splitPosition, setSplitPosition] = useState<number>(50);

  const detectionDelta = surveyB.totalDetections - surveyA.totalDetections;

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
              <GitCompare className="w-4 h-4 text-zinc-300" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Survey Temporal Comparison
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              Delta Slicer
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dual-epoch acoustic overlay, gear drift vector tracking, and dynamic debris accumulation differentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export Differential GeoTIFF
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Detection Delta</span>
            <GitCompare className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            +{detectionDelta} <span className="text-xs font-normal text-zinc-500 font-mono">targets</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>+29.1% over 18 days</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Baseline Survey A (T-0)</span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            {surveyA.totalDetections} <span className="text-xs font-normal text-zinc-500 font-mono">nets</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {surveyA.date} ({surveyA.areaKm2} km²)
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Survey B (T+18d)</span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            {surveyB.totalDetections} <span className="text-xs font-normal text-zinc-500 font-mono">nets</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {surveyB.date} ({surveyB.areaKm2} km²)
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-zinc-400">Mean Displacement</span>
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 mt-2">
            14.8 <span className="text-xs font-normal text-zinc-500 font-mono">NM</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 font-mono">Rate: 0.82 NM/day</div>
        </div>
      </div>

      {/* Split Comparison Viewer */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-4 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-xs font-mono font-medium text-zinc-300">EPOCH A: {surveyA.date}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-100" />
              <span className="text-xs font-mono font-medium text-zinc-100">EPOCH B: {surveyB.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-zinc-400 font-mono">Split:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="w-32 accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-zinc-200">{splitPosition}%</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative w-full flex-1 min-h-[400px] rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-hidden">
          {/* Epoch A (Left Base) */}
          <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
            <svg className="w-full h-full opacity-30">
              <circle cx="250" cy="180" r="12" fill="#71717a" fillOpacity="0.3" />
              <circle cx="250" cy="180" r="4" fill="#a1a1aa" />
              <circle cx="420" cy="260" r="10" fill="#71717a" fillOpacity="0.3" />
              <circle cx="420" cy="260" r="4" fill="#a1a1aa" />
            </svg>
            <div className="absolute top-3 left-3 bg-zinc-900 border border-zinc-700/80 rounded px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              SURVEY A ({surveyA.date})
            </div>
          </div>

          {/* Epoch B (Right Side with clip-path) */}
          <div
            className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center border-l border-zinc-500"
            style={{ clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)` }}
          >
            <svg className="w-full h-full opacity-40">
              <circle cx="310" cy="140" r="14" fill="#e4e4e7" fillOpacity="0.3" />
              <circle cx="310" cy="140" r="4" fill="#ffffff" />
              <line x1="250" y1="180" x2="310" y2="140" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3,3" />

              <circle cx="490" cy="220" r="12" fill="#e4e4e7" fillOpacity="0.3" />
              <circle cx="490" cy="220" r="4" fill="#ffffff" />
              <line x1="420" y1="260" x2="490" y2="220" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3,3" />

              <circle cx="680" cy="180" r="10" fill="#d4d4d8" fillOpacity="0.3" />
              <circle cx="680" cy="180" r="4" fill="#e4e4e7" />
            </svg>
            <div className="absolute top-3 right-3 bg-zinc-900 border border-zinc-700/80 rounded px-2 py-0.5 text-[10px] font-mono text-zinc-200">
              SURVEY B ({surveyB.date})
            </div>
          </div>

          {/* Vertical Divider */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 pointer-events-none z-20"
            style={{ left: `${splitPosition}%` }}
          />
        </div>
      </div>
    </div>
  );
}
