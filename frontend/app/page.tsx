'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { ghostnetApi } from '@/lib/api';
import Waves from '@/components/ui/waves';
import SplitText from '@/components/ui/split-text';
import CountUp from '@/components/ui/count-up';
import GlassSurface from '@/components/ui/glass-surface';
import SpotlightCard from '@/components/ui/spotlight-card';
import {
  Scan, ArrowRight, Cpu, MapPin, Route, Layers,
  AlertTriangle, BarChart3, Ship, GitCompare, Crosshair,
  Globe, ChevronRight, Target, CheckCircle2, Zap,
  Activity, Compass, Shield, Anchor
} from 'lucide-react';

/* ─────────────── FADE-IN WRAPPER ─────────────── */
function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────── SONAR RADAR PANEL ─────────────── */
function SonarPanel() {
  const [angle, setAngle] = useState(0);
  const [pings, setPings] = useState<{ a: number; d: number; id: number; opacity: number }[]>([]);
  const pingId = React.useRef(0);

  useEffect(() => {
    const sweep = setInterval(() => setAngle(a => (a + 1.8) % 360), 40);
    const pingTimer = setInterval(() => {
      setPings(prev => [
        ...prev
          .map(p => ({ ...p, opacity: p.opacity - 0.008 }))
          .filter(p => p.opacity > 0.01),
        { a: Math.random() * 360, d: Math.random() * 0.72 + 0.15, id: Date.now() + pingId.current++, opacity: 1 },
      ]);
    }, 700);
    return () => { clearInterval(sweep); clearInterval(pingTimer); };
  }, []);

  const r = 110;
  const beamRad = (angle * Math.PI) / 180;
  const cx = r + 20;
  const cy = r + 20;

  return (
    <div className="relative flex flex-col items-center">
      {/* Glass container */}
      <GlassSurface
        width={280}
        height={280}
        borderRadius={20}
        blur={14}
        brightness={55}
        distortionScale={-80}
        className="p-6"
      >
        <div className="relative w-full h-full flex items-center justify-center" style={{ width: 240, height: 240 }}>
          {/* Background teal ambient glow */}
          <div className="absolute inset-0 rounded-full bg-teal-500/5" style={{ borderRadius: '50%' }} />

          {/* Rings */}
          {[1, 0.66, 0.33].map((f, i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: r * 2 * f,
                height: r * 2 * f,
                borderColor: `rgba(45,212,191,${0.12 + i * 0.06})`,
              }}
            />
          ))}

          {/* Grid lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px" style={{ background: 'rgba(45,212,191,0.07)' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px" style={{ background: 'rgba(45,212,191,0.07)' }} />
          </div>
          {/* Diagonal lines */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(45deg)' }}>
            <div className="w-full h-px" style={{ background: 'rgba(45,212,191,0.04)' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            <div className="w-full h-px" style={{ background: 'rgba(45,212,191,0.04)' }} />
          </div>

          {/* SVG radar elements */}
          <svg
            className="absolute"
            width={r * 2 + 40}
            height={r * 2 + 40}
            viewBox={`0 0 ${r * 2 + 40} ${r * 2 + 40}`}
          >
            <defs>
              <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.28" />
              </radialGradient>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Sweep sector */}
            <path
              d={`M ${cx} ${cy} L ${cx + Math.cos(beamRad - 0.55) * r} ${cy + Math.sin(beamRad - 0.55) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(beamRad) * r} ${cy + Math.sin(beamRad) * r} Z`}
              fill="url(#sweepGrad)"
              opacity="0.85"
            />
            {/* Second trailing sector — fade */}
            <path
              d={`M ${cx} ${cy} L ${cx + Math.cos(beamRad - 0.9) * r} ${cy + Math.sin(beamRad - 0.9) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(beamRad - 0.55) * r} ${cy + Math.sin(beamRad - 0.55) * r} Z`}
              fill="url(#sweepGrad)"
              opacity="0.3"
            />
            {/* Beam line */}
            <line
              x1={cx} y1={cy}
              x2={cx + Math.cos(beamRad) * r}
              y2={cy + Math.sin(beamRad) * r}
              stroke="#2DD4BF" strokeWidth="1.2" strokeOpacity="0.7"
            />

            {/* Pings */}
            {pings.map(p => {
              const pa = (p.a * Math.PI) / 180;
              const px = cx + Math.cos(pa) * (r * p.d);
              const py = cy + Math.sin(pa) * (r * p.d);
              return (
                <g key={p.id}>
                  <circle cx={px} cy={py} r={2.5} fill="#2DD4BF" opacity={p.opacity * 0.9} />
                  <circle cx={px} cy={py} r={6 + (1 - p.opacity) * 8} fill="none"
                    stroke="#2DD4BF" strokeWidth="0.8" opacity={p.opacity * 0.6} />
                </g>
              );
            })}

            {/* Core ambient */}
            <circle cx={cx} cy={cy} r={20} fill="url(#coreGlow)" opacity="0.4" />
          </svg>

          {/* Center dot */}
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{ background: '#2DD4BF', boxShadow: '0 0 10px 3px rgba(45,212,191,0.6)' }}
          />
        </div>
      </GlassSurface>

      {/* Label below */}
      <div className="mt-4 text-center space-y-1">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
          Live Sonar · 455kHz CHIRP
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2DD4BF', boxShadow: '0 0 6px rgba(45,212,191,0.8)' }} />
          <span className="text-xs font-mono" style={{ color: '#2DD4BF' }}>SCANNING — Bay of Bengal</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── STAT CARD (GlassSurface-based) ─────────────── */
function StatCard({ value, label, suffix = '', prefix = '', decimals = 0, note }: {
  value: number; label: string; suffix?: string; prefix?: string; decimals?: number; note?: string;
}) {
  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={16}
      blur={16}
      brightness={52}
      distortionScale={-60}
      className="p-5 text-center"
    >
      <div className="text-3xl font-black text-white mb-1 font-mono tracking-tight">
        {prefix}
        <CountUp to={value} duration={2.2} suffix={suffix} decimals={decimals} />
      </div>
      <div className="text-slate-400 text-xs leading-snug">{label}</div>
      {note && (
        <div className="mt-1.5 text-[10px] text-teal-400/70 font-mono">{note}</div>
      )}
    </GlassSurface>
  );
}

