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
    subgraph CLIENT["🖥️ CLIENT — Vercel (Next.js 14)"]
        direction LR
        A1["📄 Landing /"] --> A2["📊 Dashboard"]
        A2 --> A3["🔍 Detect"]
        A2 --> A4["🗺️ Map"]
        A2 --> A5["📋 Reports"]
    end

    subgraph API["⚡ API LAYER — Render (FastAPI + Docker)"]
        direction LR
        B1["POST /upload"] & B2["POST /detect"] & B3["POST /detect/id"] & B4["GET /reports"] & B5["GET /health"]
    end

    subgraph CORE["🧠 BACKEND CORE"]
        direction LR
        C1["🖼️ Preprocessing"] & C2["🔬 Detection Svc"] & C3["📦 Frame Store"] & C4["📊 Analytics Svc"]
    end

    subgraph ML["🤖 ML INFERENCE — YOLO Model Manager"]
        direction LR
        D1["🏋️ YOLOModelManager"] -->|"1st: local"| D3["📁 Local Weights"]
        D1 -->|"fallback"| D2["☁️ Hugging Face Hub"]
    end

    subgraph STORE["☁️ MODEL STORAGE"]
        E1["🤗 HF Repo — best.pt"]
    end

    CLIENT -->|"HTTPS + JSON — CORS Controlled"| API
    API --> CORE
    CORE --> ML
    D2 --> E1

    style CLIENT fill:#0f172a,color:#38bdf8,stroke:#38bdf8,stroke-width:2px
    style API fill:#0f172a,color:#a78bfa,stroke:#a78bfa,stroke-width:2px
    style CORE fill:#0f172a,color:#34d399,stroke:#34d399,stroke-width:2px
    style ML fill:#0f172a,color:#fb923c,stroke:#fb923c,stroke-width:2px
    style STORE fill:#0f172a,color:#f472b6,stroke:#f472b6,stroke-width:2px
```

---

## 🧠 Model Architecture — YOLOv8 Inference Pipeline

```mermaid
flowchart TB
    subgraph INPUT["📥 INPUT"]
        direction LR
        I1["🖼️ Sonar Image"] & I2["📡 Sonar Metadata"] & I3["🌍 GeoPoint — lat · lon · depth_m"]
    end

    subgraph PREPROCESS["🔧 PREPROCESSING"]
        direction LR
        P1["📂 Decode → NumPy RGB"] --> P2["✨ Sonar Enhancement"] --> P3["📐 Resize 640px Letterbox"]
    end

    subgraph MODEL["🤖 YOLOv8 — GhostNetyolo26m · best.pt"]
        direction LR
        M1["🏗️ Backbone — CSPDarkNet + C2f"] --> M2["🔗 Neck — PAFPN"] --> M3["🎯 Head — conf=0.25 · iou=0.45"]
    end

    subgraph POSTPROCESS["📤 POST-PROCESSING"]
        direction LR
        Q1["📦 BBox Decode"] --> Q2["🏷️ Class Assignment"] --> Q3["⚖️ Severity Calc"]
        Q1 --> Q4["📏 Area Estimate"] --> Q3
    end

    subgraph OUTPUT["📊 OUTPUT — DetectionResponse"]
        direction LR
        R1["🆔 Det ID"] & R2["📦 BBox"] & R3["💯 Confidence"] & R4["🚨 Severity"] & R5["🌍 GeoTag"] & R6["⏱️ Time ms"]
    end

    INPUT --> PREPROCESS
    PREPROCESS --> MODEL
    MODEL --> POSTPROCESS
    POSTPROCESS --> OUTPUT

    style INPUT fill:#0f172a,color:#38bdf8,stroke:#38bdf8,stroke-width:2px
    style PREPROCESS fill:#0f172a,color:#a78bfa,stroke:#a78bfa,stroke-width:2px
    style MODEL fill:#0f172a,color:#fb923c,stroke:#fb923c,stroke-width:2px
    style POSTPROCESS fill:#0f172a,color:#34d399,stroke:#34d399,stroke-width:2px
    style OUTPUT fill:#0f172a,color:#f472b6,stroke:#f472b6,stroke-width:2px
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
