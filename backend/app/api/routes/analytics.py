# backend/app/api/routes/analytics.py
from fastapi import APIRouter
from typing import Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["analytics"])

class HotspotCluster(BaseModel):
    cluster_id: str
    name: str
    lat: float
    lon: float
    depth_m: float
    detection_count: int
    risk_level: str
    estimated_debris_m2: float

class FleetUnit(BaseModel):
    id: str
    name: str
    type: str
    status: str
    lat: float
    lon: float
    heading: float
    speed_knots: float
    battery_pct: int
    depth_m: float
    swath_coverage_km2: float

class CleanupMission(BaseModel):
    mission_id: str
    target_id: str
    target_label: str
    stage: str # "Identified" | "Dispatched" | "In Recovery" | "Cleared"
    assigned_vessel: str
    priority: str
    est_mass_kg: float
    lat: float
    lon: float

@router.get("/overview")
async def get_analytics_overview() -> Dict[str, Any]:
    return {
        "total_detections": 1573,
        "total_mass_tonnage": 4.8,
        "verified_resolution_pct": 94.2,
        "active_swath_area_km2": 14.8,
        "channels": [
            {"name": "Ghost Nets", "count": 582, "trend": "+4.2%", "mass_kg": 2640},
            {"name": "Synthetic Ropes", "count": 624, "trend": "-1.8%", "mass_kg": 1350},
            {"name": "Traps & Cages", "count": 218, "trend": "+0.5%", "mass_kg": 580},
            {"name": "Trawl Doors & Metal", "count": 149, "trend": "-2.1%", "mass_kg": 230},
        ],
        "monthly_trends": [
            {"month": "Jan", "actual": 142, "target": 130},
            {"month": "Feb", "actual": 186, "target": 160},
            {"month": "Mar", "actual": 215, "target": 200},
            {"month": "Apr", "actual": 320, "target": 280},
            {"month": "May", "actual": 275, "target": 260},
            {"month": "Jun", "actual": 190, "target": 180},
            {"month": "Jul", "actual": 245, "target": 220},
        ]
    }

@router.get("/hotspots")
async def get_hotspot_clusters() -> Dict[str, Any]:
    clusters = [
        {
            "cluster_id": "CL-01",
            "name": "Grande Island Reef Snag Corridor",
            "lat": 15.4989,
            "lon": 73.8278,
            "depth_m": 42.5,
            "detection_count": 8,
            "risk_level": "critical",
            "estimated_debris_m2": 340.0
        },
        {
            "cluster_id": "CL-02",
            "name": "Mormugao Deep Shipping Channel",
            "lat": 15.4120,
            "lon": 73.7910,
            "depth_m": 58.0,
            "detection_count": 5,
            "risk_level": "high",
            "estimated_debris_m2": 190.0
        },
        {
            "cluster_id": "CL-03",
            "name": "Aguada Shoal Trawl Clump",
            "lat": 15.5530,
            "lon": 73.8640,
            "depth_m": 31.2,
            "detection_count": 3,
            "risk_level": "medium",
            "estimated_debris_m2": 85.0
        },
        {
            "cluster_id": "CL-04",
            "name": "Baga Shelf Ridge Anomaly",
            "lat": 15.5680,
            "lon": 73.7420,
            "depth_m": 64.0,
            "detection_count": 6,
            "risk_level": "critical",
            "estimated_debris_m2": 260.0
        }
    ]
    return {"clusters": clusters, "total_hotspots": len(clusters)}

