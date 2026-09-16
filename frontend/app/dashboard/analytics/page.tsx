'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  RefreshCw,
  Target,
  Waves,
  Zap,
  BarChart3,
  Flame,
  ChevronRight,
  Sparkles,
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
  total_detections: 1573,
  total_mass_tonnage: 4.8,
  verified_resolution_pct: 94.2,
  active_swath_area_km2: 14.8,
  channels: [
    { name: 'Ghost Nets', count: 582, trend: '+4.2%', mass_kg: 2640 },
    { name: 'Synthetic Ropes', count: 624, trend: '-1.8%', mass_kg: 1350 },
    { name: 'Traps & Cages', count: 218, trend: '+0.5%', mass_kg: 580 },
    { name: 'Trawl Doors & Metal', count: 149, trend: '-2.1%', mass_kg: 230 },
  ],
  monthly_trends: [
    { month: 'Jan', actual: 142, target: 130 },
    { month: 'Feb', actual: 186, target: 160 },
    { month: 'Mar', actual: 215, target: 200 },
    { month: 'Apr', actual: 320, target: 280 },
    { month: 'May', actual: 275, target: 260 },
    { month: 'Jun', actual: 190, target: 180 },
    { month: 'Jul', actual: 245, target: 220 },
  ],
};

export default function SurveyAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState<string>('Apr');

  const loadData = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/overview`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.total_detections) {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxActual = Math.max(...data.monthly_trends.map((m) => Math.max(m.actual, m.target, 350)));
  const totalChannelCount = data.channels.reduce((a, c) => a + c.count, 0);
  const activeMonthData = data.monthly_trends.find((m) => m.month === activeMonth);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans text-gray-100">
      {/* ── Top Header Toolbar ── */}
      <div className="cyber-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-[#2DD4BF]/30">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Hydrographic Survey Analytics & ML Telemetry
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40">
                LIVE INTEL
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Multi-spectral sonar classification, volume estimation & EEZ recovery metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-[#2DD4BF]/20 text-gray-300 hover:text-[#2DD4BF] border border-white/10 hover:border-[#2DD4BF]/40 transition-all duration-300"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-xs font-bold text-[#2DD4BF] flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-[#2DD4BF] animate-pulse" />
            <span>2026 Hydrographic Grid</span>
          </div>
        </div>
      </div>

      {/* ── Top 4 KPI Metric Cards (3D Interactive Tilt Hover) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="cyber-card-interactive p-5 space-y-2 group">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>TOTAL DETECTIONS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ↗ +4.2%
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight group-hover:text-[#2DD4BF] transition-colors">
            {data.total_detections.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 font-medium">Acoustic returns classified</div>
        </div>

        <div className="cyber-card-interactive p-5 space-y-2 group">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>DEBRIS MASS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Critical
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight group-hover:text-[#2DD4BF] transition-colors">
            {data.total_mass_tonnage} t
          </div>
          <div className="text-xs text-gray-400 font-medium">Est. marine gear recoverable</div>
        </div>

        <div className="cyber-card-interactive p-5 space-y-2 group">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>SURVEY COVERAGE</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-300 border border-white/20">
              WGS-84
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight group-hover:text-[#2DD4BF] transition-colors">
            {data.active_swath_area_km2} km²
          </div>
          <div className="text-xs text-gray-400 font-medium">Bathymetric swath area</div>
        </div>

        <div className="cyber-card-interactive p-5 space-y-2 group">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>RESOLUTION RATE</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight group-hover:text-[#2DD4BF] transition-colors">
            {data.verified_resolution_pct}%
          </div>
          <div className="text-xs text-gray-400 font-medium">Verified detections cleared</div>
        </div>
      </div>

      {/* ── Main Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Debris Channel Performance */}
        <div className="lg:col-span-4 cyber-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-200">
                <Activity className="w-4 h-4 text-[#2DD4BF]" />
                <span>DEBRIS CHANNELS</span>
              </div>
              <button
                onClick={loadData}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#2DD4BF]/20 text-gray-400 hover:text-[#2DD4BF] transition-colors border border-white/10"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Radial segmented gauge */}
            <div className="py-4 flex flex-col items-center justify-center relative">
              <div className="relative w-56 h-30 flex items-end justify-center overflow-hidden">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 23) * Math.PI;
                    const x1 = 100 - Math.cos(angle) * 82;
                    const y1 = 100 - Math.sin(angle) * 82;
                    const x2 = 100 - Math.cos(angle) * 62;
                    const y2 = 100 - Math.sin(angle) * 62;
                    const total = data.channels.reduce((s, c) => s + c.count, 0);
                    const ghostNetShare = total > 0 ? (data.channels[0]?.count || 0) / total : 0.35;
                    const fillCount = Math.round(ghostNetShare * 24);
                    const isDark = i < fillCount;
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isDark ? '#2DD4BF' : '#1F2937'}
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="absolute bottom-1 flex flex-col items-center text-center">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {data.total_detections.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400">Total Targets</span>
                </div>
              </div>
            </div>

            {/* Channel breakdown list */}
            <div className="space-y-3 pt-2">
              {data.channels.map((channel, i) => {
                const share = totalChannelCount > 0 ? ((channel.count / totalChannelCount) * 100).toFixed(1) : '0';
                const isPositive = Boolean(channel.trend && channel.trend.startsWith('+'));
                return (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#2DD4BF]/40 transition-all flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-bold text-gray-200">
                        <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#2DD4BF]' : 'bg-gray-600'}`} />
                        <span>{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                        <span>{channel.count.toLocaleString()} targets</span>
                        <span>·</span>
                        <span className={isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                          {channel.trend || '+0.0%'}
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-black text-white font-mono">{share}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Monthly Detection Trend Chart */}
        <div className="lg:col-span-8 cyber-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-200">
                <TrendingUp className="w-4 h-4 text-[#2DD4BF]" />
                <span>MONTHLY DETECTION TRENDS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-xs font-mono font-bold text-[#2DD4BF]">
                  2026 Hydrographic Season
                </span>
              </div>
            </div>

            {/* Big stat + legend */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pt-2 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-white tracking-tight">
                  {activeMonthData ? activeMonthData.actual.toLocaleString() : '320'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  ↗ Verified Returns
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" />
                    <span className="text-gray-300">Actual Detections</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    <span>Survey Target</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-300 font-semibold">
                  <span>Selected: <strong className="text-[#2DD4BF] font-mono">{activeMonth}</strong></span>
                </div>
              </div>
            </div>

            {/* Bar + spline chart */}
            <div className="relative h-64 w-full mt-3">
              <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                {[40, 80, 120, 160].map((y) => (
                  <line key={y} x1="40" y1={y} x2="680" y2={y}
                    stroke="#374151" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Y-axis labels */}
                <text x="5" y="45" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">350</text>
                <text x="5" y="85" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">250</text>
                <text x="5" y="125" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">150</text>
                <text x="5" y="165" fill="#9CA3AF" fontSize="10" fontFamily="sans-serif">50</text>

                {/* Highlight active month column */}
                {data.monthly_trends.map((m, i) => {
                  const x = 60 + i * 100;
                  const isActive = m.month === activeMonth;
                  return isActive ? (
                    <rect key={i} x={x - 24} y="25" width="48" height="155"
                      fill="rgba(255,76,0,0.15)" rx="4" />
                  ) : null;
                })}

                {/* Target line */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.target / maxActual) * 135);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none" stroke="#4B5563" strokeWidth="2" strokeDasharray="5 3"
                />

                {/* Actual detection spline */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.actual / maxActual) * 135);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none" stroke="#2DD4BF" strokeWidth="3"
                />

                {/* Area fill */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.actual / maxActual) * 135);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')} L ${60 + (data.monthly_trends.length - 1) * 100} 170 L 60 170 Z`}
                  fill="url(#tealGradient)"
                />

                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Data points (clickable) */}
                {data.monthly_trends.map((m, i) => {
                  const x = 60 + i * 100;
                  const y = 170 - ((m.actual / maxActual) * 135);
                  const isActive = m.month === activeMonth;
                  return (
                    <circle key={i} cx={x} cy={y} r={isActive ? 7 : 4}
                      fill={isActive ? '#2DD4BF' : '#111827'}
                      stroke="#2DD4BF" strokeWidth="2.5"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveMonth(m.month)}
                    />
                  );
                })}
              </svg>

              {/* X-Axis month labels */}
              <div className="flex justify-between px-[3.5%] text-xs font-semibold text-gray-400 mt-2">
                {data.monthly_trends.map((m) => (
                  <button
                    key={m.month}
                    onClick={() => setActiveMonth(m.month)}
                    className={`w-12 py-1.5 rounded-lg text-center transition-all ${
                      m.month === activeMonth
                        ? 'text-white bg-[#2DD4BF] font-bold shadow-lg shadow-[#2DD4BF]/30'
                        : 'hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {m.month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

