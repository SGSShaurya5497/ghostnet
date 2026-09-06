"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Layers,
  Compass,
  Activity,
  Flame,
  Waves,
  ShieldAlert,
  GitCompare,
  FileText,
  TrendingUp,
  Anchor,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Navigation Items matching the reference design exactly
  const navItems = [
    { name: "Overview", icon: <Layers className="w-4 h-4" />, path: "/dashboard" },
    { name: "Map", icon: <Compass className="w-4 h-4" />, path: "/dashboard/map" },
    { name: "Anomaly Alerts", icon: <ShieldAlert className="w-4 h-4" />, badge: "5", path: "/dashboard/alerts" },
    { name: "Hotspots", icon: <Flame className="w-4 h-4" />, path: "/dashboard/hotspots" },
    { name: "Depth Analysis", icon: <Waves className="w-4 h-4" />, path: "/dashboard/depth" },
    { name: "Risk Scoring", icon: <Activity className="w-4 h-4" />, path: "/dashboard/risk" },
    { name: "Cleanup Priority", icon: <Anchor className="w-4 h-4" />, path: "/dashboard/cleanup" },
    { name: "Route Planning", icon: <Compass className="w-4 h-4" />, path: "/dashboard/route" },
    { name: "Survey Analytics", icon: <TrendingUp className="w-4 h-4" />, path: "/dashboard/analytics" },
    { name: "Survey Comparison", icon: <GitCompare className="w-4 h-4" />, path: "/dashboard/comparison" },
    { name: "Reports", icon: <FileText className="w-4 h-4" />, path: "/dashboard/reports" },
  ];

  return (
    <div className="w-screen h-screen bg-[#060b18] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP HEADER BAR (Persistent across all tabs) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="h-16 px-6 bg-[#091124]/90 border-b border-cyan-950/80 flex items-center justify-between z-30 shrink-0 backdrop-blur-xl">
        {/* Brand Logo - Clicking returns to Dashboard Overview */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-60 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          </div>
          <span className="font-extrabold font-mono tracking-widest text-sm uppercase text-white drop-shadow group-hover:text-cyan-300 transition-colors">
            OCEAN INTEL
          </span>
        </Link>

        {/* Center Search Input (Glassmorphic) */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locations, vessels, anomalies..."
              className="w-full bg-[#050c1e]/80 border border-cyan-900/40 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* Right Header Status & Actions */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-300 hidden sm:inline-block">
            Fri, 6 Sep 2026 &nbsp;<strong className="text-white">17:24 IST</strong>
          </span>

          <button
            title="Notifications"
            className="p-2 rounded-xl bg-[#0b162c] border border-cyan-900/50 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all shadow-md"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Live Indicator Capsule */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#052e2e]/90 border border-emerald-500/50 text-emerald-400 text-xs font-bold font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>Live</span>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN BODY: PERSISTENT LEFT SIDEBAR + TAB CONTENT */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* ── LEFT NAVIGATION SIDEBAR (Persistent on all tabs) ── */}
        <aside className="w-60 h-full bg-[#081226]/90 border border-cyan-900/40 rounded-2xl p-3 flex flex-col justify-between shrink-0 backdrop-blur-xl shadow-2xl">
          <div className="space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path ||
                (item.path !== "/dashboard" && pathname?.startsWith(item.path));

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-600/30 to-blue-600/20 border border-cyan-400/80 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-cyan-400" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white shadow-[0_0_8px_#f43f5e]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Card at Bottom of Left Sidebar */}
          <div className="pt-3 border-t border-cyan-950/80 flex items-center gap-3 px-1">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#0a1224] flex items-center justify-center font-bold text-xs text-white">
                  S
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#081226] shadow-[0_0_6px_#10b981]" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">Shilpi</span>
              <span className="text-[10px] font-mono text-slate-400">Project Team</span>
            </div>
          </div>
        </aside>

        {/* ── TAB WORKSPACE AREA ── */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
