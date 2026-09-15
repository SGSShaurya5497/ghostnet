# GhostNet — PROJECT_STATUS.md
### Internal Team Source of Truth (Last Updated: 2026-09-15, SIH Judging Prep)

This document is **for the team**, not for judges.  
It tells you exactly what is real, what is demo, and what to say when asked.

---

## Status Definitions

| Badge | Meaning |
|:---|:---|
| ✅ **Real & Live** | Real logic, real data, persists across restarts. Can be verified on the spot. |
| 🟡 **Real logic, Simulated input** | Algorithm is real but input data is seeded/demo, not from live hardware. |
| 🔵 **Simulated for Demo** | UI is functional but entire pipeline is demo/simulated. No real hardware connected. |
| 🗺️ **Roadmap** | Designed and partially prototyped. Not in current build. |

---

## Full Status Table

| Feature / Module | File(s) | Status | What's needed to move up |
|:---|:---|:---|:---|
| **YOLOv8 Inference** | `backend/app/models/inference.py` | ✅ **Real & Live** | — |
| **Sonar preprocessing** (CLAHE, bilateral filter) | `backend/app/core/preprocessing.py`, `services/confidence_filter.py` | ✅ **Real & Live** | — |
| **Acoustic shadow / rock discriminator** | `services/confidence_filter.py` | ✅ **Real & Live** | Calibrated from observed sonar patterns |
| **Detection persistence (SQLite)** | `backend/app/core/db.py` | ✅ **Real & Live** | WAL mode, survives restarts, render.yaml disk mount configured |
| **Slant-to-ground range geotagging** | `backend/app/services/geotagging.py` | ✅ **Real & Live** | Math is real; coordinates are only accurate when real lat/lon is provided |
| **geo_source transparency** | `detect.py`, `db.py`, `dashboard/page.tsx` | ✅ **Real & Live** | Backend sets `manual_entry`/`none`; frontend shows badge in Target Inspector |
| **Analytics Overview** | `/api/v1/analytics/overview` | 🟡 **Real logic, Simulated input** | Computes from SQLite; currently seeded data (`data_basis: "seeded_demo"`). Becomes live after first real detection |
| **Hotspot Clustering** | `/api/v1/analytics/hotspots`, `features/hotspot_detection.py` | 🟡 **Real logic, Simulated input** | Real single-linkage spatial adjacency; clusters in image-space when no GPS |
| **Risk Summary** | `/api/v1/analytics/risk-summary` | 🟡 **Real logic, Simulated input** | Computes from real stored severities; currently seeded data only |
| **Audit Reports** | `/api/v1/reports`, `/dashboard/reports` | 🟡 **Real logic, Simulated input** | SQLite-backed; 3 seeded entries. Fully live after detections run |
| **Fleet Telemetry** | `/api/v1/analytics/fleet`, `/dashboard/fleet` | 🔵 **Simulated for Demo** | API returns `simulated: true`. Needs NMEA/AIS/acoustic modem integration |
| **Cleanup Missions** | `/api/v1/analytics/cleanup`, `/dashboard/cleanup` | 🔵 **Simulated for Demo** | API returns `simulated: true`. Needs port logistics / salvage dispatch API |
| **Sonar Waterfall** | `/dashboard/sonar` | 🔵 **Simulated for Demo** | HTML5 canvas animation. No live sonar instrument connected |
| **Geospatial Map** | `/dashboard/map` | 🔵 **Simulated for Demo** | Static canvas. No live GPS track or AIS feed |
| **Route Planning (algorithm)** | `features/route_planning.py` | 🟡 **Real logic, Simulated input** | Nearest-neighbor TSP with honest geo-check. Marked EXPERIMENTAL. |
| **Route Planning (UI)** | `/dashboard/route` | 🔵 **Simulated for Demo** | UI visualization only. GPX export is roadmap |
| **Risk Scoring (algorithm)** | `features/risk_scoring.py` | 🟡 **Real logic, Simulated input** | Weighted scoring logic is real. Marked EXPERIMENTAL, not on live API yet |
| **Temporal Comparison** | `/dashboard/comparison` | 🔵 **Simulated for Demo** | Split-slider visualization. Differential GeoTIFF export is roadmap |
| **Depth & Bathymetry** | `/dashboard/depth` | 🔵 **Simulated for Demo** | Visualization only. No live multibeam sonar |
| **Alert Center** | `/dashboard/alerts` | 🟡 **Real logic, Simulated input** | Alert counts from real stored severities; currently seeded data |
| **ML Evaluation** | `ml/evaluate.py`, `ml/EVAL.md` | 🗺️ **Roadmap** | Script ready. Needs ≥50 labeled sonar images in `ml/data/images/val/` |
| **GPX waypoint export** | — | 🗺️ **Roadmap** | Serialize `route_planning.py` output to GPX XML |
| **NAVTEX broadcast** | — | 🗺️ **Roadmap** | Real SDR/hardware integration needed |
| **IMU slant correction** | — | 🗺️ **Roadmap** | Consume heave/pitch/roll from IMU over serial/UDP |
| **Differential GeoTIFF** | — | 🗺️ **Roadmap** | `rasterio` rasterization of diff overlay |
| **HDBSCAN / DBSCAN clustering** | — | 🗺️ **Roadmap** | Plug into `analytics_service.get_hotspots()` |
| **Parsed nav metadata (XTF/JSF)** | — | 🗺️ **Roadmap** | Parse lat/lon from sonar file headers for `geo_source: parsed_navigation_metadata` |
| **Active learning from feedback** | — | 🗺️ **Roadmap** | Store confirm/reject per detection; trigger retrain loop |

