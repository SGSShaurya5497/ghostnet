# GhostNet 🌊 — Project Run Guide

This document details the exact sequence of commands, environment configuration, and verification steps required to run the **GhostNet** platform locally.

---

## 🏗️ Architecture Overview

GhostNet consists of two primary services:
1. **Backend API Gateway (`backend/`)**: FastAPI + PyTorch + YOLOv8 inference running on **`http://127.0.0.1:8000`**.
2. **Frontend Client (`frontend/`)**: Next.js 14 + Tailwind CSS + Three.js dashboard running on **`http://localhost:3000`**.

---

## ⚙️ Pre-Flight Configuration (Already Prepared)

The following two configuration files have been configured:

### 1. `backend/.env`
Ensures FastAPI loads the local PyTorch model weights (`backend/model_weights/best.pt`) and configures CORS:
```env
ENVIRONMENT=development
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://ghostnet.vercel.app

# Hugging Face Model Configuration
MODEL_REPO=zzephyrr/GhostNetyolo26m
MODEL_FILENAME=best.pt
HF_TOKEN=

# Inference defaults
CONF_THRESHOLD=0.25
IOU_THRESHOLD=0.45
IMG_SIZE=640
```

### 2. `frontend/.env.local`
Points the Next.js frontend to the local FastAPI backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Step-by-Step Commands to Run

Open **two separate terminal windows/tabs** in your workspace root (`c:\Users\SHAURYA\OneDrive\Desktop\SIH Project\ghostnet`).

### Step 1: Start the Backend (Terminal 1)

Navigate to the `backend` folder and start the Uvicorn server:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### What you should see in Terminal 1:
```text
INFO:     Started server process [...]
INFO:     Waiting for application startup.
[INFO] ghostnet.main: Initializing GhostNet API service...
[INFO] ghostnet.db: Database initialized.
[INFO] ghostnet.models: Loading model from local path: ...\backend\model_weights\best.pt
[INFO] ghostnet.models: YOLO model successfully loaded and ready for inference.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

### Step 2: Start the Frontend (Terminal 2)

Navigate to the `frontend` folder and launch the Next.js development server:

```powershell
cd frontend
npm run dev
```

#### What you should see in Terminal 2:
```text
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 2-3s
```

---

## 🌐 How to Access & Verify

Once both terminals are running, open your web browser:

| Service / View | URL | Description |
| :--- | :--- | :--- |
| **Main Dashboard & AI Workstation** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Main CV interface for sonar image detection & geotagging |
| **Geospatial Survey Map** | [http://localhost:3000/dashboard/map](http://localhost:3000/dashboard/map) | Leaflet GIS interactive map with sonar detection pins |
| **Debris Hotspots** | [http://localhost:3000/dashboard/hotspots](http://localhost:3000/dashboard/hotspots) | Spatial clustering & density analysis |
| **Sonar Hydrography Waterfall** | [http://localhost:3000/dashboard/sonar](http://localhost:3000/dashboard/sonar) | Acoustic waterfall stream visualization |
| **Fleet Operations** | [http://localhost:3000/dashboard/fleet](http://localhost:3000/dashboard/fleet) | AIS telemetry & vessel tracking |
| **Backend Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Returns `{"status":"ok","version":"0.1.0","model_loaded":true}` |
| **Backend Swagger API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API exploration & testing |

---

## 🧪 Testing Live AI Sonar Detection

To demonstrate live YOLOv8 inference:
1. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
2. Real side-scan sonar samples are ready in the [`demo_samples/`](demo_samples/) directory:
   - `noaa_typo_schooner.jpg` (Clear acoustic structure)
   - `usgs_delmarva_sonar.jpg` (Seafloor clutter + confidence filter demonstration)
   - `noaa_monrovia_shipwreck.png` (Large target with bounding boxes)
3. Upload or drag & drop one of these images into the **AI Sonar Workstation**.
4. Click **Run AI Detection**.
5. Inspect:
   - Detected bounding boxes (e.g. `Crab-Pot` / `ghost_net` / `debris_patch`)
   - Calibrated confidence scores
   - Slant-to-ground range geotags (WGS-84 coordinates)
   - Downloadable annotated output

---

## ⚠️ Troubleshooting & FAQ

### Issue 1: `Errno 10048: only one usage of each socket address is normally permitted`
- **Cause**: Another process (such as a previous Uvicorn instance) is already using port 8000.
- **Fix**:
  Find and terminate the process holding port 8000:
  ```powershell
  # Check which process ID (PID) is using port 8000
  netstat -ano | findstr :8000

  # Kill the process by PID (replace <PID> with actual number from last column)
  taskkill /PID <PID> /F
  ```

### Issue 2: Frontend Cannot Connect to Backend
- Confirm that `backend` is running on `http://127.0.0.1:8000`.
- Visit `http://localhost:8000/health` in your browser. It should return `{"status":"ok","version":"0.1.0","model_loaded":true}`.
- Verify `frontend/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8000`.

### Issue 3: Stopping the Servers
- In either terminal window, press `CTRL + C` to gracefully stop the development server.
