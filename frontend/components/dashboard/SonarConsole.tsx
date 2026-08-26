'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ──────────────────────────────────────────────
//  TYPES
// ──────────────────────────────────────────────
type FrequencyMode = '100 kHz' | '455 kHz' | '800 kHz';
type LogLevel = 'INFO' | 'WARN' | 'DET' | 'SYS' | 'ERR';

interface LogLine {
  id: number;
  level: LogLevel;
  text: string;
  ts: string;
}

interface DetectionEvent {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  conf: number;
  active: boolean;
}

// ──────────────────────────────────────────────
//  CONSTANTS
// ──────────────────────────────────────────────
const LEVEL_COLOR: Record<LogLevel, string> = {
  INFO: '#2dd4bf',
  WARN: '#f59e0b',
  DET:  '#f43f5e',
  SYS:  'rgba(226,234,244,0.45)',
  ERR:  '#f43f5e',
};

const LOG_TEMPLATES: Array<{ level: LogLevel; texts: string[] }> = [
  { level: 'SYS',  texts: ['XTF stream open — port /dev/sonar0', 'Syncing RTC to GPS pulse...', 'ONNX runtime v1.18 loaded (CUDA EP)', 'Swath acquisition active — 120 m port/stbd'] },
  { level: 'INFO', texts: ['Frame 4820 decoded — 0.05 m/px', 'De-speckle pass (Lee filter σ=0.82)', 'Nadir gap 3.2 m — interpolating', 'Slant-range correction applied', 'Bottom-track lock: −248.4 m', 'AGC gain adjusted → +18.4 dB', 'Pingrate: 4 Hz at current depth'] },
  { level: 'WARN', texts: ['Acoustic shadow zone — 12 m blind spot', 'Signal dropout 0.3 s — filling with NaN', 'Heading gyro drift +0.4°/min', 'Battery 71% — switch to eco mode?', 'Multipath detected on port channel'] },
  { level: 'DET',  texts: ['GHOST_NET confidence 96.4% — GN-0482', 'Trawl webbing cluster — 58 m span detected', 'Longline mask — 4 820 px area', 'YOLO-seg: class 0 at [340, 88, 180, 110]', 'Geotag broadcast → 48°14\'22.4"N 124°42\'18.1"W'] },
  { level: 'ERR',  texts: ['Starboard transducer temp: 74°C — limit 80°C'] },
];

const WATERFALL_COLORS = [
  [2,   7,  18],   // near-black deep
  [4,  12,  28],
  [6,  22,  44],
  [8,  38,  58],
  [12, 60,  72],
  [18, 100, 90],
  [28, 148, 120],
  [45, 212, 191],  // teal peak
  [80, 220, 160],
  [130, 220, 100],
  [200, 180, 60],
  [240, 120, 30],
  [255,  60,  30], // hot alert
];

function pickColor(intensity: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, intensity));
  const idx = t * (WATERFALL_COLORS.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, WATERFALL_COLORS.length - 1);
  const frac = idx - lo;
  const a = WATERFALL_COLORS[lo];
  const b = WATERFALL_COLORS[hi];
  return [
    Math.round(a[0] + (b[0] - a[0]) * frac),
    Math.round(a[1] + (b[1] - a[1]) * frac),
    Math.round(a[2] + (b[2] - a[2]) * frac),
  ];
}

function tsNow(): string {
  return new Date().toISOString().slice(11, 23) + ' UTC';
}

// ──────────────────────────────────────────────
//  SUB-COMPONENTS
// ──────────────────────────────────────────────