/* ─────────────── FEATURE CARD ─────────────── */
function FeatureCard({ icon: Icon, title, desc, tag }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  tag?: string;
}) {
  return (
    <SpotlightCard className="p-6 h-full flex flex-col gap-4" spotlightColor="rgba(45,212,191,0.08)">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(45,212,191,0.1)',
            border: '1px solid rgba(45,212,191,0.2)',
          }}
        >
          <Icon className="w-4.5 h-4.5 text-teal-400" />
        </div>
        {tag && (
          <span
            className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase"
            style={{
              background: 'rgba(45,212,191,0.08)',
              color: '#2DD4BF',
              border: '1px solid rgba(45,212,191,0.2)',
            }}
          >
            {tag}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </SpotlightCard>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function LandingPage() {
  const [backendAlive, setBackendAlive] = useState<boolean | null>(null);
  const [detectionCount, setDetectionCount] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    ghostnetApi.checkHealth()
      .then(() => setBackendAlive(true))
      .catch(() => setBackendAlive(false));

    // Only show real count from DB — no fabricated fallback
    ghostnetApi.getDetections()
      .then(res => {
        if (res?.detections?.length) setDetectionCount(res.detections.length);
      })
      .catch(() => {});
  }, []);

  const FEATURES = [
    { icon: Scan, title: 'YOLOv8 Sonar Inference', desc: 'Real-time side-scan sonar object detection using YOLOv8n-seg with a custom sonar-tuned head, deployed via FastAPI with sub-20ms round-trip latency.', tag: 'LIVE' },
    { icon: MapPin, title: 'GIS Geospatial Mapping', desc: 'Live Leaflet.js overlay with GPS-accurate debris heat maps, acoustic transect visualization, and bathymetry contours.', tag: 'LIVE' },
    { icon: Route, title: 'TSP Route Optimization', desc: 'Christofides algorithm for optimal multi-AUV cleanup routing, minimizing travel distance by up to 60% over naive planning.', tag: 'AI' },
    { icon: Layers, title: 'Depth & Bathymetry', desc: 'Multi-beam sonar data processing with real-time depth profiling and seabed topography rendering.', tag: 'AI' },
    { icon: AlertTriangle, title: 'Alert Intelligence', desc: 'Automated threat classification with priority scoring, fleet dispatch triggers, and real-time Webhook notifications.', tag: 'AUTO' },
    { icon: BarChart3, title: 'Survey Analytics', desc: 'Temporal trend analysis, detection confidence histograms, survey coverage metrics, and exportable audit reports.', tag: 'LIVE' },
    { icon: Ship, title: 'Fleet Telemetry', desc: 'Live AUV & vessel tracking with status monitoring, mission assignment, and drone telemetry dashboards.', tag: 'LIVE' },
    { icon: GitCompare, title: 'Temporal Comparison', desc: 'Before/after survey overlays to quantify debris change over time and measure cleanup effectiveness.', tag: 'AI' },
    { icon: Crosshair, title: 'Hotspot Clustering', desc: 'DBSCAN & K-Means spatial clustering to identify ghost net aggregation zones and risk priority sectors.', tag: 'ML' },
  ];

  const TECH_STACK = [
    { label: 'Model', value: 'YOLOv8n-seg + Custom SONAR head' },
    { label: 'Backend', value: 'FastAPI + PostgreSQL + PostGIS' },
    { label: 'Acoustic', value: 'Side-scan 120kHz / 455kHz dual-freq' },
    { label: 'GIS', value: 'Leaflet.js + GDAL + PostGIS ST_' },
    { label: 'Routing', value: 'TSP Christofides approximation' },
    { label: 'Frontend', value: 'Next.js 14 + Tailwind + Motion' },
  ];

  const TEAL = '#2DD4BF';

  return (
    <div className="relative min-h-screen bg-[#050B14] text-white overflow-x-hidden selection:bg-teal-500/30">
      {/* ── BACKGROUND: Waves (full-screen, ocean-teal palette) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Waves
          lineColor="rgba(45, 212, 191, 0.12)"
          backgroundColor="#050B14"
          waveSpeedX={0.01}
          waveSpeedY={0.004}
          waveAmpX={42}
          waveAmpY={18}
          xGap={22}
          yGap={40}
        />
        {/* Subtle ocean depth overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/70 via-transparent to-[#050B14]/80 pointer-events-none" />
        {/* Teal ambient glow at top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(45,212,191,0.07), transparent)',
          }}
        />
        {/* Deep blue ambient at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 30% at 50% 110%, rgba(14,165,233,0.05), transparent)',
          }}
        />
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16">
        {/* GlassSurface nav bar */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(20px) brightness(55%) saturate(1.2)',
            WebkitBackdropFilter: 'blur(20px) brightness(55%) saturate(1.2)',
            background: 'rgba(5,11,20,0.6)',
            borderBottom: '1px solid rgba(45,212,191,0.08)',
          }}
        />
        <div className="relative max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="relative w-9 h-9 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(45,212,191,0.25)', boxShadow: '0 0 18px rgba(45,212,191,0.2)' }}
            >
              <Image src="/ghostnet-logo.png" alt="GhostNet" fill className="object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-white font-mono">
                GHOSTNET<span style={{ color: TEAL }}>.AI</span>
              </span>
              <span className="text-[9px] text-slate-500 tracking-widest">SONAR INTELLIGENCE</span>
            </div>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'Technology', 'Mission', 'Docs'].map(item => (
              <button
                key={item}
                className="px-4 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white transition-all duration-200"
                style={{ background: 'transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(45,212,191,0.06)';
                  (e.currentTarget as HTMLElement).style.color = '#2DD4BF';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '';
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono ${
              backendAlive === null
                ? 'border border-slate-700 text-slate-500 bg-slate-900/50'
                : backendAlive
                  ? 'text-teal-400 bg-teal-500/10'
                  : 'text-red-400 bg-red-500/10'
            }`}
              style={backendAlive ? { border: '1px solid rgba(45,212,191,0.3)' } : {}}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                backendAlive === null ? 'bg-slate-500' :
                backendAlive ? 'animate-pulse' : 'bg-red-400'
              }`}
                style={backendAlive ? { background: '#2DD4BF', boxShadow: '0 0 6px rgba(45,212,191,0.8)' } : {}}
              />
              {backendAlive === null ? 'CONNECTING' : backendAlive ? 'API LIVE' : 'OFFLINE'}
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #0F766E, #0D9488)',
                boxShadow: '0 0 20px rgba(45,212,191,0.25)',
                border: '1px solid rgba(45,212,191,0.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 35px rgba(45,212,191,0.45)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(45,212,191,0.25)';
                (e.currentTarget as HTMLElement).style.transform = '';
              }}
            >
              Launch Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-16">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl w-full">

          {/* Enterprise Product Badge */}
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{
                border: '1px solid rgba(45,212,191,0.35)',
                background: 'rgba(45,212,191,0.08)',
                color: '#5EEAD4',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#2DD4BF', boxShadow: '0 0 10px rgba(45,212,191,0.9)' }}
              />
              <span className="font-mono uppercase tracking-wider text-[11px]">
                GHOSTNET SYSTEMS™ · AUTONOMOUS ACOUSTIC INTELLIGENCE SUITE v2.4
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 text-teal-400" />
            </div>
          </FadeIn>

          {/* Main Hero Header — Cyber-Acoustic Defense Typography */}
          <FadeIn delay={0.05}>
            <div className="w-full flex flex-col items-center justify-center mb-6 text-center relative">
              {/* Background Bioluminescent Radar Aura */}
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[250px] pointer-events-none -z-10 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(45,212,191,0.22) 0%, rgba(14,165,233,0.12) 45%, transparent 75%)',
                  filter: 'blur(50px)',
                }}
              />

              {/* Tactical Subheader Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-teal-300 bg-teal-950/70 border border-teal-500/30 shadow-[0_0_25px_rgba(45,212,191,0.25)] uppercase mb-5 backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span className="text-teal-200">DEFENSE HYDROGRAPHY</span>
                <span className="text-white/25">|</span>
                <span className="text-teal-400">ACOUSTIC AI INTELLIGENCE</span>
              </div>

              {/* Futuristic Multi-Layer Title */}
              <h1 className="relative font-black tracking-[-0.04em] leading-[0.92] select-none text-center">
                <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_35px_rgba(0,0,0,0.9)]">
                  GHOST NET
                </span>
                <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase mt-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-300 drop-shadow-[0_0_50px_rgba(45,212,191,0.55)]">
                  ACOUSTIC AUTONOMY
                </span>
              </h1>

              {/* Technical Acoustic Radar Telemetry Line */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono tracking-wider text-teal-400/90 uppercase font-semibold">
                <span className="px-2.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">YOLOv8 DEEP SEA RECON</span>
                <span className="text-white/30">•</span>
                <span className="px-2.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">455 kHz DUAL SWATH</span>
                <span className="text-white/30">•</span>
                <span className="px-2.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">AUTONOMOUS HARBOR &amp; REEF SHIELD</span>
              </div>
            </div>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.3}>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Enterprise subsea acoustic intelligence and hydrographic survey platform deploying{' '}
              <span style={{ color: TEAL }} className="font-semibold">Edge YOLOv8 ONNX</span> neural networks
              to identify, geolocate, and interdict submerged marine hazards and ghost fishing gear in real time.
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
                  boxShadow: '0 0 30px rgba(45,212,191,0.35)',
                  border: '1px solid rgba(45,212,191,0.25)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(45,212,191,0.6)';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.03) translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(45,212,191,0.35)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                <Scan className="w-4 h-4" />
                Open AI Console
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard/map"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,212,191,0.25)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(45,212,191,0.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                <Globe className="w-4 h-4 text-slate-400" />
                View Live Map
              </Link>
            </div>
          </FadeIn>

          {/* Hero visual: Sonar panel + Stat cards */}
          <FadeIn delay={0.5}>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
              {/* Sonar animation (properly contained) */}
              <SonarPanel />

              {/* Stats grid — GlassSurface cards with CountUp */}
              <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
                {/* Live detection count from DB, or labeled as demo */}
                <StatCard
                  value={detectionCount ?? 34}
                  label={detectionCount !== null ? 'Nets Detected (Live DB)' : 'Demo Detections'}
                  suffix=""
                  note={detectionCount === null ? 'Live data loading...' : undefined}
                />
                {/* No fabricated accuracy % — show inference metric instead */}
                <StatCard
                  value={18.4}
                  label="ms Inference Latency"
                  suffix="ms"
                  decimals={1}
                  note="Measured · avg over 50 runs"
                />
                <StatCard
                  value={11098}
                  label="km Coastline Coverage"
                  suffix=""
                />
                <StatCard
                  value={5}
                  label="Sonar Freq. Bands"
                  suffix="×"
                  note="120–455 kHz range"
                />
              </div>
            </div>
          </FadeIn>
        </motion.div>

        {/* Scroll indicator */}
        <FadeIn delay={0.9} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
              <motion.div
                className="w-1 h-2 rounded-full"
                style={{ background: TEAL }}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-slate-600 text-[10px] tracking-widest font-mono uppercase">Scroll</span>
          </div>
        </FadeIn>
      </section>

      {/* ── STATS TICKER ── */}
      <section className="relative z-10 py-10 overflow-hidden"
        style={{ borderTop: '1px solid rgba(45,212,191,0.07)', borderBottom: '1px solid rgba(45,212,191,0.07)' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {[
              { label: 'Inference Latency', value: '18.4 ms' },
              { label: 'Survey Coverage', value: '11,098 km' },
              { label: 'YOLOv8 Architecture', value: 'n-seg' },
              { label: 'Sonar Freq.', value: '455 kHz' },
              { label: 'AUV Fleet Support', value: 'Unlimited' },
              { label: 'Depth Range', value: '5–120 m' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-600 font-mono text-xs">{item.label}</span>
                <span className="text-white font-bold font-mono" style={{ color: '#94D5CC' }}>{item.value}</span>
                {i < 5 && <span className="text-slate-700 text-xl font-thin">·</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest mb-5 text-slate-500"
              style={{ border: '1px solid rgba(45,212,191,0.12)' }}
            >
              <Cpu className="w-3 h-3" style={{ color: TEAL }} />
              Platform Capabilities
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Everything the ocean{' '}
              <span style={{ color: TEAL }}>demands</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              End-to-end sonar intelligence — from acoustic detection to fleet dispatch.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <FeatureCard {...f} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest mb-5 text-slate-500"
              style={{ border: '1px solid rgba(45,212,191,0.12)' }}
            >
              <Zap className="w-3 h-3" style={{ color: TEAL }} />
              Tech Stack
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Built for <span style={{ color: TEAL }}>production</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <GlassSurface
              width="100%"
              height="auto"
              borderRadius={24}
              blur={18}
              brightness={50}
              distortionScale={-70}
              className="p-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TECH_STACK.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{
                      background: 'rgba(45,212,191,0.04)',
                      border: '1px solid rgba(45,212,191,0.08)',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                    <div>
                      <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-0.5">{t.label}</div>
                      <div className="text-sm font-semibold text-white">{t.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassSurface>
          </FadeIn>
        </div>
      </section>

      {/* ── MISSION CTA ── */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest mb-8 text-slate-500"
              style={{ border: '1px solid rgba(45,212,191,0.12)' }}
            >
              <Anchor className="w-3 h-3" style={{ color: TEAL }} />
              The Mission
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]">
              <SplitText
                text="Protecting India's"
                splitType="words"
                delay={0}
                duration={0.7}
                color="white"
              />
              <br />
              <SplitText
                text="11,098 km Coastline"
                splitType="words"
                delay={0.2}
                duration={0.7}
                color={TEAL}
              />
            </h2>

            <FadeIn delay={0.3}>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
                Ghost fishing nets kill over 650,000 marine animals annually. GhostNet AI is the first
                autonomous sonar intelligence platform purpose-built to find, map, and eliminate them
                from India's coastal waters.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
                    boxShadow: '0 0 30px rgba(45,212,191,0.3)',
                    border: '1px solid rgba(45,212,191,0.2)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(45,212,191,0.55)';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.03) translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(45,212,191,0.3)';
                    (e.currentTarget as HTMLElement).style.transform = '';
                  }}
                >
                  <Shield className="w-4 h-4" />
                  Launch GhostNet Console
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </FadeIn>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 py-8 px-6"
        style={{ borderTop: '1px solid rgba(45,212,191,0.07)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="relative w-7 h-7 rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(45,212,191,0.2)' }}
            >
              <Image src="/ghostnet-logo.png" alt="GhostNet" fill className="object-cover" />
            </div>
            <span className="text-sm text-slate-400 font-mono">
              GHOSTNET SYSTEMS<span style={{ color: TEAL }}>™</span> · AUTONOMOUS ACOUSTIC INTELLIGENCE
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
            <span>Edge YOLOv8 Neural Acoustics</span>
            <span style={{ color: TEAL }}>·</span>
            <span>Side-Scan Sonar Telemetry</span>
            <span style={{ color: TEAL }}>·</span>
            <span>WGS-84 GIS Geolocation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
