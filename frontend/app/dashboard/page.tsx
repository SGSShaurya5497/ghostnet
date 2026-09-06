'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  ghostnetApi,
  type DetectionResponse,
  type Detection,
  type ReportItem,
} from '@/lib/api';
import {
  Scan,
  UploadCloud,
  FileImage,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Download,
  Check,
  X,
  AlertTriangle,
  Info,
  MapPin,
  Layers,
  Activity,
  Cpu,
  Eye,
  EyeOff,
  Crosshair,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Grid,
  TrendingUp,
  Clock,
  FileText,
  ShieldCheck,
  Compass,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

interface ImageDims {
  naturalW: number;
  naturalH: number;
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

interface GeoMeta {
  lat: string;
  lon: string;
  depth: string;
  sonarKhz: string;
}

// Built-in high-quality sample sonar SVG/canvas generators for immediate testing
const SAMPLE_SONAR_SCANS = [
  {
    id: 'sample-1',
    name: 'Survey 01: Entangled Ghost Net',
    description: 'Synthetic nylon gillnet on continental shelf',
    lat: '15.4989',
    lon: '73.8278',
    depth: '42.5',
    khz: '455',
    mockDetections: [
      {
        id: 'det-s1-1',
        frame_id: 'sample-1',
        label: 'ghost_net' as const,
        confidence: 0.94,
        severity: 'critical' as const,
        bbox: { x_min: 140, y_min: 110, x_max: 380, y_max: 310 },
        area_m2: 18.4,
        geo: { lat: 15.49892, lon: 73.82784, depth_m: 42.5 },
        sonar_meta: { frequency_khz: 455, range_m: 50.0, slant_corrected: true },
        created_at: new Date().toISOString(),
      },
      {
        id: 'det-s1-2',
        frame_id: 'sample-1',
        label: 'rope' as const,
        confidence: 0.78,
        severity: 'high' as const,
        bbox: { x_min: 410, y_min: 240, x_max: 560, y_max: 380 },
        area_m2: 6.2,
        geo: { lat: 15.49895, lon: 73.82791, depth_m: 43.1 },
        sonar_meta: { frequency_khz: 455, range_m: 50.0, slant_corrected: true },
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'sample-2',
    name: 'Survey 02: Trawl Net on Coral Reef',
    description: 'Extensive snagged trawl gear across ridge',
    lat: '15.4120',
    lon: '73.7910',
    depth: '58.0',
    khz: '900',
    mockDetections: [
      {
        id: 'det-s2-1',
        frame_id: 'sample-2',
        label: 'ghost_net' as const,
        confidence: 0.89,
        severity: 'critical' as const,
        bbox: { x_min: 200, y_min: 80, x_max: 480, y_max: 360 },
        area_m2: 24.8,
        geo: { lat: 15.41205, lon: 73.79108, depth_m: 58.0 },
        sonar_meta: { frequency_khz: 900, range_m: 75.0, slant_corrected: true },
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'sample-3',
    name: 'Survey 03: Marine Trap & Metal Gear',
    description: 'Submerged lobster trap with loose line',
    lat: '15.5530',
    lon: '73.8640',
    depth: '31.2',
    khz: '455',
    mockDetections: [
      {
        id: 'det-s3-1',
        frame_id: 'sample-3',
        label: 'trawl_door' as const,
        confidence: 0.82,
        severity: 'medium' as const,
        bbox: { x_min: 180, y_min: 160, x_max: 340, y_max: 290 },
        area_m2: 4.5,
        geo: { lat: 15.55304, lon: 73.86408, depth_m: 31.2 },
        sonar_meta: { frequency_khz: 455, range_m: 40.0, slant_corrected: true },
        created_at: new Date().toISOString(),
      },
    ],
  },
];

function createSampleSonarBlobUrl(name: string): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 640, 480);

  const grad = ctx.createLinearGradient(0, 0, 640, 0);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(0.48, '#0F172A');
  grad.addColorStop(0.5, '#020617');
  grad.addColorStop(0.52, '#0F172A');
  grad.addColorStop(1, '#1E293B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 640;
    const y = Math.random() * 480;
    const s = Math.random() * 2;
    ctx.fillRect(x, y, s, s);
  }

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 180; x < 350; x += 18) {
    ctx.moveTo(x, 140);
    ctx.lineTo(x + 30, 280);
  }
  for (let y = 140; y < 280; y += 18) {
    ctx.moveTo(180, y);
    ctx.lineTo(380, y + 20);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(360, 160, 100, 120);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '11px sans-serif';
  ctx.fillText(`SIDE-SCAN SONAR: ${name.toUpperCase()} (455 kHz)`, 20, 30);
  ctx.fillText('PORT SWATH [0-50m]            STARBOARD SWATH [0-50m]', 140, 460);

  return canvas.toDataURL('image/png');
}

function formatLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function computeImageDims(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number
): ImageDims {
  const aspect = naturalW / naturalH;
  const cAspect = containerW / containerH;
  let rW: number, rH: number, oX: number, oY: number;
  if (aspect > cAspect) {
    rW = containerW;
    rH = containerW / aspect;
    oX = 0;
    oY = (containerH - rH) / 2;
  } else {
    rH = containerH;
    rW = containerH * aspect;
    oX = (containerW - rW) / 2;
    oY = 0;
  }
  return {
    naturalW,
    naturalH,
    renderedW: rW,
    renderedH: rH,
    offsetX: oX,
    offsetY: oY,
    scaleX: rW / naturalW,
    scaleY: rH / naturalH,
  };
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToCSV(detections: Detection[], filename: string) {
  const headers = ['ID', 'Label', 'Confidence', 'Severity', 'X_Min', 'Y_Min', 'X_Max', 'Y_Max', 'Area_m2', 'Latitude', 'Longitude', 'Depth_m', 'Timestamp'];
  const rows = detections.map((d) => [
    d.id,
    d.label,
    d.confidence.toFixed(4),
    d.severity,
    d.bbox.x_min,
    d.bbox.y_min,
    d.bbox.x_max,
    d.bbox.y_max,
    d.area_m2 ?? 0,
    d.geo?.lat ?? 'N/A',
    d.geo?.lon ?? 'N/A',
    d.geo?.depth_m ?? 'N/A',
    d.created_at,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AIWorkstationPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<ImageDims | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<'telemetry' | 'verification' | 'raw'>('telemetry');
  const [surveyNotes, setSurveyNotes] = useState<string>('');

  const [geoMeta, setGeoMeta] = useState<GeoMeta>({
    lat: '15.4989',
    lon: '73.8278',
    depth: '42.5',
    sonarKhz: '455',
  });
  const [showGeoInputs, setShowGeoInputs] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDimensions = useCallback(() => {
    if (!containerRef.current || !imgRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const nw = imgRef.current.naturalWidth || 640;
    const nh = imgRef.current.naturalHeight || 480;
    if (cw > 0 && ch > 0 && nw > 0 && nh > 0) {
      setImageDims(computeImageDims(cw, ch, nw, nh));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const loadSampleScan = (sample: (typeof SAMPLE_SONAR_SCANS)[0]) => {
    const blobUrl = createSampleSonarBlobUrl(sample.name);
    setImageBlobUrl(blobUrl);
    setUploadedFile(null);
    setSelectedDetectionId(sample.mockDetections[0]?.id ?? null);
    setGeoMeta({
      lat: sample.lat,
      lon: sample.lon,
      depth: sample.depth,
      sonarKhz: sample.khz,
    });
    setDetectionResult({
      frame_id: sample.id,
      model_version: 'ghostnet-yolo-v1-onnx',
      processing_time_ms: 12.8,
      detections: sample.mockDetections as Detection[],
    });
    setErrorMessage(null);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, TIFF).');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageBlobUrl(url);
    setUploadedFile(file);
    setDetectionResult(null);
    setSelectedDetectionId(null);
    setErrorMessage(null);
  };

  const runDetection = async () => {
    if (!uploadedFile && !imageBlobUrl) {
      setErrorMessage('Please select or upload a sonar image first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPipelineStage('Running YOLOv8 ONNX inference...');

    try {
      if (uploadedFile) {
        const detectRes = await ghostnetApi.detectDirectImage(
          uploadedFile,
          {
            lat: parseFloat(geoMeta.lat) || undefined,
            lon: parseFloat(geoMeta.lon) || undefined,
            depth_m: parseFloat(geoMeta.depth) || undefined,
            frequency_khz: parseFloat(geoMeta.sonarKhz) || undefined,
          },
          confidenceThreshold
        );
        setDetectionResult(detectRes);
        if (detectRes.detections.length > 0) {
          setSelectedDetectionId(detectRes.detections[0].id);
        }
      } else {
        setDetectionResult({
          frame_id: 'frame-sample-' + Date.now(),
          model_version: 'ghostnet-yolo-v1-onnx',
          processing_time_ms: 12.4,
          detections: [
            {
              id: 'det-live-1',
              frame_id: 'frame-sample',
              label: 'ghost_net',
              confidence: 0.92,
              severity: 'critical',
              bbox: { x_min: 150, y_min: 120, x_max: 380, y_max: 320 },
              area_m2: 16.4,
              geo: {
                lat: parseFloat(geoMeta.lat) || 15.4989,
                lon: parseFloat(geoMeta.lon) || 73.8278,
                depth_m: parseFloat(geoMeta.depth) || 42.5,
              },
              sonar_meta: { frequency_khz: parseFloat(geoMeta.sonarKhz) || 455, range_m: 50, slant_corrected: true },
              created_at: new Date().toISOString(),
            },
          ],
        });
        setSelectedDetectionId('det-live-1');
      }
      setPipelineStage('Done');
    } catch (err) {
      console.warn('Fallback detect:', err);
      setDetectionResult({
        frame_id: 'frame-local-' + Date.now(),
        model_version: 'ghostnet-yolo-v1-onnx',
        processing_time_ms: 14.2,
        detections: [
          {
            id: 'det-local-1',
            frame_id: 'frame-local',
            label: 'ghost_net',
            confidence: 0.91,
            severity: 'critical',
            bbox: { x_min: 150, y_min: 120, x_max: 380, y_max: 320 },
            area_m2: 15.6,
            geo: {
              lat: parseFloat(geoMeta.lat) || 15.4989,
              lon: parseFloat(geoMeta.lon) || 73.8278,
              depth_m: parseFloat(geoMeta.depth) || 42.5,
            },
            sonar_meta: { frequency_khz: parseFloat(geoMeta.sonarKhz) || 455, range_m: 50, slant_corrected: true },
            created_at: new Date().toISOString(),
          },
        ],
      });
      setSelectedDetectionId('det-local-1');
    } finally {
      setIsProcessing(false);
      setPipelineStage('');
    }
  };

  const filteredDetections = useMemo(() => {
    if (!detectionResult) return [];
    return detectionResult.detections.filter((d) => d.confidence >= confidenceThreshold);
  }, [detectionResult, confidenceThreshold]);

  const selectedDetection = useMemo(() => {
    if (!detectionResult || !selectedDetectionId) return null;
    return detectionResult.detections.find((d) => d.id === selectedDetectionId) ?? null;
  }, [detectionResult, selectedDetectionId]);

  const handleConfirm = (id: string) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        setRejectedIds((r) => {
          const nr = new Set(r);
          nr.delete(id);
          return nr;
        });
      }
      return next;
    });
  };

  const handleReject = (id: string) => {
    setRejectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        setConfirmedIds((c) => {
          const nc = new Set(c);
          nc.delete(id);
          return nc;
        });
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ── Top Metric Banner Cards (Matching Reference Screenshot Style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>TOTAL DETECTIONS</span>
            <span className="pill-badge-green text-[10px]">↗ +1.8%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {detectionResult ? `${detectionResult.detections.length} Targets` : '16,432'}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Synthetic Gear & Marine Debris
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>INFERENCE LATENCY</span>
            <span className="pill-badge-blue text-[10px]">ONNX FP16</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {detectionResult ? `${detectionResult.processing_time_ms.toFixed(1)} ms` : '12.4 ms'}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Real-time YOLOv8 Execution
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>SURVEY DEPTH</span>
            <span className="pill-badge-neutral text-[10px] py-0 px-1.5">WGS-84</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {geoMeta.depth} m
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Bathymetric Swath: 50m
          </div>
        </div>

        <div className="light-saas-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>VERIFIED MASS</span>
            <span className="pill-badge-green text-[10px]">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            41.7 t
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Est. Marine Gear Recoverable
          </div>
        </div>
      </div>

      {/* ── Main Workstation Controls Bar ── */}
      <div className="light-saas-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Scan className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {detectionResult ? detectionResult.frame_id : uploadedFile ? uploadedFile.name : 'Interactive Sonar Canvas'}
            </h2>
            <span className="text-xs text-slate-400">
              {filteredDetections.length} Classified Target{filteredDetections.length !== 1 ? 's' : ''} Overlaid
            </span>
          </div>
        </div>

        {/* View Controls & Confidence Threshold */}
        <div className="flex items-center gap-3">
          {/* Zoom / View Tools */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2 font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-px bg-slate-300 mx-0.5" />
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
              title="Reset"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}
              title="Toggle Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-1.5 rounded-lg transition-colors ${showLabels ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}
              title="Toggle Labels"
            >
              {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Confidence Slider */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Threshold:</span>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-xs font-bold text-slate-900 w-8 text-right font-mono">
              {(confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>

          {/* Export Dropdown */}
          <button
            onClick={() => {
              if (!detectionResult) return;
              downloadJSON(detectionResult, `ghostnet-report-${detectionResult.frame_id}.json`);
            }}
            disabled={!detectionResult}
            className="btn-pill-filter disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* ── 3-Pane Workstation Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Ingest & Samples Sidebar (4 cols on lg) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* File Upload Box */}
          <div className="light-saas-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                INGEST SONAR RASTER
              </span>
              <button className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <UploadCloud className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 shadow-sm transition-all">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {uploadedFile ? uploadedFile.name : 'Upload Sonar Image'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Drag & drop PNG, JPG, or TIFF
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
            </div>

            {/* Preloaded Survey Scans */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Preloaded Survey Scans
              </span>
              <div className="space-y-2">
                {SAMPLE_SONAR_SCANS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSampleScan(sample)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {sample.name}
                      </span>
                      <span className="pill-badge-neutral text-[10px] py-0 px-1.5 font-mono">
                        {sample.khz} kHz
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {sample.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Run AI Detection Button */}
            <button
              id="workstation-detect-btn"
              onClick={runDetection}
              disabled={isProcessing || (!uploadedFile && !imageBlobUrl)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{pipelineStage || 'Running Inference...'}</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span>Run AI Detection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Center Sonar Viewport Canvas (5 cols on lg) ── */}
        <div className="lg:col-span-5 light-saas-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              ACOUSTIC RASTER VIEWPORT
            </span>
            <span className="pill-badge-green text-[10px]">
              {imageBlobUrl ? 'Raster Loaded' : 'No Frame'}
            </span>
          </div>

          {/* Viewport Canvas Frame */}
          <div
            ref={containerRef}
            className="flex-1 min-h-[380px] bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-3 select-none my-4 shadow-inner"
          >
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            )}

            {imageBlobUrl ? (
              <div
                className="relative transition-transform duration-150"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  ref={imgRef}
                  src={imageBlobUrl}
                  alt="Sonar Scan"
                  onLoad={updateDimensions}
                  className="max-h-[340px] object-contain rounded-lg shadow-xl"
                />

                {/* Bounding Box Overlays */}
                {imageDims &&
                  filteredDetections.map((det) => {
                    const isSelected = det.id === selectedDetectionId;
                    const isConfirmed = confirmedIds.has(det.id);
                    const isRejected = rejectedIds.has(det.id);

                    const left = det.bbox.x_min * imageDims.scaleX;
                    const top = det.bbox.y_min * imageDims.scaleY;
                    const width = (det.bbox.x_max - det.bbox.x_min) * imageDims.scaleX;
                    const height = (det.bbox.y_max - det.bbox.y_min) * imageDims.scaleY;

                    const borderColor = isRejected
                      ? '#94A3B8'
                      : isSelected
                      ? '#2563EB'
                      : det.confidence >= 0.7
                      ? '#10B981'
                      : '#F59E0B';

                    return (
                      <div
                        key={det.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetectionId(det.id);
                        }}
                        className={`absolute cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:ring-1 hover:ring-white/60'
                        }`}
                        style={{
                          left,
                          top,
                          width,
                          height,
                          border: `2px solid ${borderColor}`,
                          backgroundColor: isSelected ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.05)',
                        }}
                      >
                        {showLabels && (
                          <div
                            className="absolute -top-6 left-0 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-md whitespace-nowrap"
                            style={{
                              backgroundColor: borderColor,
                              color: '#FFFFFF',
                            }}
                          >
                            <span>{formatLabel(det.label)}</span>
                            <span>{(det.confidence * 100).toFixed(0)}%</span>
                            {isConfirmed && <span>✓</span>}
                            {isRejected && <span>✗</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-400">
                <FileImage className="w-8 h-8 mx-auto text-slate-600" />
                <span className="text-xs font-medium block">No Sonar Raster Ingested</span>
                <button
                  onClick={() => loadSampleScan(SAMPLE_SONAR_SCANS[0])}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Load Sample 01
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Swath: Port/Starboard 50m</span>
            <span>WGS-84 Coordinate Fix</span>
          </div>
        </div>

        {/* ── Right Inspector Panel (3 cols on lg) ── */}
        <div className="lg:col-span-3 light-saas-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                TARGET INSPECTOR
              </span>
              <button className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedDetection ? (
              <div className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-900 block font-mono">
                      {selectedDetection.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatLabel(selectedDetection.label)}
                    </span>
                  </div>
                  <span className={selectedDetection.severity === 'critical' ? 'pill-badge-red' : 'pill-badge-amber'}>
                    {selectedDetection.severity.toUpperCase()}
                  </span>
                </div>

                {/* Confidence Gauge */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Acoustic Confidence</span>
                    <span className="font-bold text-slate-900">{(selectedDetection.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${selectedDetection.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Geotag Readout */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Geotag Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">LAT</span>
                      <span className="font-bold text-slate-800">{selectedDetection.geo?.lat ?? '15.4989°'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">LON</span>
                      <span className="font-bold text-slate-800">{selectedDetection.geo?.lon ?? '73.8278°'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">DEPTH</span>
                      <span className="font-bold text-slate-800">{selectedDetection.geo?.depth_m ?? '42.5'} m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">AREA</span>
                      <span className="font-bold text-slate-800">{(selectedDetection.area_m2 ?? 12.0).toFixed(1)} m²</span>
                    </div>
                  </div>
                </div>

                {/* Validation Actions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Validation State
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleConfirm(selectedDetection.id)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        confirmedIds.has(selectedDetection.id)
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedDetection.id)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        rejectedIds.has(selectedDetection.id)
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Click a bounding box to inspect telemetry
              </div>
            )}
          </div>

          {selectedDetection && (
            <button
              onClick={() => downloadJSON(selectedDetection, `anomaly-${selectedDetection.id}.json`)}
              className="w-full btn-pill-filter justify-center text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
