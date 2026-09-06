'use client';

import React, { useState } from 'react';
import {
  GitCompare,
  Calendar,
  ArrowRight,
  TrendingUp,
  Compass,
  Download,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SurveySession {
  id: string;
  name: string;
  date: string;
  vessel: string;
  totalDetections: number;
  areaKm2: number;
  meanConfidence: number;
}

const MOCK_SURVEYS: SurveySession[] = [
  {
    id: 'SURV-2026-08-15',
    name: 'Goa Coastal Shelf Epoch A (T-0)',
    date: 'Aug 15, 2026',
    vessel: 'RV-OCEANUS',
    totalDetections: 48,
    areaKm2: 240,
    meanConfidence: 93.2,
  },
  {
    id: 'SURV-2026-09-02',
    name: 'Goa Coastal Shelf Epoch B (T+18d)',
    date: 'Sep 02, 2026',
    vessel: 'AUV-NEPTUNE-02',
    totalDetections: 62,
    areaKm2: 255,
    meanConfidence: 95.8,
  },
];

export default function SurveyComparisonPage() {
  const [surveyA, setSurveyA] = useState<SurveySession>(MOCK_SURVEYS[0]);
  const [surveyB, setSurveyB] = useState<SurveySession>(MOCK_SURVEYS[1]);
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [exported, setExported] = useState(false);

  const detectionDelta = surveyB.totalDetections - surveyA.totalDetections;

  const handleExport = () => {
    setExported(true);
    const data = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            delta_detections: detectionDelta,
            displacement_nm: 14.8,
            survey_a: surveyA.id,
            survey_b: surveyB.id,
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [73.8278, 15.4989],
              [73.834, 15.512],
            ],
          },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `differential-geotiff-vector-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <GitCompare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Survey Temporal & Delta Comparison
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Dual-epoch acoustic overlay, gear drift vector tracking, and dynamic debris accumulation differentials
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-primary-dark text-xs"
          >
            {exported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exported Vector GeoTIFF</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Differential GeoTIFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Detection Delta</span>
            <GitCompare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            +{detectionDelta} <span className="text-xs font-normal text-slate-400">targets</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+29.1% over 18 days</span>
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Baseline Epoch A</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {surveyA.totalDetections} <span className="text-xs font-normal text-slate-400">nets</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {surveyA.date} ({surveyA.areaKm2} km²)
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Follow-up Epoch B</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {surveyB.totalDetections} <span className="text-xs font-normal text-slate-400">nets</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {surveyB.date} ({surveyB.areaKm2} km²)
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Mean Debris Drift</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            14.8 <span className="text-xs font-normal text-slate-400">NM</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Drift Velocity: 0.82 NM/day
          </div>
        </div>
      </div>

      {/* ── Split Comparison Viewer Card ── */}
      <div className="light-saas-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-700">EPOCH A: {surveyA.date}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-mono font-bold text-slate-900">EPOCH B: {surveyB.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 border border-slate-200">
            <span className="text-xs text-slate-600 font-mono font-semibold">Slide Split:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="w-36 accent-blue-600 h-1.5 bg-slate-300 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-900 w-10 text-right">{splitPosition}%</span>
          </div>
        </div>

        {/* Visualizer Canvas */}
        <div className="relative w-full h-[440px] rounded-2xl bg-slate-950 overflow-hidden shadow-inner select-none">
          {/* Epoch A (Left Base Layer) */}
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            <svg className="w-full h-full opacity-40">
              <circle cx="220" cy="170" r="14" fill="#94A3B8" fillOpacity="0.3" />
              <circle cx="220" cy="170" r="5" fill="#94A3B8" />
              <text x="236" y="174" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                T0-TARGET-A1
              </text>

              <circle cx="390" cy="270" r="12" fill="#94A3B8" fillOpacity="0.3" />
              <circle cx="390" cy="270" r="5" fill="#94A3B8" />
              <text x="406" y="274" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                T0-TARGET-A2
              </text>
            </svg>
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 shadow-md">
              SURVEY A · {surveyA.date} ({surveyA.totalDetections} detections)
            </div>
          </div>

          {/* Epoch B (Right Side with clip-path) */}
          <div
            className="absolute inset-0 bg-slate-900/80 flex items-center justify-center border-l-2 border-sky-400"
            style={{ clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)` }}
          >
            <svg className="w-full h-full opacity-60">
              {/* Drift vector lines */}
              <line x1="220" y1="170" x2="310" y2="130" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="310" cy="130" r="16" fill="#38BDF8" fillOpacity="0.25" />
              <circle cx="310" cy="130" r="6" fill="#38BDF8" stroke="#ffffff" strokeWidth="1.5" />
              <text x="328" y="134" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                T18-DRIFT-B1 (+9.2 NM)
              </text>

              <line x1="390" y1="270" x2="480" y2="230" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="480" cy="230" r="14" fill="#38BDF8" fillOpacity="0.25" />
              <circle cx="480" cy="230" r="6" fill="#38BDF8" stroke="#ffffff" strokeWidth="1.5" />
              <text x="498" y="234" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                T18-DRIFT-B2 (+11.4 NM)
              </text>

              {/* Newly accumulated net */}
              <circle cx="680" cy="180" r="18" fill="#EF4444" fillOpacity="0.3" className="animate-pulse" />
              <circle cx="680" cy="180" r="6" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
              <text x="700" y="184" fill="#F87171" fontSize="11" fontFamily="monospace" fontWeight="bold">
                NEW ACCUMULATION #B-49
              </text>
            </svg>
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-blue-500/50 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold text-blue-300 shadow-md">
              SURVEY B · {surveyB.date} ({surveyB.totalDetections} detections)
            </div>
          </div>

          {/* Vertical Divider Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-sky-400 pointer-events-none z-20 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
            style={{ left: `${splitPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-2 border-sky-500 shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            </div>
          </div>
        </div>

        {/* Explanatory Footer Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Blue dashed vectors depict net displacement calculated via hydrographic drift model.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Red pulsars denote newly snagged ghost gear undetected during Epoch A.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
