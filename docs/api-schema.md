# GhostNet API Schema — Single Source of Truth

> **Rule**: Every field defined here MUST be mirrored exactly in:
> 1. `backend/app/schemas/detection.py` (Pydantic models)
> 2. `frontend/lib/api.ts` (TypeScript interfaces)
> 3. `shared/detection-schema.json` (JSON Schema)
>
> Update all three whenever this file changes.

---

## Detection Object

A `Detection` represents a single identified debris candidate within a sonar frame.

```json
{
  "id": "det_01JXXXXXXXXXXXXX",
  "frame_id": "frame_20240315_001",
  "label": "ghost_net",
  "confidence": 0.87,
  "bbox": {
    "x_min": 124,
    "y_min": 88,
    "x_max": 310,
    "y_max": 256
  },
  "geo": {
    "lat": 12.9716,
    "lon": 77.5946,
    "depth_m": 34.2
  },
  "sonar_meta": {
    "range_m": 75.0,
    "frequency_khz": 450,
    "slant_corrected": true
  },
  "severity": "high",
  "area_m2": 18.4,
  "created_at": "2024-03-15T10:22:05Z"
}
```

---

## Field Definitions

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | ULID-formatted unique detection ID, prefix `det_` |
| `frame_id` | `string` | ✅ | Identifier of the sonar frame this detection came from |
| `label` | `DetectionLabel` | ✅ | Classification label (see enum below) |
| `confidence` | `float` | ✅ | Model confidence score — `0.0` to `1.0` (inclusive) |
| `bbox` | `BoundingBox` | ✅ | Pixel-space bounding box in the original sonar frame |
| `geo` | `GeoPoint \| null` | ❌ | Georeferenced position; `null` if sonar file has no GPS track |
| `sonar_meta` | `SonarMeta` | ✅ | Metadata about the sonar capture conditions |
| `severity` | `SeverityLevel` | ✅ | Derived severity classification (see enum below) |
| `area_m2` | `float \| null` | ❌ | Estimated real-world area of the debris patch in m²; `null` if range data insufficient |
| `created_at` | `string (ISO 8601)` | ✅ | UTC timestamp when this detection was created |

---

### `BoundingBox`

Pixel coordinates in the **original** (pre-correction) sonar image space.

| Field | Type | Required | Description |
|---|---|---|---|
| `x_min` | `int` | ✅ | Left edge of bounding box (pixels) |
| `y_min` | `int` | ✅ | Top edge of bounding box (pixels) |
| `x_max` | `int` | ✅ | Right edge of bounding box (pixels) |
| `y_max` | `int` | ✅ | Bottom edge of bounding box (pixels) |

Constraint: `x_max > x_min`, `y_max > y_min`.

---

### `GeoPoint`

| Field | Type | Required | Description |
|---|---|---|---|
| `lat` | `float` | ✅ | Latitude in decimal degrees (WGS84), range `[-90, 90]` |
| `lon` | `float` | ✅ | Longitude in decimal degrees (WGS84), range `[-180, 180]` |
| `depth_m` | `float \| null` | ❌ | Depth in metres below sea surface; `null` if unavailable |

---

### `SonarMeta`

| Field | Type | Required | Description |
|---|---|---|---|
| `range_m` | `float` | ✅ | Sonar range setting in metres |
| `frequency_khz` | `float` | ✅ | Sonar frequency in kHz |
| `slant_corrected` | `bool` | ✅ | `true` if slant-range correction was applied in preprocessing |

---

### `DetectionLabel` Enum

| Value | Description |
|---|---|
| `ghost_net` | Abandoned fishing net or net fragment |
| `rope` | Mooring rope, anchor line, or similar cordage |
| `trawl_door` | Heavy metal trawl board |
| `debris_patch` | Mixed unclassified debris patch |
| `unknown` | Detected anomaly, label confidence too low to classify |

---

### `SeverityLevel` Enum

Severity is **derived** by the backend from `confidence` and `area_m2`:

| Value | Rule |
|---|---|
| `critical` | confidence ≥ 0.9 AND area_m2 ≥ 50 |
| `high` | confidence ≥ 0.7 AND area_m2 ≥ 10 |
| `medium` | confidence ≥ 0.5 |
| `low` | confidence < 0.5 |

---

## API Endpoints

### `GET /health`

Returns service liveness status. Used by Render health checks.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "model_loaded": false
}
```

| Field | Type | Description |
|---|---|---|
| `status` | `"ok"` | Always `"ok"` when service is alive |
| `version` | `string` | Backend API version (semver) |
| `model_loaded` | `bool` | `true` once ONNX model weights are loaded |

---

### `POST /api/v1/upload`

Upload a sonar image or file for processing.

**Request**: `multipart/form-data`
- `file`: sonar image file (`.png`, `.jpg`, `.tiff`, `.xtf`)

**Response `202 Accepted`**:
```json
{
  "frame_id": "frame_20240315_001",
  "status": "queued",
  "message": "File received. Detection will be available at /api/v1/detect/{frame_id}"
}
```

---

### `POST /api/v1/detect/{frame_id}`

Run detection on an already-uploaded frame.

**Response `200 OK`**:
```json
{
  "frame_id": "frame_20240315_001",
  "detections": [ /* array of Detection objects */ ],
  "processing_time_ms": 412,
  "model_version": "ghostnet-v0.1-onnx"
}
```

---

### `GET /api/v1/reports`

List all past detection reports.

**Query params**: `?limit=20&offset=0`

**Response `200 OK`**:
```json
{
  "total": 143,
  "limit": 20,
  "offset": 0,
  "items": [ /* array of DetectionReport objects */ ]
}
```

---

## Versioning

- This schema is currently at **v0.1.0**
- When any field is added or renamed, bump the version and update all three locations listed at the top of this file
- Deprecations must be listed here with a removal target version before removal
