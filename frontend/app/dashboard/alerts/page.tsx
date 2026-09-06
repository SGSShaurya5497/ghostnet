'use client';

import React, { useState } from 'react';
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
  Bell,
  CheckCircle2,
  ChevronRight,
  Search,
} from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  source: string;
  severity: 'critical' | 'high' | 'medium';
  lat: number;
  lon: number;
  depth: number;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  confidence: number;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1049',
    title: 'High-Density Ghost Net Snag Detected',
    source: 'RV-OCEANUS Acoustic Sonar',
    severity: 'critical',
    lat: 15.4989,
    lon: 73.8278,
    depth: 42.5,
    timestamp: '2 mins ago',
    status: 'Active',
    confidence: 0.94,
  },
  {
    id: 'ALT-1044',
    title: 'Unregistered Dark Vessel Drift in Marine Reserve',
    source: 'AIS Radar + Satellite Bathymetry',
    severity: 'high',
    lat: 15.512,
    lon: 73.834,
    depth: 38.0,
    timestamp: '14 mins ago',
    status: 'Active',
    confidence: 0.88,
  },
  {
    id: 'ALT-1038',
    title: 'Submerged Trawl Door Entanglement Alert',
    source: 'AUV-NEPTUNE-02 Swath',
    severity: 'critical',
    lat: 15.441,
    lon: 73.782,
    depth: 54.2,
    timestamp: '36 mins ago',
    status: 'Acknowledged',
    confidence: 0.91,
  },
  {
    id: 'ALT-1029',
    title: 'Repeated Polypropylene Line Echo Cluster',
    source: 'Synthetic Hydrographic Survey',
    severity: 'medium',
    lat: 15.534,
    lon: 73.856,
    depth: 29.8,
    timestamp: '1 hour ago',
    status: 'Resolved',
    confidence: 0.79,
  },
];

export default function AnomalyAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(INITIAL_ALERTS[0].id);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) ?? alerts[0];

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const criticalActiveCount = alerts.filter((a) => a.status === 'Active' && (a.severity === 'critical' || a.severity === 'high')).length;

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'Active' ? 'Acknowledged' : 'Resolved' } : a))
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Real-time Threat & Anomaly Alert Center
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Autonomous warning triggers across marine corridors and surveyed reefs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {criticalActiveCount > 0 ? (
            <div className="pill-badge-red text-xs py-1 px-3">
              <span>{criticalActiveCount} Critical/High Alert{criticalActiveCount !== 1 ? 's' : ''} Active</span>
            </div>
          ) : (
            <div className="pill-badge-green text-xs py-1 px-3">
              <span>All Clear</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main View: Alert Feed + Detail (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alert List (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 w-72 border border-slate-200/80">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts, vessels, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filterSeverity === s ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlertId;

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-300 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : alert.severity === 'high'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">{alert.id}</span>
                        <span className="text-xs font-semibold text-slate-800">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>{alert.source}</span>
                        <span>·</span>
                        <span>{alert.depth}m Depth</span>
                        <span>·</span>
                        <span className="pill-badge-neutral text-[10px] py-0 px-1.5">{alert.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">
                        {(alert.confidence * 100).toFixed(0)}% Conf
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{alert.timestamp}</span>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Alert Inspector (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-black font-mono text-slate-900">{selectedAlert.id}</span>
                <span className="text-xs font-bold text-slate-700 block">{selectedAlert.title}</span>
              </div>
              <span
                className={
                  selectedAlert.severity === 'critical'
                    ? 'pill-badge-red'
                    : selectedAlert.severity === 'high'
                    ? 'pill-badge-amber'
                    : 'pill-badge-green'
                }
              >
                {selectedAlert.severity.toUpperCase()}
              </span>
            </div>

            {/* Geolocation Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Anomaly Coordinates
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                  <span className="font-bold text-slate-900">{selectedAlert.lat}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                  <span className="font-bold text-slate-900">{selectedAlert.lon}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">DEPTH</span>
                  <span className="font-bold text-slate-900">{selectedAlert.depth} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">CONFIDENCE</span>
                  <span className="font-bold text-emerald-600">{(selectedAlert.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Workflow Response
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Incident Status:</span>
                <span className="pill-badge-blue">{selectedAlert.status}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Trigger Source:</span>
                <span className="font-bold text-slate-900">{selectedAlert.source}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => acknowledgeAlert(selectedAlert.id)}
            className="w-full btn-primary-dark text-xs justify-center"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {selectedAlert.status === 'Active'
                ? 'Acknowledge Alert'
                : selectedAlert.status === 'Acknowledged'
                ? 'Mark as Resolved'
                : 'Reopen Alert'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
