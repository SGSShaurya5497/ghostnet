"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  Cpu,
  Globe2,
  Sparkles,
} from "lucide-react";

export default function SaaSStartupScreen() {
  const router = useRouter();

  // Animation Sequence Phases: 1 -> 2 -> 3 -> 4 -> 5 -> 6 (Ready)
  const [phase, setPhase] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("Initializing workspace...");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Canvas Ref for subtle ambient particles
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Phase Progression Controller
  useEffect(() => {
    // Phase 1 -> 2: Ambient light starts
    const t1 = setTimeout(() => setPhase(2), 600);

    // Phase 2 -> 3: Logo & Title fade in
    const t2 = setTimeout(() => setPhase(3), 1400);

    // Phase 3 -> 4: Tagline appears
    const t3 = setTimeout(() => setPhase(4), 2200);

    // Phase 4 -> 5: Progress indicator commences
    const t4 = setTimeout(() => setPhase(5), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Progress Bar & Status Text Simulation
  useEffect(() => {
    if (phase < 5) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase(6);
          setStatusText("System ready.");
          return 100;
        }

        const next = prev + 2;
        if (next < 30) {
          setStatusText("Initializing neural sonar pipelines...");
        } else if (next < 65) {
          setStatusText("Calibrating bathymetric geospatial mesh...");
        } else if (next < 90) {
          setStatusText("Establishing orbital satellite telemetry stream...");
        } else {
          setStatusText("Synchronizing maritime intelligence...");
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [phase]);

  // Handle Smooth Transition to Main Dashboard
  const enterDashboard = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 650);
  };

  // Keyboard navigation shortcut [Enter] or [Space]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterDashboard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning]);

  // Subtle Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  // Ambient Starfield / Atmospheric Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Ethereal subtle floating nodes
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-between font-sans overflow-hidden select-none transition-all duration-700 ${
        isTransitioning
          ? "opacity-0 scale-[1.03] blur-sm pointer-events-none"
          : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. ATMOSPHERIC BACKGROUND & AMBIENT GLOW */}
      {/* ───────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Atmospheric Soft Lighting Orbs */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent blur-[140px] pointer-events-none transition-opacity duration-1000 ${
          phase >= 2 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * 30}px), calc(-50% + ${(mousePos.y - 0.5) * 30}px))`,
        }}
      />

      <div
        className={`absolute bottom-1/4 right-1/3 w-[450px] h-[350px] rounded-full bg-gradient-to-br from-indigo-500/10 via-teal-500/5 to-transparent blur-[120px] pointer-events-none transition-opacity duration-1000 ${
          phase >= 2 ? "opacity-80" : "opacity-0"
        }`}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP MINIMAL HEADER BAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header
        className={`w-full max-w-7xl px-8 py-6 flex items-center justify-between z-20 transition-all duration-1000 ${
          phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-400 tracking-wider">
            SYSTEM STATUS: <strong className="text-slate-200">OPERATIONAL</strong>
          </span>
        </div>

        <button
          onClick={enterDashboard}
          className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/30 shadow-sm"
        >
          <span>Skip to Console</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CENTER BRANDING & ULTRA-REFINED GLASSMORPHIC CARD */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="z-20 flex flex-col items-center justify-center my-auto px-4 max-w-xl w-full">
        <div
          className={`w-full bg-[#081226]/50 border border-cyan-500/15 rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(6,182,212,0.06)] relative transition-all duration-1000 ${
            phase >= 3
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          {/* Subtle Top Glass Border Highlight */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          {/* Minimal Center Logo Emblem */}
          <div className="relative mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent border border-cyan-400/30 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.2)]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_12px_#22d3ee] animate-pulse" />
            </div>
            {/* Outer Subtle Orbit Ring */}
            <div className="absolute -inset-2 rounded-3xl border border-cyan-500/10 animate-[spin_12s_linear_infinite]" />
          </div>

          {/* Large Clean Typography Project Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow">
            OCEAN INTEL
          </h1>

          {/* Understated Tagline */}
          <p
            className={`text-xs sm:text-sm font-normal tracking-[0.18em] text-slate-400 uppercase mt-3 transition-all duration-700 ${
              phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            Maritime Intelligence & Situational Awareness
          </p>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* 4. REFINED LOADING & PROGRESS INITIALIZATION */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div
            className={`w-full max-w-xs mt-8 space-y-3 transition-all duration-700 ${
              phase >= 5 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Minimalist Progress Track */}
            <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden border border-white/[0.05]">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 rounded-full transition-all duration-150 shadow-[0_0_10px_#22d3ee]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status Telemetry Text */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="truncate pr-2">{statusText}</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* 5. ENTER WORKSPACE CTA BUTTON (Phase 6) */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div
            className={`mt-6 w-full max-w-xs transition-all duration-500 ${
              phase >= 6
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2 pointer-events-none"
            }`}
          >
            <button
              onClick={enterDashboard}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold tracking-wider font-mono uppercase flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] border border-cyan-400/40 group"
            >
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-2.5 text-[10px] font-mono text-slate-400 text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> to launch
            </div>
          </div>
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. BOTTOM MINIMAL METADATA FOOTER */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer
        className={`w-full max-w-7xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/40 z-20 gap-3 transition-all duration-1000 ${
          phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ENCRYPTED PROTOCOL 256-BIT</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>WGS-84 GEOSPATIAL ENGINE</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>GHOSTNET PLATFORM v2.4</span>
          <span>•</span>
          <span>DEEP OCEAN TELEMETRY</span>
        </div>
      </footer>
    </div>
  );
}
