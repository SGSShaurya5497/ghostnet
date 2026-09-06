"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Radio,
  Eye,
  Sliders,
  Sparkles,
  Download,
  Filter,
  Layers,
  Ship,
  Compass,
  ArrowLeft,
} from "lucide-react";

export default function AnomalyAlertsPage() {
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.85);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [matchedAis, setMatchedAis] = useState<boolean>(true);
  const [unmatchedDarkVessels, setUnmatchedDarkVessels] = useState<boolean>(true);

  return (
    <div className="w-full h-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl flex text-zinc-100 font-sans overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Left Panel: Controls */}
      <div className="w-[300px] h-full bg-[#070e1c]/80 border-r border-cyan-950/80 flex flex-col z-10 shrink-0">
        <div className="p-3.5 border-b border-cyan-950/80 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white hover:bg-cyan-900/80 text-xs font-mono transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Controls</span>
          </h2>
        </div>

        <div className="p-4 flex flex-col gap-5 overflow-y-auto">
          {/* Target Detection Filter */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[10px] font-mono uppercase text-zinc-500 font-medium">Confidence & Optical</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Confidence Threshold</span>
                  <span className="font-mono text-zinc-200">{Math.round(confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-zinc-200 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-300">Bounding Boxes</span>
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`w-7 h-4 rounded-full transition-colors relative ${
                    showBoundingBoxes ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all absolute top-0.5 ${
                      showBoundingBoxes ? "bg-zinc-950 right-0.5" : "bg-zinc-500 left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Acoustic Trajectories</span>
                <button
                  onClick={() => setShowTrajectories(!showTrajectories)}
                  className={`w-7 h-4 rounded-full transition-colors relative ${
                    showTrajectories ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all absolute top-0.5 ${
                      showTrajectories ? "bg-zinc-950 right-0.5" : "bg-zinc-500 left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* AIS & RF Section */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-zinc-800">
            <h3 className="text-[10px] font-mono uppercase text-zinc-500 font-medium">AIS & RF Correlation</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Matched AIS Vessels</span>
                <button
                  onClick={() => setMatchedAis(!matchedAis)}
                  className={`w-7 h-4 rounded-full transition-colors relative ${
                    matchedAis ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all absolute top-0.5 ${
                      matchedAis ? "bg-zinc-950 right-0.5" : "bg-zinc-500 left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-rose-400">Dark Vessels / Unmatched</span>
                <button
                  onClick={() => setUnmatchedDarkVessels(!unmatchedDarkVessels)}
                  className={`w-7 h-4 rounded-full transition-colors relative ${
                    unmatchedDarkVessels ? "bg-rose-500" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all absolute top-0.5 ${
                      unmatchedDarkVessels ? "bg-white right-0.5" : "bg-zinc-500 left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800/80">
          <button className="w-full py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-all shadow-sm">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 h-full relative bg-zinc-950 flex items-center justify-center overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #71717a 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Trajectories */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M100 800 Q 300 500 500 400 T 900 200"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M400 900 Q 600 700 700 500 T 900 400"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          {/* Dark Vessel Alert Marker */}
          <g>
            <rect
              x="680"
              y="480"
              width="170"
              height="24"
              rx="4"
              fill="#18181b"
              stroke="#f43f5e"
              strokeWidth="1"
            />
            <text x="690" y="496" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="500">
              DARK VESSEL SUSPECTED
            </text>
          </g>
        </svg>

        {/* Minimal Coordinates Overlay */}
        <div className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-zinc-400">
          SURVEILLANCE SECTOR: 34°49.2&apos; N, 142°11.3&apos; W
        </div>
      </div>

      {/* Right Panel: Vessel / Target Dossier */}
      <div className="w-[300px] h-full bg-zinc-900/60 border-l border-zinc-800/80 flex flex-col z-10">
        <div className="p-4 border-b border-zinc-800/80">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Target Details: Unmatched
          </h2>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="w-full h-32 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
            <span className="text-zinc-500 text-xs font-mono">OPTICAL CAPTURE</span>
          </div>

          <div className="flex flex-col gap-2 text-xs font-mono bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
            <h3 className="text-[10px] text-zinc-500 mb-1 font-bold">STATUS & SPECS</h3>
            <div className="flex justify-between">
              <span className="text-zinc-400">MMSI:</span>
              <span className="text-zinc-200">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">IMO:</span>
              <span className="text-zinc-200">UNKNOWN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">STATUS:</span>
              <span className="text-rose-400 font-bold">DARK VESSEL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">CONFIDENCE:</span>
              <span className="text-zinc-100">92%</span>
            </div>
          </div>

          <button className="w-full mt-auto py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium rounded-lg transition-all shadow-sm">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
