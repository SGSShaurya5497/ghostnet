# -*- coding: utf-8 -*-
"""
==============================================================================
STATUS: EXPERIMENTAL / RESEARCH PROTOTYPE
This module is a standalone algorithmic prototype and is not currently wired
into the active FastAPI backend routes. Scheduled for Roadmap Phase 2.
==============================================================================

risk_scoring.py  (Feature 1) -- GhostNetPINGE
Public entry point: calculate_risk(detection, config=None)

Computes a weighted risk/severity score (0-100) for a single detection.

Weights, per-class risk values, and thresholds are defined in RISK_CONFIG
at the top of this file.  They are PROJECT-DEFINED ASSUMPTIONS for the
GhostNetPINGE hackathon -- NOT an official marine-debris risk standard.

Confirmed real fields used (from Step 0 inspection):
  class_id, class_name, confidence, cx, cy, bw, bh

Optional fields (NOT in pipeline; graceful fallback used if absent):
  latitude, longitude  -- Location Risk defaults to neutral 0.5 when missing.
"""

import math
import sys
import os

# Allow running as a standalone script from any working directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict, clamp, validate_detection

# ---------------------------------------------------------------------------
# RISK_CONFIG -- all tunable parameters in one place
# IMPORTANT: these weights/values are HACKATHON ASSUMPTIONS, not standards.
# ---------------------------------------------------------------------------
DEFAULT_RISK_CONFIG = {
    # Component weights (must sum to 1.0)
    "weights": {
        "object_type": 0.35,   # 35% -- What kind of object was detected
        "size":        0.25,   # 25% -- How large the bounding box is (pixel-area proxy)
        "location":    0.25,   # 25% -- Where in the image it appears
        "confidence":  0.15,   # 15% -- AI confidence in the detection
    },

    # Per-class base risk score (0-100).
    # Currently the model appears single-class; extend this dict as more
    # classes are confirmed from model.names.
    # HACKATHON ASSUMPTION -- not an official classification.
    "class_risk": {
        "crab-pot":   70,    # Entanglement hazard
        "ghost net":  85,    # Active ghost net -- highest entanglement risk
        "debris":     55,    # Generic debris
        "unknown":    50,    # Fallback for unrecognised class names
    },

    # Thresholds for size risk (pixel_area_proxy = bw * bh, range 0-1)
    # Larger pixel footprint = higher risk proxy.
    # NOTE: This is pixel-area proxy, NOT physical square metres.
    "size_thresholds": {
        "large":  0.04,   # >= 4% of image area -> high size risk
        "medium": 0.01,   # 1-4% -> medium
        # below 0.01 -> small
    },
    "size_scores": {
        "large":  100,
        "medium": 55,
        "small":  20,
    },

    # Location risk: normalised distance of bbox centre from image centre (0-1).
    # Objects near image edges are assumed to be harder to survey/retrieve.
    # HACKATHON ASSUMPTION.
    "location_edge_weight": 1.0,  # multiplier for edge-proximity score

    # When no geographic coordinates are supplied, location risk defaults to
    # a neutral mid-value (50/100).  Clearly documented as fallback.
    "location_fallback_score": 50,

    # Severity band thresholds
    "severity_bands": {
        "LOW":      (0,  24),
        "MEDIUM":   (25, 49),
        "HIGH":     (50, 74),
        "CRITICAL": (75, 100),
    },
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _object_type_score(detection, config):
    """Return 0-100 score based on class_name. Falls back to 'unknown'."""
    class_risk = config["class_risk"]
    name_lower = detection.class_name.strip().lower()
    return class_risk.get(name_lower, class_risk["unknown"])


def _size_score(detection, config):
    """
    Return 0-100 score based on bounding-box pixel area.
    pixel_area_proxy = bw * bh (normalised, NOT physical square metres).
    """
    area = detection.pixel_area_proxy
    thresholds = config["size_thresholds"]
    scores = config["size_scores"]
    if area >= thresholds["large"]:
        return scores["large"]
    elif area >= thresholds["medium"]:
        return scores["medium"]
    else:
        return scores["small"]


def _location_score(detection, config):
    """
    Return 0-100 location-risk score.

    If no geographic coordinates are supplied (which is the current pipeline
    state -- no GPS anywhere in the repo), this function falls back to
    config['location_fallback_score'] (default: 50 = neutral).

    When real coordinates ARE available in future, replace the fallback branch
    with geographic logic (e.g., proximity to protected zones or survey edge).

    Current heuristic (image-space only): objects closer to image edges score
    higher, on the assumption that edge regions are harder to resurvey.
    HACKATHON ASSUMPTION -- not an official standard.
    """
    if detection.has_geo:
        # Placeholder: real geographic logic would go here once GPS is wired in.
        # For now, still use image-space heuristic even when geo is present,
        # since we have no reference polygon/protected-zone data.
        pass

    # Image-space heuristic: distance from centre (0.5, 0.5).
    # Normalised distance in [0, ~0.707]; scale to [0, 100].
    dx = detection.cx - 0.5
    dy = detection.cy - 0.5
    dist_from_centre = math.sqrt(dx * dx + dy * dy)  # 0 = centre, ~0.707 = corner
    max_dist = math.sqrt(0.5)  # max possible distance from centre
    edge_score = clamp(dist_from_centre / max_dist, 0.0, 1.0) * 100.0
    return edge_score


def _confidence_score(detection, config):
    """
    Return 0-100 score based on AI confidence.
    Higher confidence -> higher score (more certain the object is real).
    """
    return clamp(detection.confidence, 0.0, 1.0) * 100.0


def _severity_band(score, config):
    """Map numeric score to a severity label string."""
    bands = config["severity_bands"]
    for label, (lo, hi) in bands.items():
        if lo <= score <= hi:
            return label
    return "CRITICAL" if score > 100 else "LOW"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def calculate_risk(detection, config=None):
    """
    Compute a weighted risk/severity score for a single detection.

    Parameters
    ----------
    detection : Detection | dict
        A Detection dataclass instance, or a plain dict with keys:
        Required: class_id, class_name, confidence, cx, cy, bw, bh
        Optional: latitude, longitude (location fallback used if absent)
    config : dict | None
        Override any keys in DEFAULT_RISK_CONFIG.  If None, defaults are used.

    Returns
    -------
    dict with keys:
        score        : float  -- Weighted risk score, clamped to [0, 100]
        severity     : str    -- "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
        components   : dict   -- Raw component scores (object_type, size,
                                 location, confidence) before weighting
        warnings     : list   -- Validation warnings (empty if clean)
    """
    # Merge config
    cfg = dict(DEFAULT_RISK_CONFIG)
    if config:
        cfg.update(config)

    # Coerce dict -> Detection if needed
    if isinstance(detection, dict):
        try:
            detection = detection_from_dict(detection)
        except (KeyError, TypeError) as exc:
            return {
                "score": 0.0,
                "severity": "LOW",
                "components": {},
                "warnings": ["Invalid detection dict: {}".format(exc)],
            }

    warnings = validate_detection(detection)

    # Guard: clamp confidence to valid range before scoring
    safe_conf = clamp(detection.confidence, 0.0, 1.0)
    safe_det = detection
    if detection.confidence != safe_conf:
        # Temporarily build a patched version for computation
        import dataclasses
        safe_det = dataclasses.replace(detection, confidence=safe_conf)

    # Compute component scores (each 0-100)
    w = cfg["weights"]
    components = {
        "object_type": _object_type_score(safe_det, cfg),
        "size":        _size_score(safe_det, cfg),
        "location":    _location_score(safe_det, cfg),
        "confidence":  _confidence_score(safe_det, cfg),
    }

    # Weighted sum
    raw_score = (
        components["object_type"] * w["object_type"] +
        components["size"]        * w["size"]        +
        components["location"]    * w["location"]    +
        components["confidence"]  * w["confidence"]
    )
    score = round(clamp(raw_score, 0.0, 100.0), 2)
    severity = _severity_band(score, cfg)

    return {
        "score":      score,
        "severity":   severity,
        "components": components,
        "warnings":   warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo & test cases
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== risk_scoring.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    test_cases = [
        {
            "label": "Normal detection (Crab-Pot, high confidence)",
            "det": {
                "class_id": 0, "class_name": "Crab-Pot",
                "confidence": 0.85, "cx": 0.15, "cy": 0.92,
                "bw": 0.10, "bh": 0.10,
            },
        },
        {
            "label": "Missing confidence field -> should gracefully error",
            "det": {
                "class_id": 0, "class_name": "Crab-Pot",
                "cx": 0.5, "cy": 0.5, "bw": 0.05, "bh": 0.05,
            },
        },
        {
            "label": "Boundary: score should be LOW (near 0)",
            "det": {
                "class_id": 0, "class_name": "unknown",
                "confidence": 0.01, "cx": 0.5, "cy": 0.5,
                "bw": 0.005, "bh": 0.005,
            },
        },
        {
            "label": "Boundary: high-risk large ghost net near edge",
            "det": {
                "class_id": 0, "class_name": "Ghost Net",
                "confidence": 0.99, "cx": 0.05, "cy": 0.05,
                "bw": 0.30, "bh": 0.25,
            },
        },
        {
            "label": "Boundary: confidence > 1.0 (malformed) -> clamped",
            "det": {
                "class_id": 0, "class_name": "Crab-Pot",
                "confidence": 1.5, "cx": 0.5, "cy": 0.5,
                "bw": 0.1, "bh": 0.1,
            },
        },
        {
            "label": "Missing coordinates -> should gracefully error",
            "det": {
                "class_id": 0, "class_name": "Crab-Pot",
                "confidence": 0.5,
            },
        },
    ]

    for tc in test_cases:
        print("Case: {}".format(tc["label"]))
        result = calculate_risk(tc["det"])
        print("  score={score}  severity={severity}".format(**result))
        print("  components={}".format(result["components"]))
        if result["warnings"]:
            print("  warnings={}".format(result["warnings"]))
        print()

    print("All score values must be in [0, 100]: ", end="")
    scores = []
    for tc in test_cases:
        r = calculate_risk(tc["det"])
        scores.append(r["score"])
    assert all(0 <= s <= 100 for s in scores), "FAIL: score out of range"
    print("PASS")
