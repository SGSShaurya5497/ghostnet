"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Compass,
  Layers,
  Lock,
  Wifi,
  Sparkles,
  ChevronRight,
  Globe,
  Sliders,
  Play,
  RotateCcw,
} from "lucide-react";

interface InitStep {
  id: string;
  name: string;
  subsystem: string;
  status: "PENDING" | "INITIALIZING" | "ONLINE" | "FAILED";
  latencyMs: number;
}

const INITIAL_STEPS: InitStep[] = [
  { id: "geo", name: "Geospatial Engine", subsystem: "GIS-CORE / WGS84", status: "PENDING", latencyMs: 14 },
  { id: "data", name: "Maritime Data Engine", subsystem: "AIS-SAR-CORRELATION", status: "PENDING", latencyMs: 22 },
  { id: "analytics", name: "Survey Analytics", subsystem: "ACOUSTIC-TELEMETRY", status: "PENDING", latencyMs: 18 },
  { id: "risk", name: "Risk Intelligence", subsystem: "ECO-ENTANGLEMENT-V5", status: "PENDING", latencyMs: 29 },
  { id: "route", name: "Route Planning", subsystem: "EULERIAN-DRIFT-SWATH", status: "PENDING", latencyMs: 12 },
  { id: "anomaly", name: "Anomaly Detection", subsystem: "ONNX-YOLOV8-OCEANIS", status: "PENDING", latencyMs: 35 },
  { id: "layer", name: "Intelligence Layer", subsystem: "MULTIBEAM-BACKSCATTER", status: "PENDING", latencyMs: 16 },
];

