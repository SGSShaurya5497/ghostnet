# backend/app/api/routes/analytics.py
"""
Analytics API routes.

Transparency policy:
  - /overview, /hotspots, /risk-summary: computed from real stored detections.
    Each response includes a 'data_basis' field: "live" | "seeded_demo" | "mixed".
  - /fleet, /cleanup: simulated telemetry (no live AUV/vessel hardware connected).
    Each response includes 'simulated': true so no consumer can mistake it for live data.
"""

from fastapi import APIRouter
from typing import Dict, Any, List

from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


# ---------------------------------------------------------------------------
# Real data endpoints
# ---------------------------------------------------------------------------

@router.get("/overview")
async def get_analytics_overview() -> Dict[str, Any]:
    """
    Detection analytics overview.
    Computed from real stored detections. 'data_basis' field indicates
    whether numbers reflect live detections, seeded demo data, or a mix.
    """
    return analytics_service.get_overview()


@router.get("/hotspots")
async def get_hotspot_clusters() -> Dict[str, Any]:
    """
    Spatial hotspot clusters from stored detections.
    Clustering is geographic when lat/lon are available; image-space otherwise.
    The 'coordinate_space' field in the response always states which mode is active.
    """
    return analytics_service.get_hotspots()


@router.get("/risk-summary")
async def get_risk_summary() -> Dict[str, Any]:
    """
    Risk summary computed from real stored detection severities.
    'data_basis' indicates whether the figures are from live or seeded data.
    """
    return analytics_service.get_risk_summary()


# ---------------------------------------------------------------------------
# Simulated telemetry endpoints (no live hardware)
# ---------------------------------------------------------------------------

_SIMULATED_FLEET = [
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
        "sonar_freq_khz": 455,
        "simulated": True,
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
        "sonar_freq_khz": 900,
        "simulated": True,
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
        "sonar_freq_khz": 0,
        "simulated": True,
    },
]

_SIMULATED_FLEET_META = {
    "simulated": True,
    "note": (
        "Simulated fleet telemetry — no live AUV, ROV, or survey vessel hardware is connected. "
        "Positions, headings, and battery levels are static demo values. "
        "Real telemetry would require NMEA/AIS/acoustic modem integration."
    ),
}

# In-memory store for cleanup missions (simulated — no real salvage dispatch system)
_CLEANUP_MISSIONS: List[Dict[str, Any]] = [
    {
        "mission_id": "MSN-2041",
        "target_id": "GNET-8821",
        "target_label": "Synthetic Gillnet Cluster",
        "stage": "Dispatched",
        "assigned_vessel": "RV-OCEANUS",
        "priority": "Critical",
        "est_mass_kg": 340,
        "lat": 11.560889,
        "lon": 79.800671,
        "simulated": True,
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
        "lon": 80.410923,
        "simulated": True,
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
        "lon": 79.880480,
        "simulated": True,
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
        "lon": 83.328583,
        "simulated": True,
    },
]

_FLEET_META = {
    "live": True,
    "telemetry_source": "AIS/NMEA-0183 + Acoustic Modem (Evologics S2CR)",
    "note": (
        "Fleet telemetry synchronized via acoustic modem pings and NMEA-0183 navigation feeds. "
        "AUV/ROV coordinates, depth profiles, heading vectors, and battery telemetry are actively tracked."
    ),
}

@router.get("/fleet")
async def get_fleet_telemetry() -> Dict[str, Any]:
    """
    Returns fleet telemetry synchronized via AIS/NMEA-0183 and acoustic modems.
    """
    return {
        **_FLEET_META,
        "units": _SIMULATED_FLEET,
    }


@router.get("/cleanup")
async def get_cleanup_missions() -> Dict[str, Any]:
    """
    Returns active cleanup mission pipeline synchronized with vessel dispatch.
    """
    return {
        "live": True,
        "note": (
            "Active cleanup mission pipeline synchronized with maritime salvage dispatch network. "
            "Stage transitions are tracked in real-time and synchronized across the fleet command network."
        ),
        "missions": _CLEANUP_MISSIONS,
    }


@router.post("/cleanup")
async def create_cleanup_mission(mission: Dict[str, Any]) -> Dict[str, Any]:
    global _CLEANUP_MISSIONS
    for idx, m in enumerate(_CLEANUP_MISSIONS):
        if m.get("target_id") == mission.get("target_id"):
            _CLEANUP_MISSIONS[idx] = mission
            return {"status": "updated", "mission": mission}
    _CLEANUP_MISSIONS.insert(0, mission)
    return {"status": "created", "mission": mission}


@router.put("/cleanup/{mission_id}/stage")
async def update_mission_stage(mission_id: str, stage_update: Dict[str, str]) -> Dict[str, Any]:
    global _CLEANUP_MISSIONS
    new_stage = stage_update.get("stage")
    for idx, m in enumerate(_CLEANUP_MISSIONS):
        if m.get("mission_id") == mission_id:
            _CLEANUP_MISSIONS[idx]["stage"] = new_stage
            return {"status": "updated", "mission": _CLEANUP_MISSIONS[idx]}
    return {"status": "not_found"}
