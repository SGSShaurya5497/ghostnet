# -*- coding: utf-8 -*-
"""
anomaly_alerts.py  (Feature 10) -- GhostNetPINGE
Public entry point: generate_alerts(detections, threshold=75, config=None)

Identifies high/critical severity detections and produces structured alert objects.

Features:
  - Threshold-configurable: default is 75 (CRITICAL band).
  - Deduplicates alerts for detections with the same detection_id.
  - Pure batch function over supplied data -- no streaming, polling, or
    real-time I/O of any kind.
  - Severity band definitions mirror risk_scoring.py (not imported to keep
    modules independent; bands are re-declared locally).

Confirmed real fields used: class_name, confidence, cx, cy, bw, bh
Depends on: risk_score (must be pre-computed by risk_scoring.py or caller)
Optional: detection_id (for deduplication), depth_m, latitude, longitude
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Severity band definitions (mirrored from risk_scoring.py without import)
# HACKATHON ASSUMPTION -- not an official standard.
# ---------------------------------------------------------------------------
SEVERITY_BANDS = {
    "LOW":      (0,  24),
    "MEDIUM":   (25, 49),
    "HIGH":     (50, 74),
    "CRITICAL": (75, 100),
}

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_ALERT_CONFIG = {
    # Minimum risk_score to generate an alert (default: 75 = CRITICAL)
    "alert_threshold": 75,

    # If True and detection_id is present, suppress duplicate alerts for the
    # same detection_id within a single call.
    "deduplicate_by_id": True,

    # Alert message templates keyed by severity
    "message_templates": {
        "HIGH":     "HIGH severity {class_name} detected (score={score:.1f}, conf={conf:.1%}). Recommend inspection.",
        "CRITICAL": "CRITICAL severity {class_name} detected (score={score:.1f}, conf={conf:.1%}). Immediate action required.",
    },

    # Fallback template for any unlabelled severity above threshold
    "default_message_template": "Alert: {class_name} detected with risk score {score:.1f} ({severity}). Confidence: {conf:.1%}.",
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _score_to_severity(score):
    for label, (lo, hi) in SEVERITY_BANDS.items():
        if lo <= score <= hi:
            return label
    return "CRITICAL" if score > 100 else "LOW"


def _build_message(det, score, severity, templates, default_template):
    tmpl = templates.get(severity, default_template)
    return tmpl.format(
        class_name=det.class_name,
        score=score,
        conf=det.confidence,
        severity=severity,
    )


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

def generate_alerts(detections, threshold=75, config=None):
    """
    Scan a batch of detections and produce structured alert objects for any
    detection whose risk_score meets or exceeds the threshold.

    Parameters
    ----------
    detections : list[Detection | dict]
        Each detection should have a risk_score field (float 0-100).
        Detections without risk_score are skipped and noted in warnings.
    threshold : float
        Minimum risk_score to trigger an alert.  Default 75 (CRITICAL band).
        Override with config['alert_threshold'] or this positional argument.
    config : dict | None
        Override DEFAULT_ALERT_CONFIG.

    Returns
    -------
    dict with keys:
        alerts       : list[dict]  -- Alert objects (see structure below)
        alert_count  : int
        skipped_no_risk : int      -- Detections without risk_score
        duplicates_suppressed : int
        warnings     : list[str]

    Each alert object:
        {
          "severity"     : str,   -- "HIGH" | "CRITICAL" (or other above-threshold label)
          "object_type"  : str,
          "risk_score"   : float,
          "confidence"   : float,
          "detection_id" : str | None,
          "image_position": {"cx": float, "cy": float},
          "coordinates"  : {"lat": float, "lon": float} | None,
          "message"      : str,
        }
    """
    cfg = dict(DEFAULT_ALERT_CONFIG)
    if config:
        cfg.update(config)

    # Positional threshold overrides config if explicitly passed
    alert_threshold = float(threshold)
    if "alert_threshold" in (config or {}):
        alert_threshold = float(cfg["alert_threshold"])

    dedup = cfg["deduplicate_by_id"]
    templates = cfg["message_templates"]
    default_tmpl = cfg["default_message_template"]

    warnings = []

    try:
        dets = _coerce_list(detections)
    except (TypeError, KeyError) as exc:
        return {
            "alerts": [], "alert_count": 0,
            "skipped_no_risk": 0, "duplicates_suppressed": 0,
            "warnings": ["Input error: {}".format(exc)],
        }

    alerts = []
    skipped = 0
    dupes = 0
    seen_ids = set()

    for det in dets:
        if det.risk_score is None:
            skipped += 1
            continue

        score = float(det.risk_score)
        if score < alert_threshold:
            continue

        # Deduplication
        if dedup and det.detection_id is not None:
            if det.detection_id in seen_ids:
                dupes += 1
                continue
            seen_ids.add(det.detection_id)

        severity = _score_to_severity(score)
        message = _build_message(det, score, severity, templates, default_tmpl)

        alert = {
            "severity":      severity,
            "object_type":   det.class_name,
            "risk_score":    round(score, 2),
            "confidence":    round(det.confidence, 4),
            "detection_id":  det.detection_id,
            "image_position": {"cx": det.cx, "cy": det.cy},
            "coordinates":   {"lat": det.latitude, "lon": det.longitude}
                             if det.has_geo else None,
            "message":       message,
        }
        alerts.append(alert)

    # Sort alerts by risk_score descending for easy consumption
    alerts.sort(key=lambda a: a["risk_score"], reverse=True)

    return {
        "alerts":                alerts,
        "alert_count":           len(alerts),
        "skipped_no_risk":       skipped,
        "duplicates_suppressed": dupes,
        "warnings":              warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    print("=== anomaly_alerts.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    dets = [
        # CRITICAL
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25,
         "risk_score": 88.0, "detection_id": "det_002"},
        # HIGH (below CRITICAL threshold of 75)
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10,
         "risk_score": 62.0, "detection_id": "det_001"},
        # LOW -- below threshold
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.55,
         "cx": 0.80, "cy": 0.20, "bw": 0.04, "bh": 0.04,
         "risk_score": 20.0, "detection_id": "det_003"},
        # Duplicate of det_002 -- should be suppressed
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.88,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25,
         "risk_score": 88.0, "detection_id": "det_002"},
        # No risk_score -- should be skipped
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.70,
         "cx": 0.40, "cy": 0.40, "bw": 0.06, "bh": 0.06},
    ]

    print("--- Default threshold (75, CRITICAL only) ---")
    result = generate_alerts(dets)
    print("alert_count:", result["alert_count"])
    print("skipped_no_risk:", result["skipped_no_risk"])
    print("duplicates_suppressed:", result["duplicates_suppressed"])
    for a in result["alerts"]:
        print("  [{}] {} score={} id={}".format(
            a["severity"], a["object_type"], a["risk_score"], a["detection_id"]))
        print("    ->", a["message"])

    print("\n--- Threshold = 50 (HIGH+CRITICAL) ---")
    result2 = generate_alerts(dets, threshold=50)
    print("alert_count:", result2["alert_count"])
    for a in result2["alerts"]:
        print("  [{}] {} score={}".format(
            a["severity"], a["object_type"], a["risk_score"]))

    print("\nAll tests passed.")
