# -*- coding: utf-8 -*-
"""
==============================================================================
STATUS: EXPERIMENTAL / RESEARCH PROTOTYPE
This module is a standalone algorithmic prototype and is not currently wired
into the active FastAPI backend routes. Scheduled for Roadmap Phase 2.
==============================================================================

survey_analytics.py  (Feature 6) -- GhostNetPINGE
Public entry point: generate_survey_statistics(detections, config=None)

Produces a structured statistics dict suitable for a dashboard to consume.

Always-computable fields (from confirmed real pipeline data):
  - detection count
  - class distribution (class_name frequencies)
  - confidence stats (min, max, mean, std)
  - bounding-box size stats (pixel_area_proxy = bw*bh, NOT physical m2)

Optional fields (only included if present in input; never fabricated):
  - risk distribution (requires risk_score, populated by risk_scoring.py)
  - depth statistics (requires depth_m, NOT in pipeline)
  - geographic density (requires latitude/longitude, NOT in pipeline)

Confirmed real fields: class_name, class_id, confidence, cx, cy, bw, bh
"""

import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_ANALYTICS_CONFIG = {
    # Decimal places for rounding reported statistics
    "round_digits": 4,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _mean(values):
    return sum(values) / len(values) if values else None

def _std(values):
    if len(values) < 2:
        return None
    m = _mean(values)
    variance = sum((v - m) ** 2 for v in values) / len(values)
    return math.sqrt(variance)

def _minmax(values):
    if not values:
        return None, None
    return min(values), max(values)

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

def _r(val, digits):
    """Round a value if it's numeric, else return as-is."""
    if isinstance(val, float):
        return round(val, digits)
    return val


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_survey_statistics(detections, config=None):
    """
    Compute structured summary statistics for a set of detections.

    Parameters
    ----------
    detections : list[Detection | dict]
    config : dict | None

    Returns
    -------
    dict with keys:
        detection_count     : int
        class_distribution  : dict[str, int]  -- class_name -> count
        confidence_stats    : dict            -- min, max, mean, std
        bbox_size_stats     : dict            -- pixel_area_proxy stats (NOT m2)
        risk_stats          : dict | str      -- stats if risk_score present, else "unavailable"
        depth_stats         : dict | str      -- stats if depth_m present, else "unavailable"
        geo_density         : str             -- "unavailable" (no GPS in pipeline)
        warnings            : list[str]
        notes               : dict            -- data-availability notes for the dashboard
    """
    cfg = dict(DEFAULT_ANALYTICS_CONFIG)
    if config:
        cfg.update(config)

    rd = cfg["round_digits"]
    warnings = []

    try:
        dets = _coerce_list(detections)
    except (TypeError, KeyError) as exc:
        return {
            "detection_count": 0,
            "class_distribution": {},
            "confidence_stats": {},
            "bbox_size_stats": {},
            "risk_stats": "unavailable",
            "depth_stats": "unavailable",
            "geo_density": "unavailable",
            "warnings": ["Input error: {}".format(exc)],
            "notes": {},
        }

    n = len(dets)

    # --- Always-computable ---
    class_dist = {}
    for d in dets:
        class_dist[d.class_name] = class_dist.get(d.class_name, 0) + 1

    confs = [d.confidence for d in dets]
    conf_min, conf_max = _minmax(confs)
    confidence_stats = {
        "min":  _r(conf_min, rd),
        "max":  _r(conf_max, rd),
        "mean": _r(_mean(confs), rd),
        "std":  _r(_std(confs), rd),
    }

    # pixel_area_proxy = bw * bh.  NOT physical square metres.
    areas = [d.pixel_area_proxy for d in dets]
    area_min, area_max = _minmax(areas)
    bbox_size_stats = {
        "pixel_area_proxy_min":  _r(area_min, rd),
        "pixel_area_proxy_max":  _r(area_max, rd),
        "pixel_area_proxy_mean": _r(_mean(areas), rd),
        "pixel_area_proxy_std":  _r(_std(areas), rd),
        "note": "pixel_area_proxy = bw*bh (normalised). NOT physical square metres.",
    }

    # --- Optional: risk_score ---
    risk_values = [d.risk_score for d in dets if d.risk_score is not None]
    if risk_values:
        risk_min, risk_max = _minmax(risk_values)
        sev_dist = {}
        for rv in risk_values:
            if rv < 25:
                sev = "LOW"
            elif rv < 50:
                sev = "MEDIUM"
            elif rv < 75:
                sev = "HIGH"
            else:
                sev = "CRITICAL"
            sev_dist[sev] = sev_dist.get(sev, 0) + 1

        risk_stats = {
            "count_with_score": len(risk_values),
            "min":  _r(risk_min, rd),
            "max":  _r(risk_max, rd),
            "mean": _r(_mean(risk_values), rd),
            "std":  _r(_std(risk_values), rd),
            "severity_distribution": sev_dist,
        }
    else:
        risk_stats = "unavailable (run risk_scoring.py first to populate risk_score)"

    # --- Optional: depth ---
    depth_values = [d.depth_m for d in dets if d.depth_m is not None]
    if depth_values:
        d_min, d_max = _minmax(depth_values)
        depth_stats = {
            "count_with_depth": len(depth_values),
            "min_m":  _r(d_min, rd),
            "max_m":  _r(d_max, rd),
            "mean_m": _r(_mean(depth_values), rd),
        }
    else:
        depth_stats = "unavailable (depth_m not exposed by current pipeline)"

    # --- Optional: geographic density ---
    geo_dets = [d for d in dets if d.has_geo]
    if geo_dets:
        geo_density = {
            "count_with_geo": len(geo_dets),
            "note": "Geographic density analysis requires survey area polygon; not implemented.",
        }
    else:
        geo_density = "unavailable (no latitude/longitude in current pipeline output)"

    notes = {
        "pipeline_metadata_gap": (
            "GPS, depth, physical scale, and survey ID are NOT exposed by the "
            "current inference pipeline.  risk_stats, depth_stats, and geo_density "
            "will remain unavailable until those fields are added."
        )
    }

    return {
        "detection_count":    n,
        "class_distribution": class_dist,
        "confidence_stats":   confidence_stats,
        "bbox_size_stats":    bbox_size_stats,
        "risk_stats":         risk_stats,
        "depth_stats":        depth_stats,
        "geo_density":        geo_density,
        "warnings":           warnings,
        "notes":              notes,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    print("=== survey_analytics.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    dets = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10, "risk_score": 62.0},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.18, "cy": 0.89, "bw": 0.09, "bh": 0.09, "risk_score": 58.0},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25, "risk_score": 88.0},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.55,
         "cx": 0.80, "cy": 0.20, "bw": 0.04, "bh": 0.04},
    ]

    stats = generate_survey_statistics(dets)
    print(json.dumps(stats, indent=2, default=str))
