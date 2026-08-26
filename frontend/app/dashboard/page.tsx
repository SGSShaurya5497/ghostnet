'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import CustomCursor from '@/components/ui/CustomCursor';
import MagneticButton from '@/components/ui/MagneticButton';

// Lazy-load SonarConsole (heavy canvas, only rendered when tab active)
const SonarConsole = dynamic(() => import('@/components/dashboard/SonarConsole'), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(45,212,191,0.5)' }}>
        Initialising sonar pipeline...
      </span>
    </div>
  ),
});

interface DetectionTarget {
  id: string;
  code: string;
  lat: string;
  lon: string;
  depth: string;
  confidence: number;
  area: string;
  type: string;
  status: 'Critical' | 'Moderate' | 'Resolved';
  timestamp: string;
}

const MOCK_TARGETS: DetectionTarget[] = [
  {
    id: '1',
    code: 'GN-0482',
    lat: "48°14'22.4\"N",
    lon: "124°42'18.1\"W",
    depth: '-142.8m',
    confidence: 0.964,
    area: '34.5m x 12.0m',
    type: 'Monofilament Gillnet',
    status: 'Critical',
    timestamp: '12:44:02 UTC',
  },
  {
    id: '2',
    code: 'GN-0483',
    lat: "48°15'04.8\"N",
    lon: "124°40'55.3\"W",
    depth: '-218.4m',
    confidence: 0.918,
    area: '58.0m x 24.5m',
    type: 'Trawl Webbing Cluster',
    status: 'Critical',
    timestamp: '12:41:19 UTC',
  },
  {
    id: '3',
    code: 'GN-0484',
    lat: "48°13'49.1\"N",
    lon: "124°44'02.9\"W",
    depth: '-98.2m',
    confidence: 0.887,
    area: '18.2m x 8.4m',
    type: 'Longline & Buoy Cluster',
    status: 'Moderate',
    timestamp: '12:38:55 UTC',
  },
  {
    id: '4',
    code: 'GN-0485',
    lat: "48°16'11.0\"N",
    lon: "124°39'22.7\"W",
    depth: '-312.0m',
    confidence: 0.942,
    area: '42.0m x 16.8m',
    type: 'Commercial Purse Seine',
    status: 'Critical',
    timestamp: '12:35:10 UTC',
  },
  {
    id: '5',
    code: 'GN-0486',
    lat: "48°12'35.2\"N",
    lon: "124°45'50.1\"W",
    depth: '-165.7m',
    confidence: 0.852,
    area: '14.0m x 9.5m',
    type: 'Drift Net Segment',
    status: 'Moderate',
    timestamp: '12:29:44 UTC',
  },
];

// ── Ambient particle canvas ──
function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.32,
      vy: Math.random() * 0.38 + 0.08,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2dd4bf';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > canvas.height) p.y = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.45,
      }}
    />
  );
}

