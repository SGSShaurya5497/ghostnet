# -*- coding: utf-8 -*-
"""
route_planning.py  (Feature 5) -- GhostNetPINGE
Public entry point: generate_route(targets, start_point, config=None)

Generates an AUV/inspection route visiting supplied target detections.

IMPORTANT: Real route planning requires genuine geographic or physical
coordinates.  The current pipeline exposes ONLY normalised image-space
coordinates (cx, cy), which are meaningless as real-world waypoints.

Behaviour:
  - If targets have latitude/longitude -> compute a nearest-neighbour route
    in geographic space (degrees).
  - If targets have ONLY pixel/image coordinates -> return a clear
    "insufficient spatial information" result.  Never fabricate a route
    from image-space coordinates as if they were geographic positions.

Confirmed real fields used: class_name, cx, cy (image-space only)
Optional (not in pipeline): latitude, longitude
"""

import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_ROUTE_CONFIG = {
    # Routing algorithm.  Currently only "nearest_neighbor" is implemented.
    # Swap in a different function here to change algorithm without touching
    # the rest of the module.
    "algorithm": "nearest_neighbor",

    # Speed of the AUV/vessel in m/s.  Used only for time estimates.
    # 1 degree lat/lon ~ 111 km at equator; time estimates are rough.
    # NOT used when coordinates are unavailable.
    "auv_speed_ms": 1.0,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _haversine_degrees(lat1, lon1, lat2, lon2):
    """
    Approximate distance in metres between two lat/lon points.
    Uses simplified equirectangular approximation -- acceptable for short
    distances typical in a sonar survey area.
    """
    R = 6_371_000  # Earth radius in metres
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    avg_lat = math.radians((lat1 + lat2) / 2.0)
    x = dlon * math.cos(avg_lat)
    dist = R * math.sqrt(dlat ** 2 + x ** 2)
    return dist


def _nearest_neighbor_route(start_lat, start_lon, targets):
    """
    Nearest-neighbour TSP approximation.
    Returns ordered list of target dicts with estimated distances.
    """
    remaining = list(targets)
    route = []
    cur_lat, cur_lon = start_lat, start_lon

    while remaining:
        best_idx = 0
        best_dist = _haversine_degrees(cur_lat, cur_lon,
                                       remaining[0]["latitude"],
                                       remaining[0]["longitude"])
        for i in range(1, len(remaining)):
            d = _haversine_degrees(cur_lat, cur_lon,
                                   remaining[i]["latitude"],
                                   remaining[i]["longitude"])
            if d < best_dist:
                best_dist = d
                best_idx = i

        chosen = remaining.pop(best_idx)
        route.append({
            "target":             chosen,
            "distance_from_prev_m": round(best_dist, 2),
        })
        cur_lat = chosen["latitude"]
        cur_lon = chosen["longitude"]

    return route


def _coerce_list(raw_list):
    result = []
    for item in (raw_list or []):
        if isinstance(item, Detection):
            result.append(item)
        elif isinstance(item, dict):
            result.append(detection_from_dict(item))
        else:
            raise TypeError("Expected Detection or dict, got {}".format(type(item)))
    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_route(targets, start_point, config=None):
    """
    Generate an AUV/inspection waypoint route through detected targets.

    Parameters
    ----------
    targets : list[Detection | dict]
        Target detections to visit.  Must have latitude/longitude for a real
        route to be generated.
    start_point : dict
        Starting position.  Must have keys 'latitude' and 'longitude' for a
        real route.  Image-space start coordinates are ignored.
    config : dict | None
        Override DEFAULT_ROUTE_CONFIG.

    Returns
    -------
    dict with keys:
        status          : str   -- "ok" | "insufficient_spatial_info" | "no_targets" | "error"
        route           : list  -- Ordered waypoints (empty if status != "ok")
        total_distance_m: float -- Estimated total route length in metres
        algorithm       : str   -- Algorithm used
        warnings        : list[str]
        note            : str   -- Human-readable explanation of status
    """
    cfg = dict(DEFAULT_ROUTE_CONFIG)
    if config:
        cfg.update(config)

    warnings = []

    try:
        dets = _coerce_list(targets)
    except (TypeError, KeyError) as exc:
        return {
            "status": "error", "route": [], "total_distance_m": 0,
            "algorithm": cfg["algorithm"], "warnings": [str(exc)],
            "note": "Input error.",
        }

    if not dets:
        return {
            "status": "no_targets", "route": [], "total_distance_m": 0,
            "algorithm": cfg["algorithm"], "warnings": warnings,
            "note": "No targets supplied; route is empty.",
        }

    # Check if geographic coordinates are available
    geo_targets = [d for d in dets if d.has_geo]
    start_lat = start_point.get("latitude")
    start_lon = start_point.get("longitude")
    has_start_geo = start_lat is not None and start_lon is not None

    if not geo_targets or not has_start_geo:
        missing = []
        if not geo_targets:
            missing.append("targets lack latitude/longitude")
        if not has_start_geo:
            missing.append("start_point lacks latitude/longitude")
        return {
            "status": "insufficient_spatial_info",
            "route": [],
            "total_distance_m": 0,
            "algorithm": cfg["algorithm"],
            "warnings": warnings,
            "note": (
                "Cannot generate a real route: {}.  "
                "The current pipeline exposes only normalised image-space "
                "coordinates (cx, cy), which are NOT geographic waypoints.  "
                "Add real lat/lon to each detection and start_point to enable "
                "route planning.".format("; ".join(missing))
            ),
        }

    if len(geo_targets) < len(dets):
        warnings.append(
            "{} of {} targets lacked lat/lon and were excluded from routing.".format(
                len(dets) - len(geo_targets), len(dets))
        )

    # Build simplified target dicts for the routing algorithm
    target_dicts = [
        {
            "latitude":   d.latitude,
            "longitude":  d.longitude,
            "class_name": d.class_name,
            "confidence": d.confidence,
            "risk_score": d.risk_score,
        }
        for d in geo_targets
    ]

    if cfg["algorithm"] == "nearest_neighbor":
        route = _nearest_neighbor_route(start_lat, start_lon, target_dicts)
    else:
        return {
            "status": "error", "route": [], "total_distance_m": 0,
            "algorithm": cfg["algorithm"],
            "warnings": warnings,
            "note": "Unknown algorithm: {}".format(cfg["algorithm"]),
        }

    total_dist = sum(wp["distance_from_prev_m"] for wp in route)

    return {
        "status":            "ok",
        "route":             route,
        "total_distance_m":  round(total_dist, 2),
        "algorithm":         cfg["algorithm"],
        "warnings":          warnings,
        "note":              "Route computed in geographic space (lat/lon).",
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== route_planning.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    # Case 1: No targets
    print("--- Case: zero targets ---")
    print(generate_route([], {"latitude": 48.0, "longitude": -123.0}))

    # Case 2: Image-space only (no lat/lon) -- should refuse to route
    print("\n--- Case: image-space coords only (current pipeline state) ---")
    img_dets = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.50, "cy": 0.50, "bw": 0.08, "bh": 0.08},
    ]
    result = generate_route(img_dets, {"cx": 0.0, "cy": 0.0})
    print("status:", result["status"])
    print("note:", result["note"])

    # Case 3: Geographic coordinates present -- full route
    print("\n--- Case: geographic coordinates available ---")
    geo_dets = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10,
         "latitude": 48.001, "longitude": -123.010},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.50, "cy": 0.50, "bw": 0.08, "bh": 0.08,
         "latitude": 48.003, "longitude": -123.005},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25,
         "latitude": 48.000, "longitude": -123.020},
    ]
    result = generate_route(geo_dets, {"latitude": 47.999, "longitude": -123.000})
    print("status:", result["status"])
    print("total_distance_m:", result["total_distance_m"])
    for i, wp in enumerate(result["route"], 1):
        t = wp["target"]
        print("  Waypoint {}: lat={} lon={} dist_from_prev={}m class={}".format(
            i, t["latitude"], t["longitude"], wp["distance_from_prev_m"], t["class_name"]))
