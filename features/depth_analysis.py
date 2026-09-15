# -*- coding: utf-8 -*-
"""
==============================================================================
STATUS: EXPERIMENTAL / RESEARCH PROTOTYPE
This module is a standalone algorithmic prototype and is not currently wired
into the active FastAPI backend routes. Scheduled for Roadmap Phase 2.
==============================================================================

depth_analysis.py  (Feature 7) -- GhostNetPINGE
Public entry point: analyze_depth(detections, config=None)

Analyses depth distribution across detections.

The current pipeline exposes NO depth metadata whatsoever (confirmed in
Step 0 -- no depth field in .txt labels, no config, no other files).
This module:
  1. Returns a clear "Depth data unavailable" result when depth_m is absent.
  2. Is structured so plugging in real depth data later requires only
     populating detection.depth_m -- no other code changes needed.

Confirmed real fields used: class_name, confidence (for cross-tabulation)
Optional (not in pipeline): depth_m
"""

import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_DEPTH_CONFIG = {
    # Bin edges (in metres) for depth histogram
    "depth_bins": [0, 5, 10, 20, 50, 100, float("inf")],

    # Decimal places for reported statistics
    "round_digits": 3,
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
    return math.sqrt(sum((v - m) ** 2 for v in values) / len(values))

def _histogram(values, bins):
    """
    Simple histogram using bin edges.
    bins: list of edges, e.g. [0, 5, 10, inf].
    Returns list of dicts: {range_label, count}.
    """
    result = []
    for i in range(len(bins) - 1):
        lo = bins[i]
        hi = bins[i + 1]
        label = "{}-{}m".format(lo, hi if hi != float("inf") else "+")
        count = sum(1 for v in values if lo <= v < hi)
        result.append({"range": label, "count": count})
    return result

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

def analyze_depth(detections, config=None):
    """
    Analyse depth distribution across a set of detections.

    Parameters
    ----------
    detections : list[Detection | dict]
        Each detection may optionally carry depth_m (float, metres).
        If none carry depth_m, the function returns a clear unavailable result.
    config : dict | None
        Override DEFAULT_DEPTH_CONFIG.

    Returns
    -------
    dict with keys:
        status              : str  -- "ok" | "unavailable" | "partial" | "error"
        depth_available_count : int
        total_count         : int
        depth_stats         : dict | str  -- stats dict if available, else message
        depth_histogram     : list | str  -- histogram if available, else message
        class_depth_breakdown : dict | str -- per-class depth stats if available
        note                : str
        warnings            : list[str]

    HOW TO WIRE IN REAL DEPTH LATER
    --------------------------------
    After model.predict(), read depth from your sonar metadata source and set:
        det_dict["depth_m"] = <float_metres>
    Then pass the list to analyze_depth().  No other changes required.
    """
    cfg = dict(DEFAULT_DEPTH_CONFIG)
    if config:
        cfg.update(config)

    rd = cfg["round_digits"]
    warnings = []

    try:
        dets = _coerce_list(detections)
    except (TypeError, KeyError) as exc:
        return {
            "status": "error",
            "depth_available_count": 0,
            "total_count": 0,
            "depth_stats": "unavailable",
            "depth_histogram": "unavailable",
            "class_depth_breakdown": "unavailable",
            "note": "Input error: {}".format(exc),
            "warnings": [str(exc)],
        }

    total = len(dets)
    depth_dets = [d for d in dets if d.depth_m is not None]
    n_depth = len(depth_dets)

    if n_depth == 0:
        return {
            "status": "unavailable",
            "depth_available_count": 0,
            "total_count": total,
            "depth_stats": "Depth data unavailable -- depth_m not present in any detection.",
            "depth_histogram": "Depth data unavailable",
            "class_depth_breakdown": "Depth data unavailable",
            "note": (
                "The current pipeline does not expose depth metadata.  "
                "To enable this module, populate detection['depth_m'] with a "
                "float value (metres) from your sonar hardware/navigation log."
            ),
            "warnings": warnings,
        }

    if n_depth < total:
        warnings.append("{}/{} detections have depth_m; others excluded.".format(n_depth, total))
        status = "partial"
    else:
        status = "ok"

    depths = [d.depth_m for d in depth_dets]
    depth_stats = {
        "min_m":  round(min(depths), rd),
        "max_m":  round(max(depths), rd),
        "mean_m": round(_mean(depths), rd),
        "std_m":  round(_std(depths), rd) if _std(depths) is not None else None,
    }

    hist = _histogram(depths, cfg["depth_bins"])

    # Per-class breakdown
    class_depths = {}
    for d in depth_dets:
        name = d.class_name
        if name not in class_depths:
            class_depths[name] = []
        class_depths[name].append(d.depth_m)

    class_breakdown = {}
    for name, vals in class_depths.items():
        class_breakdown[name] = {
            "count":  len(vals),
            "min_m":  round(min(vals), rd),
            "max_m":  round(max(vals), rd),
            "mean_m": round(_mean(vals), rd),
        }

    return {
        "status":                  status,
        "depth_available_count":   n_depth,
        "total_count":             total,
        "depth_stats":             depth_stats,
        "depth_histogram":         hist,
        "class_depth_breakdown":   class_breakdown,
        "note": "Depth values are in metres.  Source: caller-supplied depth_m field.",
        "warnings":                warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    print("=== depth_analysis.py demo ===\n")

    # DEMO / TEST DATA -- not real detections

    # Case 1: No depth data (current pipeline state)
    print("--- Case: no depth data (current pipeline) ---")
    no_depth = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.50, "cy": 0.50, "bw": 0.08, "bh": 0.08},
    ]
    result = analyze_depth(no_depth)
    print("status:", result["status"])
    print("depth_stats:", result["depth_stats"])
    print("note:", result["note"])

    # Case 2: Depth data present (future state after wiring)
    print("\n--- Case: depth data present (future state) ---")
    with_depth = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10, "depth_m": 8.5},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.50, "cy": 0.50, "bw": 0.08, "bh": 0.08, "depth_m": 12.3},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25, "depth_m": 4.1},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.55,
         "cx": 0.80, "cy": 0.20, "bw": 0.04, "bh": 0.04, "depth_m": 22.7},
    ]
    result2 = analyze_depth(with_depth)
    print(json.dumps(result2, indent=2, default=str))
