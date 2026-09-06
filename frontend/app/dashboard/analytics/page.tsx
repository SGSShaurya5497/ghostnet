'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Waves,
  ShieldAlert,
  Layers,
  Sparkles,
  RefreshCw,
  Target,
  CheckCircle2,
} from 'lucide-react';

interface DebrisChannel {
  name: string;
  count: number;
  trend: string;
  mass_kg: number;
}

interface MonthlyTrend {
  month: string;
  actual: number;
  target: number;
}

interface AnalyticsData {
  total_detections: number;
  total_mass_tonnage: number;
  verified_resolution_pct: number;
  active_swath_area_km2: number;
  channels: DebrisChannel[];
  monthly_trends: MonthlyTrend[];
}

const FALLBACK_DATA: AnalyticsData = {
  total_detections: 16432,
  total_mass_tonnage: 41.7,
  verified_resolution_pct: 96.4,
  active_swath_area_km2: 14.8,
  channels: [
    { name: 'Ghost Nets', count: 5762, trend: '+1.8%', mass_kg: 24150 },
    { name: 'Synthetic Ropes', count: 6843, trend: '-2.8%', mass_kg: 11200 },
    { name: 'Traps & Cages', count: 2123, trend: '-2.8%', mass_kg: 4850 },
    { name: 'Trawl Doors & Metal', count: 1704, trend: '+0.4%', mass_kg: 1500 },
  ],
  monthly_trends: [
    { month: 'Jan', actual: 12000, target: 11000 },
    { month: 'Feb', actual: 14000, target: 13000 },
    { month: 'Mar', actual: 13000, target: 15000 },
    { month: 'Apr', actual: 20000, target: 22000 },
    { month: 'May', actual: 18000, target: 19000 },
    { month: 'Jun', actual: 16000, target: 17000 },
    { month: 'Jul', actual: 15000, target: 16000 },
  ],
};

// Recent survey activity feed (static for now)
const RECENT_ACTIVITY = [
  {
    id: 'GNET-8821',
    label: 'Synthetic Gillnet Cluster',
    vessel: 'RV-OCEANUS',
    time: '4 mins ago',
    severity: 'critical',
  },
  {
    id: 'GNET-8819',
    label: 'Abandoned Polypropylene Line',
    vessel: 'AUV-NEPTUNE-02',
    time: '18 mins ago',
    severity: 'high',
  },
  {
    id: 'GNET-8815',
    label: 'Snagged Trawl Net on Reef',
    vessel: 'RV-OCEANUS',
    time: '32 mins ago',
    severity: 'critical',
  },
];

