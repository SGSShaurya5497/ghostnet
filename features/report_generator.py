# -*- coding: utf-8 -*-
"""
report_generator.py  (Feature 9) -- GhostNetPINGE
Public entry point: generate_report(survey_data, output_path, format="json", config=None)

Generates a survey report in JSON or CSV format from supplied detection data.

PDF is NOT supported and is explicitly excluded because:
  1. No PDF library (reportlab, fpdf, weasyprint) is a current project dependency.
  2. Adding a heavyweight PDF dependency to a Colab/lightweight environment
     conflicts with the project's dependency discipline.
  (Add PDF later by installing reportlab and swapping in the _write_pdf stub below.)

STRICT DATA HONESTY: This module uses ONLY data passed to it.  It never
fabricates GPS coordinates, depth, survey area, or environmental impact figures.
Any field absent from the input is marked "unavailable" in the report, never guessed.

Confirmed real fields: class_name, class_id, confidence, cx, cy, bw, bh
Optional (reported only if present): risk_score, severity, depth_m, latitude, longitude,
  survey_id, timestamp
"""

import csv
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_REPORT_CONFIG = {
    # Number of decimal places in numeric fields
    "round_digits": 4,

    # ISO 8601 timestamp format for report generation time
    "timestamp_format": "%Y-%m-%dT%H:%M:%S",
}

# CSV column ordering
CSV_COLUMNS = [
    "detection_id", "class_id", "class_name", "confidence",
    "cx", "cy", "bw", "bh", "pixel_area_proxy",
    "risk_score", "severity", "depth_m", "latitude", "longitude",
    "survey_id", "timestamp",
]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

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


def _det_to_dict(det, rd):
    """Flatten a Detection into a flat dict for report inclusion."""
    def _r(v):
        return round(v, rd) if isinstance(v, float) else v

    return {
        "detection_id":      det.detection_id or "unavailable",
        "class_id":          det.class_id,
        "class_name":        det.class_name,
        "confidence":        _r(det.confidence),
        "cx":                _r(det.cx),
        "cy":                _r(det.cy),
        "bw":                _r(det.bw),
        "bh":                _r(det.bh),
        "pixel_area_proxy":  _r(det.pixel_area_proxy),
        "risk_score":        _r(det.risk_score) if det.risk_score is not None else "unavailable",
        "severity":          "unavailable",   # filled below if risk_score present
        "depth_m":           _r(det.depth_m) if det.depth_m is not None else "unavailable",
        "latitude":          _r(det.latitude) if det.latitude is not None else "unavailable",
        "longitude":         _r(det.longitude) if det.longitude is not None else "unavailable",
        "survey_id":         det.survey_id or "unavailable",
        "timestamp":         det.timestamp or "unavailable",
    }


SEVERITY_BANDS = {
    "LOW":      (0,  24),
    "MEDIUM":   (25, 49),
    "HIGH":     (50, 74),
    "CRITICAL": (75, 100),
}

def _score_to_severity(score):
    for label, (lo, hi) in SEVERITY_BANDS.items():
        if lo <= score <= hi:
            return label
    return "CRITICAL" if score > 100 else "LOW"


def _build_summary(dets, rd):
    """Build a top-level summary block for the JSON report."""
    n = len(dets)
    class_dist = {}
    for d in dets:
        class_dist[d.class_name] = class_dist.get(d.class_name, 0) + 1

    confs = [d.confidence for d in dets]
    conf_summary = {
        "min":  round(min(confs), rd) if confs else "unavailable",
        "max":  round(max(confs), rd) if confs else "unavailable",
        "mean": round(sum(confs) / n, rd) if confs else "unavailable",
    }

    risk_vals = [d.risk_score for d in dets if d.risk_score is not None]
    if risk_vals:
        risk_summary = {
            "min":  round(min(risk_vals), rd),
            "max":  round(max(risk_vals), rd),
            "mean": round(sum(risk_vals) / len(risk_vals), rd),
        }
    else:
        risk_summary = "unavailable (risk_score not populated)"

    return {
        "total_detections":   n,
        "class_distribution": class_dist,
        "confidence":         conf_summary,
        "risk":               risk_summary,
        "gps_available":      any(d.has_geo for d in dets),
        "depth_available":    any(d.has_depth for d in dets),
        "note": (
            "Fields marked 'unavailable' reflect missing pipeline metadata "
            "(GPS, depth, survey ID, timestamp).  No values were fabricated."
        ),
    }


def _write_json(report_dict, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2, default=str)


