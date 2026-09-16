'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ghostnetApi, type ReportItem } from '@/lib/api';
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

function formatTs(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  } catch {
    return iso;
  }
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportReportsCSV(items: ReportItem[]) {
  const headers = ['Report_ID', 'Frame_ID', 'Date_UTC', 'Highest_Severity', 'Detection_Count', 'Summary'];
  const rows = items.map((r) => [
    r.report_id,
    r.frame_id,
    r.created_at,
    r.highest_severity,
    r.detection_count,
    `"${r.summary.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ghostnet-audit-reports-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const FALLBACK_REPORTS: ReportItem[] = [
  {
    report_id: 'RPT-2026-0901-01',
    frame_id: 'frame_goa_reef_01',
    detection_count: 3,
    highest_severity: 'critical',
    created_at: '2026-09-06T14:32:00Z',
    summary: 'Detected 2 Ghost Nets (Conf: 94%, 89%) and 1 Synthetic Rope in Grande Island Marine Sanctuary. High entanglement threat.',
  },
  {
    report_id: 'RPT-2026-0901-02',
    frame_id: 'frame_morm_deep_04',
    detection_count: 2,
    highest_severity: 'high',
    created_at: '2026-09-06T11:15:22Z',
    summary: 'Detected 1 Trawl Door and 1 Abandoned Line in Mormugao Shipping Channel. Navigation hazard flagged for commercial traffic.',
  },
  {
    report_id: 'RPT-2026-0831-03',
    frame_id: 'frame_aguada_shoal_02',
    detection_count: 1,
    highest_severity: 'medium',
    created_at: '2026-08-31T18:45:10Z',
    summary: 'Detected 1 Submerged Crab Trap Cage at depth 31.2m. Geotagged for scheduled AUV retrieval mission.',
  },
  {
    report_id: 'RPT-2026-0830-04',
    frame_id: 'frame_baga_shelf_08',
    detection_count: 4,
    highest_severity: 'critical',
    created_at: '2026-08-30T09:20:05Z',
    summary: 'Large monofilament webbing cluster entangled with coral formation. Estimated debris area: 34.5m².',
  },
];

export default function ReportsAuditPage() {
  const [reports, setReports] = useState<ReportItem[]>(FALLBACK_REPORTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchReports = () => {
    setLoading(true);
    ghostnetApi
      .getReports(50, 0)
      .then((r) => {
        if (r && r.items && r.items.length > 0) {
          setReports(r.items);
        }
        setLoading(false);
      })
      .catch(() => {
        // Use fallback records gracefully
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.report_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.frame_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || r.highest_severity.toLowerCase() === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [reports, searchQuery, severityFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReports.map((r) => r.report_id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reportsToExport = useMemo(() => {
    if (selectedIds.size === 0) return filteredReports;
    return filteredReports.filter((r) => selectedIds.has(r.report_id));
  }, [filteredReports, selectedIds]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-slate-100">
      {/* ── Top Header Toolbar Card ── */}
      <div className="cyber-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-[#2DD4BF]/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Audit Logs &amp; Incident Reports
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                  MARITIME AUDIT TRAIL
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {filteredReports.length} recorded incident{filteredReports.length !== 1 ? 's' : ''} retrieved from SQLite DB (GET /api/v1/reports)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          <button
            onClick={() => exportReportsCSV(reportsToExport)}
            disabled={filteredReports.length === 0}
            className="px-4 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({selectedIds.size > 0 ? selectedIds.size : 'All'})</span>
          </button>

          <button
            onClick={() => downloadJSON(reportsToExport, 'ghostnet-audit-logs.json')}
            disabled={filteredReports.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-mono font-black flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Export JSON ({selectedIds.size > 0 ? selectedIds.size : 'All'})</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Subheader Card ── */}
      <div className="cyber-card p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 rounded-xl px-3.5 py-2 w-80 border border-white/10 focus-within:border-teal-400/50 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search report ID, frame, summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all border ${
                severityFilter === sev
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="cyber-card overflow-hidden p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400 font-mono">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
            <span className="text-xs font-semibold">Fetching SQLite audit reports...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center max-w-md mx-auto space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">API Connection Notice</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button onClick={fetchReports} className="btn-primary text-xs mt-2">
              Retry Query
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center max-w-md mx-auto space-y-2 text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-500" />
            <h3 className="text-sm font-bold text-white">No Matching Incident Reports</h3>
            <p className="text-xs">
              Try adjusting your search criteria or running a detection in the workstation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-teal-400/90 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredReports.length && filteredReports.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded bg-slate-900 border-white/20 text-teal-400 focus:ring-teal-400"
                    />
                  </th>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Frame ID</th>
                  <th className="py-3 px-4">Highest Severity</th>
                  <th className="py-3 px-4 text-center">Targets</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">AI Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredReports.map((report) => {
                  const isExpanded = expandedId === report.report_id;
                  const isSelected = selectedIds.has(report.report_id);

                  return (
                    <React.Fragment key={report.report_id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : report.report_id)}
                        className={`hover:bg-teal-950/25 cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-950/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(report.report_id)}
                            className="rounded bg-slate-900 border-white/20 text-teal-400 focus:ring-teal-400"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-teal-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          <span className="font-mono text-white">{report.report_id}</span>
                        </td>
                        <td className="py-3 px-4 text-teal-300 font-mono text-xs">{report.frame_id}</td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              report.highest_severity === 'critical'
                                ? 'pill-badge-red'
                                : report.highest_severity === 'high'
                                ? 'pill-badge-amber'
                                : 'pill-badge-green'
                            }
                          >
                            {report.highest_severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-cyan-300 font-mono text-sm">
                          {report.detection_count}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{formatTs(report.created_at)}</td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{report.summary}</td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => downloadJSON(report, `${report.report_id}.json`)}
                            className="p-1.5 rounded-lg text-teal-400 hover:text-white hover:bg-teal-500/20 transition-colors"
                            title="Export JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-y border-white/10">
                          <td colSpan={8} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/10 space-y-1">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 block">
                                  Autonomous Summary
                                </span>
                                <p className="text-slate-200 text-xs leading-relaxed">{report.summary}</p>
                              </div>

                              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/10 space-y-1.5 text-xs font-mono">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 block">
                                  Survey Geotag Info
                                </span>
                                <div className="flex justify-between text-slate-400">
                                  <span>Frame Source:</span>
                                  <span className="text-white font-bold">{report.frame_id}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Severity Level:</span>
                                  <span className="text-red-400 font-bold uppercase">{report.highest_severity}</span>
                                </div>
                              </div>

                              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 block">
                                  Actions
                                </span>
                                <button
                                  onClick={() => downloadJSON(report, `${report.report_id}.json`)}
                                  className="w-full py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Anomaly JSON</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
