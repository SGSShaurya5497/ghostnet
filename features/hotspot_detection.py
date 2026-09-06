# -*- coding: utf-8 -*-
"""
hotspot_detection.py  (Feature 3) -- GhostNetPINGE
Public entry point: detect_hotspots(detections, config=None)

Clusters detections into spatial hotspots.

Because the pipeline exposes NO geographic coordinates (confirmed in Step 0),
clustering is performed in IMAGE-SPACE using normalised (cx, cy) coordinates.
All output is clearly labelled as "image-space clustering".

If callers pass detections with latitude/longitude populated, the module will
cluster geographically instead and label results accordingly.

Confirmed real fields used: class_name, cx, cy, confidence, bw, bh
Optional: latitude, longitude (not in pipeline), risk_score (from risk_scoring.py)
"""

import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_HOTSPOT_CONFIG = {
    # Distance threshold for merging detections into one hotspot cluster.
    # When clustering in image-space: this is normalised distance (0-1 scale).
    # When clustering geographically: this is degrees (approx 0.001 deg ~ 111m).
    "cluster_radius_image": 0.15,    # normalised image units
    "cluster_radius_geo":   0.001,   # degrees (approx 111 m)

    # Minimum number of detections to qualify as a hotspot
    "min_cluster_size": 2,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _distance_image(a, b):
    """Euclidean distance between two detections in normalised image-space."""
    return math.sqrt((a.cx - b.cx) ** 2 + (a.cy - b.cy) ** 2)


def _distance_geo(a, b):
    """Approximate Euclidean distance in degrees between two detections."""
    return math.sqrt((a.latitude - b.latitude) ** 2 +
                     (a.longitude - b.longitude) ** 2)


def _use_geo(detections):
    """Return True only if ALL detections have valid lat/lon."""
    return all(d.has_geo for d in detections)


def _simple_cluster(detections, dist_fn, radius):
    """
    Greedy single-linkage clustering.
    Returns list of lists (each inner list = one cluster of Detection objects).
    """
    clusters = []
    assigned = [False] * len(detections)

    for i, det in enumerate(detections):
        if assigned[i]:
            continue
        cluster = [det]
        assigned[i] = True
        for j in range(i + 1, len(detections)):
            if assigned[j]:
                continue
            # Check distance to any member of current cluster (single-linkage)
            for member in cluster:
                if dist_fn(det, detections[j]) <= radius:
                    cluster.append(detections[j])
                    assigned[j] = True
                    break
        clusters.append(cluster)

    return clusters


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

def detect_hotspots(detections, config=None):
    """
    Cluster detections into spatial hotspots.

    Parameters
    ----------
    detections : list[Detection | dict]
        All detections from a survey frame or session.
    config : dict | None
        Override DEFAULT_HOTSPOT_CONFIG keys.

    Returns
    -------
    dict with keys:
        hotspots         : list[dict]  -- Each hotspot has:
                             hotspot_id   : str
                             detections   : list[dict]
                             count        : int
                             average_risk : float | str  ("unavailable" if no risk scores)
                             max_risk     : float | str
                             coordinate_space : str
        isolated         : list[dict]  -- Detections not in any hotspot cluster
        coordinate_space : str         -- "image-space" | "geographic"
        warnings         : list[str]
    """
    cfg = dict(DEFAULT_HOTSPOT_CONFIG)
    if config:
        cfg.update(config)

    warnings = []

    try:
        dets = _coerce_list(detections)
    except (TypeError, KeyError) as exc:
        return {
            "hotspots": [], "isolated": [],
            "coordinate_space": "unknown",
            "warnings": ["Input error: {}".format(exc)],
        }

    if not dets:
        return {
            "hotspots": [], "isolated": [],
            "coordinate_space": "image-space (normalised coords)",
            "warnings": ["No detections supplied."],
        }

    geo_mode = _use_geo(dets)
    if geo_mode:
        dist_fn = _distance_geo
        radius  = cfg["cluster_radius_geo"]
        coord_space = "geographic (lat/lon)"
    else:
        dist_fn = _distance_image
        radius  = cfg["cluster_radius_image"]
        coord_space = "image-space (normalised cx/cy -- NOT geographic)"
        if any(d.has_geo for d in dets):
            warnings.append(
                "Some detections have lat/lon but not all; falling back to image-space clustering."
            )

    raw_clusters = _simple_cluster(dets, dist_fn, radius)
    min_size = cfg["min_cluster_size"]

    hotspots = []
    isolated = []

    for idx, cluster in enumerate(raw_clusters):
        if len(cluster) < min_size:
            isolated.extend([vars(d) for d in cluster])
            continue

        # Compute risk stats (only from detections that have risk_score populated)
        risk_scores = [d.risk_score for d in cluster if d.risk_score is not None]
        avg_risk = (sum(risk_scores) / len(risk_scores)) if risk_scores else "unavailable (run risk_scoring first)"
        max_risk = max(risk_scores) if risk_scores else "unavailable (run risk_scoring first)"

        hotspots.append({
            "hotspot_id":      "hotspot_{:03d}".format(idx + 1),
            "detections":      [vars(d) for d in cluster],
            "count":           len(cluster),
            "average_risk":    avg_risk,
            "max_risk":        max_risk,
            "coordinate_space": coord_space,
        })

    return {
        "hotspots":         hotspots,
        "isolated":         isolated,
        "coordinate_space": coord_space,
        "warnings":         warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== hotspot_detection.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    dets = [
        # Cluster A (near bottom-left)
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10, "risk_score": 62.0},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.18, "cy": 0.89, "bw": 0.09, "bh": 0.09, "risk_score": 58.0},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.72,
         "cx": 0.20, "cy": 0.91, "bw": 0.08, "bh": 0.08, "risk_score": 55.0},
        # Cluster B (near centre)
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.60,
         "cx": 0.48, "cy": 0.52, "bw": 0.05, "bh": 0.05, "risk_score": 40.0},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.61,
         "cx": 0.50, "cy": 0.50, "bw": 0.05, "bh": 0.05, "risk_score": 41.0},
        # Isolated
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.55,
         "cx": 0.80, "cy": 0.20, "bw": 0.04, "bh": 0.04, "risk_score": 35.0},
    ]

    result = detect_hotspots(dets)
    print("Coordinate space:", result["coordinate_space"])
    print("Hotspots found: {}".format(len(result["hotspots"])))
    for h in result["hotspots"]:
        print("  {} | count={} | avg_risk={} | max_risk={}".format(
            h["hotspot_id"], h["count"], h["average_risk"], h["max_risk"]))

    print("Isolated detections:", len(result["isolated"]))
    print("Warnings:", result["warnings"])

    # Edge cases
    print("\n--- Empty input ---")
    print(detect_hotspots([]))
