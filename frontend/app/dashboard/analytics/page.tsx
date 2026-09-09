'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  RefreshCw,
  Target,
  Waves,
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans rounded-none">
      {/* ── Top 4 KPI Metric Cards (0 Curves, Solid Ocean Theme) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-none">
        <div className="light-saas-card p-5 space-y-1.5 rounded-none">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
            <span>TOTAL DETECTIONS</span>
            <span className="pill-badge-green text-[10px]">↗ +4.2%</span>
          </div>
          <div className="text-2xl font-black text-[#0E232B] tracking-tight">
            {data.total_detections.toLocaleString()}
          </div>
          <div className="text-xs text-[#526E78] font-medium">Acoustic returns classified</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5 rounded-none">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
            <span>DEBRIS MASS</span>
            <span className="pill-badge-red text-[10px]">Critical</span>
          </div>
          <div className="text-2xl font-black text-[#0E232B] tracking-tight">
            {data.total_mass_tonnage} t
          </div>
          <div className="text-xs text-[#526E78] font-medium">Est. marine gear recoverable</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5 rounded-none">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
            <span>SURVEY COVERAGE</span>
            <span className="pill-badge-neutral text-[10px] py-0 px-1.5">WGS-84</span>
          </div>
          <div className="text-2xl font-black text-[#0E232B] tracking-tight">
            {data.active_swath_area_km2} km²
          </div>
          <div className="text-xs text-[#526E78] font-medium">Bathymetric swath area</div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5 rounded-none">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#526E78]">
            <span>RESOLUTION RATE</span>
            <span className="pill-badge-green text-[10px]">Active</span>
          </div>
          <div className="text-2xl font-black text-[#0E232B] tracking-tight">
            {data.verified_resolution_pct}%
          </div>
          <div className="text-xs text-[#526E78] font-medium">Verified detections cleared</div>
        </div>
      </div>

      {/* ── Main Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-none">
        {/* Left: Debris Channel Performance */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between rounded-none">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#B8C9CC]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E232B]">
                <Activity className="w-4 h-4 text-[#075A73]" />
                <span>DEBRIS CHANNELS</span>
              </div>
              <button
                onClick={loadData}
                className="p-1.5 rounded-none bg-[#E5EDEE] hover:bg-[#B8C9CC] text-[#075A73] transition-colors border border-[#B8C9CC]"
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
                    const ghostNetShare = total > 0 ? (data.channels[0]?.count || 0) / total : 0.35;
                    const fillCount = Math.round(ghostNetShare * 24);
                    const isDark = i < fillCount;
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isDark ? '#075A73' : '#B8C9CC'}
                        strokeWidth="5"
                      />
                    );
                  })}
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center text-center">
                  <span className="text-2xl font-black tracking-tight text-[#0E232B]">
                    {data.total_detections.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-[#526E78]">Targets Detected</span>
                </div>
              </div>
            </div>

            {/* Channel breakdown list */}
            <div className="space-y-3 pt-2">
              {data.channels.map((channel, i) => {
                const share = totalChannelCount > 0 ? ((channel.count / totalChannelCount) * 100).toFixed(1) : '0';
                const isPositive = channel.trend.startsWith('+');
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#2A434D]">
                        <span className={`w-1.5 h-1.5 rounded-none ${i === 0 ? 'bg-[#075A73]' : 'bg-[#B8C9CC]'}`} />
                        <span>{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#526E78]">
                        <span>{channel.count.toLocaleString()} targets ({channel.mass_kg.toLocaleString()} kg)</span>
                        <span className={isPositive ? 'pill-badge-green text-[10px] py-0 px-1.5' : 'pill-badge-red text-[10px] py-0 px-1.5'}>
                          {channel.trend}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#0E232B] font-mono">{share}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Monthly Detection Trend Chart */}
        <div className="lg:col-span-8 light-saas-card p-6 flex flex-col justify-between rounded-none">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#B8C9CC]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E232B]">
                <TrendingUp className="w-4 h-4 text-[#075A73]" />
                <span>MONTHLY DETECTION TRENDS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="pill-badge-ocean text-xs font-mono font-bold rounded-none">2026 Hydrographic Season</span>
              </div>
            </div>

            {/* Big stat + legend */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#0E232B] tracking-tight">
                  {activeMonthData ? activeMonthData.actual.toLocaleString() : '320'}
                </span>
                <span className="pill-badge-green font-bold text-xs rounded-none">↗ Verified Returns</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-[#526E78] font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-none bg-[#075A73]" />
                    <span>Actual Detections</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-none bg-[#B8C9CC]" />
                    <span>Survey Target</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#2A434D] font-semibold">
                  <span>Selected Month: <strong className="text-[#075A73] font-mono">{activeMonth}</strong></span>
                </div>
              </div>
            </div>

            {/* Bar + spline chart */}
            <div className="relative h-60 w-full mt-3">
              <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                {[40, 80, 120, 160].map((y) => (
                  <line key={y} x1="40" y1={y} x2="680" y2={y}
                    stroke="#D1DEE0" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Y-axis labels */}
                <text x="5" y="45" fill="#526E78" fontSize="10" fontFamily="sans-serif">350</text>
                <text x="5" y="85" fill="#526E78" fontSize="10" fontFamily="sans-serif">250</text>
                <text x="5" y="125" fill="#526E78" fontSize="10" fontFamily="sans-serif">150</text>
                <text x="5" y="165" fill="#526E78" fontSize="10" fontFamily="sans-serif">50</text>

                {/* Highlight active month column */}
                {data.monthly_trends.map((m, i) => {
                  const x = 60 + i * 100;
                  const isActive = m.month === activeMonth;
                  return isActive ? (
                    <rect key={i} x={x - 24} y="25" width="48" height="155"
                      fill="rgba(7,90,115,0.12)" />
                  ) : null;
                })}

                {/* Target line (Ocean Mist Dashed) */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.target / maxActual) * 135);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none" stroke="#B8C9CC" strokeWidth="2" strokeDasharray="5 3"
                />

                {/* Actual detection spline (Deep Ocean Blue) */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.actual / maxActual) * 135);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none" stroke="#075A73" strokeWidth="2.5"
                />

                {/* Area fill */}
                <path
                  d={`M ${data.monthly_trends.map((m, i) => {
                    const x = 60 + i * 100;
                    const y = 170 - ((m.actual / maxActual) * 135);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')} L ${60 + (data.monthly_trends.length - 1) * 100} 170 L 60 170 Z`}
                  fill="rgba(7,90,115,0.08)"
                />

                {/* Data points (clickable) */}
                {data.monthly_trends.map((m, i) => {
                  const x = 60 + i * 100;
                  const y = 170 - ((m.actual / maxActual) * 135);
                  const isActive = m.month === activeMonth;
                  return (
                    <circle key={i} cx={x} cy={y} r={isActive ? 6 : 4}
                      fill={isActive ? '#075A73' : '#FFFFFF'}
                      stroke="#075A73" strokeWidth="2.5"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveMonth(m.month)}
                    />
                  );
                })}
              </svg>

              {/* Floating tooltip for active month */}
              {activeMonthData && (
                <div className="absolute top-2 right-4 dark-tooltip z-20 pointer-events-none rounded-none">
                  <div className="font-bold text-white mb-1.5">{activeMonth} 2026</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-[#B8C9CC]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-none bg-[#B8C9CC]" />
                        <span>Target</span>
                      </span>
                      <span className="font-bold text-white font-mono">{activeMonthData.target} targets</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-[#B8C9CC]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-none bg-white" />
                        <span>Detected</span>
                      </span>
                      <span className="font-bold text-white font-mono">{activeMonthData.actual} targets</span>
                    </div>
                  </div>
                </div>
              )}

              {/* X-Axis month labels */}
              <div className="flex justify-between px-[3.5%] text-[11px] font-medium text-[#526E78] mt-2">
                {data.monthly_trends.map((m) => (
                  <button
                    key={m.month}
                    onClick={() => setActiveMonth(m.month)}
                    className={`w-12 py-1 rounded-none text-center transition-colors ${
                      m.month === activeMonth
                        ? 'text-[#075A73] bg-[#E5EDEE] font-bold border border-[#075A73]'
                        : 'hover:text-[#0E232B] hover:bg-[#E5EDEE]'
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
