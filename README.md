# GhostNet 🌊

> **Marine debris (ghost net) detection via side-scan sonar imagery — end-to-end computer vision pipeline for SIH.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/ML-YOLOv8%20%2B%20PyTorch-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![Hugging Face](https://img.shields.io/badge/Model-Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface)](https://huggingface.co/zzephyrr/GhostNetyolo26m)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com/)

---

## 📐 System Architecture

```mermaid
flowchart TB
    %% =======================================================
    %% GHOSTNET END-TO-END SYSTEM ARCHITECTURE
    %% =======================================================

    subgraph CLIENT_TIER ["🖥️ CLIENT & PRESENTATION TIER (Vercel)"]
        direction TB
        subgraph UI_MODULES ["Next.js 14 App Router (TypeScript + Tailwind CSS)"]
            direction LR
            UI1["📄 <b>Landing Page (/)</b><br/>• Hero & Mission Overview<br/>• Live Detection Metrics"]
            UI2["📊 <b>Dashboard (/dashboard)</b><br/>• Real-time Sonar Telemetry<br/>• Multi-frame Stream"]
            UI3["🔍 <b>Detection UI (/detect)</b><br/>• Bounding Box Canvas<br/>• Severity Badges"]
            UI4["🗺️ <b>GIS Spatial Map (/map)</b><br/>• Leaflet Debris Hotspots<br/>• Vessel GPS Markers"]
            UI5["📋 <b>Reports (/reports)</b><br/>• Exportable Summaries<br/>• Survey History"]
        end
    end

    subgraph GATEWAY_TIER ["⚡ API GATEWAY & NETWORKING LAYER (Render Docker)"]
        direction TB
        GW["🛡️ <b>FastAPI Application (app.main:app)</b><br/>• Lifespan Model Pre-warming • CORS Security Middleware • Swagger / OpenAPI Docs"]
        subgraph ENDPOINTS ["REST API v1 Endpoints (/api/v1)"]
            direction LR
            EP1["<b>POST /upload</b><br/>Multipart Sonar Image<br/>+ GeoPoint & Metadata"]
            EP2["<b>POST /detect</b><br/>Direct Upload + Real-time<br/>Inference Pipeline"]
            EP3["<b>POST /detect/{id}</b><br/>Run Inference on<br/>Cached Frame ID"]
            EP4["<b>GET /reports</b><br/>List Incident Reports<br/>+ Pagination Filter"]
            EP5["<b>GET /health</b><br/>Liveness Probe &<br/>Model Ready Status"]
        end
    end

    subgraph CORE_TIER ["🧠 BACKEND CORE & ANALYTICS ENGINE"]
        direction TB
        subgraph PREPROC ["Image Preprocessing Engine (app.core.preprocessing)"]
            direction LR
            PP1["<b>load_image_from_bytes()</b><br/>• OpenCV Buffer Decode<br/>• BGR to RGB Matrix"]
            PP2["<b>apply_sonar_enhancement()</b><br/>• RGB to LAB Space<br/>• CLAHE on L-Channel (clipLimit=2.0)<br/>• Highlights Net Shadows"]
            PP1 --> PP2
        end

        subgraph SVCS ["Domain Services & Caches (app.services)"]
            direction LR
            DS["🔬 <b>DetectionService</b><br/>• In-Memory FrameStore Cache<br/>• BBox Coordinate Clipping<br/>• Area Proxy Calc (range_m²)<br/>• Severity Decision Engine"]
            AN["📊 <b>Analytics & Features</b><br/>• DBSCAN Hotspot Clustering<br/>• Multi-factor Risk Scoring<br/>• ROV Route Optimizer<br/>• Bathymetric Depth Analytics"]
        end
    end

    subgraph ML_TIER ["🤖 ML INFERENCE & MODEL WEIGHTS MANAGEMENT"]
        direction TB
        YMM["🏋️ <b>YOLOModelManager (Singleton Pattern)</b><br/>• Lazy Loader & Thread-safe Singleton • PyTorch & Ultralytics Inference Engine"]
        
        subgraph STORAGE ["Dual-Tier Weight Resolution"]
            direction LR
            LOCAL["📁 <b>Local Cache Check</b><br/>backend/model_weights/best.pt<br/><i>(Primary Resolution)</i>"]
            HF["☁️ <b>Hugging Face Hub</b><br/>hf_hub_download()<br/>Repo: zzephyrr/GhostNetyolo26m<br/><i>(Automatic Fallback)</i>"]
            LOCAL -.->|"Fallback: Auto-download"| HF
        end
        YMM --> LOCAL
    end

    %% Inter-Tier Flow Connections
    CLIENT_TIER ==>|"HTTPS / REST API + JSON Payload"| GATEWAY_TIER
    GATEWAY_TIER ==>|"Decoded Image Bytes & Geo Metadata"| PREPROC
    PREPROC ==>|"Enhanced RGB Image Array"| DS
    DS ==>|"Run YOLOv8 Model Inference"| YMM
    YMM ==>|"Bounding Boxes & Class Confidences"| DS
    DS ==>|"Detections & Spatial Coordinates"| AN
    DS ==>|"DetectionResponse Schema Payload"| GATEWAY_TIER
    GATEWAY_TIER ==>|"JSON Response (BBox, Conf, Severity, GeoTag)"| CLIENT_TIER

    %% Styling Theme
    classDef clientStyle fill:#0b192c,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef apiStyle fill:#1e1b4b,stroke:#a78bfa,stroke-width:2px,color:#f8fafc;
    classDef coreStyle fill:#062e24,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef mlStyle fill:#311506,stroke:#fb923c,stroke-width:2px,color:#f8fafc;
    classDef storageStyle fill:#3b0724,stroke:#f472b6,stroke-width:2px,color:#f8fafc;
    classDef subCard fill:#0f172a,stroke:#334155,stroke-width:1px,color:#e2e8f0;

    class CLIENT_TIER clientStyle;
    class GATEWAY_TIER apiStyle;
    class CORE_TIER coreStyle;
    class ML_TIER mlStyle;
    class STORAGE storageStyle;
    class UI1,UI2,UI3,UI4,UI5,GW,EP1,EP2,EP3,EP4,EP5,PP1,PP2,DS,AN,YMM,LOCAL,HF subCard;
```

---

## 🧠 Model Architecture — YOLOv8 Inference Pipeline

```mermaid
flowchart TB
    %% =======================================================
    %% GHOSTNET COMPUTER VISION INFERENCE PIPELINE
    %% =======================================================

    subgraph STAGE1 ["📥 STAGE 1: MULTI-MODAL SONAR INGESTION"]
        direction LR
        IN1["🖼️ <b>Raw Sonar Frame</b><br/>• Format: PNG, JPEG, TIFF<br/>• Acoustic backscatter intensity<br/>• Low-contrast seafloor texture"]
        IN2["📡 <b>Sonar Telemetry Meta</b><br/>• Slant Range: range_m (e.g. 50m)<br/>• Acoustic Frequency: freq_kHz<br/>• Resolution: pixel_res_m"]
        IN3["🌍 <b>AUV / Vessel GeoPoint</b><br/>• Latitude & Longitude (WGS84)<br/>• Bathymetric Depth: depth_m<br/>• Timestamp (ISO 8601 UTC)"]
    end

    subgraph STAGE2 ["🔧 STAGE 2: ACOUSTIC PREPROCESSING & ENHANCEMENT"]
        direction LR
        PR1["<b>Step 2.1: NumPy Decoding</b><br/>• cv2.imdecode(buffer)<br/>• BGR to RGB colorspace matrix"]
        PR2["<b>Step 2.2: LAB Sonar CLAHE</b><br/>• Convert RGB → LAB space<br/>• CLAHE on L-channel (clip=2.0)<br/>• Highlights acoustic net shadows"]
        PR3["<b>Step 2.3: Letterbox Rescaling</b><br/>• Aspect-ratio preserved resize<br/>• imgsz=640 (stride 32 padded)<br/>• Normalization to [0.0, 1.0]"]
        PR1 --> PR2
        PR2 --> PR3
    end

    subgraph STAGE3 ["🤖 STAGE 3: DEEP CONVOLUTIONAL INFERENCE (YOLOv8 — GhostNetyolo26m)"]
        direction TB
        subgraph NN_INTERNAL ["Deep Feature Extraction & Decoupled Prediction"]
            direction LR
            BB["🏗️ <b>CSPDarkNet Backbone</b><br/>• Cross-Stage Partial Network<br/>• C2f Multi-scale Feature Blocks<br/>• SPPF (Spatial Pyramid Pooling)"]
            NK["🔗 <b>PAFPN Fusion Neck</b><br/>• Top-down & Bottom-up Paths<br/>• Multi-scale Feature Fusion<br/>• Retains fine netting filament cues"]
            HD["🎯 <b>Anchor-Free Decoupled Head</b><br/>• Separate Regression & Cls branches<br/>• Task-aligned Assigner<br/>• Inference: conf≥0.25, IoU=0.45"]
            BB --> NK
            NK --> HD
        end
    end

    subgraph STAGE4 ["⚙️ STAGE 4: POST-PROCESSING, HEURISTICS & SEVERITY RULES"]
        direction LR
        PO1["<b>Non-Max Suppression (NMS)</b><br/>• Suppress redundant overlaps<br/>• Clip xyxy to image boundary [0, W/H]"]
        PO2["<b>Acoustic Area Proxy Estimation</b><br/>• bbox_ratio = (w_box × h_box) / (W × H)<br/>• area_m² = bbox_ratio × (range_m)² × 0.1"]
        PO3["<b>Severity Classification Matrix</b><br/>• 🔴 <b>CRITICAL:</b> Conf ≥ 0.90 & Area ≥ 50 m²<br/>• 🟠 <b>HIGH:</b> Conf ≥ 0.70 & Area ≥ 10 m²<br/>• 🟡 <b>MEDIUM:</b> Conf ≥ 0.50<br/>• 🟢 <b>LOW:</b> Conf < 0.50"]
        PO1 --> PO2
        PO2 --> PO3
    end

    subgraph STAGE5 ["📊 STAGE 5: STRUCTURED OUTPUT & DOWNSTREAM ANALYTICS"]
        direction LR
        OUT1["🆔 <b>Detection Object</b><br/>• id: det_xxxx (UUID)<br/>• frame_id: frame_xxxx<br/>• label: ghost_net | rope | trawl_door<br/>• confidence: float (0.00 – 1.00)"]
        OUT2["📦 <b>Spatial Bounding Box</b><br/>• x_min, y_min, x_max, y_max<br/>• Estimated Area: area_m²<br/>• Severity: CRITICAL / HIGH / MED / LOW"]
        OUT3["🌍 <b>Geo-Tag & Downstream</b><br/>• GeoPoint: lat, lon, depth_m<br/>• DBSCAN Hotspot Density Map<br/>• ROV Recovery Route Priority Score"]
    end

    %% Pipeline Flow
    STAGE1 ==>|"Raw Acoustic Stream"| STAGE2
    STAGE2 ==>|"640x640 Preprocessed Tensor"| STAGE3
    STAGE3 ==>|"Raw Bounding Boxes & Class Logits"| STAGE4
    STAGE4 ==>|"Validated & Scored Detections"| STAGE5

    %% Styling Theme
    classDef s1Style fill:#0b192c,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef s2Style fill:#1e1b4b,stroke:#a78bfa,stroke-width:2px,color:#f8fafc;
    classDef s3Style fill:#311506,stroke:#fb923c,stroke-width:2px,color:#f8fafc;
    classDef s4Style fill:#062e24,stroke:#34d399,stroke-width:2px,color:#f8fafc;
    classDef s5Style fill:#3b0724,stroke:#f472b6,stroke-width:2px,color:#f8fafc;
    classDef cardStyle fill:#0f172a,stroke:#334155,stroke-width:1px,color:#e2e8f0;

    class STAGE1 s1Style;
    class STAGE2 s2Style;
    class STAGE3 s3Style;
    class STAGE4 s4Style;
    class STAGE5 s5Style;
    class IN1,IN2,IN3,PR1,PR2,PR3,BB,NK,HD,PO1,PO2,PO3,OUT1,OUT2,OUT3 cardStyle;
```

---

## 🏗️ Monorepo Structure

```
ghostnet/
├── frontend/              # Next.js 14 (App Router, TypeScript) → Vercel
│   ├── app/               # Pages & routing
│   ├── components/        # UI components
│   └── lib/api.ts         # TypeScript API client
│
├── backend/               # FastAPI + YOLO → Render (Docker)
│   └── app/
│       ├── api/routes/    # detect · upload · reports · health
│       ├── core/          # config · preprocessing
│       ├── models/        # YOLOModelManager (inference.py)
│       ├── schemas/       # Pydantic models (Detection, BBox, GeoPoint…)
│       └── services/      # DetectionService · AnalyticsService
│
├── ml/                    # Training pipeline (NOT deployed)
│   ├── train.py
│   ├── export_onnx.py
│   └── notebooks/
│
├── features/              # Feature analytics modules
│   ├── anomaly_alerts.py
│   ├── cleanup_priority.py
│   ├── depth_analysis.py
│   ├── hotspot_detection.py
│   ├── map_data.py
│   ├── report_generator.py
│   ├── risk_scoring.py
│   ├── route_planning.py
│   ├── survey_analytics.py
│   └── survey_comparison.py
│
├── shared/                # Cross-boundary type definitions
│   └── detection-schema.json
│
└── docs/
    └── api-schema.md      ← single source of truth for Detection shape
```

| Layer | Tech | Deploys to |
|---|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) | Vercel |
| Backend | FastAPI + Ultralytics YOLO | Render (Docker) |
| ML Training | PyTorch + YOLOv8 | Local / Colab |
| Model Hosting | Hugging Face Hub (`zzephyrr/GhostNetyolo26m`) | HF Cloud |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns model load status |
| `POST` | `/api/v1/upload` | Upload sonar image → returns `frame_id` |
| `POST` | `/api/v1/detect` | Upload + detect in a single request |
| `POST` | `/api/v1/detect/{frame_id}` | Detect on a previously uploaded frame |
| `GET` | `/api/v1/reports` | List historical detection reports |

