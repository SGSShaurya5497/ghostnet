'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ghostnetApi } from '@/lib/api';
import {
  Scan,
  Waves,
  Target,
  Map,
  CheckCircle2,
  BarChart3,
  Search,
  ChevronRight,
  Radio,
  ShieldCheck,
  ChevronDown,
  ArrowUpRight,
  Check,
  Filter,
  Calendar,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
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
    title: 'Geospatial & Missions',
    items: [
      { name: 'Survey Map', path: '/dashboard/map', icon: Map },
      { name: 'Cleanup Missions', path: '/dashboard/cleanup', icon: CheckCircle2 },
    ],
  },
];


const SURVEY_OPTIONS = [
  { id: 'all', label: 'All Surveys', desc: 'All coastal corridors & survey zones' },
  { id: 'bob', label: 'Bay of Bengal Corridor', desc: 'East coast transects (11°N - 21°N)' },
  { id: 'goa', label: 'Goa Continental Shelf', desc: 'West coast acoustic survey (15°N)' },
  { id: 'mannar', label: 'Gulf of Mannar Transect', desc: 'Shallow reef conservation zone' },
  { id: 'palk', label: 'Palk Strait Survey', desc: 'Trans-boundary fishing corridor' },
  { id: 'andaman', label: 'Andaman Ridge Survey', desc: 'Deep trench & island reef grid' },
];

