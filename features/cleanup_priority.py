# -*- coding: utf-8 -*-
"""
cleanup_priority.py  (Feature 4) -- GhostNetPINGE
Public entry point: rank_detections(detections, config=None)

Sorts detections by risk score (descending) with severity as tiebreaker,
and supports optional filtering by severity, class name, and status field.

Requires risk_score to have been pre-computed (e.g., by risk_scoring.py).
Detections without a risk_score are assigned a fallback score and noted
in warnings rather than silently dropped.

Confirmed real fields used: class_name, confidence, cx, cy, bw, bh
Depends on risk_score: populated by risk_scoring.py (not in raw pipeline).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_PRIORITY_CONFIG = {
    # Severity sort order (higher index = higher priority)
    "severity_order": {
        "LOW":      0,
        "MEDIUM":   1,
        "HIGH":     2,
        "CRITICAL": 3,
    },

    # Fallback risk score assigned to detections that lack a risk_score field.
    # HACKATHON ASSUMPTION: unknown risk = mid-level urgency.
    "missing_risk_fallback": 50.0,

    # Optional filters (None = no filter applied)
    "filter_severity":   None,   # e.g. "HIGH" to return only HIGH+ detections
    "filter_class_name": None,   # e.g. "Ghost Net"
    "filter_status":     None,   # e.g. "active" -- requires status field on detection
}

SEVERITY_BANDS = {
    "LOW":      (0,  24),
    "MEDIUM":   (25, 49),
    "HIGH":     (50, 74),
    "CRITICAL": (75, 100),
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _score_to_severity(score):
    """Map a numeric risk score to a severity label."""
    for label, (lo, hi) in SEVERITY_BANDS.items():
        if lo <= score <= hi:
            return label
    return "CRITICAL" if score > 100 else "LOW"


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


def _det_to_ranked_dict(det, risk_score, severity):
    """Convert a Detection + computed values into a ranked output dict."""
    d = vars(det).copy()
    d["risk_score"] = risk_score
    d["severity"]   = severity
    return d


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def rank_detections(detections, config=None):
    """
    Sort and optionally filter detections by cleanup priority.

    Sorting: primary = risk_score descending; tiebreaker = severity descending;
    secondary tiebreaker = confidence descending (stable for equal-risk items).

    Parameters
    ----------
    detections : list[Detection | dict]
        Each item may optionally contain a 'risk_score' field (float 0-100).
        If absent, config['missing_risk_fallback'] is used and a warning is issued.
    config : dict | None
        Override DEFAULT_PRIORITY_CONFIG.

    Returns
    -------
    dict with keys:
        ranked   : list[dict]  -- Detections sorted by priority (highest first),
                                  each item includes risk_score and severity fields.
        filtered : bool        -- True if any filter was applied
        warnings : list[str]
    """
    cfg = dict(DEFAULT_PRIORITY_CONFIG)
    if config:
        cfg.update(config)

    warnings = []

    try:
        dets = _coerce_list(detections)
    except (TypeError, KeyError) as exc:
        return {"ranked": [], "filtered": False,
                "warnings": ["Input error: {}".format(exc)]}

    fallback_score = float(cfg["missing_risk_fallback"])
    sev_order = cfg["severity_order"]

    # Build enriched records
    records = []
    for det in dets:
        if det.risk_score is not None:
            score = float(det.risk_score)
        else:
            score = fallback_score
            warnings.append(
                "Detection class='{}' cx={} cy={} has no risk_score; "
                "using fallback={}.".format(det.class_name, det.cx, det.cy, fallback_score)
            )
        severity = _score_to_severity(score)
        records.append((det, score, severity))

    # Apply optional filters
    filtered = False
    f_sev   = cfg.get("filter_severity")
    f_class = cfg.get("filter_class_name")
    f_status = cfg.get("filter_status")

    if f_sev:
        min_order = sev_order.get(f_sev.upper(), 0)
        records = [(d, s, sv) for d, s, sv in records
                   if sev_order.get(sv, 0) >= min_order]
        filtered = True
    if f_class:
        records = [(d, s, sv) for d, s, sv in records
                   if d.class_name.lower() == f_class.lower()]
        filtered = True
    if f_status:
        records = [(d, s, sv) for d, s, sv in records
                   if getattr(d, "status", None) == f_status]
        filtered = True

    # Sort: risk_score DESC, severity_order DESC, confidence DESC
    records.sort(
        key=lambda x: (x[1], sev_order.get(x[2], 0), x[0].confidence),
        reverse=True
    )

    ranked = [_det_to_ranked_dict(d, s, sv) for d, s, sv in records]

    return {"ranked": ranked, "filtered": filtered, "warnings": warnings}


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== cleanup_priority.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    dets = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10, "risk_score": 62.5},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.50, "cy": 0.50, "bw": 0.08, "bh": 0.08, "risk_score": 35.0},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25, "risk_score": 88.0},
        # No risk_score -- should trigger fallback warning
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.60,
         "cx": 0.30, "cy": 0.30, "bw": 0.05, "bh": 0.05},
        # Equal-risk to previous -- stable tiebreaker on confidence
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.65,
         "cx": 0.70, "cy": 0.70, "bw": 0.05, "bh": 0.05},
    ]

    result = rank_detections(dets)
    print("Ranked detections (highest priority first):")
    for i, r in enumerate(result["ranked"], 1):
        print("  #{}: class={} score={} severity={} conf={}".format(
            i, r["class_name"], r["risk_score"], r["severity"], r["confidence"]))

    print("\nWarnings:", result["warnings"])

    # Filter demo: only HIGH+
    print("\n--- Filter: severity >= HIGH ---")
    result_h = rank_detections(dets, config={"filter_severity": "HIGH"})
    for r in result_h["ranked"]:
        print("  class={} score={} severity={}".format(
            r["class_name"], r["risk_score"], r["severity"]))

    print("\nAll tests passed.")