export default function SurveyAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState<string>('Apr');

  const loadData = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/overview`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        // silently use fallback
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxActual = Math.max(...data.monthly_trends.map((m) => m.actual));
  const totalChannelCount = data.channels.reduce((a, c) => a + c.count, 0);

  const activeMonthData = data.monthly_trends.find((m) => m.month === activeMonth);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top 4 KPI Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>TOTAL DETECTIONS</span>
            <span className="pill-badge-green text-[10px]">↗ +1.8%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {data.total_detections.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium">Acoustic returns classified</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>DEBRIS MASS</span>
            <span className="pill-badge-red text-[10px]">Critical</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {data.total_mass_tonnage} t
          </div>
          <div className="text-xs text-slate-500 font-medium">Est. marine gear recoverable</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>SURVEY COVERAGE</span>
            <span className="pill-badge-neutral text-[10px] py-0 px-1.5">WGS-84</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {data.active_swath_area_km2} km²
          </div>
          <div className="text-xs text-slate-500 font-medium">Bathymetric swath area</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>RESOLUTION RATE</span>
            <span className="pill-badge-green text-[10px]">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {data.verified_resolution_pct}%
          </div>
          <div className="text-xs text-slate-500 font-medium">Verified detections cleared</div>
        </div>
      </div>

      {/* ── Main Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Debris Channel Performance */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Activity className="w-4 h-4 text-slate-800" />
                <span>DEBRIS CHANNELS</span>
              </div>
              <button
                onClick={loadData}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Radial segmented gauge */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="relative w-52 h-28 flex items-end justify-center overflow-hidden">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 23) * Math.PI;
                    const x1 = 100 - Math.cos(angle) * 82;
                    const y1 = 100 - Math.sin(angle) * 82;
                    const x2 = 100 - Math.cos(angle) * 62;
                    const y2 = 100 - Math.sin(angle) * 62;
                    const total = data.channels.reduce((s, c) => s + c.count, 0);
                    const ghostNetShare = data.channels[0]?.count / total;
                    const fillCount = Math.round(ghostNetShare * 24);
                    const isDark = i < fillCount;
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isDark ? '#1E293B' : '#E2E8F0'}
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center text-center">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    {data.total_detections.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Targets Detected</span>
                </div>
              </div>
            </div>

            {/* Channel breakdown list */}
            <div className="space-y-3 pt-2">
              {data.channels.map((channel, i) => {
                const share = ((channel.count / totalChannelCount) * 100).toFixed(1);
                const isPositive = channel.trend.startsWith('+');
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-slate-900' : 'bg-slate-400'}`} />
                        <span>{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{channel.count.toLocaleString()} detections</span>
                        <span className={isPositive ? 'pill-badge-green text-[10px] py-0 px-1.5' : 'pill-badge-red text-[10px] py-0 px-1.5'}>
                          {channel.trend}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{share}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Monthly Detection Trend Chart */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <TrendingUp className="w-4 h-4 text-slate-800" />
                <span>MONTHLY DETECTION TRENDS</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-pill-filter">
                  <span>2026</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button className="btn-pill-filter">
                  <span>All Debris Types</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={loadData}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Big stat + legend */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeMonthData ? activeMonthData.actual.toLocaleString() : '20,000'}
                </span>
                <span className="pill-badge-green font-bold text-xs">↗ Acoustic Returns</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Actual Detections</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>Survey Target</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span>Active Month: <strong className="text-slate-900">{activeMonth}</strong></span>
                </div>
              </div>
            </div>

            {/* Bar + spline chart */}
            <div className="relative h-56 w-full mt-2">
              <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                {[40, 80, 120, 160].map((y) => (
                  <line key={y} x1="40" y1={y} x2="680" y2={y}
                    stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Y-axis labels */}
                <text x="5" y="45" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">25k</text>
                <text x="5" y="85" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">20k</text>
                <text x="5" y="125" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">15k</text>
                <text x="5" y="165" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">10k</text>

                {/* Highlight active month column */}
                {data.monthly_trends.map((m, i) => {
                  const x = 60 + i * 100;
                  const isActive = m.month === activeMonth;
                  return isActive ? (
                    <rect key={i} x={x - 20} y="30" width="40" height="150"
                      fill="rgba(37,99,235,0.10)" rx="8" />
                  ) : null;
                })}

                {/* Target line (grey dashed) */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.target / maxActual) * 130);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5 3"
                />

                {/* Actual detection spline */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.actual / maxActual) * 130);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none" stroke="#2563EB" strokeWidth="2.5"
                />

                {/* Area fill */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.actual / maxActual) * 130);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')} L ${60 + (data.monthly_trends.length - 1) * 100} 170 L 60 170 Z`}
                  fill="rgba(37,99,235,0.06)"
                />

                {/* Data points (clickable) */}
                {data.monthly_trends.map((m, i) => {
                  const x = 60 + i * 100;
                  const y = 170 - ((m.actual / maxActual) * 130);
                  const isActive = m.month === activeMonth;
                  return (
                    <circle key={i} cx={x} cy={y} r={isActive ? 6 : 4}
                      fill={isActive ? '#2563EB' : '#FFFFFF'}
                      stroke="#2563EB" strokeWidth="2.5"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveMonth(m.month)}
                    />
                  );
                })}
              </svg>

              {/* Floating tooltip for active month */}
              {activeMonthData && (
                <div className="absolute top-2 right-4 dark-tooltip z-20 pointer-events-none">
                  <div className="font-bold text-slate-200 mb-1.5">{activeMonth} 2026</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Target</span>
                      </span>
                      <span className="font-bold text-white">{activeMonthData.target.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Detected</span>
                      </span>
                      <span className="font-bold text-white">{activeMonthData.actual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* X-Axis month labels */}
              <div className="flex justify-between px-[3.5%] text-[11px] font-medium text-slate-400 mt-1">
                {data.monthly_trends.map((m) => (
                  <button
                    key={m.month}
                    onClick={() => setActiveMonth(m.month)}
                    className={`w-12 text-center transition-colors ${m.month === activeMonth ? 'text-slate-900 font-bold' : 'hover:text-slate-700'}`}
                  >
                    {m.month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Activity, Top Debris Classes, Coverage Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Survey Activity */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Clock className="w-4 h-4 text-slate-800" />
                <span>RECENT DETECTIONS</span>
              </div>
              <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {RECENT_ACTIVITY.map((item) => (
                <div key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                      item.severity === 'critical'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {item.id} · <span className="text-slate-500">{item.time}</span>
                      </span>
                    </div>
                  </div>
                  <span className={item.severity === 'critical' ? 'pill-badge-red text-[10px]' : 'pill-badge-amber text-[10px]'}>
                    {item.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Debris Classes Bar Chart */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Layers className="w-4 h-4 text-slate-800" />
                <span>DEBRIS BY MASS (KG)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="btn-pill-filter text-xs py-1 px-2.5">
                  <span>2026</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium pt-1">
              <span>Total Recoverable:</span>
              <strong className="text-slate-900">{(data.total_mass_tonnage * 1000).toLocaleString()} kg</strong>
            </div>

            {/* Horizontal bar chart */}
            <div className="space-y-3 pt-2">
              {data.channels.map((channel, i) => {
                const maxMass = Math.max(...data.channels.map(c => c.mass_kg));
                const pct = (channel.mass_kg / maxMass) * 100;
                const colors = ['bg-blue-600', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-400'];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">{channel.name}</span>
                      <span className="font-bold text-slate-900 font-mono">{channel.mass_kg.toLocaleString()} kg</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[i]} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Survey Coverage Activity Grid */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Waves className="w-4 h-4 text-slate-800" />
                <span>SURVEY COVERAGE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="btn-pill-filter text-xs py-1 px-2.5">
                  <span>Weekly</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{data.active_swath_area_km2}</span>
              <span className="pill-badge-green font-bold text-xs">↗ km²</span>
              <span className="text-xs text-slate-400 font-medium">Active Swath</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>RV-OCEANUS:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  14.8 km² <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>AUV-NEPTUNE-02:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  6.4 km² <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>ROV-TRITON-X:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  0 km² <span className="w-2 h-2 rounded-full bg-slate-300" />
                </span>
              </div>
            </div>

            {/* Sonar ping activity heatmap */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-6 gap-1.5 items-center text-[10px] font-medium text-slate-400">
                <span />
                <span className="text-center">Mon</span>
                <span className="text-center">Tue</span>
                <span className="text-center">Wed</span>
                <span className="text-center">Thu</span>
                <span className="text-center">Fri</span>
              </div>

              {[
                { label: '06-12h', cells: ['bg-slate-100', 'bg-blue-600', 'bg-slate-100', 'bg-blue-300', 'bg-blue-600'] },
                { label: '12-18h', cells: ['bg-blue-600', 'bg-slate-100', 'bg-blue-200', 'bg-blue-600', 'bg-slate-100'] },
                { label: '18-24h', cells: ['bg-slate-100', 'bg-blue-600', 'bg-blue-200', 'bg-slate-100', 'bg-blue-600'] },
              ].map((row, ri) => (
                <div key={ri} className="grid grid-cols-6 gap-1.5 items-center my-1.5">
                  <span className="font-mono text-[9px] text-slate-400 truncate">{row.label}</span>
                  {row.cells.map((bg, ci) => (
                    <div key={ci} className={`h-5 rounded-md ${bg}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