def _write_csv(det_dicts, output_path):
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(det_dicts)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_report(survey_data, output_path, format="json", config=None):
    """
    Generate a survey report file from detection data.

    Parameters
    ----------
    survey_data : list[Detection | dict] | dict
        Either a list of detections directly, or a dict with at least a
        "detections" key containing such a list.  Additional top-level keys
        (e.g., survey_id, timestamp) are included in the report header if present.
    output_path : str
        Destination file path.  Extension is overridden to match format.
    format : str
        "json" (default) or "csv".  "pdf" is not supported (see module docstring).
    config : dict | None

    Returns
    -------
    dict with keys:
        status       : str   -- "ok" | "error"
        output_path  : str   -- Absolute path of the written file
        format       : str
        record_count : int
        warnings     : list[str]
    """
    cfg = dict(DEFAULT_REPORT_CONFIG)
    if config:
        cfg.update(config)

    rd = cfg["round_digits"]
    warnings = []
    fmt = format.lower().strip()

    if fmt not in ("json", "csv"):
        return {
            "status": "error",
            "output_path": "",
            "format": fmt,
            "record_count": 0,
            "warnings": [
                "Unsupported format '{}'. Use 'json' or 'csv'. "
                "PDF is not supported (no PDF library in project dependencies).".format(fmt)
            ],
        }

    # Normalise input
    header_meta = {}
    if isinstance(survey_data, dict):
        raw_dets = survey_data.get("detections", [])
        header_meta = {k: v for k, v in survey_data.items() if k != "detections"}
    elif isinstance(survey_data, list):
        raw_dets = survey_data
    else:
        return {
            "status": "error", "output_path": "", "format": fmt,
            "record_count": 0,
            "warnings": ["survey_data must be a list or dict; got {}".format(type(survey_data))],
        }

    try:
        dets = _coerce_list(raw_dets)
    except (TypeError, KeyError) as exc:
        return {
            "status": "error", "output_path": "", "format": fmt,
            "record_count": 0,
            "warnings": ["Detection parse error: {}".format(exc)],
        }

    # Build flat dicts, adding severity where risk_score is present
    det_dicts = []
    for det in dets:
        d = _det_to_dict(det, rd)
        if det.risk_score is not None:
            d["severity"] = _score_to_severity(det.risk_score)
        det_dicts.append(d)

    # Enforce correct extension
    base, _ = os.path.splitext(output_path)
    output_path = base + "." + fmt

    generated_at = datetime.now().strftime(cfg["timestamp_format"])

    try:
        if fmt == "json":
            report = {
                "report_generated_at": generated_at,
                "survey_metadata":     header_meta if header_meta else "unavailable",
                "summary":             _build_summary(dets, rd),
                "detections":          det_dicts,
            }
            _write_json(report, output_path)
        elif fmt == "csv":
            _write_csv(det_dicts, output_path)
            if len(dets) == 0:
                warnings.append("No detections: CSV written with header row only.")
    except IOError as exc:
        return {
            "status": "error", "output_path": output_path, "format": fmt,
            "record_count": len(dets),
            "warnings": ["File write error: {}".format(exc)],
        }

    return {
        "status":       "ok",
        "output_path":  os.path.abspath(output_path),
        "format":       fmt,
        "record_count": len(dets),
        "warnings":     warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import tempfile

    print("=== report_generator.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    dets = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10,
         "risk_score": 62.0, "detection_id": "det_001"},
        {"class_id": 0, "class_name": "Ghost Net", "confidence": 0.90,
         "cx": 0.05, "cy": 0.05, "bw": 0.30, "bh": 0.25,
         "risk_score": 88.0, "detection_id": "det_002"},
        # Detection without optional fields -- should appear with "unavailable"
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.55,
         "cx": 0.80, "cy": 0.20, "bw": 0.04, "bh": 0.04},
    ]

    survey = {
        "detections": dets,
        "survey_id":  "DEMO-SURVEY-001",
        "operator":   "GhostNetPINGE demo",
    }

    tmpdir = tempfile.gettempdir()

    # JSON report
    json_path = os.path.join(tmpdir, "ghostnet_report")
    result = generate_report(survey, json_path, format="json")
    print("JSON report:", result)

    # CSV report
    csv_path = os.path.join(tmpdir, "ghostnet_report")
    result2 = generate_report(survey, csv_path, format="csv")
    print("CSV report:", result2)

    # Unsupported format
    result3 = generate_report(survey, os.path.join(tmpdir, "report"), format="pdf")
    print("PDF attempt:", result3)

    # Missing optional fields
    result4 = generate_report([], os.path.join(tmpdir, "empty_report"), format="json")
    print("Empty input:", result4)
