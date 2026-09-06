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

export default function ReportsAuditPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
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
        setReports(r.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load reports.');
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-slate-900">
              Audit Logs & Incident Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {filteredReports.length} recorded incident{filteredReports.length !== 1 ? 's' : ''} retrieved from GET /api/v1/reports
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => exportReportsCSV(reportsToExport)}
            disabled={filteredReports.length === 0}
            className="btn-pill-filter disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({selectedIds.size > 0 ? selectedIds.size : 'All'})</span>
          </button>

          <button
            onClick={() => downloadJSON(reportsToExport, 'ghostnet-audit-logs.json')}
            disabled={filteredReports.length === 0}
            className="btn-primary text-xs disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON ({selectedIds.size > 0 ? selectedIds.size : 'All'})</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Subheader Card ── */}
      <div className="light-saas-card p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 w-80 border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search report ID, frame, summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                severityFilter === sev ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="light-saas-card overflow-hidden p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Fetching reports...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center max-w-md mx-auto space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">API Connection Notice</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <button onClick={fetchReports} className="btn-primary-dark text-xs mt-2">
              Retry Query
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center max-w-md mx-auto space-y-2 text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No Matching Incident Reports</h3>
            <p className="text-xs">
              Try adjusting your search criteria or running a detection in the workstation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredReports.length && filteredReports.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const isExpanded = expandedId === report.report_id;
                  const isSelected = selectedIds.has(report.report_id);

                  return (
                    <React.Fragment key={report.report_id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : report.report_id)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(report.report_id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          <span className="font-mono">{report.report_id}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{report.frame_id}</td>
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
                        <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                          {report.detection_count}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{formatTs(report.created_at)}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{report.summary}</td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => downloadJSON(report, `${report.report_id}.json`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Export JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-y border-slate-200">
                          <td colSpan={8} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                  Autonomous Summary
                                </span>
                                <p className="text-slate-800 text-xs leading-relaxed">{report.summary}</p>
                              </div>

                              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1 text-xs font-mono">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                  Survey Geotag Info
                                </span>
                                <div className="flex justify-between text-slate-600">
                                  <span>Frame Source:</span>
                                  <span className="text-slate-900 font-bold">{report.frame_id}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>Severity Level:</span>
                                  <span className="text-red-600 font-bold">{report.highest_severity}</span>
                                </div>
                              </div>

                              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                  Actions
                                </span>
                                <button
                                  onClick={() => downloadJSON(report, `${report.report_id}.json`)}
                                  className="btn-pill-filter text-xs justify-center"
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