export default function StartupSequencePage() {
  const router = useRouter();

  // Lifecycle States
  const [phase, setPhase] = useState<
    "BLACK_SCREEN" | "LOGO_REVEAL" | "INITIALIZING" | "SCANNING" | "SYSTEM_READY" | "LAUNCHING"
  >("BLACK_SCREEN");
  const [progress, setProgress] = useState<number>(0);
  const [steps, setSteps] = useState<InitStep[]>(INITIAL_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [radarScanAngle, setRadarScanAngle] = useState<number>(0);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<"CONNECTED" | "STANDALONE_MOCK">("CONNECTED");

  // Step 1 & 2: Sequence Orchestrator
  useEffect(() => {
    // 1. Initial Black Screen -> Logo Reveal (after 500ms)
    const t1 = setTimeout(() => {
      setPhase("LOGO_REVEAL");
    }, 600);

    // 2. Logo Reveal -> Start Initialization (after 1800ms)
    const t2 = setTimeout(() => {
      setPhase("INITIALIZING");
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Step 3 & 4: Sequential Service Initialization & Progress Counter
  useEffect(() => {
    if (phase !== "INITIALIZING") return;

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setSteps((prev) =>
          prev.map((step, idx) => {
            if (idx === currentStep) return { ...step, status: "ONLINE" };
            if (idx === currentStep + 1) return { ...step, status: "INITIALIZING" };
            return step;
          })
        );
        setActiveStepIndex(currentStep);
        setProgress(Math.round(((currentStep + 1) / steps.length) * 85));
        currentStep++;
      } else {
        clearInterval(stepInterval);
        setPhase("SCANNING");
        setProgress(92);
      }
    }, 420);

    return () => clearInterval(stepInterval);
  }, [phase]);

  // Step 5 & 6: Radar Sweep & Map Activation
  useEffect(() => {
    if (phase !== "SCANNING") return;

    const scanTimeout = setTimeout(() => {
      setProgress(100);
      setPhase("SYSTEM_READY");
    }, 1800);

    return () => clearTimeout(scanTimeout);
  }, [phase]);

  // Handle Launch Transition
  const handleEnterDashboard = () => {
    setPhase("LAUNCHING");
    setTimeout(() => {
      router.push("/dashboard/map");
    }, 700);
  };

  return (
    <div className="relative w-screen h-screen bg-[#050811] text-zinc-100 overflow-hidden flex items-center justify-center font-sans select-none">
      {/* Background Animated Coordinate Grid & Satellite Shading */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          phase === "BLACK_SCREEN" ? "opacity-0" : "opacity-25"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px, 80px 80px, 80px 80px",
        }}
      />

      {/* World Map Backdrop (Reveals progressively during initialization) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 pointer-events-none ${
          phase === "BLACK_SCREEN" || phase === "LOGO_REVEAL"
            ? "opacity-5 scale-95"
            : "opacity-40 scale-100"
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#050811" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Continents Outline */}
          <path
            d="M160,140 Q320,130 460,180 Q480,240 460,320 Q380,420 280,380 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
            strokeDasharray="4,4"
            className="transition-opacity duration-1000"
          />
          <path
            d="M360,460 Q480,520 480,720 Q400,840 370,680 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
            strokeDasharray="4,4"
          />
          <path
            d="M720,180 Q880,180 840,280 Q740,260 720,180 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
          />
          <path
            d="M710,320 Q900,380 900,620 Q780,720 700,520 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
          />
          <path
            d="M860,120 Q1340,140 1260,300 Q920,240 860,120 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
          />
          <path
            d="M1080,280 Q1320,340 1200,460 Q1060,360 1080,280 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
          />
          <path
            d="M1240,580 Q1440,640 1320,760 1240,580 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="0.75"
          />

          {/* Dynamic Trajectories */}
          {(phase === "SCANNING" || phase === "SYSTEM_READY" || phase === "LAUNCHING") && (
            <g className="transition-opacity duration-700">
              <path
                d="M320,280 Q600,200 840,260 T1200,420"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="6,6"
              />
              <path
                d="M420,620 Q750,540 1100,660"
                fill="none"
                stroke="#f97316"
                strokeWidth="1.5"
                strokeDasharray="4,6"
              />
              {/* Active Radar Nodes */}
              <circle cx="340" cy="270" r="6" fill="#06b6d4" className="animate-ping" />
              <circle cx="840" cy="260" r="5" fill="#f43f5e" className="animate-ping" />
              <circle cx="1200" cy="420" r="6" fill="#10b981" />
            </g>
          )}

          {/* Sweep Radar Line */}
          {phase === "SCANNING" && (
            <line
              x1="0"
              y1="0"
              x2="1600"
              y2="900"
              stroke="#06b6d4"
              strokeWidth="2"
              className="animate-pulse"
              opacity="0.6"
            />
          )}
        </svg>
      </div>

      {/* Floating HUD Panels around the Map */}
      <div
        className={`absolute inset-0 p-6 pointer-events-none flex flex-col justify-between transition-opacity duration-1000 ${
          phase === "INITIALIZING" || phase === "SCANNING" || phase === "SYSTEM_READY"
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        {/* Top HUD Row */}
        <div className="flex justify-between items-start">
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-2.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-zinc-400">SYSTEM STATUS</span>
              <span className="text-xs font-bold text-zinc-100 font-mono">ONLINE // READY</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-2.5 shadow-lg">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400">DATA STREAM</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">ENCRYPTED TELEMETRY</span>
            </div>
          </div>
        </div>

        {/* Bottom HUD Row */}
        <div className="flex justify-between items-end">
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-2.5 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-zinc-400">VESSEL FLEET</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">2 UNITS ACTIVE</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3.5 py-2 backdrop-blur-md flex items-center gap-2.5 shadow-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400">INTELLIGENCE</span>
              <span className="text-xs font-bold text-rose-300 font-mono">SPYK_33:65:18</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Startup Modal / Initialization Console */}
      <div
        className={`relative z-20 w-full max-w-lg mx-4 bg-[#0a101d]/90 border border-zinc-700/80 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-700 flex flex-col items-center text-center ${
          phase === "BLACK_SCREEN"
            ? "opacity-0 translate-y-6 scale-95"
            : phase === "LAUNCHING"
            ? "opacity-0 scale-105"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Glowing Central Logo / Aperture */}
        <div className="relative mb-4 group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="w-10 h-10 rounded-xl border border-cyan-400/60 flex items-center justify-center animate-spin" style={{ animationDuration: "12s" }}>
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
            </div>
          </div>
        </div>

        {/* Brand & Platform Identity */}
        <h1 className="text-2xl font-black tracking-widest uppercase text-white">
          OCEANIS INTEL
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-1.5" />
        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-5">
          MARITIME INTELLIGENCE & GEOSPATIAL PLATFORM
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2 p-0.5 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_10px_#06b6d4]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-4 px-1">
          <span>INITIALIZING CORE SERVICES...</span>
          <span className="text-cyan-400 font-bold">{progress}%</span>
        </div>

        {/* Sequential Subsystem Status Terminal */}
        <div className="w-full bg-[#050811]/90 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-left font-mono text-xs mb-5 max-h-48 overflow-y-auto">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between transition-opacity ${
                step.status === "PENDING"
                  ? "opacity-30"
                  : step.status === "INITIALIZING"
                  ? "opacity-80 text-cyan-300"
                  : "opacity-100 text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {step.status === "ONLINE" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : step.status === "INITIALIZING" ? (
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                )}
                <span className="text-[11px]">{step.name}</span>
                <span className="text-[9px] text-zinc-500 hidden sm:inline">[{step.subsystem}]</span>
              </div>

              <span
                className={`text-[10px] font-bold ${
                  step.status === "ONLINE"
                    ? "text-emerald-400"
                    : step.status === "INITIALIZING"
                    ? "text-cyan-400 animate-pulse"
                    : "text-zinc-600"
                }`}
              >
                {step.status}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button once System Ready */}
        {phase === "SYSTEM_READY" ? (
          <button
            onClick={handleEnterDashboard}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 group"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>CALIBRATING MULTI-SWATH SENSORS...</span>
          </div>
        )}

        {/* Bottom Small Tagline */}
        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
          <span>LAT: 34°49.2&apos; N / LON: 142°11.3&apos; W</span>
          <span className="text-emerald-400">STATUS: NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
