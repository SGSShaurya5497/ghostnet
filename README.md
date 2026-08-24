# GhostNet 🌊

**Marine debris (ghost net) detection via side-scan sonar imagery — computer vision pipeline.**

| Layer | Tech | Deploys to |
|---|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) | Vercel |
| Backend | FastAPI + ONNX Runtime | Render (Docker) |
| ML | PyTorch training pipeline | Local / Colab |

---

## Monorepo Structure

```
ghostnet/
├── frontend/         # Next.js — Vercel root directory
├── backend/          # FastAPI — Render root directory
├── ml/               # Training-only, NOT deployed
├── shared/           # Cross-boundary type definitions
└── docs/
    └── api-schema.md  ← single source of truth for Detection shape
```

---

## Local Development

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

## Deployment

### Backend → Render

1. Connect the **`ghostnet/backend`** subdirectory as the Render root directory (or use `render.yaml`).
2. Choose **Docker** as the environment — **not** the Python buildpack.
3. Set these env vars in Render dashboard:
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app` (update after Vercel deploy)
   - `MODEL_DOWNLOAD_URL` = URL to your `.onnx` file (GitHub release / GCS / S3)
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

## Model Weights

Model weights (`.onnx`) are **not committed to git** — Render has repo size limits.

Options:
1. **Git LFS**: `git lfs track "*.onnx"` — then commit normally
2. **Download script**: set `MODEL_DOWNLOAD_URL` env var; the backend downloads on first boot via `app/models/inference.py`

Training pipeline lives in `ml/` — run `ml/export_onnx.py` to produce the weight file, then upload it to your chosen storage.

---

## Schema Discipline

`docs/api-schema.md` is the **single source of truth** for the `Detection` object.

Whenever a field changes:
1. Update `docs/api-schema.md`
2. Update `backend/app/schemas/detection.py` (Pydantic)
3. Update `frontend/lib/api.ts` (TypeScript interfaces)
4. Update `shared/detection-schema.json` (JSON Schema)

---

## Development Checklist (before first deploy)

- [ ] Backend `/health` returns 200
- [ ] Frontend calls `/health` and shows response
- [ ] CORS set to `http://localhost:3000` locally
- [ ] No hardcoded URLs in frontend code (use `NEXT_PUBLIC_API_URL`)
- [ ] Model weights excluded from git (`.gitignore` covers `.onnx`)
- [ ] Render env vars configured (without values committed)
- [ ] Vercel env vars configured in dashboard
- [ ] `ALLOWED_ORIGINS` updated to real Vercel URL after first deploy