// ── Main Dashboard ──
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'waterfall' | 'upload' | 'console'>('map');
  const [selectedTarget, setSelectedTarget] = useState<DetectionTarget>(MOCK_TARGETS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('Standby');
  const [isFilterCritical, setIsFilterCritical] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);

  // Live UTC clock
  const [timeUtc, setTimeUtc] = useState('');
  useEffect(() => {
    const update = () => setTimeUtc(new Date().toUTCString().slice(17, 25) + ' UTC');
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleInspectorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!inspectorRef.current) return;
    const rect = inspectorRef.current.getBoundingClientRect();
    inspectorRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    inspectorRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep('01 Ingesting Sonar Stream (XTF)...');

    const steps = [
      { p: 22,  s: '02 De-speckling & Resolution Normalization...' },
      { p: 48,  s: '03 Slant-range Correction & Nadir Fill...' },
      { p: 70,  s: '04 YOLO-seg ONNX Inference (CUDA EP)...' },
      { p: 88,  s: '05 Geotagging & Coordinate Projection...' },
      { p: 100, s: '06 Complete — 3 New Targets Identified ✓' },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setUploadProgress(steps[stepIdx].p);
        setUploadStep(steps[stepIdx].s);
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          triggerToast('Sonar log processed — 3 confirmed ghost nets identified');
        }, 800);
      }
    }, 900);
  };

  const filteredTargets = isFilterCritical
    ? MOCK_TARGETS.filter((t) => t.status === 'Critical')
    : MOCK_TARGETS;

  const TABS = [
    { key: 'map',       label: 'Bathymetric Map' },
    { key: 'waterfall', label: 'Sonar Spectrogram' },
    { key: 'upload',    label: 'Log Preprocessor' },
    { key: 'console',   label: 'Sonar Console', live: true },
  ] as const;

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 50% 0%, #06162a 0%, #030b16 50%, #010408 100%)',
        color: '#e8f1fa',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'none',
      }}
    >
      <CustomCursor />
      <AmbientParticles />

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div
          className="ultra-glass"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            padding: '0.9rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#2dd4bf',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            animation: 'card-rise 0.4s var(--ease-smooth)',
            boxShadow: '0 16px 50px rgba(0,0,0,0.85), 0 0 35px rgba(45,212,191,0.3)',
            borderRadius: '12px',
            maxWidth: '380px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2dd4bf',
              boxShadow: '0 0 10px #2dd4bf',
              flexShrink: 0,
            }}
          />
          <span style={{ position: 'relative', zIndex: 2 }}>{toastMessage}</span>
        </div>
      )}

      {/* ══ TOP HEADER BAR ══ */}
      <header
        style={{
          height: '66px',
          padding: '0 clamp(1.5rem, 3vw, 2.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(3, 8, 20, 0.72)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer accent line along the bottom of header */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.6) 30%, rgba(255,255,255,0.3) 50%, rgba(45,212,191,0.6) 70%, transparent 100%)',
            opacity: 0.7,
          }}
        />
        {/* Moving shimmer sweep */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '30%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            animation: 'shimmer-line 4s ease-in-out infinite',
          }}
        />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1.5px solid #2dd4bf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(45, 212, 191, 0.55)',
                background: 'rgba(45,212,191,0.07)',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#2dd4bf',
                  boxShadow: '0 0 8px #2dd4bf',
                  animation: 'glow-pulse 2s ease-in-out infinite',
                }}
              />
            </div>
            Ghost<span style={{ color: '#2dd4bf' }}>Net</span>
          </Link>

          <div style={{ height: '20px', width: '1px', background: 'rgba(45, 212, 191, 0.18)' }} />

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'rgba(45, 212, 191, 0.8)',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#2dd4bf',
                boxShadow: '0 0 8px #2dd4bf',
                animation: 'glow-pulse 2s infinite',
              }}
            />
            AUV-DRONE // LINKED (5.8 GHz)
          </span>
        </div>

        {/* Telemetry Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', textAlign: 'right' }}>
            <span style={{ color: 'rgba(226, 234, 244, 0.4)' }}>UTC: </span>
            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{timeUtc}</span>
          </div>

          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: 'rgba(226, 234, 244, 0.7)',
              padding: '0.45rem 1.1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
          >
            ← Pitch Deck
          </Link>
        </div>
      </header>

      {/* ══ KEY METRICS BAR ══ */}
      <div
        style={{
          padding: '1.1rem clamp(1.5rem, 3vw, 2.5rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.85rem',
          borderBottom: '1px solid rgba(45, 212, 191, 0.08)',
          background: 'rgba(2, 6, 16, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {[
          { label: 'Area Scanned',           val: '148.4 km²',   sub: 'Olympic Coast Sector 4' },
          { label: 'Confirmed Ghost Nets',    val: '18 Targets',  sub: '92.4% Avg Confidence' },
          { label: 'Critical Entanglements',  val: '7 High Risk', sub: 'Action Vector Ready' },
          { label: 'Active Sonar Depth',      val: '−248.4 m',    sub: 'Dual-Frequency 455 kHz' },
        ].map((m, i) => (
          <div
            key={i}
            className="glass-tile mouse-spotlight"
            style={{ padding: '0.95rem 1.2rem' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'rgba(45, 212, 191, 0.7)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.2rem',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#ffffff',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {m.val}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'rgba(226, 234, 244, 0.4)',
                marginTop: '0.1rem',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ══ MAIN WORKSPACE ══ */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(290px, 340px) 1fr minmax(300px, 365px)',
          gap: '1.1rem',
          padding: '1.1rem clamp(1.5rem, 3vw, 2.5rem)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 5,
          minHeight: 0,
        }}
      >
        {/* ══ LEFT: Targets + Upload trigger ══ */}
        <div
          className="glass-sidebar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            padding: '1.2rem',
            minHeight: 0,
          }}
        >
          {/* List header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              Identified Targets ({filteredTargets.length})
            </div>

            <button
              onClick={() => setIsFilterCritical(!isFilterCritical)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                padding: '0.32rem 0.65rem',
                borderRadius: '6px',
                background: isFilterCritical ? 'rgba(244, 63, 94, 0.18)' : 'rgba(255,255,255,0.04)',
                border: isFilterCritical ? '1px solid rgba(244, 63, 94, 0.55)' : '1px solid rgba(255,255,255,0.1)',
                color: isFilterCritical ? '#f43f5e' : 'rgba(226, 234, 244, 0.65)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isFilterCritical ? '● Critical' : 'All'}
            </button>
          </div>

          {/* Scrollable target list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              overflowY: 'auto',
              flex: 1,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {filteredTargets.map((t) => {
              const isSel = selectedTarget.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTarget(t);
                    triggerToast(`Target ${t.code} locked — ${t.type}`);
                  }}
                  className="ripple-container"
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: isSel
                      ? 'rgba(45, 212, 191, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSel
                      ? '1px solid rgba(45, 212, 191, 0.45)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    boxShadow: isSel
                      ? '0 0 24px rgba(45, 212, 191, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)'
                      : 'none',
                    cursor: 'pointer',
                    transform: isSel ? 'scale(1.01)' : 'scale(1)',
                    transition:
                      'transform 0.25s var(--ease-elastic), background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    backdropFilter: isSel ? 'blur(4px)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: isSel ? '#2dd4bf' : '#ffffff',
                        fontSize: '0.86rem',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {t.code}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        padding: '0.18rem 0.5rem',
                        borderRadius: '5px',
                        background:
                          t.status === 'Critical'
                            ? 'rgba(244, 63, 94, 0.18)'
                            : 'rgba(45, 212, 191, 0.12)',
                        color: t.status === 'Critical' ? '#f43f5e' : '#2dd4bf',
                        border:
                          t.status === 'Critical'
                            ? '1px solid rgba(244, 63, 94, 0.4)'
                            : '1px solid rgba(45, 212, 191, 0.35)',
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'rgba(226, 234, 244, 0.7)',
                      margin: '0.3rem 0',
                    }}
                  >
                    {t.type}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.64rem',
                      color: 'rgba(226, 234, 244, 0.38)',
                    }}
                  >
                    <span>{t.depth}</span>
                    <span>{(t.confidence * 100).toFixed(1)}% conf.</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload CTA */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <MagneticButton
              onClick={handleSimulatedUpload}
              disabled={isUploading}
              style={{ padding: '0.82rem', borderRadius: '10px', fontSize: '0.82rem', width: '100%' }}
            >
              {isUploading ? 'Ingesting Sonar Stream...' : '+ Ingest Sonar Log (.XTF)'}
            </MagneticButton>

            {isUploading && (
              <div style={{ marginTop: '0.85rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: '#2dd4bf',
                    marginBottom: '0.45rem',
                  }}
                >
                  <span>{uploadStep}</span>
                  <span>{uploadProgress}%</span>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: '5px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    border: '1px solid rgba(45,212,191,0.12)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #2dd4bf, #5eead4)',
                      boxShadow: '0 0 10px rgba(45,212,191,0.6)',
                      transition: 'width 0.5s var(--ease-smooth)',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ CENTER: Tabbed workspace ══ */}
        <div
          className="ultra-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0 1.25rem',
              borderBottom: '1px solid rgba(45, 212, 191, 0.1)',
              background: 'rgba(2, 5, 14, 0.6)',
              backdropFilter: 'blur(8px)',
              position: 'relative',
              zIndex: 2,
              flexShrink: 0,
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color:
                    activeTab === tab.key
                      ? '#2dd4bf'
                      : 'rgba(226, 234, 244, 0.45)',
                  borderBottom:
                    activeTab === tab.key
                      ? '2px solid #2dd4bf'
                      : '2px solid transparent',
                  paddingBottom: '0.7rem',
                  paddingTop: '0.85rem',
                  paddingLeft: '0.6rem',
                  paddingRight: '0.6rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {'live' in tab && tab.live && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: activeTab === tab.key ? '#2dd4bf' : 'rgba(45,212,191,0.4)',
                      boxShadow: activeTab === tab.key ? '0 0 8px #2dd4bf' : 'none',
                      animation: 'glow-pulse 1.5s ease-in-out infinite',
                      flexShrink: 0,
                    }}
                  />
                )}
                {tab.label}
              </button>
            ))}

            {/* Export button in tab bar */}
            <button
              onClick={() => triggerToast('Exported mission_report.json — 5 targets')}
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                padding: '0.38rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(45,212,191,0.08)',
                border: '1px solid rgba(45,212,191,0.25)',
                color: '#2dd4bf',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export JSON
            </button>
          </div>

          {/* ── Tab 1: Bathymetric Hazard Map ── */}
          {activeTab === 'map' && (
            <div
              style={{
                flex: 1,
                position: 'relative',
                background: 'radial-gradient(ellipse at center, #06182c 0%, #030d18 60%, #01040a 100%)',
                overflow: 'hidden',
              }}
            >
              {/* Coordinate grid */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(45,212,191,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.05) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Radar rings */}
              {[100, 200, 300, 430].map((r, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${r * 1.5}px`,
                    height: `${r * 1.5}px`,
                    marginTop: `-${r * 0.75}px`,
                    marginLeft: `-${r * 0.75}px`,
                    borderRadius: '50%',
                    border: '1px solid rgba(45, 212, 191, 0.1)',
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* Sweeping sonar line */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '480px',
                  height: '480px',
                  marginTop: '-240px',
                  marginLeft: '-240px',
                  borderRadius: '50%',
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(45,212,191,0.28) 0deg, transparent 55deg, transparent 360deg)',
                  animation: 'sonar-sweep 5s linear infinite',
                  pointerEvents: 'none',
                }}
              />

              {/* AUV blip */}
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '42%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 8,
                }}
              >
                {/* Ping ring */}
                <div
                  style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid rgba(45,212,191,0.5)',
                    animation: 'sonar-ping 2.5s ease-out infinite',
                    marginTop: '-13px',
                    marginLeft: '-13px',
                  }}
                />
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#2dd4bf',
                    boxShadow: '0 0 18px #2dd4bf, 0 0 40px rgba(45,212,191,0.35)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: '#2dd4bf',
                    marginTop: '0.3rem',
                    background: 'rgba(2,5,14,0.8)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                    border: '1px solid rgba(45,212,191,0.2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  AUV-04 (LIVE)
                </span>
              </div>

              {/* Target blips */}
              {MOCK_TARGETS.map((t, idx) => {
                const positions = [
                  { top: '32%', left: '62%' },
                  { top: '67%', left: '70%' },
                  { top: '55%', left: '24%' },
                  { top: '20%', left: '40%' },
                  { top: '78%', left: '46%' },
                ];
                const pos = positions[idx % positions.length];
                const isSel = selectedTarget.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTarget(t);
                      triggerToast(`Blip ${t.code} locked`);
                    }}
                    style={{
                      position: 'absolute',
                      top: pos.top,
                      left: pos.left,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 10,
                      transform: isSel ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.25s var(--ease-elastic)',
                    }}
                  >
                    {isSel && (
                      <div
                        style={{
                          position: 'absolute',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: `1.5px solid ${t.status === 'Critical' ? '#f43f5e' : '#2dd4bf'}`,
                          animation: 'sonar-ping 2s ease-out infinite',
                          marginTop: '-10px',
                          marginLeft: '-10px',
                          opacity: 0.6,
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: isSel ? '16px' : '11px',
                        height: isSel ? '16px' : '11px',
                        borderRadius: '50%',
                        background: t.status === 'Critical' ? '#f43f5e' : '#2dd4bf',
                        boxShadow: `0 0 14px ${t.status === 'Critical' ? '#f43f5e' : '#2dd4bf'}`,
                        border: '2px solid rgba(255,255,255,0.9)',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        color: isSel ? '#ffffff' : 'rgba(226, 234, 244, 0.65)',
                        background: 'rgba(2,5,14,0.85)',
                        padding: '0.12rem 0.4rem',
                        borderRadius: '4px',
                        border: isSel ? '1px solid rgba(45,212,191,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        marginTop: '0.25rem',
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {t.code}
                    </span>
                  </div>
                );
              })}

              {/* Map scale + coords overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'rgba(45,212,191,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <span>48°14′N — 124°42′W</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '40px', height: '2px', background: 'rgba(45,212,191,0.5)' }} />
                  <span>500 m</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 2: Sonar Spectrogram (static preview) ── */}
          {activeTab === 'waterfall' && (
            <div
              style={{
                flex: 1,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#2dd4bf' }}>
                // MULTI-BEAM HIGH FREQUENCY SONAR SPECTROGRAM [455 kHz]
              </div>

              {/* Spectrogram display */}
              <div
                style={{
                  height: '280px',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, #0f2d3a 0%, #081d26 50%, #030d12 100%)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Scan lines */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(45,212,191,0.05) 0px, rgba(45,212,191,0.05) 1px, transparent 1px, transparent 4px)',
                  }}
                />

                {/* Animated sweep */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.8), rgba(255,255,255,0.4), rgba(45,212,191,0.8), transparent)',
                    boxShadow: '0 0 12px rgba(45,212,191,0.6)',
                    animation: 'scan-line 2.5s linear infinite',
                  }}
                />

                {/* Detection bounding box */}
                <div
                  style={{
                    position: 'absolute',
                    top: '28%',
                    left: '38%',
                    width: '180px',
                    height: '110px',
                    border: '2px solid #2dd4bf',
                    borderRadius: '4px',
                    background: 'rgba(45, 212, 191, 0.12)',
                    boxShadow: '0 0 24px rgba(45, 212, 191, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#02050e',
                      background: '#2dd4bf',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    GHOST_NET: 96.4%
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#2dd4bf' }}>
                    MASK: 4,820 PX
                  </span>
                </div>
              </div>

              {/* Metric row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Speckle SNR', val: '+24.8 dB', hi: true },
                  { label: 'Inference', val: '14.2 ms', hi: false },
                  { label: 'Resolution', val: '0.05 m/px', hi: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="glass-tile"
                    style={{ padding: '0.75rem' }}
                  >
                    <div style={{ fontSize: '0.64rem', color: 'rgba(226,234,244,0.45)', position: 'relative', zIndex: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: s.hi ? '#2dd4bf' : '#ffffff', position: 'relative', zIndex: 2 }}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 3: Upload & Preprocessor ── */}
          {activeTab === 'upload' && (
            <div
              style={{
                flex: 1,
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Drop zone */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  padding: '3.5rem 2rem',
                  border: '1.5px dashed rgba(45, 212, 191, 0.3)',
                  borderRadius: '16px',
                  background: 'rgba(45,212,191,0.03)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'border-color 0.25s ease, background 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(45,212,191,0.1)',
                    border: '1px solid rgba(45,212,191,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  Upload Raw Sonar Log
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(226, 234, 244, 0.45)', maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>
                  Drag & drop sonar logs (.XTF / .JSF / .SGY) from Edgetech, Klein, or C-MAX systems. Runs local ONNX — zero cloud dependency.
                </p>

                <MagneticButton
                  onClick={handleSimulatedUpload}
                  disabled={isUploading}
                  style={{ marginTop: '0.5rem', padding: '0.75rem 2rem', fontSize: '0.85rem' }}
                >
                  Select File & Analyse
                </MagneticButton>
              </div>

              {/* Progress stepper */}
              {isUploading && (
                <div style={{ width: '100%', maxWidth: '520px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: '#2dd4bf',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <span>{uploadStep}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid rgba(45,212,191,0.12)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg, #2dd4bf, #5eead4)',
                        boxShadow: '0 0 12px rgba(45,212,191,0.6)',
                        transition: 'width 0.5s var(--ease-smooth)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 4: Sonar Console ── */}
          {activeTab === 'console' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', position: 'relative', zIndex: 2 }}>
              <SonarConsole />
            </div>
          )}
        </div>

        {/* ══ RIGHT: Target Telemetry Panel ══ */}
        <div
          ref={inspectorRef}
          id="target-telemetry-panel"
          onMouseMove={handleInspectorMouseMove}
          className="ultra-glass mouse-spotlight"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.4rem',
            position: 'relative',
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#ffffff',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2dd4bf',
                boxShadow: '0 0 10px #2dd4bf',
                animation: 'glow-pulse 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            Target Telemetry
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#2dd4bf' }}>
              {selectedTarget.code}
            </span>
          </div>

          {/* Details table */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              background: 'rgba(2, 5, 14, 0.55)',
              padding: '1rem 1.1rem',
              borderRadius: '12px',
              border: '1px solid rgba(45, 212, 191, 0.1)',
              backdropFilter: 'blur(6px)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {[
              { label: 'Latitude',          val: selectedTarget.lat },
              { label: 'Longitude',         val: selectedTarget.lon },
              { label: 'Seafloor Depth',    val: selectedTarget.depth },
              { label: 'Footprint',         val: selectedTarget.area },
              { label: 'Gear Class',        val: selectedTarget.type },
              { label: 'YOLO-seg Conf.',    val: `${(selectedTarget.confidence * 100).toFixed(1)}%` },
              { label: 'First Detected',    val: selectedTarget.timestamp },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  paddingBottom: '0.4rem',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: 'rgba(226, 234, 244, 0.45)', flexShrink: 0 }}>{item.label}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: '#ffffff',
                    textAlign: 'right',
                  }}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* Confidence visual bar */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(226,234,244,0.45)', marginBottom: '0.35rem' }}>
              <span>YOLO-SEG CONFIDENCE</span>
              <span style={{ color: '#2dd4bf' }}>{(selectedTarget.confidence * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${selectedTarget.confidence * 100}%`,
                  background: `linear-gradient(90deg, #2dd4bf, ${selectedTarget.confidence > 0.9 ? '#5eead4' : '#f59e0b'})`,
                  boxShadow: '0 0 10px rgba(45,212,191,0.5)',
                  borderRadius: '3px',
                  transition: 'width 0.4s var(--ease-smooth)',
                }}
              />
            </div>
          </div>

          {/* Retrieval advisory */}
          <div
            style={{
              padding: '1rem 1.1rem',
              borderRadius: '10px',
              background: 'rgba(45, 212, 191, 0.07)',
              border: '1px solid rgba(45, 212, 191, 0.18)',
              backdropFilter: 'blur(4px)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.64rem',
                color: '#2dd4bf',
                letterSpacing: '0.1em',
                marginBottom: '0.45rem',
              }}
            >
              RETRIEVAL VECTOR ADVISORY
            </div>
            <p style={{ fontSize: '0.76rem', color: 'rgba(226, 234, 244, 0.75)', lineHeight: 1.6 }}>
              Surface vessel approach from 240° SW to avoid prevailing bottom currents. Recommended ROV grapple hook approach angle: 15° pitch.
            </p>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              background:
                selectedTarget.status === 'Critical'
                  ? 'rgba(244, 63, 94, 0.1)'
                  : 'rgba(45, 212, 191, 0.06)',
              border:
                selectedTarget.status === 'Critical'
                  ? '1px solid rgba(244, 63, 94, 0.3)'
                  : '1px solid rgba(45, 212, 191, 0.2)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color:
                  selectedTarget.status === 'Critical' ? '#f43f5e' : '#2dd4bf',
              }}
            >
              STATUS: {selectedTarget.status.toUpperCase()}
            </span>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: selectedTarget.status === 'Critical' ? '#f43f5e' : '#2dd4bf',
                boxShadow: `0 0 10px ${selectedTarget.status === 'Critical' ? '#f43f5e' : '#2dd4bf'}`,
                animation: 'glow-pulse 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Action buttons */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <MagneticButton
              onClick={() => triggerToast(`Exported ${selectedTarget.code} GeoJSON Recovery Vector`)}
              style={{ width: '100%', padding: '0.78rem', fontSize: '0.8rem' }}
            >
              Export Recovery Plan (.GeoJSON)
            </MagneticButton>

            <button
              onClick={() => triggerToast('Maritime Broadcast Sent → NOAA / USCG Emergency Feed')}
              style={{
                padding: '0.72rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'rgba(226, 234, 244, 0.75)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Broadcast to Maritime Net
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
