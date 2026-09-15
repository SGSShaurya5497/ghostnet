# -*- coding: utf-8 -*-
"""
==============================================================================
STATUS: EXPERIMENTAL / RESEARCH PROTOTYPE
This module is a standalone algorithmic prototype and is not currently wired
into the active FastAPI backend routes. Scheduled for Roadmap Phase 2.
==============================================================================

map_data.py  (Feature 8) -- GhostNetPINGE
Public entry point: prepare_map_data(detections, config=None)

Converts detections into map-marker-ready records for a frontend map library.

IMPORTANT: The current pipeline exposes NO geographic coordinates (confirmed
in Step 0).  When lat/lon is absent, this module returns a structured result
that clearly states geospatial metadata is required -- it does NOT fabricate
coordinates.

Each output marker record contains:
  - object_type, risk_score, severity (if available), confidence
  - coordinates (only if present)
  - popup detail text for the map UI

This is a pure data-transformation module.  No live UI is built here.

Confirmed real fields: class_name, confidence, cx, cy, bw, bh
Optional: latitude, longitude, risk_score, severity
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_MAP_CONFIG = {
    # Severity -> marker color mapping for frontend map libraries
    # (e.g., Leaflet, Mapbox).  Purely cosmetic metadata.
    "severity_colors": {
        "LOW":      "#4caf50",   # green
        "MEDIUM":   "#ff9800",   # orange
        "HIGH":     "#f44336",   # red
        "CRITICAL": "#9c27b0",   # purple
        "UNKNOWN":  "#607d8b",   # grey (no risk score available)
    },

    # Default icon type to include in marker metadata
    "default_marker_icon": "circle",

    # Whether to include a popup_text field in each marker
    "include_popup_text": True,
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
    for label, (lo, hi) in SEVERITY_BANDS.items():
        if lo <= score <= hi:
            return label
    return "CRITICAL" if score > 100 else "LOW"


def _build_popup(det, severity, risk_score):
    """Build a plain-text popup description for a map marker."""
    lines = [
        "Object: {}".format(det.class_name),
        "Confidence: {:.1%}".format(det.confidence),
    ]
    if risk_score is not None:
        lines.append("Risk Score: {} ({})".format(round(risk_score, 1), severity))
    else:
        lines.append("Risk Score: not computed")
    if det.has_geo:
        lines.append("Lat: {:.6f}  Lon: {:.6f}".format(det.latitude, det.longitude))
    else:
        lines.append("Location: image-space only (cx={:.3f}, cy={:.3f})".format(
            det.cx, det.cy))
    if det.depth_m is not None:
        lines.append("Depth: {:.1f} m".format(det.depth_m))
    return " | ".join(lines)


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

def prepare_map_data(detections, config=None):
    """
    Convert detections into a list of map-marker-ready records.

    Parameters
    ----------
    detections : list[Detection | dict]
    config : dict | None

    Returns
    -------
    dict with keys:
        status          : str   -- "ok" | "no_geo" | "partial_geo" | "empty" | "error"
        markers         : list  -- Map marker records (see below)
        geo_available   : bool  -- True if at least one marker has real lat/lon
        geo_required_note : str -- Instructions for adding real coordinates
        warnings        : list[str]

    Each marker record:
        {
          "detection_id"   : str | None,
          "object_type"    : str,
          "confidence"     : float,
          "risk_score"     : float | None,
          "severity"       : str,
          "color"          : str,       # hex color from severity_colors
          "icon"           : str,
          "coordinates"    : {"lat": float, "lon": float} | None,
          "image_position" : {"cx": float, "cy": float},  # always present
          "popup_text"     : str,       # if include_popup_text is True
        }
    """
    cfg = dict(DEFAULT_MAP_CONFIG)
    if config:
        cfg.update(config)

    warnings = []

    try:
        dets = _coerce_list(detections)
    except (TypeError, KeyError) as exc:
        return {
            "status": "error", "markers": [], "geo_available": False,
            "geo_required_note": "",
            "warnings": ["Input error: {}".format(exc)],
        }

    if not dets:
        return {
            "status": "empty", "markers": [], "geo_available": False,
            "geo_required_note": (
                "No detections supplied.  Add lat/lon to detections to enable "
                "geographic map rendering."
            ),
            "warnings": warnings,
        }

    markers = []
    n_geo = 0

    for det in dets:
        risk_score = det.risk_score
        if risk_score is not None:
            severity = _score_to_severity(risk_score)
        else:
            severity = "UNKNOWN"

        color = cfg["severity_colors"].get(severity, cfg["severity_colors"]["UNKNOWN"])

        coordinates = None
        if det.has_geo:
            coordinates = {"lat": det.latitude, "lon": det.longitude}
            n_geo += 1

        marker = {
            "detection_id":   det.detection_id,
            "object_type":    det.class_name,
            "confidence":     round(det.confidence, 4),
            "risk_score":     round(risk_score, 2) if risk_score is not None else None,
            "severity":       severity,
            "color":          color,
            "icon":           cfg["default_marker_icon"],
            "coordinates":    coordinates,
            "image_position": {"cx": det.cx, "cy": det.cy},
        }
        if cfg["include_popup_text"]:
            marker["popup_text"] = _build_popup(det, severity, risk_score)

        markers.append(marker)

    geo_available = n_geo > 0

    if n_geo == 0:
        status = "no_geo"
    elif n_geo < len(dets):
        status = "partial_geo"
        warnings.append("{}/{} detections lack lat/lon; their coordinates field is null.".format(
            len(dets) - n_geo, len(dets)))
    else:
        status = "ok"

    geo_required_note = (
        "The current pipeline does NOT produce GPS coordinates.  "
        "To render detections on a geographic map, populate "
        "detection['latitude'] and detection['longitude'] from your "
        "survey navigation log / sonar position data after model.predict()."
    ) if not geo_available else (
        "Some or all detections have geographic coordinates -- map rendering is possible."
    )

    return {
        "status":            status,
        "markers":           markers,
        "geo_available":     geo_available,
        "geo_required_note": geo_required_note,
        "warnings":          warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    print("=== map_data.py demo ===\n")

    # DEMO / TEST DATA -- not real detections

    # Case 1: No geo (current pipeline state)
    print("--- Case: no geographic coordinates (current pipeline) ---")
    no_geo = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10,
         "risk_score": 62.0, "detection_id": "det_001"},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25,
         "risk_score": 88.0, "detection_id": "det_002"},
    ]
    result = prepare_map_data(no_geo)
    print("status:", result["status"])
    print("geo_available:", result["geo_available"])
    print("geo_required_note:", result["geo_required_note"])
    for m in result["markers"]:
        print("  object={} severity={} color={} coordinates={}".format(
            m["object_type"], m["severity"], m["color"], m["coordinates"]))

    # Case 2: With geographic coordinates (future state)
    print("\n--- Case: with geographic coordinates ---")
    with_geo = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10,
         "latitude": 48.001, "longitude": -123.010,
         "risk_score": 62.0, "detection_id": "det_001"},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25,
         "latitude": 48.003, "longitude": -123.005,
         "risk_score": 88.0, "detection_id": "det_002"},
    ]
    result2 = prepare_map_data(with_geo)
    print("status:", result2["status"])
    for m in result2["markers"]:
        print("  object={} coords={} popup={}".format(
            m["object_type"], m["coordinates"], m.get("popup_text")))