@router.get("/fleet")
async def get_fleet_telemetry() -> List[Dict[str, Any]]:
    return [
        {
            "id": "VESSEL-01",
            "name": "RV-OCEANUS",
            "type": "Hydrographic Survey Vessel",
            "status": "Active Survey",
            "lat": 15.4989,
            "lon": 73.8278,
            "heading": 184.2,
            "speed_knots": 4.2,
            "battery_pct": 98,
            "depth_m": 42.5,
            "swath_coverage_km2": 14.8,
            "sonar_freq_khz": 455
        },
        {
            "id": "AUV-02",
            "name": "AUV-NEPTUNE-02",
            "type": "Autonomous Underwater Vehicle",
            "status": "Acoustic Pinging",
            "lat": 15.4410,
            "lon": 73.7820,
            "heading": 92.5,
            "speed_knots": 2.8,
            "battery_pct": 74,
            "depth_m": 54.2,
            "swath_coverage_km2": 6.4,
            "sonar_freq_khz": 900
        },
        {
            "id": "ROV-01",
            "name": "ROV-TRITON-X",
            "type": "Remotely Operated Recovery Vehicle",
            "status": "Standby on Deck",
            "lat": 15.4989,
            "lon": 73.8278,
            "heading": 0.0,
            "speed_knots": 0.0,
            "battery_pct": 100,
            "depth_m": 0.0,
            "swath_coverage_km2": 0.0,
            "sonar_freq_khz": 0
        }
    ]

CLEANUP_MISSIONS_STORE: List[Dict[str, Any]] = [
    {
        "mission_id": "MSN-2041",
        "target_id": "GNET-8821",
        "target_label": "Synthetic Gillnet Cluster",
        "stage": "Dispatched",
        "assigned_vessel": "RV-OCEANUS",
        "priority": "Critical",
        "est_mass_kg": 340,
        "lat": 11.560889,
        "lon": 79.800671
    },
    {
        "mission_id": "MSN-2039",
        "target_id": "GNET-8815",
        "target_label": "Snagged Trawl Net on Reef",
        "stage": "In Recovery",
        "assigned_vessel": "ROV-TRITON-X",
        "priority": "Critical",
        "est_mass_kg": 620,
        "lat": 13.325614,
        "lon": 80.410923
    },
    {
        "mission_id": "MSN-2035",
        "target_id": "GNET-8819",
        "target_label": "Abandoned Polypropylene Line",
        "stage": "Identified",
        "assigned_vessel": "AUV-NEPTUNE-02",
        "priority": "High",
        "est_mass_kg": 180,
        "lat": 11.856251,
        "lon": 79.880480
    },
    {
        "mission_id": "MSN-2028",
        "target_id": "GNET-8809",
        "target_label": "Submerged Crab Trap Cage",
        "stage": "Cleared",
        "assigned_vessel": "RV-OCEANUS",
        "priority": "Medium",
        "est_mass_kg": 95,
        "lat": 17.633693,
        "lon": 83.328583
    }
]

@router.get("/cleanup")
async def get_cleanup_missions() -> List[Dict[str, Any]]:
    return CLEANUP_MISSIONS_STORE

@router.post("/cleanup")
async def create_cleanup_mission(mission: Dict[str, Any]) -> Dict[str, Any]:
    global CLEANUP_MISSIONS_STORE
    # Check if target already exists and update
    for idx, m in enumerate(CLEANUP_MISSIONS_STORE):
        if m.get("target_id") == mission.get("target_id"):
            CLEANUP_MISSIONS_STORE[idx] = mission
            return {"status": "updated", "mission": mission}
    CLEANUP_MISSIONS_STORE.insert(0, mission)
    return {"status": "created", "mission": mission}

@router.put("/cleanup/{mission_id}/stage")
async def update_mission_stage(mission_id: str, stage_update: Dict[str, str]) -> Dict[str, Any]:
    global CLEANUP_MISSIONS_STORE
    new_stage = stage_update.get("stage")
    for idx, m in enumerate(CLEANUP_MISSIONS_STORE):
        if m.get("mission_id") == mission_id:
            CLEANUP_MISSIONS_STORE[idx]["stage"] = new_stage
            return {"status": "updated", "mission": CLEANUP_MISSIONS_STORE[idx]}
    return {"status": "not_found"}

@router.get("/risk-summary")
async def get_risk_summary() -> Dict[str, Any]:
    return {
        "overall_hazard_index": 7.8,
        "critical_hotspots": 2,
        "entanglement_risk_level": "High",
        "navigational_hazard_count": 5,
        "depth_distribution": [
            {"range": "0-20m", "count": 2, "hazard": "Low"},
            {"range": "20-40m", "count": 7, "hazard": "Medium"},
            {"range": "40-60m", "count": 14, "hazard": "Critical"},
            {"range": "60m+", "count": 6, "hazard": "High"}
        ]
    }
