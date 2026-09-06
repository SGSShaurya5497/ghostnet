'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Waves,
  Play,
  Pause,
  Activity,
  Sliders,
  Radio,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function SonarConsolePage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [gain, setGain] = useState<number>(65);
  const [frequency, setFrequency] = useState<number>(455);
  const [swathWidth, setSwathWidth] = useState<number>(50);
  const [colormap, setColormap] = useState<'cyan' | 'emerald' | 'amber' | 'thermal'>('cyan');
  const [speed, setSpeed] = useState<number>(4.2);
  const [pingCount, setPingCount] = useState<number>(1420);

  const waterfallCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let scanLine = 0;

    const render = () => {
      if (isPlaying) {
        setPingCount((prev) => prev + 1);

        // 1. Waterfall Canvas
        const wCanvas = waterfallCanvasRef.current;
        if (wCanvas) {
          const ctx = wCanvas.getContext('2d');
          if (ctx) {
            const w = wCanvas.width;
            const h = wCanvas.height;

            ctx.drawImage(wCanvas, 0, 0, w, h - 2, 0, 2, w, h - 2);

            const imgData = ctx.createImageData(w, 2);
            for (let x = 0; x < w; x++) {
              const distFromCenter = Math.abs(x - w / 2) / (w / 2);
              const nadirZone = distFromCenter < 0.05 ? 0.1 : 1;
              const noise = Math.random() * (gain / 100);
              
              const anomaly = Math.sin((scanLine + x) * 0.04) > 0.85 && distFromCenter > 0.2 && distFromCenter < 0.6 ? 0.9 : 0;
              const intensity = Math.min(1, (noise * 0.5 + anomaly * 0.8) * nadirZone);

              let r = 0, g = 0, b = 0;
              if (colormap === 'cyan') {
                r = Math.floor(intensity * 20);
                g = Math.floor(intensity * 180);
                b = Math.floor(intensity * 240);
              } else if (colormap === 'emerald') {
                r = Math.floor(intensity * 30);
                g = Math.floor(intensity * 230);
                b = Math.floor(intensity * 160);
              } else if (colormap === 'amber') {
                r = Math.floor(intensity * 240);
                g = Math.floor(intensity * 160);
                b = Math.floor(intensity * 40);
              } else {
                r = Math.floor(intensity * 255);
                g = Math.floor(intensity * 120);
                b = Math.floor(intensity * 50);
              }

              for (let y = 0; y < 2; y++) {
                const idx = (y * w + x) * 4;
                imgData.data[idx] = r;
                imgData.data[idx + 1] = g;
                imgData.data[idx + 2] = b;
                imgData.data[idx + 3] = 255;
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }
        }

        // 2. Waveform Canvas
        const wfCanvas = waveformCanvasRef.current;
        if (wfCanvas) {
          const ctx = wfCanvas.getContext('2d');
          if (ctx) {
            const w = wfCanvas.width;
            const h = wfCanvas.height;
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();

            ctx.strokeStyle = colormap === 'amber' ? '#F59E0B' : colormap === 'emerald' ? '#10B981' : '#38BDF8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
              const freqFactor = frequency / 100;
              const y = h / 2 + Math.sin((x + scanLine * 3) * 0.08 * freqFactor) * (gain * 0.35) * Math.sin(x * 0.02) + (Math.random() - 0.5) * 8;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }

        scanLine++;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, gain, frequency, colormap]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card ── */}
      <div className="light-saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Live Hydrographic Waterfall Console
            </h1>
            <span className="text-xs text-slate-400 font-medium">
              Dual Swath Side-scan Sonar Stream · PING #{pingCount}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {(['cyan', 'emerald', 'amber', 'thermal'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setColormap(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  colormap === c ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary-dark text-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Ping'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Waterfall Display + Settings (Grid) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Waterfall Viewport (8 cols on lg) */}
        <div className="lg:col-span-8 light-saas-card p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
            <span>PORT SWATH [ -{swathWidth}m ]</span>
            <span className="text-blue-600 font-black">NADIR BLIND ZONE</span>
            <span>STARBOARD SWATH [ +{swathWidth}m ]</span>
          </div>

          <div className="h-96 w-full rounded-2xl bg-slate-950 overflow-hidden relative shadow-inner">
            <canvas
              ref={waterfallCanvasRef}
              width={800}
              height={450}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono border border-slate-700/50 shadow-md">
              {frequency} kHz CHIRP · GAIN {gain}%
            </div>
          </div>

          {/* Waveform Canvas */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Acoustic Amplitude Waveform</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">2.4 MSPS Sampling</span>
            </div>
            <div className="h-24 w-full rounded-2xl bg-slate-950 overflow-hidden shadow-inner">
              <canvas
                ref={waveformCanvasRef}
                width={800}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Transducer Settings Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 light-saas-card p-6 flex flex-col justify-between h-full">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                TRANSDUCER CONTROLS
              </span>
              <button className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gain Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Acoustic Gain</span>
                <span className="font-bold text-blue-600 font-mono">{gain}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={gain}
                onChange={(e) => setGain(parseInt(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Frequency Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">CHIRP Transducer Frequency</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFrequency(455)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    frequency === 455 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  455 kHz (Wide)
                </button>
                <button
                  onClick={() => setFrequency(900)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    frequency === 900 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  900 kHz (Hi-Res)
                </button>
              </div>
            </div>

            {/* Swath Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Swath Width</span>
                <span className="font-bold text-blue-600 font-mono">{swathWidth} meters</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="10"
                value={swathWidth}
                onChange={(e) => setSwathWidth(parseInt(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vessel Telemetry Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vessel Survey Telemetry
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Speed Over Ground:</span>
                <span className="font-bold text-slate-900">{speed} knots</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bathymetric Depth:</span>
                <span className="font-bold text-slate-900">42.8 m</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transducer Heading:</span>
                <span className="font-bold text-slate-900">184.2° SSW</span>
              </div>
            </div>
          </div>

          {/* Towfish Motion Compensation Readout */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Towfish Motion Compensation
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">HEAVE</span>
                <span className="font-bold text-slate-900 font-mono text-sm">0.12 m</span>
                <div className="h-1 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                  <div className="h-full w-[12%] bg-emerald-500 rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">PITCH</span>
                <span className="font-bold text-slate-900 font-mono text-sm">1.4°</span>
                <div className="h-1 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                  <div className="h-full w-[14%] bg-blue-500 rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">ROLL</span>
                <span className="font-bold text-slate-900 font-mono text-sm">0.8°</span>
                <div className="h-1 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                  <div className="h-full w-[8%] bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex justify-between text-slate-500 pt-0.5 border-t border-slate-100">
              <span>Compensation Active:</span>
              <span className="font-bold text-emerald-600">IMU-6DOF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
