"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Share2,
  Printer,
  Sparkles,
  FileCheck,
  Eye,
  ArrowLeft,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: "EXECUTIVE_BRIEF" | "SALVAGE_MANIFEST" | "ECO_IMPACT" | "ACOUSTIC_TELEMETRY";
  dateGenerated: string;
  author: string;
  fileSize: string;
  status: "READY" | "PROCESSING" | "ARCHIVED";
  summary: string;
}

const mockReports: Report[] = [
  {
    id: "REP-2026-0906-01",
    title: "North Pacific Gyre - Ghost Gear Extraction Executive Brief",
    type: "EXECUTIVE_BRIEF",
    dateGenerated: "Sep 06, 2026 18:45 UTC",
    author: "Oceanis Intelligence",
    fileSize: "4.8 MB (PDF)",
    status: "READY",
    summary:
      "Comprehensive multi-mission assessment of 121 ghost nets detected across 1,482 km² survey swaths with recovery risk grading.",
  },
  {
    id: "REP-2026-0905-02",
    title: "Vessel Extraction Manifest & Salvage Chain of Custody",
    type: "SALVAGE_MANIFEST",
    dateGenerated: "Sep 05, 2026 12:10 UTC",
    author: "RV Ocean Sentinel Crew",
    fileSize: "2.1 MB (PDF)",
    status: "READY",
    summary:
      "Log of 4,280 kg synthetic polymer nets hauled and loaded onto port reclamation trucks with serial RFID tags.",
  },
  {
    id: "REP-2026-0903-03",
    title: "Sanctuary Ecological Risk & Megafauna Safety Audit",
    type: "ECO_IMPACT",
    dateGenerated: "Sep 03, 2026 09:30 UTC",
    author: "Oceanis Risk Engine",
    fileSize: "8.4 MB (PDF + GeoJSON)",
    status: "READY",
    summary:
      "Drift simulation model calculating 79% cetacean entanglement probability in Papahānaumokuākea sanctuary approaches.",
  },
  {
    id: "REP-2026-0830-04",
    title: "EM-304 Multibeam Sonar Calibration & Backscatter Log",
    type: "ACOUSTIC_TELEMETRY",
    dateGenerated: "Aug 30, 2026 16:00 UTC",
    author: "Diagnostics Subsystem",
    fileSize: "14.2 MB (XYZ + CSV)",
    status: "ARCHIVED",
    summary:
      "Acoustic frequency response, gain curves, and point cloud raw echo data from 0m to 200m depth profiles.",
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report>(mockReports[0]);
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("ALL");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports =
    reportTypeFilter === "ALL"
      ? reports
      : reports.filter((r) => r.type === reportTypeFilter);

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
              <FileText className="w-4 h-4 text-zinc-300" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Reports & Briefings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              Export Center
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated executive briefings, IMO/NOAA compliance manifests, and geospatial telemetry export packages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsGenerating(true);
              setTimeout(() => {
                setIsGenerating(false);
              }, 1000);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            Generate Briefing
          </button>
        </div>
      </div>

      {/* Main Grid: Left Report List + Right Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Reports List (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">
                Generated Documents
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none font-mono"
              >
                <option value="ALL">All Report Types</option>
                <option value="EXECUTIVE_BRIEF">Executive Briefs</option>
                <option value="SALVAGE_MANIFEST">Salvage Manifests</option>
                <option value="ECO_IMPACT">Eco Impact Audits</option>
                <option value="ACOUSTIC_TELEMETRY">Telemetry Logs</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {filteredReports.map((rep) => {
              const isSelected = selectedReport.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-600 shadow-sm"
                      : "bg-zinc-900/50 border-zinc-800/70 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100">{rep.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2">{rep.summary}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 ${
                        rep.status === "READY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
                    <div className="flex items-center gap-2.5">
                      <span>{rep.dateGenerated}</span>
                      <span>•</span>
                      <span>By: <strong className="text-zinc-300">{rep.author}</strong></span>
                    </div>
                    <span className="text-zinc-300">{rep.fileSize}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Report Preview & Export Controls */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              Document Preview
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">{selectedReport.id}</span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Title
            </span>
            <div className="text-sm font-semibold text-zinc-100 mt-0.5">{selectedReport.title}</div>
            <div className="text-xs font-mono text-zinc-400 mt-1">{selectedReport.type}</div>
          </div>

          {/* Document Abstract & Meta */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3.5 space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase mb-1 font-mono">Summary</span>
              <p className="text-zinc-300 leading-relaxed">{selectedReport.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-zinc-400 font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block">Format</span>
                <span className="text-zinc-200">{selectedReport.fileSize}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Checksum</span>
                <span className="text-emerald-400">SHA-256 VALID</span>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-2 space-y-2 mt-auto">
            <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Download Briefing (PDF)
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button className="py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
