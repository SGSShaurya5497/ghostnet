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
        "total_detections": 16432,
        "total_mass_tonnage": 41.7,
        "verified_resolution_pct": 96.4,
        "active_swath_area_km2": 14.8,
        "channels": [
            {"name": "Ghost Nets", "count": 5762, "trend": "+1.8%", "mass_kg": 24150},
            {"name": "Synthetic Ropes", "count": 6843, "trend": "-2.8%", "mass_kg": 11200},
            {"name": "Traps & Cages", "count": 2123, "trend": "-2.8%", "mass_kg": 4850},
            {"name": "Trawl Doors & Metal", "count": 1704, "trend": "+0.4%", "mass_kg": 1500},
        ],
        "monthly_trends": [
            {"month": "Jan", "actual": 12000, "target": 11000},
            {"month": "Feb", "actual": 14000, "target": 13000},
            {"month": "Mar", "actual": 13000, "target": 15000},
            {"month": "Apr", "actual": 20000, "target": 22000},
            {"month": "May", "actual": 18000, "target": 19000},
            {"month": "Jun", "actual": 16000, "target": 17000},
            {"month": "Jul", "actual": 15000, "target": 16000},
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

@router.get("/cleanup")
async def get_cleanup_missions() -> List[Dict[str, Any]]:
    return [
        {
            "mission_id": "MSN-2041",
            "target_id": "GNET-8821",
            "target_label": "Synthetic Gillnet Cluster",
            "stage": "Dispatched",
            "assigned_vessel": "RV-OCEANUS",
            "priority": "Critical",
            "est_mass_kg": 340,
            "lat": 15.4989,
            "lon": 73.8278
        },
        {
            "mission_id": "MSN-2039",
            "target_id": "GNET-8815",
            "target_label": "Snagged Trawl Net on Reef",
            "stage": "In Recovery",
            "assigned_vessel": "ROV-TRITON-X",
            "priority": "Critical",
            "est_mass_kg": 620,
            "lat": 15.4410,
            "lon": 73.7820
        },
        {
            "mission_id": "MSN-2035",
            "target_id": "GNET-8819",
            "target_label": "Abandoned Polypropylene Line",
            "stage": "Identified",
            "assigned_vessel": "AUV-NEPTUNE-02",
            "priority": "High",
            "est_mass_kg": 180,
            "lat": 15.5120,
            "lon": 73.8340
        },
        {
            "mission_id": "MSN-2028",
            "target_id": "GNET-8809",
            "target_label": "Submerged Crab Trap Cage",
            "stage": "Cleared",
            "assigned_vessel": "RV-OCEANUS",
            "priority": "Medium",
            "est_mass_kg": 95,
            "lat": 15.5340,
            "lon": 73.8560
        }
    ]

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
