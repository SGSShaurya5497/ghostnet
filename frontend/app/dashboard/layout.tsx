'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ghostnetApi } from '@/lib/api';
import {
  Scan,
  Waves,
  Target,
  Map,
  Flame,
  Navigation,
  CheckCircle2,
  BarChart3,
  ShieldAlert,
  SplitSquareVertical,
  Layers,
  FileText,
  Bell,
  Search,
  ChevronRight,
  Radio,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Route,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { name: 'AI Workstation', path: '/dashboard', icon: Scan },
      { name: 'Survey Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Sonar Hydrography', path: '/dashboard/sonar', icon: Waves },
      { name: 'Live Detections', path: '/dashboard/detections', icon: Target },
    ],
  },
  {
    title: 'Geospatial & Fleet',
    items: [
      { name: 'Survey Map', path: '/dashboard/map', icon: Map },
      { name: 'Debris Hotspots', path: '/dashboard/hotspots', icon: Flame },
      { name: 'Fleet Operations', path: '/dashboard/fleet', icon: Navigation },
      { name: 'Route Planning', path: '/dashboard/route', icon: Route },
      { name: 'Cleanup Missions', path: '/dashboard/cleanup', icon: CheckCircle2 },
    ],
  },
  {
    title: 'Intelligence & Audit',
    items: [
      { name: 'Risk Assessment', path: '/dashboard/risk', icon: ShieldAlert },
      { name: 'Sonar Comparison', path: '/dashboard/comparison', icon: SplitSquareVertical },
      { name: 'Depth Matrix', path: '/dashboard/depth', icon: Layers },
      { name: 'Reports & Logs', path: '/dashboard/reports', icon: FileText },
      { name: 'Alert Center', path: '/dashboard/alerts', icon: Bell },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Backend health & latency ping
  useEffect(() => {
    const check = async () => {
      const start = performance.now();
      try {
        const h = await ghostnetApi.checkHealth();
        const latency = Math.round(performance.now() - start);
        setModelLoaded(h.model_loaded);
        setBackendLatency(latency);
      } catch {
        setModelLoaded(false);
        setBackendLatency(null);
      }
    };
    check();
    const interval = setInterval(check, 15_000);
    return () => clearInterval(interval);
  }, []);

  // Command-K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allNavItems = useMemo(() => {
    return NAV_SECTIONS.flatMap((s) => s.items);
  }, []);

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    return allNavItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allNavItems, searchQuery]);

  const currentTitle = useMemo(() => {
    if (pathname === '/dashboard') return 'AI Workstation';
    const found = allNavItems.find((item) => item.path === pathname);
    return found ? found.name : 'Console';
  }, [pathname, allNavItems]);

  return (
    <div className="w-screen h-screen bg-[#EEF1F5] text-[#0F172A] flex flex-col overflow-hidden select-none font-sans">
      {/* ── Clean White Top SaaS Header Bar ── */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-40 shadow-sm">
        {/* Left: Brand Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                GhostNet
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  AI PRO
                </span>
              </span>
            </div>
          </Link>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => router.push('/dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">{currentTitle}</span>
          </nav>
        </div>

        {/* Center: Command Bar */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-xs text-slate-500 hover:text-slate-900 transition-all w-72 justify-between group border border-slate-200/60 shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>Search tools & telemetry...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600 shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Dropdowns & Status Pills (Matching Reference Image Header) */}
        <div className="flex items-center gap-3">
          {/* Quick Filter Pill Buttons from Screenshot */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="btn-pill-filter">
              <span>All Surveys</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button className="btn-pill-filter">
              <span>2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Backend Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                modelLoaded === true
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'
                  : modelLoaded === false
                  ? 'bg-slate-400'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-slate-700 font-semibold text-[11px]">
              {modelLoaded === true
                ? `YOLO-v8 (${backendLatency ?? 12}ms)`
                : modelLoaded === false
                ? 'Offline (Demo Mode)'
                : 'Connecting...'}
            </span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => router.push('/dashboard/alerts')}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* User / Exit Link */}
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors hidden sm:block"
            title="Overview"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Main Body: White SaaS Sidebar + Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Clean White Sidebar ── */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-200 z-30 shadow-xs`}
        >
          {/* Top Section Nav */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.path === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname?.startsWith(item.path);

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        {!sidebarCollapsed && (
                          <div className="flex-1 flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600 border border-red-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sidebar: Survey Vessel & Collapse */}
          <div className="p-3 border-t border-slate-200/80 space-y-2 bg-slate-50/50">
            {!sidebarCollapsed && (
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">RV-OCEANUS</span>
                    <span className="text-[10px] text-slate-500 font-mono">Survey IN-GOA-04</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="w-full py-2 flex items-center justify-center gap-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="text-xs font-medium">Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── Main Dynamic Page Content ── */}
        <main className="flex-1 overflow-y-auto bg-[#EEF1F5] p-6">
          {children}
        </main>
      </div>

      {/* ── Command Palette (⌘K) Modal ── */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a tool name or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
              <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredCommands.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-900">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.path}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
