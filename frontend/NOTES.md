# GhostNet Frontend — Codebase Audit & API Contract

## Real API Contract (from backend source)

**Base URL**: `http://localhost:8000` (env: NEXT_PUBLIC_API_URL)
**Prefix**: /api/v1/ for all data endpoints; /health at root.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Backend health -> { status, version, model_loaded } |
| POST | /api/v1/upload | Upload sonar image -> { frame_id, status, message, filename } |
| POST | /api/v1/detect/{frame_id}?conf=0.5 | Run YOLO on stored frame -> DetectionResponse |
| POST | /api/v1/detect | Upload + detect in one shot -> DetectionResponse |
| GET | /api/v1/reports?limit=20&offset=0 | History -> ReportListResponse |
| GET | /api/v1/analytics/hotspots | Cluster map -> HotspotResponse |
| GET | /api/v1/analytics/risk-summary | Risk overview |

### Missing Endpoints (flagged)
- NO confirm/false-positive action endpoint exists in backend.
  Flag: marking confirmed/rejected is UI-only state for now.
- NO per-frame image retrieval endpoint.
  The frontend must track its own blob URL after upload.
- NO export/PDF endpoint.
  Report export must be a client-side JSON download.
- NO streaming/websocket.
  Detection is request/response only.

## Architecture

The new dashboard root becomes a single-page instrument workstation:
- Left panel (220px): sonar log list + upload control
- Center panel (flex): sonar image viewport with real bbox overlays
- Right panel (300px): selected detection inspector
- Bottom strip (80px): timeline with detection timestamps