### Detection Labels

| Label | Description |
|---|---|
| `ghost_net` | Abandoned fishing nets |
| `rope` | Loose rope / monofilament line |
| `trawl_door` | Trawl net doors / otter boards |
| `debris_patch` | General marine debris cluster |

### Severity Levels

| Severity | Confidence | Estimated Area |
|---|---|---|
| 🔴 `CRITICAL` | ≥ 0.90 | ≥ 50 m² |
| 🟠 `HIGH` | ≥ 0.70 | ≥ 10 m² |
| 🟡 `MEDIUM` | ≥ 0.50 | any |
| 🟢 `LOW` | < 0.50 | any |

---

## 💻 Local Development

### Prerequisites

- Node.js ≥ 20
- Python ≥ 3.11
- Docker (optional, for local Dockerfile testing)

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env — set ALLOWED_ORIGINS=http://localhost:3000

uvicorn app.main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health` → `{"status":"ok",...}`

### 2. Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Open `http://localhost:3000` — landing page, then `http://localhost:3000/dashboard`.

---

## 🚀 Deployment

### Backend → Render

1. Connect the **`ghostnet/backend`** subdirectory as the Render root directory (or use `render.yaml`).
2. Choose **Docker** as the environment — **not** the Python buildpack.
3. Set these env vars in Render dashboard:
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`
   - `MODEL_REPO` = `zzephyrr/GhostNetyolo26m`
   - `MODEL_FILENAME` = `best.pt`
   - `ENVIRONMENT` = `production`
4. Render will use `backend/Dockerfile` automatically.
5. Add health check path: `/health`.

### Frontend → Vercel

1. Import the repo into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set these env vars in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
4. Deploy.
5. **After getting the Vercel URL**, go back to Render and update `ALLOWED_ORIGINS` to the real Vercel URL.

> ⚠️ **CORS note**: `ALLOWED_ORIGINS` must be updated to the real Vercel URL — otherwise the browser will block all API calls. `"*"` is never used.

---

## 🧪 Model Weights

Model weights (`best.pt`) are hosted on **Hugging Face** at [`zzephyrr/GhostNetyolo26m`](https://huggingface.co/zzephyrr/GhostNetyolo26m) — not committed to git.

The backend `YOLOModelManager` automatically:
1. Checks for `model_weights/best.pt` locally first
2. Falls back to downloading from Hugging Face on first boot

Training pipeline lives in `ml/` — run `ml/train.py` to train, then `ml/export_onnx.py` to produce a portable weight file.

---

## 📐 Schema Discipline

`docs/api-schema.md` is the **single source of truth** for the `Detection` object.

Whenever a field changes:
1. Update `docs/api-schema.md`
2. Update `backend/app/schemas/detection.py` (Pydantic)
3. Update `frontend/lib/api.ts` (TypeScript interfaces)
4. Update `shared/detection-schema.json` (JSON Schema)

---

## ✅ Development Checklist (before first deploy)

- [ ] Backend `/health` returns 200
- [ ] Frontend calls `/health` and shows response
- [ ] CORS set to `http://localhost:3000` locally
- [ ] No hardcoded URLs in frontend code (use `NEXT_PUBLIC_API_URL`)
- [ ] Model weights auto-downloading from HF on backend startup
- [ ] Render env vars configured (`MODEL_REPO`, `MODEL_FILENAME`, `ALLOWED_ORIGINS`)
- [ ] Vercel env vars configured in dashboard
- [ ] `ALLOWED_ORIGINS` updated to real Vercel URL after first deploy