/** Live waveform oscilloscope canvas */
function WaveformCanvas({ gain, frequency }: { gain: number; frequency: FrequencyMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const tRef      = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqMap: Record<FrequencyMode, number> = { '100 kHz': 1.2, '455 kHz': 2.8, '800 kHz': 4.5 };
    const freqMult = freqMap[frequency];
    const gainNorm = gain / 100;

    const draw = () => {
      tRef.current += 0.022;
      const t = tRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const cx = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Dark glass background
      ctx.fillStyle = 'rgba(2,6,16,0.9)';
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(45,212,191,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (H / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 6; i++) {
        const x = (W / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Centre zero line
      ctx.strokeStyle = 'rgba(45,212,191,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cx);
      ctx.lineTo(W, cx);
      ctx.stroke();

      // Waveform glow (outer)
      const gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, 'rgba(45,212,191,0.0)');
      gradient.addColorStop(0.2, 'rgba(45,212,191,0.4)');
      gradient.addColorStop(0.8, 'rgba(45,212,191,0.4)');
      gradient.addColorStop(1, 'rgba(45,212,191,0.0)');

      ctx.strokeStyle = 'rgba(45,212,191,0.12)';
      ctx.lineWidth = 6;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const nx = x / W;
        const noise =
          Math.sin(nx * 60 * freqMult + t * 3.5) * 0.08 * gainNorm +
          Math.sin(nx * 18 * freqMult + t * 1.8) * 0.06 * gainNorm;
        const base =
          Math.sin(nx * 12 * freqMult + t * 2.2) * 0.55 * gainNorm +
          Math.sin(nx * 5.4 * freqMult + t * 1.1) * 0.28 * gainNorm;
        const y = cx + (base + noise) * cx * 0.72;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Waveform core
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const nx = x / W;
        const noise =
          Math.sin(nx * 60 * freqMult + t * 3.5) * 0.08 * gainNorm +
          Math.sin(nx * 18 * freqMult + t * 1.8) * 0.06 * gainNorm;
        const base =
          Math.sin(nx * 12 * freqMult + t * 2.2) * 0.55 * gainNorm +
          Math.sin(nx * 5.4 * freqMult + t * 1.1) * 0.28 * gainNorm;
        const y = cx + (base + noise) * cx * 0.72;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Peak markers
      ctx.fillStyle = 'rgba(45,212,191,0.9)';
      for (let x = 0; x < W; x += 40) {
        const nx = x / W;
        const noise =
          Math.sin(nx * 60 * freqMult + t * 3.5) * 0.08 * gainNorm +
          Math.sin(nx * 18 * freqMult + t * 1.8) * 0.06 * gainNorm;
        const base =
          Math.sin(nx * 12 * freqMult + t * 2.2) * 0.55 * gainNorm +
          Math.sin(nx * 5.4 * freqMult + t * 1.1) * 0.28 * gainNorm;
        const y = cx + (base + noise) * cx * 0.72;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [gain, frequency]);

  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={140}
      style={{ width: '100%', height: '140px', borderRadius: '8px', display: 'block' }}
    />
  );
}

/** Scrolling waterfall spectrogram canvas */
function WaterfallCanvas({
  gain,
  frequency,
  onDetection,
}: {
  gain: number;
  frequency: FrequencyMode;
  onDetection: (evt: DetectionEvent) => void;
}) {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const animRef         = useRef<number>(0);
  const imageDataRef    = useRef<ImageData | null>(null);
  const detTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDetectionRef  = useRef(onDetection);
  onDetectionRef.current = onDetection;

  const freqMap: Record<FrequencyMode, number> = { '100 kHz': 0.6, '455 kHz': 1.0, '800 kHz': 1.6 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    imageDataRef.current = ctx.createImageData(W, 1);

    let ticked = 0;
    let detId = 0;

    const scheduleDetection = () => {
      const delay = 4000 + Math.random() * 6000;
      detTimerRef.current = setTimeout(() => {
        const bx = Math.floor(W * 0.25 + Math.random() * W * 0.5);
        const bw = Math.floor(80 + Math.random() * 140);
        const bh = Math.floor(60 + Math.random() * 80);
        const conf = 0.84 + Math.random() * 0.14;
        onDetectionRef.current({
          id: ++detId,
          x: Math.max(0, bx - bw / 2),
          y: Math.floor(H * 0.2 + Math.random() * H * 0.5),
          w: bw,
          h: bh,
          label: ['GHOST_NET', 'TRAWL_CLUSTER', 'LONGLINE', 'MONOFILAMENT'][Math.floor(Math.random() * 4)],
          conf,
          active: true,
        });
        scheduleDetection();
      }, delay);
    };
    scheduleDetection();

    const draw = () => {
      ticked++;
      const gainNorm = gain / 100;
      const fm = freqMap[frequency];

      // Scroll existing content down by 1px
      const existing = ctx.getImageData(0, 0, W, H - 1);
      ctx.putImageData(existing, 0, 1);

      // Generate new top row
      const row = imageDataRef.current!;
      for (let x = 0; x < W; x++) {
        const nx = x / W;
        // Combine multiple harmonics for realistic spectrogram noise
        const val =
          (Math.sin(nx * 28 * fm + ticked * 0.018) * 0.3 +
            Math.sin(nx * 8 * fm  + ticked * 0.008) * 0.25 +
            Math.sin(nx * 55 * fm + ticked * 0.04)  * 0.15 +
            Math.random() * 0.18 +
            0.12) * gainNorm;

        const clamped = Math.max(0, Math.min(1, val));
        const [r, g, b] = pickColor(clamped);
        const base = x * 4;
        row.data[base]     = r;
        row.data[base + 1] = g;
        row.data[base + 2] = b;
        row.data[base + 3] = 255;
      }
      ctx.putImageData(row, 0, 0);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      if (detTimerRef.current) clearTimeout(detTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gain, frequency]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      style={{ width: '100%', height: '300px', borderRadius: '8px', display: 'block' }}
    />
  );
}

// ──────────────────────────────────────────────
//  MAIN SONAR CONSOLE
// ──────────────────────────────────────────────
export default function SonarConsole() {
  const [frequency, setFrequency] = useState<FrequencyMode>('455 kHz');
  const [gain, setGain]           = useState<number>(72);
  const [agcOn, setAgcOn]         = useState<boolean>(true);
  const [swath, setSwath]         = useState<number>(120);
  const [logLines, setLogLines]   = useState<LogLine[]>([]);
  const [detection, setDetection] = useState<DetectionEvent | null>(null);
  const logEndRef                 = useRef<HTMLDivElement>(null);
  const logIdRef                  = useRef<number>(0);
  const logTimerRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((level: LogLevel, text: string) => {
    setLogLines((prev) => {
      const next = [...prev, { id: ++logIdRef.current, level, text, ts: tsNow() }];
      return next.length > 180 ? next.slice(next.length - 180) : next;
    });
  }, []);

  // Periodic console log injection
  useEffect(() => {
    // Boot sequence
    const boot = [
      { l: 'SYS' as LogLevel, t: 'GhostNet SONAR OS v2.4.1 — booting...' },
      { l: 'SYS' as LogLevel, t: 'XTF stream open — port /dev/sonar0' },
      { l: 'INFO' as LogLevel, t: 'Syncing RTC to GPS pulse...' },
      { l: 'INFO' as LogLevel, t: 'ONNX runtime v1.18 loaded (CUDA EP)' },
      { l: 'INFO' as LogLevel, t: 'Swath acquisition active — 120 m port/stbd' },
      { l: 'SYS' as LogLevel, t: 'Pipeline ready. Awaiting sonar ping...' },
    ];
    boot.forEach((entry, i) => {
      setTimeout(() => addLog(entry.l, entry.t), i * 220);
    });

    // Continuous random stream
    const inject = () => {
      const group = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const text  = group.texts[Math.floor(Math.random() * group.texts.length)];
      addLog(group.level, text);
    };

    logTimerRef.current = setInterval(inject, 900 + Math.random() * 600);
    return () => {
      if (logTimerRef.current) clearInterval(logTimerRef.current);
    };
  }, [addLog]);

  // Auto-scroll console
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

  // Handle waterfall detection event
  const handleDetection = useCallback((evt: DetectionEvent) => {
    setDetection(evt);
    addLog('DET', `${evt.label} confidence ${(evt.conf * 100).toFixed(1)}% — bbox [${Math.round(evt.x)}, ${Math.round(evt.y)}, ${evt.w}, ${evt.h}]`);
    setTimeout(() => setDetection(null), 4500);
  }, [addLog]);

  const freqOptions: FrequencyMode[] = ['100 kHz', '455 kHz', '800 kHz'];

  // Signal stats derived from frequency
  const statsMap: Record<FrequencyMode, { snr: string; res: string; range: string }> = {
    '100 kHz': { snr: '+18.2 dB', res: '0.18 m/px', range: '600 m' },
    '455 kHz': { snr: '+24.8 dB', res: '0.05 m/px', range: '200 m' },
    '800 kHz': { snr: '+29.1 dB', res: '0.02 m/px', range: '80 m' },
  };
  const stats = statsMap[frequency];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.25rem',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* ─── ROW 1: Status bar ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#2dd4bf',
        }}
      >
        {/* Live indicator */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '999px',
            background: 'rgba(45,212,191,0.08)',
            border: '1px solid rgba(45,212,191,0.25)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#2dd4bf',
              boxShadow: '0 0 10px #2dd4bf',
              animation: 'glow-pulse 1.6s ease-in-out infinite',
            }}
          />
          LIVE SONAR FEED
        </span>
        <span style={{ color: 'rgba(226,234,244,0.35)' }}>·</span>
        <span style={{ color: 'rgba(226,234,244,0.6)' }}>MODE: SIDE-SCAN SYNTHETIC APERTURE</span>
        <span style={{ color: 'rgba(226,234,244,0.35)' }}>·</span>
        <span style={{ color: 'rgba(226,234,244,0.6)' }}>AUV-04 // DEPTH −248.4 m</span>
        <span style={{ marginLeft: 'auto', color: 'rgba(226,234,244,0.4)' }}>
          {tsNow()}
        </span>
      </div>

      {/* ─── ROW 2: Main 3-column grid ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr 1fr',
          gap: '1rem',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* ── LEFT: Waveform Oscilloscope ── */}
        <div
          className="ultra-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            padding: '1.1rem',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#2dd4bf', letterSpacing: '0.1em' }}>
              WAVEFORM OSCILLOSCOPE
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                background: 'rgba(45,212,191,0.1)',
                border: '1px solid rgba(45,212,191,0.25)',
                color: '#2dd4bf',
              }}
            >
              {frequency}
            </span>
          </div>

          {/* Waveform canvas */}
          <div style={{ position: 'relative', zIndex: 2, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(45,212,191,0.1)' }}>
            <WaveformCanvas gain={gain} frequency={frequency} />
          </div>

          {/* Signal stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', position: 'relative', zIndex: 2 }}>
            {[
              { label: 'Speckle SNR', val: stats.snr, accent: true },
              { label: 'Resolution', val: stats.res, accent: false },
              { label: 'Max Range', val: stats.range, accent: false },
              { label: 'Gain', val: `${gain}%`, accent: false },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-tile"
                style={{ padding: '0.6rem 0.75rem' }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(226,234,244,0.45)', letterSpacing: '0.06em', position: 'relative', zIndex: 2 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: s.accent ? '#2dd4bf' : '#ffffff', position: 'relative', zIndex: 2 }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* AGC toggle */}
          <button
            onClick={() => setAgcOn((v) => !v)}
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              background: agcOn ? 'rgba(45,212,191,0.1)' : 'rgba(255,255,255,0.03)',
              border: agcOn ? '1px solid rgba(45,212,191,0.4)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: agcOn ? '#2dd4bf' : 'rgba(226,234,244,0.5)' }}>
              AUTO-GAIN CONTROL (AGC)
            </span>
            <span
              style={{
                width: '30px',
                height: '16px',
                borderRadius: '8px',
                background: agcOn ? '#2dd4bf' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: agcOn ? '15px' : '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s var(--ease-smooth)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              />
            </span>
          </button>
        </div>

        {/* ── CENTER: Waterfall Spectrogram ── */}
        <div
          className="ultra-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            padding: '1.1rem',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#2dd4bf', letterSpacing: '0.1em' }}>
              WATERFALL SPECTROGRAM
            </span>
            {detection && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'rgba(244,63,94,0.2)',
                  border: '1px solid rgba(244,63,94,0.5)',
                  color: '#f43f5e',
                  animation: 'det-flash 1s ease-in-out infinite',
                }}
              >
                ● DETECTION EVENT
              </span>
            )}
          </div>

          {/* Waterfall with detection overlay */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(45,212,191,0.15)',
              flex: 1,
            }}
          >
            <WaterfallCanvas gain={gain} frequency={frequency} onDetection={handleDetection} />

            {/* Scanning line overlay */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.8), rgba(255,255,255,0.4), rgba(45,212,191,0.8), transparent)',
                boxShadow: '0 0 12px rgba(45,212,191,0.6)',
                animation: 'scan-line 3s linear infinite',
                pointerEvents: 'none',
              }}
            />

            {/* YOLO detection bounding box */}
            {detection && (
              <div
                style={{
                  position: 'absolute',
                  top: `${detection.y}px`,
                  left: `${detection.x}px`,
                  width: `${detection.w}px`,
                  height: `${detection.h}px`,
                  border: '2px solid #f43f5e',
                  borderRadius: '4px',
                  background: 'rgba(244,63,94,0.08)',
                  boxShadow: '0 0 20px rgba(244,63,94,0.45), inset 0 0 12px rgba(244,63,94,0.06)',
                  pointerEvents: 'none',
                  animation: 'card-rise 0.3s var(--ease-smooth)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '-1px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    background: '#f43f5e',
                    color: '#02050d',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '3px 3px 3px 0',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {detection.label}: {(detection.conf * 100).toFixed(1)}%
                </span>
                {/* Corner markers */}
                {[
                  { top: -1, left: -1, borderTop: '2px solid #2dd4bf', borderLeft: '2px solid #2dd4bf', borderBottom: 'none', borderRight: 'none' },
                  { top: -1, right: -1, borderTop: '2px solid #2dd4bf', borderRight: '2px solid #2dd4bf', borderBottom: 'none', borderLeft: 'none' },
                  { bottom: -1, left: -1, borderBottom: '2px solid #2dd4bf', borderLeft: '2px solid #2dd4bf', borderTop: 'none', borderRight: 'none' },
                  { bottom: -1, right: -1, borderBottom: '2px solid #2dd4bf', borderRight: '2px solid #2dd4bf', borderTop: 'none', borderLeft: 'none' },
                ].map((corner, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '10px',
                      height: '10px',
                      ...corner,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}

            {/* Colour scale legend */}
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '2px',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: '#f43f5e' }}>HIGH</span>
              <div
                style={{
                  width: '8px',
                  height: '60px',
                  borderRadius: '4px',
                  background: 'linear-gradient(to bottom, #ff3c1e, #f59e0b, #2dd4bf, #041828)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'rgba(226,234,244,0.4)' }}>LOW</span>
            </div>
          </div>

          {/* Frequency selector */}
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
            {freqOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: frequency === f ? 'rgba(45,212,191,0.18)' : 'rgba(255,255,255,0.03)',
                  border: frequency === f ? '1px solid rgba(45,212,191,0.55)' : '1px solid rgba(255,255,255,0.08)',
                  color: frequency === f ? '#2dd4bf' : 'rgba(226,234,244,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: frequency === f ? '0 0 16px rgba(45,212,191,0.2)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Gain + Swath sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', position: 'relative', zIndex: 2 }}>
            {/* Gain */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(226,234,244,0.5)' }}>GAIN</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#2dd4bf' }}>{gain}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#2dd4bf',
                  cursor: 'pointer',
                  height: '3px',
                }}
              />
            </div>

            {/* Swath */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(226,234,244,0.5)' }}>SWATH</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#2dd4bf' }}>{swath} m</span>
              </div>
              <input
                type="range"
                min={40}
                max={300}
                step={10}
                value={swath}
                onChange={(e) => setSwath(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#2dd4bf',
                  cursor: 'pointer',
                  height: '3px',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Console Terminal ── */}
        <div
          className="ultra-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1.1rem',
            minHeight: 0,
          }}
        >
          {/* Terminal header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['#f43f5e', '#f59e0b', '#2dd4bf'].map((c, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.8 }} />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(226,234,244,0.4)', marginLeft: '0.25rem' }}>
              ghostnet_console — AUV-04
            </span>
          </div>

          {/* Log scrolling area */}
          <div
            className="glass-terminal"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.75rem',
              minHeight: 0,
              maxHeight: '380px',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              {logLines.map((line) => (
                <div
                  key={line.id}
                  style={{
                    display: 'flex',
                    gap: '0.6rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.64rem',
                    lineHeight: 1.65,
                    marginBottom: '0.1rem',
                  }}
                >
                  <span style={{ color: 'rgba(226,234,244,0.25)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {line.ts.slice(0, 12)}
                  </span>
                  <span
                    style={{
                      color: LEVEL_COLOR[line.level],
                      fontWeight: line.level === 'DET' || line.level === 'ERR' ? 700 : 400,
                      flexShrink: 0,
                      minWidth: '2.8rem',
                    }}
                  >
                    [{line.level}]
                  </span>
                  <span
                    style={{
                      color: line.level === 'SYS'
                        ? 'rgba(226,234,244,0.5)'
                        : line.level === 'DET'
                        ? '#fca5a5'
                        : 'rgba(226,234,244,0.8)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
              {/* Blinking cursor */}
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '13px',
                  background: '#2dd4bf',
                  verticalAlign: 'middle',
                  marginLeft: '2px',
                  animation: 'console-blink 1.1s step-end infinite',
                  boxShadow: '0 0 8px #2dd4bf',
                }}
              />
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Console log legend */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
            {(Object.entries(LEVEL_COLOR) as [LogLevel, string][]).map(([lvl, col]) => (
              <span key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(226,234,244,0.5)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: col, flexShrink: 0 }} />
                {lvl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ROW 3: Bottom telemetry strip ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.75rem',
        }}
      >
        {[
          { label: 'PING RATE', val: '4 Hz', sub: 'at −248 m' },
          { label: 'NADIR GAP', val: '3.2 m', sub: 'Interp. active' },
          { label: 'AUV SPEED', val: '1.8 kn', sub: '0.93 m/s' },
          { label: 'HEADING', val: '247°', sub: 'SW bearing' },
          { label: 'FRAMES/SEC', val: '22.4', sub: `${frequency} mode` },
          { label: 'INFERENCE', val: '14.2 ms', sub: 'ONNX-CUDA' },
        ].map((m) => (
          <div
            key={m.label}
            className="glass-tile"
            style={{ padding: '0.7rem 0.85rem' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(45,212,191,0.7)', letterSpacing: '0.08em', position: 'relative', zIndex: 2 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', position: 'relative', zIndex: 2 }}>
              {m.val}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(226,234,244,0.35)', position: 'relative', zIndex: 2 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