const YEAR_OPTIONS = [
  { year: '2026', desc: 'Current Active Hydrographic Season' },
  { year: '2025', desc: 'Archived Acoustic Survey Runs' },
  { year: '2024', desc: 'Historical Baseline Corridors' },
  { year: '2023', desc: 'Legacy Sonar Calibration Data' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [modelLoaded, setModelLoaded] = useState<boolean | null>(null);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  // Interactive Header Dropdown States
  const [selectedSurvey, setSelectedSurvey] = useState<string>('All Surveys');
  const [isSurveyDropdownOpen, setIsSurveyDropdownOpen] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);

  const surveyDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        surveyDropdownRef.current &&
        !surveyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSurveyDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setIsSurveyDropdownOpen(false);
        setIsYearDropdownOpen(false);
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
    <div className="w-screen h-screen bg-[#F2F6F7] text-[#0E232B] flex flex-col overflow-hidden select-none font-sans rounded-none">
      {/* ── Solid Header Bar (0 Curves, Solid Ocean Theme) ── */}
      <header className="h-16 shrink-0 bg-white border-b border-[#B8C9CC] flex items-center justify-between px-6 z-40 shadow-none rounded-none">
        {/* Left: Brand Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90 rounded-none"
          >
            <div className="w-8 h-8 rounded-none bg-[#075A73] flex items-center justify-center text-white">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#075A73] flex items-center gap-1.5">
                GhostNet
                <span className="text-[10px] px-1.5 py-0.2 rounded-none font-bold bg-[#E5EDEE] text-[#075A73] border border-[#B8C9CC]">
                  AI PRO
                </span>
              </span>
            </div>
          </Link>

          <div className="h-4 w-px bg-[#B8C9CC] mx-1 hidden sm:block" />

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-[#526E78]">
            <span className="hover:text-[#075A73] transition-colors cursor-pointer" onClick={() => router.push('/dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#849EAA]" />
            <span className="text-[#075A73] font-bold">{currentTitle}</span>
          </nav>
        </div>

        {/* Center: Command Bar */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-white hover:bg-[#E5EDEE] text-xs text-[#526E78] hover:text-[#075A73] transition-all w-72 justify-between group border border-[#B8C9CC]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#849EAA] group-hover:text-[#075A73] transition-colors" />
              <span>Search tools & telemetry...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] text-[10px] font-mono text-[#075A73]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Dropdowns & Status Pills */}
        <div className="flex items-center gap-3">
          {/* Quick Filter Interactive Dropdown Pill Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Survey Filter Dropdown */}
            <div className="relative" ref={surveyDropdownRef}>
              <button
                onClick={() => {
                  setIsSurveyDropdownOpen((prev) => !prev);
                  setIsYearDropdownOpen(false);
                }}
                className={`btn-pill-filter text-xs rounded-none ${
                  isSurveyDropdownOpen ? 'bg-[#E5EDEE] border-[#075A73] text-[#075A73]' : ''
                }`}
                title="Select Active Survey Region"
              >
                <Filter className="w-3.5 h-3.5 text-[#075A73]" />
                <span className="font-semibold">{selectedSurvey}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#526E78] transition-transform duration-150 ${isSurveyDropdownOpen ? 'rotate-180 text-[#075A73]' : ''}`} />
              </button>

              {/* Survey Dropdown Popover */}
              {isSurveyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-none border border-[#075A73] shadow-md py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#075A73] bg-[#E5EDEE] border-b border-[#B8C9CC]">
                    Select Survey Corridor
                  </div>
                  {SURVEY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedSurvey(opt.label);
                        setIsSurveyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 text-xs transition-colors rounded-none hover:bg-[#E5EDEE] ${
                        selectedSurvey === opt.label ? 'bg-[#E5EDEE] font-bold text-[#075A73]' : 'text-[#2A434D]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-[10px] text-[#526E78] font-normal leading-tight mt-0.5">{opt.desc}</div>
                      </div>
                      {selectedSurvey === opt.label && (
                        <Check className="w-3.5 h-3.5 text-[#075A73] shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Filter Dropdown */}
            <div className="relative" ref={yearDropdownRef}>
              <button
                onClick={() => {
                  setIsYearDropdownOpen((prev) => !prev);
                  setIsSurveyDropdownOpen(false);
                }}
                className={`btn-pill-filter text-xs rounded-none ${
                  isYearDropdownOpen ? 'bg-[#E5EDEE] border-[#075A73] text-[#075A73]' : ''
                }`}
                title="Select Survey Year"
              >
                <Calendar className="w-3.5 h-3.5 text-[#075A73]" />
                <span className="font-semibold">{selectedYear}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#526E78] transition-transform duration-150 ${isYearDropdownOpen ? 'rotate-180 text-[#075A73]' : ''}`} />
              </button>

              {/* Year Dropdown Popover */}
              {isYearDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-none border border-[#075A73] shadow-md py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#075A73] bg-[#E5EDEE] border-b border-[#B8C9CC]">
                    Select Hydrographic Year
                  </div>
                  {YEAR_OPTIONS.map((y) => (
                    <button
                      key={y.year}
                      onClick={() => {
                        setSelectedYear(y.year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors rounded-none hover:bg-[#E5EDEE] ${
                        selectedYear === y.year ? 'bg-[#E5EDEE] font-bold text-[#075A73]' : 'text-[#2A434D]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold font-mono">{y.year}</div>
                        <div className="text-[10px] text-[#526E78] font-normal">{y.desc}</div>
                      </div>
                      {selectedYear === y.year && (
                        <Check className="w-3.5 h-3.5 text-[#075A73] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Backend Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-none bg-white border border-[#B8C9CC] text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-none ${
                modelLoaded === true
                  ? 'bg-emerald-600 animate-pulse'
                  : modelLoaded === false
                  ? 'bg-[#849EAA]'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-[#0E232B] font-semibold text-[11px]">
              {modelLoaded === true
                ? `YOLO-v8 (${backendLatency ?? 12}ms)`
                : modelLoaded === false
                ? 'Offline (Demo Mode)'
                : 'Connecting...'}
            </span>
          </div>

          {/* User / Exit Link */}
          <Link
            href="/"
            className="p-2 rounded-none bg-white hover:bg-[#E5EDEE] text-[#075A73] transition-colors hidden sm:block border border-[#B8C9CC]"
            title="Overview"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Main Body: Hover-Expanding Sidebar + Workspace ── */}
      <div className="flex-1 flex overflow-hidden rounded-none">
        {/* ── Hover-Expanding Sidebar Menu (0 Curves) ── */}
        <aside
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`${
            isSidebarHovered ? 'w-64 shadow-lg' : 'w-[72px]'
          } shrink-0 bg-white border-r border-[#B8C9CC] flex flex-col justify-between transition-all duration-300 ease-out z-30 select-none rounded-none`}
        >
          {/* Top Section Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5 rounded-none">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1 rounded-none">
                {/* Section Title (Fades in on expansion) */}
                <div
                  className={`px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#075A73] font-mono transition-opacity duration-200 ${
                    isSidebarHovered ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  {section.title}
                </div>

                <div className="space-y-1 rounded-none">
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
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-none text-xs font-bold transition-all duration-150 transform ${
                          isActive
                            ? 'bg-[#075A73] text-white shadow-sm'
                            : 'text-[#2A434D] hover:text-[#0E232B] hover:bg-[#E5EDEE]'
                        } ${
                          isSidebarHovered
                            ? 'hover:scale-[1.03] origin-left'
                            : 'justify-center px-0 hover:scale-110 origin-center'
                        }`}
                        title={!isSidebarHovered ? item.name : undefined}
                      >
                        <div
                          className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#E5EDEE] group-hover:bg-[#B8C9CC] text-[#075A73]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        {/* Text (visible when sidebar expands) */}
                        {isSidebarHovered && (
                          <div className="flex-1 flex items-center justify-between min-w-0 transition-opacity duration-200 rounded-none">
                            <span className="truncate text-xs font-semibold group-hover:font-bold">{item.name}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sidebar: Acoustic System Widget */}
          <div className="p-2.5 border-t border-[#B8C9CC] bg-[#E5EDEE] space-y-1.5 rounded-none">
            {isSidebarHovered ? (
              <div className="p-2.5 rounded-none bg-white border border-[#B8C9CC] space-y-1.5 transition-all">
                <div className="flex items-center justify-between rounded-none">
                  <div className="flex items-center gap-1.5 rounded-none">
                    <div className="w-5 h-5 rounded-none bg-[#E5EDEE] text-[#075A73] flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#075A73]">RV-OCEANUS</span>
                  </div>
                  <span className="w-2 h-2 rounded-none bg-emerald-600 animate-pulse" />
                </div>
                <div className="text-[10px] text-[#526E78] font-mono space-y-0.5 border-t border-[#D1DEE0] pt-1.5 rounded-none">
                  <div className="flex justify-between">
                    <span>Acoustic:</span>
                    <strong className="text-[#0E232B]">455 kHz CHIRP</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS Fix:</span>
                    <strong className="text-emerald-700">12 Sats (WGS-84)</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-full flex justify-center py-2 text-[#526E78] hover:text-[#075A73] transition-colors rounded-none"
                title="Hover to expand menu & telemetry"
              >
                <div className="w-2 h-2 rounded-none bg-emerald-600 animate-pulse" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Dynamic Page Content ── */}
        <main className="flex-1 overflow-y-auto bg-[#F2F6F7] p-6 rounded-none">
          {children}
        </main>
      </div>

      {/* ── Command Palette (⌘K) Modal (0 Curves) ── */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 bg-[#075A73]/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4 rounded-none"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-none shadow-xl border border-[#075A73] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#B8C9CC] rounded-none">
              <Search className="w-4 h-4 text-[#075A73] shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a tool name or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-[#0E232B] placeholder-[#849EAA] outline-none rounded-none"
              />
              <kbd className="px-1.5 py-0.5 rounded-none bg-[#E5EDEE] border border-[#B8C9CC] text-xs font-mono text-[#075A73]">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1 rounded-none">
              {filteredCommands.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-none text-xs text-[#2A434D] hover:text-[#075A73] hover:bg-[#E5EDEE] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 rounded-none">
                      <Icon className="w-3.5 h-3.5 text-[#075A73]" />
                      <span className="font-semibold text-[#0E232B]">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#849EAA]">
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

