'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  Video,
  Scan,
  Download,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
  FileVideo,
  ShieldCheck,
  Target,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { ghostnetApi, type Detection } from '@/lib/api';

interface CapturedSnag {
  id: string;
  timestampSec: number;
  formattedTime: string;
  label: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium';
  area_m2: number;
  lat: number;
  lon: number;
  depth_m: number;
  thumbnailUrl: string;
  bbox: { x_min: number; y_min: number; x_max: number; y_max: number };
}

const PRELOADED_SURVEY_CLIPS = [
  {
    id: 'clip-1',
    name: 'Survey Leg 01: Reef Rim Ghost Net Drift',
    description: '455 kHz Sonar sweep over Goa continental shelf with synthetic nylon gillnets',
    durationSec: 36,
    anomalyTimestamps: [
      { sec: 6, label: 'ghost_net', confidence: 0.94, severity: 'critical' as const, bbox: { x_min: 220, y_min: 130, x_max: 460, y_max: 320 }, area_m2: 22.4, lat: 15.4989, lon: 73.8278, depth: 42.5 },
      { sec: 18, label: 'rope', confidence: 0.86, severity: 'high' as const, bbox: { x_min: 340, y_min: 160, x_max: 540, y_max: 290 }, area_m2: 8.7, lat: 15.4994, lon: 73.8282, depth: 43.1 },
      { sec: 29, label: 'ghost_net', confidence: 0.91, severity: 'critical' as const, bbox: { x_min: 160, y_min: 100, x_max: 420, y_max: 300 }, area_m2: 19.8, lat: 15.4999, lon: 73.8288, depth: 44.0 },
    ],
  },
  {
    id: 'clip-2',
    name: 'Survey Leg 02: Deep Shipping Corridor Clump',
    description: '900 kHz Hi-Res towfish pass identifying heavy trawl doors and entangled rigging',
    durationSec: 42,
    anomalyTimestamps: [
      { sec: 9, label: 'trawl_door', confidence: 0.88, severity: 'high' as const, bbox: { x_min: 280, y_min: 140, x_max: 510, y_max: 310 }, area_m2: 14.2, lat: 15.4120, lon: 73.7910, depth: 58.0 },
      { sec: 25, label: 'ghost_net', confidence: 0.93, severity: 'critical' as const, bbox: { x_min: 190, y_min: 110, x_max: 450, y_max: 330 }, area_m2: 26.5, lat: 15.4126, lon: 73.7917, depth: 58.6 },
    ],
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SonarVideoAnalysisPage() {
  const router = useRouter();

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('clip-1');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(36);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [autoPauseOnDetect, setAutoPauseOnDetect] = useState<boolean>(true);

  // AI Detections & Captures
  const [activeDetections, setActiveDetections] = useState<any[]>([]);
  const [capturedSnags, setCapturedSnags] = useState<CapturedSnag[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(-999);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastInferenceTimeRef = useRef<number>(0);

  const currentPreset = PRELOADED_SURVEY_CLIPS.find((c) => c.id === selectedPresetId) ?? PRELOADED_SURVEY_CLIPS[0];

  // Load Preset Simulation
  const selectPreset = (clip: typeof PRELOADED_SURVEY_CLIPS[0]) => {
    setSelectedPresetId(clip.id);
    setVideoFile(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setCurrentTime(0);
    setDuration(clip.durationSec);
    setIsPlaying(false);
    setActiveDetections([]);
    setCapturedSnags([]);
    setLastCaptureTime(-999);
  };

  // Handle Custom Video Upload
  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (.mp4, .webm, .mov, etc.)');
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setSelectedPresetId('custom');
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveDetections([]);
    setCapturedSnags([]);
    setLastCaptureTime(-999);
  };

  // Capture Snapshot from Video or Canvas
  const captureCurrentFrameAsDataUrl = (): string => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 640;
    offCanvas.height = 420;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return '';

    if (videoRef.current && videoUrl) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 420);
    } else if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 0, 0, 640, 420);
    }
    return offCanvas.toDataURL('image/jpeg', 0.92);
  };

  // Trigger Auto-Capture on Net Detection
  const handleSnagDetected = useCallback((anomaly: any, timestampSec: number) => {
    // Avoid duplicate captures within 3 seconds of the same snag
    if (Math.abs(timestampSec - lastCaptureTime) < 3.0) return;

    const snapshot = captureCurrentFrameAsDataUrl();
    const newSnag: CapturedSnag = {
      id: `SNAG-${Date.now().toString().slice(-6)}`,
      timestampSec,
      formattedTime: formatTime(timestampSec),
      label: anomaly.label,
      confidence: anomaly.confidence,
      severity: anomaly.severity || 'critical',
      area_m2: anomaly.area_m2 || 18.5,
      lat: anomaly.lat || 15.4989,
      lon: anomaly.lon || 73.8278,
      depth_m: anomaly.depth || 42.5,
      thumbnailUrl: snapshot,
      bbox: anomaly.bbox,
    };

    setCapturedSnags((prev) => [newSnag, ...prev]);
    setLastCaptureTime(timestampSec);

    if (autoPauseOnDetect) {
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
    }
  }, [lastCaptureTime, autoPauseOnDetect, videoUrl]);

  // Real-Time Frame Inference Engine on Live Video Feed
  const runLiveInferenceOnFrame = async () => {
    if (Date.now() - lastInferenceTimeRef.current < 600) return; // limit to ~1.6 FPS for live video
    lastInferenceTimeRef.current = Date.now();

    const snapshot = captureCurrentFrameAsDataUrl();
    if (!snapshot) return;

    setIsScanning(true);

    try {
      // Convert Data URL to Blob for FastAPI YOLO direct inference
      const res = await fetch(snapshot);
      const blob = await res.blob();
      const file = new File([blob], 'video_frame.jpg', { type: 'image/jpeg' });

      const detectRes = await ghostnetApi.detectDirectImage(file, {
        lat: 15.4989,
        lon: 73.8278,
        depth_m: 42.5,
      });

      if (detectRes && detectRes.detections && detectRes.detections.length > 0) {
        setActiveDetections(detectRes.detections);
        const topDet = detectRes.detections[0];
        if (topDet.confidence >= 0.65) {
          handleSnagDetected({
            label: topDet.label,
            confidence: topDet.confidence,
            severity: topDet.severity,
            bbox: topDet.bbox,
            area_m2: topDet.area_m2 || 18.0,
            lat: topDet.geo?.lat || 15.4989,
            lon: topDet.geo?.lon || 73.8278,
            depth: topDet.geo?.depth_m || 42.5,
          }, currentTime);
        }
      } else {
        setActiveDetections([]);
      }
    } catch {
      // If backend offline, fall back to preset simulated anomaly timestamps
      if (selectedPresetId !== 'custom') {
        const matchingAnomaly = currentPreset.anomalyTimestamps.find(
          (a) => Math.abs(currentTime - a.sec) <= 1.5
        );
        if (matchingAnomaly) {
          setActiveDetections([matchingAnomaly]);
          handleSnagDetected(matchingAnomaly, currentTime);
        } else {
          setActiveDetections([]);
        }
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Capture and Immediately Analyze Frame in AI Workstation
  const analyzeCurrentFrameInWorkstation = () => {
    const snapshot = captureCurrentFrameAsDataUrl();
    if (!snapshot) return;

    try {
      sessionStorage.setItem('ghostnet_live_snapshot', snapshot);
      sessionStorage.setItem('ghostnet_snapshot_time', formatTime(currentTime));
      sessionStorage.setItem('ghostnet_snapshot_source', videoFile ? videoFile.name : currentPreset.name);
    } catch {
      // ignore
    }

    router.push('/dashboard');
  };

  // Synthetic Seabed Sonar Video Canvas Renderer (when no MP4 is uploaded)
  // Uses precomputed steady particles and smooth linear forward sweep line to eliminate wobble/up-and-down shaking
  const particlesRef = useRef<{ x: number; y: number; s: number; alpha: number }[]>([]);
  useEffect(() => {
    // Generate fixed particle field once
    const pts = [];
    for (let i = 0; i < 400; i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.12 + 0.04,
      });
    }
    particlesRef.current = pts;
  }, []);

  useEffect(() => {
    if (videoUrl) return; // User uploaded an actual video

    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanProgress = (currentTime / Math.max(1, duration)) % 1;

    const renderSeabedSimulation = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Deep steady underwater bathymetry background
      ctx.fillStyle = '#060D1A';
      ctx.fillRect(0, 0, w, h);

      // Acoustic swath gradient (port & starboard channels)
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#0D1B2A');
      grad.addColorStop(0.46, '#081426');
      grad.addColorStop(0.5, '#020617'); // Nadir blind zone
      grad.addColorStop(0.54, '#081426');
      grad.addColorStop(1, '#0D1B2A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Steady sediment particles (fixed coordinates, no oscillation)
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        ctx.fillStyle = `rgba(180, 220, 255, ${pt.alpha})`;
        ctx.fillRect(pt.x * w, pt.y * h, pt.s, pt.s);
      }

      // Center Nadir line
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Range grid lines (horizontal depth slices)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 40; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Smooth downward waterfall sweep line
      const sweepY = ((currentTime / Math.max(1, duration)) * h) % h;
      const sweepGrad = ctx.createLinearGradient(0, sweepY - 30, 0, sweepY);
      sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, Math.max(0, sweepY - 30), w, 30);

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(w, sweepY);
      ctx.stroke();

      // Render Passing Ghost Net anomaly if within active timestamp
      const activeAnomaly = currentPreset.anomalyTimestamps.find(
        (a) => Math.abs(currentTime - a.sec) <= 1.8
      );

      if (activeAnomaly) {
        const bx = activeAnomaly.bbox.x_min * (w / 640);
        const by = activeAnomaly.bbox.y_min * (h / 420);
        const bw = (activeAnomaly.bbox.x_max - activeAnomaly.bbox.x_min) * (w / 640);
        const bh = (activeAnomaly.bbox.y_max - activeAnomaly.bbox.y_min) * (h / 420);

        // Acoustic shadow patch behind net
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(bx + bw * 0.4, by + 8, bw * 0.9, bh * 0.95);

        // High-reflectivity netting mesh filaments
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = bx; x < bx + bw; x += 12) {
          ctx.moveTo(x, by);
          ctx.lineTo(x + 8, by + bh);
        }
        for (let y = by; y < by + bh; y += 12) {
          ctx.moveTo(bx, y);
          ctx.lineTo(bx + bw, y + 8);
        }
        ctx.stroke();

        // High-intensity acoustic highlight knots
        ctx.fillStyle = '#E0F2FE';
        for (let kx = bx; kx < bx + bw; kx += 24) {
          for (let ky = by; ky < by + bh; ky += 24) {
            ctx.fillRect(kx, ky, 3, 3);
          }
        }
      }

      // Sonar Header Overlay
      ctx.fillStyle = 'rgba(6, 13, 26, 0.9)';
      ctx.fillRect(0, 0, w, 26);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`SEABED SSS SCANNER · ${currentPreset.name.toUpperCase()} · 455 kHz`, 12, 17);

      animationId = requestAnimationFrame(renderSeabedSimulation);
    };

    renderSeabedSimulation();
    return () => cancelAnimationFrame(animationId);
  }, [currentTime, currentPreset, videoUrl, duration]);

  // Video Time Progression & Frame AI Trigger
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + 0.25 * playbackRate;
        if (nextTime >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return nextTime;
      });

      // Sample frame and run YOLO inference
      runLiveInferenceOnFrame();
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackRate, currentPreset]);

  // Sync custom HTML5 <video> element
  const togglePlay = () => {
    if (videoRef.current && videoUrl) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (currentTime >= duration) setCurrentTime(0);
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (sec: number) => {
    setCurrentTime(sec);
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = sec;
    }
  };

  const downloadJPG = (snag: CapturedSnag) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 640;
      canvas.height = img.height || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw GPS telemetry overlay bar at bottom
      const barH = 48;
      ctx.fillStyle = 'rgba(7, 90, 115, 0.92)';
      ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

      // Top decorative border
      ctx.strokeStyle = '#B8C9CC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - barH);
      ctx.lineTo(canvas.width, canvas.height - barH);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`GEO-LOC: LAT ${snag.lat.toFixed(5)}°N | LON ${snag.lon.toFixed(5)}°E | DEPTH: ${snag.depth_m.toFixed(1)}m`, 14, canvas.height - 28);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#B8C9CC';
      ctx.fillText(`SNAG: ${snag.label.toUpperCase()} (${(snag.confidence * 100).toFixed(0)}%) | TIME: ${snag.formattedTime} | DATUM: WGS-84`, 14, canvas.height - 12);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.95);
      a.download = `captured-snag-${snag.id}-${snag.lat.toFixed(4)}N-${snag.lon.toFixed(4)}E.jpg`;
      a.click();
    };
    img.src = snag.thumbnailUrl;
  };

  const sendToWorkstation = (snag: CapturedSnag) => {
    try {
      sessionStorage.setItem('ghostnet_live_snapshot', snag.thumbnailUrl);
      sessionStorage.setItem('ghostnet_snapshot_time', snag.formattedTime);
      sessionStorage.setItem('ghostnet_snapshot_source', snag.id);
    } catch {
      // ignore
    }
    router.push('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Header Toolbar Card: Tactical Ocean AUV Theme ── */}
      <div className="cyber-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(45,212,191,0.35)]">
            <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-mono flex items-center gap-2">
              AUV Video &amp; Acoustic Waterfall Scanner
              <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-teal-500/15 text-teal-300 border border-teal-500/35 tracking-wider">
                YOLOv8 TRACKER
              </span>
            </h1>
            <span className="text-xs text-slate-400 font-mono">
              Real-time seabed survey feed · Temporal feature tracker · Extract frames directly to AI Workstation
            </span>
          </div>
        </div>

        {/* Action Controls & Upload */}
        <div className="flex items-center gap-3">
          <input
            id="seabed-video-input"
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.webm,.mov"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]);
              e.target.value = '';
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-pill-filter text-xs"
            title="Upload custom underwater seabed survey video"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
            <span>{videoFile ? videoFile.name : 'Upload Survey Video'}</span>
          </button>

          <button
            onClick={togglePlay}
            className="btn-primary text-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Feed' : 'Scan Feed'}</span>
          </button>

          {/* Dedicated Instant Analyze Frame Button */}
          <button
            onClick={analyzeCurrentFrameInWorkstation}
            className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold font-mono transition-all flex items-center gap-1.5 border border-teal-500/40 shadow-sm"
            title="Analyze the current stopped frame in the AI Workstation"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Analyze Frame at {formatTime(currentTime)}</span>
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Layout: Video Display + Captured Targets Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Video Viewport + Live Bounding Box + Controls (8 cols on lg) */}
        <div className="lg:col-span-8 cyber-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-white/[0.08] font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'bg-amber-400'}`} />
              <span className="text-slate-200">{videoFile ? `FEED: ${videoFile.name}` : currentPreset.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
              {isScanning && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono animate-pulse">
                  AI SCANNING ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Video Player / Canvas Frame with Overlaid Bounding Boxes */}
          <div className="h-[400px] w-full rounded-xl bg-[#020611] border border-teal-500/25 overflow-hidden relative shadow-inner flex items-center justify-center select-none">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration);
                }}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={800}
                height={480}
                className="w-full h-full object-cover"
              />
            )}

            {/* Scanline HUD effect */}
            <div className="waterfall-scanline" />

            {/* Live Bounding Box Overlay on Video Stream */}
            {activeDetections.map((det, idx) => {
              const left = `${(det.bbox.x_min / 640) * 100}%`;
              const top = `${(det.bbox.y_min / 420) * 100}%`;
              const width = `${((det.bbox.x_max - det.bbox.x_min) / 640) * 100}%`;
              const height = `${((det.bbox.y_max - det.bbox.y_min) / 420) * 100}%`;

              return (
                <div
                  key={idx}
                  className="absolute border-2 border-teal-400 bg-teal-500/15 pointer-events-none rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all"
                  style={{ left, top, width, height }}
                >
                  <div className="absolute -top-7 left-0 px-2.5 py-0.5 rounded-md bg-slate-950/90 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold whitespace-nowrap flex items-center gap-1.5 shadow-md">
                    <Target className="w-3 h-3 text-teal-400" />
                    <span>{formatLabel(det.label)}</span>
                    <span className="text-white">{(det.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}

            {/* Detection Banner Overlay */}
            {activeDetections.length > 0 && (
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-red-950/90 backdrop-blur-md text-red-200 text-xs font-mono font-bold border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                <span>GHOST GEAR TARGET ACQUIRED</span>
              </div>
            )}

            {/* When Video is Paused: In-Player Action Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-[#030712]/70 backdrop-blur-[3px] flex items-center justify-center pointer-events-none">
                <button
                  onClick={analyzeCurrentFrameInWorkstation}
                  className="pointer-events-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 hover:scale-105 text-slate-950 font-black text-xs font-mono uppercase tracking-wider shadow-[0_0_25px_rgba(45,212,191,0.4)] border border-teal-400/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze Frame at {formatTime(currentTime)} in Workstation</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            )}
          </div>

          {/* Video Playback & Seek Controls */}
          <div className="space-y-3 pt-1">
            {/* Seek Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-teal-400 font-mono w-10">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="flex-1 accent-[#2DD4BF] cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-400 font-mono w-10 text-right">{formatTime(duration)}</span>
            </div>

            {/* Playback Settings & Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/40 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => seekTo(0)}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/[0.08] transition-colors"
                  title="Restart Video"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed Toggles */}
                <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-white/[0.08] text-xs font-mono font-bold">
                  {[1, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${playbackRate === rate ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={analyzeCurrentFrameInWorkstation}
                  className="ml-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/[0.08] hover:border-teal-500/30 text-teal-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  title="Send current paused frame to Workstation"
                >
                  <Scan className="w-3.5 h-3.5 text-teal-400" />
                  <span>Send to Workstation</span>
                </button>
              </div>

              {/* Auto Pause Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPauseOnDetect}
                  onChange={(e) => setAutoPauseOnDetect(e.target.checked)}
                  className="w-4 h-4 text-teal-400 rounded accent-[#2DD4BF]"
                />
                <span>Auto-pause on Net Detection</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Captured Ghost Nets & Targets Feed (4 cols on lg) */}
        <div className="lg:col-span-4 cyber-card p-5 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-white block">
                  CAPTURED TARGETS TIMELINE
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {capturedSnags.length} Target{capturedSnags.length !== 1 ? 's' : ''} auto-cataloged
                </span>
              </div>
              <span className="pill-badge-ocean text-[10px]">AUTO-LOG</span>
            </div>

            {/* Timeline List of Captured Targets */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {capturedSnags.length > 0 ? (
                capturedSnags.map((snag) => (
                  <div
                    key={snag.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-teal-500/40 hover:bg-white/[0.05] transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-teal-300 font-mono">{snag.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-900 text-slate-400 font-mono border border-white/[0.08]">
                          @{snag.formattedTime}
                        </span>
                      </div>
                      <span className="pill-badge-red text-[10px] uppercase">{snag.severity}</span>
                    </div>

                    {/* Snapshot Preview & Details */}
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-14 rounded-lg bg-black overflow-hidden border border-white/[0.1] shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={snag.thumbnailUrl}
                          alt="Captured Snag"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-0.5 text-[11px] text-slate-300 flex-1 font-mono">
                        <span className="font-bold text-white block text-xs truncate">{formatLabel(snag.label)}</span>
                        <div className="flex justify-between text-slate-400">
                          <span>Confidence:</span>
                          <strong className="text-teal-400">{(snag.confidence * 100).toFixed(0)}%</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Est. Area:</span>
                          <strong className="text-cyan-300">{snag.area_m2} m²</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for this Captured Target */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-white/[0.06] text-[11px] font-mono">
                      <button
                        onClick={() => seekTo(snag.timestampSec)}
                        className="py-1 px-2 rounded-lg bg-slate-900 border border-white/[0.08] hover:bg-slate-800 text-slate-300 font-semibold transition-colors flex items-center justify-center gap-1"
                        title="Seek video to this timestamp"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Seek</span>
                      </button>
                      <button
                        onClick={() => downloadJPG(snag)}
                        className="py-1 px-2 rounded-lg bg-slate-900 border border-white/[0.08] hover:bg-slate-800 text-slate-300 font-semibold transition-colors flex items-center justify-center gap-1"
                        title="Download captured JPG frame"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>JPG</span>
                      </button>
                      <button
                        onClick={() => sendToWorkstation(snag)}
                        className="py-1 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-semibold transition-colors flex items-center justify-center gap-1"
                        title="Analyze in AI Workstation"
                      >
                        <Scan className="w-3.5 h-3.5 text-teal-400" />
                        <span>Analyze</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-2 text-slate-500">
                  <Scan className="w-8 h-8 mx-auto text-slate-600" />
                  <span className="text-xs font-bold text-slate-300 block font-mono">No Snags Detected Yet</span>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                    Play the video scan or pause at any point and click &ldquo;Analyze Frame&rdquo; to send the frame to the AI Workstation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preloaded Demo Clips Selector */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-2 font-mono">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
              Preloaded Survey Video Clips
            </span>
            <div className="space-y-1.5">
              {PRELOADED_SURVEY_CLIPS.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => selectPreset(clip)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                    selectedPresetId === clip.id
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.15)] font-semibold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{clip.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{clip.durationSec}s</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{clip.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

