// frontend/lib/api.ts
// Single source of truth client for GhostNet FastAPI backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type DetectionLabel = 'ghost_net' | 'rope' | 'trawl_door' | 'debris_patch' | 'unknown';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface GeoPoint {
  lat: number;
  lon: number;
  depth_m?: number | null;
}

export interface SonarMeta {
  range_m: number;
  frequency_khz: number;
  slant_corrected: boolean;
}

export interface Detection {
  id: string;
  frame_id: string;
  label: DetectionLabel;
  confidence: number;
  bbox: BoundingBox;
  geo?: GeoPoint | null;
  sonar_meta: SonarMeta;
  severity: SeverityLevel;
  area_m2?: number | null;
  created_at: string;
}

export interface DetectionResponse {
  frame_id: string;
  detections: Detection[];
  processing_time_ms: number;
  model_version: string;
}

export interface UploadResponse {
  frame_id: string;
  status: string;
  message: string;
  filename?: string;
}

export interface ReportItem {
  report_id: string;
  frame_id: string;
  detection_count: number;
  highest_severity: SeverityLevel;
  created_at: string;
  summary: string;
}

export interface ReportListResponse {
  total: number;
  limit: number;
  offset: number;
  items: ReportItem[];
}

export interface HotspotCluster {
  cluster_id: string;
  center_lat: number;
  center_lon: number;
  detection_count: number;
  risk_level: SeverityLevel;
  estimated_debris_m2: number;
}

export interface HotspotResponse {
  clusters: HotspotCluster[];
  total_hotspots: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
}

// ---------------------------------------------------------------------------
// API Client Methods
// ---------------------------------------------------------------------------

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      // ignore
    }
    throw new Error(`API Error (${res.status}): ${errorDetail}`);
  }
  return res.json() as Promise<T>;
}

export const ghostnetApi = {
  /** Check backend health status */
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
    return handleResponse<HealthResponse>(res);
  },

  /** Upload sonar frame for queued processing */
  async uploadSonarFrame(
    file: File,
    meta?: { lat?: number; lon?: number; depth_m?: number; range_m?: number; frequency_khz?: number }
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (meta?.lat !== undefined) formData.append('lat', meta.lat.toString());
    if (meta?.lon !== undefined) formData.append('lon', meta.lon.toString());
    if (meta?.depth_m !== undefined) formData.append('depth_m', meta.depth_m.toString());
    if (meta?.range_m !== undefined) formData.append('range_m', meta.range_m.toString());
    if (meta?.frequency_khz !== undefined) formData.append('frequency_khz', meta.frequency_khz.toString());

    const res = await fetch(`${API_BASE_URL}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<UploadResponse>(res);
  },

  /** Run YOLO detection on an uploaded frame */
  async detectFrame(frameId: string, conf?: number): Promise<DetectionResponse> {
    const url = new URL(`${API_BASE_URL}/api/v1/detect/${encodeURIComponent(frameId)}`);
    if (conf !== undefined) url.searchParams.set('conf', conf.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
    });
    return handleResponse<DetectionResponse>(res);
  },

  /** Direct image upload + detection in a single request */
  async detectDirectImage(
    file: File,
    meta?: { lat?: number; lon?: number; depth_m?: number; range_m?: number; frequency_khz?: number },
    conf?: number
  ): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (conf !== undefined) formData.append('conf', conf.toString());
    if (meta?.lat !== undefined) formData.append('lat', meta.lat.toString());
    if (meta?.lon !== undefined) formData.append('lon', meta.lon.toString());
    if (meta?.depth_m !== undefined) formData.append('depth_m', meta.depth_m.toString());
    if (meta?.range_m !== undefined) formData.append('range_m', meta.range_m.toString());
    if (meta?.frequency_khz !== undefined) formData.append('frequency_khz', meta.frequency_khz.toString());

    const res = await fetch(`${API_BASE_URL}/api/v1/detect`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<DetectionResponse>(res);
  },

  /** Fetch detection history reports */
  async getReports(limit = 20, offset = 0): Promise<ReportListResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/reports?limit=${limit}&offset=${offset}`, {
      cache: 'no-store',
    });
    return handleResponse<ReportListResponse>(res);
  },

  /** Fetch hotspot clusters for map visualizer */
  async getHotspots(): Promise<HotspotResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics/hotspots`, {
      cache: 'no-store',
    });
    return handleResponse<HotspotResponse>(res);
  },

  /** Fetch risk summary overview */
  async getRiskSummary(): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics/risk-summary`, {
      cache: 'no-store',
    });
    return handleResponse<Record<string, unknown>>(res);
  },
};