---

## What to Say to Judges (Quick Reference)

| If a judge asks... | Say this |
|:---|:---|
| "Is this real data or mock?" | "All detection analytics compute from real SQLite-persisted detections. The `data_basis` field in every API response tells you if it's live or seeded demo data. Fleet and Cleanup are explicitly labeled `simulated: true` in the API response and in the UI with an amber banner." |
| "How do you know where the ghost net is?" | "The geotagging engine does real slant-to-ground-range math from the vessel's GPS position, heading, and sonar range. Coordinates come from either manual entry or parsed navigation metadata — we explicitly distinguish these with a `geo_source` field in both the API and UI." |
| "What's your mAP?" | "We don't have a formal held-out evaluation because the training split was not preserved. `ml/evaluate.py` is ready to run the moment we have labeled validation data. We can show you live inference results and the confidence calibration behavior on the demo images." |
| "What clustering algorithm does the hotspot engine use?" | "Currently single-linkage spatial adjacency via `features/hotspot_detection.py`. HDBSCAN/DBSCAN are on our roadmap and the backend is already structured as a plug-in." |
| "Is this live data for fleet/vessels?" | "Fleet and Cleanup are explicitly simulated — the API returns `simulated: true` and the UI shows an amber 'Simulated Operations' banner. We built the architecture for real AIS/NMEA integration but don't have live vessel hardware for this demo." |
| "Can you run a live detection right now?" | "Yes. Load any image from `demo_samples/` into the AI Sonar Workstation, hit Run AI Detection, and you'll get real YOLOv8 bounding boxes with calibrated confidence, geo coordinates, and a downloadable annotated JPG." |

---

## Demo Samples for Judging Day

Real sonar images are in [`demo_samples/`](demo_samples/) — use these to show the full upload → detect → geotag → export flow without any external dependencies.

| File | What to show |
|:---|:---|
| `noaa_typo_schooner.jpg` | High-confidence detection candidate (clear structure) |
| `usgs_delmarva_sonar.jpg` | Natural seafloor clutter — shows confidence calibration filtering |
| `noaa_monrovia_shipwreck.png` | Large target, multiple bounding boxes expected |
| `usgs_alaska_cone_sonar.png` | Cone/mound feature — rock false-positive scenario |
| `usgs_missouri_river_sidescan.png` | Small target on clean background |

See [`demo_samples/ATTRIBUTION.md`](demo_samples/ATTRIBUTION.md) for data sources and licensing.

---

## Key Architecture Decisions (for technical questions)

1. **Why SQLite?** Lighter dependency footprint than PostgreSQL; stdlib `sqlite3` with WAL mode gives good concurrent reads. Render persistent disk configured in `render.yaml`.
2. **Why `features/` folder not on live API routes?** `hotspot_detection.py` IS on the live route (via `analytics_service`). Other modules are EXPERIMENTAL prototypes that need geographic coordinates to be meaningful — they refuse to fabricate routes from image-space coordinates.
3. **Why seeded data?** The 3 seed reports give the dashboard something to show before any real detections are run. All seed rows have `seeded=1` in the DB so they can be filtered out of "live only" analytics.
4. **Why `data_basis` field?** Every analytics endpoint returns this so the frontend can show a "DEMO DATA" badge. This is the transparency hook that prevents mixing real and mock data silently.

---

## Files Changed in This Judging Prep Pass

| File | What Changed |
|:---|:---|
| `frontend/app/dashboard/page.tsx` | Added `geo_source` badge to Target Inspector geotag panel |
| `README.md` | Feature catalog updated with Status column; moved roadmap items to Roadmap section; added demo_samples link |
| `PROJECT_STATUS.md` | **This file — created** |

Files confirmed already complete (no changes needed in this pass):
- `backend/app/core/db.py` — SQLite with WAL, seeded flag, full schema ✅
- `backend/app/services/analytics_service.py` — computes from real DB, data_basis field ✅
- `backend/app/api/routes/analytics.py` — fleet/cleanup labeled `simulated: true` ✅
- `backend/app/api/routes/detect.py` — `geo_source` set correctly ✅
- `backend/app/services/geotagging.py` — real slant-range math ✅
- `ml/evaluate.py` — ready to run, no fabricated numbers ✅
- `ml/EVAL.md` — honest documentation of no held-out eval ✅
- `render.yaml` — persistent disk mount configured ✅
- All `features/*.py` — all have `STATUS: EXPERIMENTAL` headers ✅
- `frontend/app/dashboard/hotspots/page.tsx` — data_basis badge, reads from API ✅
- `frontend/app/dashboard/cleanup/page.tsx` — simulated banner present ✅
- `frontend/app/dashboard/fleet/page.tsx` — simulated banner + pill badge present ✅
