'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/ui/CustomCursor';
import MagneticButton from '@/components/ui/MagneticButton';

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

// Ambient particle canvas for moving glass refraction
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

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.55 + 0.25,
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
        opacity: 0.5,
      }}
    />
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'waterfall' | 'upload'>('map');
  const [selectedTarget, setSelectedTarget] = useState<DetectionTarget>(MOCK_TARGETS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('Standby');
  const [isFilterCritical, setIsFilterCritical] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);

  // Live clock
  const [timeUtc, setTimeUtc] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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
      { p: 25, s: '02 De-speckling & Resolution Normalization...' },
      { p: 55, s: '03 YOLO-seg ONNX Inference...' },
      { p: 85, s: '04 Geotagging & Coordinate Projection...' },
      { p: 100, s: '05 Complete: 3 New Targets Identified' },
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
          triggerToast('Sonar log processed: 3 confirmed ghost nets identified');
        }, 800);
      }
    }, 850);
  };

  const filteredTargets = isFilterCritical
    ? MOCK_TARGETS.filter((t) => t.status === 'Critical')
    : MOCK_TARGETS;

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
      }}
    >
      <CustomCursor />
      <AmbientParticles />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="ultra-glass"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '1rem 1.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            color: '#2dd4bf',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            animation: 'card-rise 0.4s ease-out',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(45,212,191,0.3)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2dd4bf',
              boxShadow: '0 0 10px #2dd4bf',
            }}
          />
          {toastMessage}
        </div>
      )}

      {/* ── Top Header Bar (Solid Clean Dark) ── */}
      <header
        style={{
          height: '66px',
          padding: '0 clamp(1.5rem, 3vw, 2.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(45, 212, 191, 0.14)',
          background: 'rgba(4, 9, 20, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand & Home Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
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
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '1.5px solid #2dd4bf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(45, 212, 191, 0.5)',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#2dd4bf',
                }}
              />
            </div>
            Ghost<span style={{ color: '#2dd4bf' }}>Net</span>
          </Link>

          <div
            style={{
              height: '18px',
              width: '1px',
              background: 'rgba(45, 212, 191, 0.2)',
            }}
          />

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'rgba(45, 212, 191, 0.85)',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
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

        {/* Telemetry Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textAlign: 'right' }}>
            <span style={{ color: 'rgba(226, 234, 244, 0.45)' }}>UTC CLOCK: </span>
            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{timeUtc}</span>
          </div>

          <Link
            href="/"
            className="solid-panel"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(226, 234, 244, 0.8)',
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            ← Back to Pitch
          </Link>
        </div>
      </header>

      {/* ── Key Metrics Bar (Solid Opaque Tiles with Hover Lift) ── */}
      <div
        style={{
          padding: '1.25rem clamp(1.5rem, 3vw, 2.5rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          borderBottom: '1px solid rgba(45, 212, 191, 0.1)',
          background: 'rgba(3, 8, 18, 0.8)',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {[
          { label: 'Area Scanned', val: '148.4 km²', sub: 'Olympic Coast Sector 4' },
          { label: 'Confirmed Ghost Nets', val: '18 Targets', sub: '92.4% Avg Confidence' },
          { label: 'Critical Entanglements', val: '7 High Risk', sub: 'Action Vector Ready' },
          { label: 'Active Sonar Depth', val: '-248.4 m', sub: 'Dual-Frequency 455 kHz' },
        ].map((m, i) => (
          <div
            key={i}
            className="solid-panel mouse-spotlight"
            style={{
              padding: '1rem 1.25rem',
              background: '#060c18',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: 'rgba(45, 212, 191, 0.75)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {m.val}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(226, 234, 244, 0.45)', marginTop: '0.15rem' }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Workspace ── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr minmax(320px, 390px)',
          gap: '1.25rem',
          padding: '1.25rem clamp(1.5rem, 3vw, 2.5rem)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* ── Left Column: Targets & Log Feed (Solid Opaque Sidebar) ── */}
        <div
          className="solid-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#060c18',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              Identified Targets ({filteredTargets.length})
            </div>

            <button
              onClick={() => setIsFilterCritical(!isFilterCritical)}
              className="solid-panel"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '4px',
                background: isFilterCritical ? 'rgba(244, 63, 94, 0.25)' : '#071020',
                border: isFilterCritical ? '1px solid #f43f5e' : '1px solid rgba(45, 212, 191, 0.2)',
                color: isFilterCritical ? '#f43f5e' : 'rgba(226, 234, 244, 0.8)',
                cursor: 'pointer',
              }}
            >
              {isFilterCritical ? '● Critical Only' : 'Show All'}
            </button>
          </div>

          {/* Targets List with Click Ripples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', flex: 1 }}>
            {filteredTargets.map((t) => {
              const isSelected = selectedTarget.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTarget(t);
                    triggerToast(`Selected Target ${t.code} (${t.type})`);
                  }}
                  className="solid-panel ripple-container"
                  style={{
                    padding: '0.9rem 1.1rem',
                    borderRadius: '10px',
                    background: isSelected ? '#0d2235' : '#071122',
                    border: isSelected ? '1.5px solid #2dd4bf' : '1px solid rgba(45, 212, 191, 0.1)',
                    boxShadow: isSelected ? '0 0 20px rgba(45, 212, 191, 0.25)' : 'none',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: isSelected ? '#2dd4bf' : '#ffffff',
                        fontSize: '0.88rem',
                      }}
                    >
                      {t.code}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background:
                          t.status === 'Critical'
                            ? 'rgba(244, 63, 94, 0.2)'
                            : 'rgba(45, 212, 191, 0.2)',
                        color: t.status === 'Critical' ? '#f43f5e' : '#2dd4bf',
                        border:
                          t.status === 'Critical'
                            ? '1px solid rgba(244, 63, 94, 0.5)'
                            : '1px solid rgba(45, 212, 191, 0.5)',
                      }}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'rgba(226, 234, 244, 0.75)',
                      margin: '0.35rem 0',
                    }}
                  >
                    {t.type}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'rgba(226, 234, 244, 0.45)',
                    }}
                  >
                    <span>{t.depth}</span>
                    <span>{(t.confidence * 100).toFixed(1)}% YOLO-seg</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ingest Sonar Log Trigger Button */}
          <MagneticButton
            onClick={handleSimulatedUpload}
            disabled={isUploading}
            style={{
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
            }}
          >
            {isUploading ? 'Ingesting Sonar Stream...' : '+ Ingest Sonar Log (.XTF)'}
          </MagneticButton>
        </div>

        {/* ── Center Column: Interactive Acoustic Seafloor Map / Sonar Waterfall (Solid Opaque Frame) ── */}
        <div
          className="solid-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#060c18',
            overflow: 'hidden',
          }}
        >
          {/* Workspace Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid rgba(45, 212, 191, 0.12)',
              background: '#040814',
            }}
          >
            {[
              { key: 'map', label: 'Bathymetric Hazard Map' },
              { key: 'waterfall', label: 'Sonar Spectrogram Stream' },
              { key: 'upload', label: 'Log Preprocessor & Filter' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: activeTab === tab.key ? '#2dd4bf' : 'rgba(226, 234, 244, 0.5)',
                  borderBottom: activeTab === tab.key ? '2px solid #2dd4bf' : '2px solid transparent',
                  paddingBottom: '0.4rem',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Interactive Bathymetric Sonar Grid */}
          {activeTab === 'map' && (
            <div
              style={{
                flex: 1,
                position: 'relative',
                background:
                  'radial-gradient(ellipse at center, #06182c 0%, #030d18 60%, #01040a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Radar Coordinate Grid */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(45,212,191,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.06) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Sweeping Sonar Radar Circles */}
              {[120, 240, 360, 480].map((r, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: `${r * 1.5}px`,
                    height: `${r * 1.5}px`,
                    borderRadius: '50%',
                    border: '1px solid rgba(45, 212, 191, 0.15)',
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* Sweeping Radar Scanner Line */}
              <div
                style={{
                  position: 'absolute',
                  width: '500px',
                  height: '500px',
                  borderRadius: '50%',
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(45,212,191,0.25) 0deg, transparent 60deg, transparent 360deg)',
                  animation: 'sonar-sweep 5s linear infinite',
                  pointerEvents: 'none',
                }}
              />

              {/* AUV Drone Position Blip */}
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '42%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#2dd4bf',
                    boxShadow: '0 0 16px #2dd4bf',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: '#2dd4bf',
                    marginTop: '0.2rem',
                  }}
                >
                  AUV-04 (LIVE)
                </span>
              </div>

              {/* Mapped Target Blips */}
              {MOCK_TARGETS.map((t, idx) => {
                const positions = [
                  { top: '35%', left: '60%' },
                  { top: '65%', left: '72%' },
                  { top: '55%', left: '25%' },
                  { top: '22%', left: '38%' },
                  { top: '78%', left: '44%' },
                ];
                const pos = positions[idx % positions.length];
                const isSelected = selectedTarget.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTarget(t);
                      triggerToast(`Target Blip ${t.code} Locked`);
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
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div
                      style={{
                        width: isSelected ? '18px' : '12px',
                        height: isSelected ? '18px' : '12px',
                        borderRadius: '50%',
                        background: t.status === 'Critical' ? '#f43f5e' : '#2dd4bf',
                        boxShadow: `0 0 16px ${t.status === 'Critical' ? '#f43f5e' : '#2dd4bf'}`,
                        border: '2px solid #fff',
                        transition: 'all 0.2s',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: isSelected ? '#ffffff' : 'rgba(226, 234, 244, 0.7)',
                        background: '#040916',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: isSelected ? '1px solid #2dd4bf' : '1px solid rgba(255,255,255,0.1)',
                        marginTop: '0.25rem',
                      }}
                    >
                      {t.code}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Sonar Spectrogram Stream */}
          {activeTab === 'waterfall' && (
            <div
              style={{
                flex: 1,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: '#2dd4bf',
                }}
              >
                // MULTI-BEAM HIGH FREQUENCY SONAR SPECTROGRAM [455 kHz]
              </div>

              {/* Simulated Waterfall Display */}
              <div
                style={{
                  height: '320px',
                  borderRadius: '8px',
                  background:
                    'linear-gradient(180deg, #0f2d3a 0%, #081d26 50%, #030d12 100%)',
                  border: '1px solid rgba(45, 212, 191, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(45,212,191,0.08) 0px, rgba(45,212,191,0.08) 2px, transparent 2px, transparent 4px)',
                  }}
                />

                {/* YOLO-seg Bounding Box Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '30%',
                    left: '40%',
                    width: '180px',
                    height: '110px',
                    border: '2px solid #2dd4bf',
                    borderRadius: '4px',
                    background: 'rgba(45, 212, 191, 0.18)',
                    boxShadow: '0 0 25px rgba(45, 212, 191, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#02050e',
                      background: '#2dd4bf',
                      padding: '0.1rem 0.3rem',
                      borderRadius: '2px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    GHOST_NET: 96.4%
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      color: '#2dd4bf',
                    }}
                  >
                    MASK: 4,820 PX
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#081120',
                    borderRadius: '6px',
                    border: '1px solid rgba(45,212,191,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'rgba(226,234,244,0.5)' }}>
                    Speckle SNR
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2dd4bf' }}>
                    +24.8 dB
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#081120',
                    borderRadius: '6px',
                    border: '1px solid rgba(45,212,191,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'rgba(226,234,244,0.5)' }}>
                    Inference Time
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    14.2 ms
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#081120',
                    borderRadius: '6px',
                    border: '1px solid rgba(45,212,191,0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'rgba(226,234,244,0.5)' }}>
                    Resolution
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    0.05 m/px
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Upload & Preprocessor */}
          {activeTab === 'upload' && (
            <div
              style={{
                flex: 1,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  padding: '3rem 2rem',
                  border: '2px dashed rgba(45, 212, 191, 0.35)',
                  borderRadius: '12px',
                  background: '#070e1c',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  Upload Raw Sonar File (.XTF / .JSF / .SGY)
                </div>

                <p style={{ fontSize: '0.8rem', color: 'rgba(226, 234, 244, 0.5)', maxWidth: '380px' }}>
                  Drag & drop sonar logs directly from Edgeping, Edgetech, or Klein systems. Runs local ONNX model
                  with no cloud dependency.
                </p>

                <MagneticButton
                  onClick={handleSimulatedUpload}
                  disabled={isUploading}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 2.2rem',
                    fontSize: '0.85rem',
                  }}
                >
                  Select File & Analyze
                </MagneticButton>
              </div>

              {/* Upload Progress Stepper */}
              {isUploading && (
                <div style={{ marginTop: '2rem', width: '100%', maxWidth: '540px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#2dd4bf',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span>{uploadStep}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: '#081120',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress}%`,
                        background: '#2dd4bf',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column: Target Details & Retrieval Plan (ULTRA-LUXURY GLASS PANEL) ── */}
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
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              position: 'relative',
              zIndex: 2,
            }}
          >
            Target Telemetry // {selectedTarget.code}
          </div>

          {/* Details Table */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: 'rgba(3, 7, 16, 0.45)',
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid rgba(45, 212, 191, 0.12)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {[
              { label: 'Latitude', val: selectedTarget.lat },
              { label: 'Longitude', val: selectedTarget.lon },
              { label: 'Seafloor Depth', val: selectedTarget.depth },
              { label: 'Estimated Footprint', val: selectedTarget.area },
              { label: 'Gear Classification', val: selectedTarget.type },
              { label: 'YOLO-seg Confidence', val: `${(selectedTarget.confidence * 100).toFixed(1)}%` },
              { label: 'First Detected', val: selectedTarget.timestamp },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  paddingBottom: '0.4rem',
                }}
              >
                <span style={{ color: 'rgba(226, 234, 244, 0.55)' }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#ffffff' }}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* Action Vector Guidance */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(45, 212, 191, 0.08)',
              border: '1px solid rgba(45, 212, 191, 0.22)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: '#2dd4bf',
                letterSpacing: '0.08em',
                marginBottom: '0.4rem',
              }}
            >
              RETRIEVAL VECTOR ADVISORY
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(226, 234, 244, 0.8)', lineHeight: 1.5 }}>
              Surface vessel approach from 240° SW to avoid prevailing bottom currents. Recommended ROV grapple hook
              approach angle: 15° pitch.
            </p>
          </div>

          {/* Export Actions with Magnetic Buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', position: 'relative', zIndex: 2 }}>
            <MagneticButton
              onClick={() => triggerToast(`Exported ${selectedTarget.code} GeoJSON Recovery Vector`)}
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.82rem',
              }}
            >
              Export Recovery Plan (.GeoJSON)
            </MagneticButton>

            <button
              onClick={() => triggerToast('Maritime Broadcast Sent to NOAA / USCG Emergency Feed')}
              className="solid-panel"
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#e2eaf4',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid rgba(45, 212, 191, 0.2)',
                cursor: 'pointer',
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
