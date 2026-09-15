# -*- coding: utf-8 -*-
"""
==============================================================================
STATUS: EXPERIMENTAL / RESEARCH PROTOTYPE
This module is a standalone algorithmic prototype and is not currently wired
into the active FastAPI backend routes. Scheduled for Roadmap Phase 2.
==============================================================================

survey_comparison.py  (Feature 2) -- GhostNetPINGE
Public entry point: compare_surveys(previous_detections, current_detections, config=None)

Compares two sets of detections (previous vs. current survey) and classifies
each detection as new, persistent, or no_longer_detected.

IMPORTANT: The pipeline exposes only image-space normalised coordinates
(cx, cy, bw, bh).  ALL comparisons here are in IMAGE-SPACE only.
This module never claims an object was "physically removed" -- it uses
the term "no_longer_detected" strictly.

Confirmed real fields used: class_id, class_name, cx, cy, bw, bh, confidence
Optional fields (not in pipeline): latitude, longitude, survey_id, timestamp
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.common import Detection, detection_from_dict, validate_detection

# ---------------------------------------------------------------------------
# Default config
# ---------------------------------------------------------------------------
DEFAULT_COMPARE_CONFIG = {
    # IoU threshold for considering two detections the "same" object.
    # Comparisons are in IMAGE-SPACE (normalised coordinates), not geographic.
    "iou_threshold": 0.30,

    # If True, class_name must also match for two detections to be considered
    # the same object (in addition to IoU overlap).
    "require_class_match": True,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _bbox_iou(a, b):
    """
    Compute IoU between two detections using normalised YOLO coordinates.
    IMAGE-SPACE COMPARISON -- not geographic.

    Parameters
    ----------
    a, b : Detection

    Returns
    -------
    float : IoU value in [0, 1]
    """
    # Convert cx, cy, bw, bh -> x1, y1, x2, y2
    ax1, ay1 = a.cx - a.bw / 2, a.cy - a.bh / 2
    ax2, ay2 = a.cx + a.bw / 2, a.cy + a.bh / 2
    bx1, by1 = b.cx - b.bw / 2, b.cy - b.bh / 2
    bx2, by2 = b.cx + b.bw / 2, b.cy + b.bh / 2

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_w = max(0.0, inter_x2 - inter_x1)
    inter_h = max(0.0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h

    area_a = a.bw * a.bh
    area_b = b.bw * b.bh
    union_area = area_a + area_b - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area


def _coerce_list(raw_list):
    """Convert a list of dicts or Detection objects into Detection objects."""
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

def compare_surveys(previous_detections, current_detections, config=None):
    """
    Compare two lists of detections and classify changes.

    NOTE: All spatial comparisons are IMAGE-SPACE only (normalised cx/cy/bw/bh).
    No geographic coordinates are used.  Results must not be interpreted as
    physical movement or removal of objects from the real world.

    Parameters
    ----------
    previous_detections : list[Detection | dict]
        Detections from the earlier survey.
    current_detections : list[Detection | dict]
        Detections from the most recent survey.
    config : dict | None
        Override DEFAULT_COMPARE_CONFIG keys.

    Returns
    -------
    dict with keys:
        new                : list[dict]  -- In current but not matched to previous
        persistent         : list[dict]  -- Matched between previous and current
        no_longer_detected : list[dict]  -- In previous but not matched to current
        comparison_space   : str         -- Always "image-space (normalised coords)"
        warnings           : list[str]
    """
    cfg = dict(DEFAULT_COMPARE_CONFIG)
    if config:
        cfg.update(config)

    warnings = []

    try:
        prev = _coerce_list(previous_detections)
        curr = _coerce_list(current_detections)
    except (TypeError, KeyError) as exc:
        return {
            "new": [],
            "persistent": [],
            "no_longer_detected": [],
            "comparison_space": "image-space (normalised coords)",
            "warnings": ["Input error: {}".format(exc)],
        }

    iou_thresh = cfg["iou_threshold"]
    require_class = cfg["require_class_match"]

    matched_prev = set()   # indices into prev that were matched
    matched_curr = set()   # indices into curr that were matched
    persistent = []

    for ci, c in enumerate(curr):
        best_iou = 0.0
        best_pi = -1
        for pi, p in enumerate(prev):
            if pi in matched_prev:
                continue
            if require_class and c.class_name.lower() != p.class_name.lower():
                continue
            iou = _bbox_iou(c, p)
            if iou > best_iou:
                best_iou = iou
                best_pi = pi

        if best_iou >= iou_thresh and best_pi >= 0:
            matched_curr.add(ci)
            matched_prev.add(best_pi)
            persistent.append({
                "previous": vars(prev[best_pi]),
                "current":  vars(c),
                "iou":      round(best_iou, 4),
                "note":     "IMAGE-SPACE match only",
            })

    new_dets = [vars(curr[i]) for i in range(len(curr)) if i not in matched_curr]
    no_longer = [vars(prev[i]) for i in range(len(prev)) if i not in matched_prev]

    return {
        "new":                new_dets,
        "persistent":         persistent,
        "no_longer_detected": no_longer,
        "comparison_space":   "image-space (normalised coords)",
        "warnings":           warnings,
    }


# ---------------------------------------------------------------------------
# __main__ -- standalone demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== survey_comparison.py demo ===\n")

    # DEMO / TEST DATA -- not real detections
    prev = [
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.80,
         "cx": 0.15, "cy": 0.92, "bw": 0.10, "bh": 0.10, "detection_id": "p1"},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.75,
         "cx": 0.50, "cy": 0.50, "bw": 0.08, "bh": 0.08, "detection_id": "p2"},
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.70,
         "cx": 0.80, "cy": 0.80, "bw": 0.06, "bh": 0.06, "detection_id": "p3"},
    ]
    curr = [
        # Persistent: close to p1
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.82,
         "cx": 0.16, "cy": 0.91, "bw": 0.10, "bh": 0.10, "detection_id": "c1"},
        # Persistent: close to p2
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.74,
         "cx": 0.50, "cy": 0.51, "bw": 0.08, "bh": 0.08, "detection_id": "c2"},
        # New: no match in previous
        {"class_id": 0, "class_name": "Crab-Pot", "confidence": 0.60,
         "cx": 0.30, "cy": 0.20, "bw": 0.05, "bh": 0.05, "detection_id": "c3"},
        # Nearby but different class -- should NOT match p3 if require_class_match=True
        {"class_id": 1, "class_name": "Ghost Net", "confidence": 0.65,
         "cx": 0.80, "cy": 0.80, "bw": 0.06, "bh": 0.06, "detection_id": "c4"},
    ]

    result = compare_surveys(prev, curr)
    print("New detections ({}):".format(len(result["new"])))
    for d in result["new"]:
        print("  id={detection_id}  class={class_name}  conf={confidence}".format(**d))

    print("\nPersistent detections ({}):".format(len(result["persistent"])))
    for d in result["persistent"]:
        print("  prev_id={}  curr_id={}  iou={}".format(
            d["previous"].get("detection_id"),
            d["current"].get("detection_id"),
            d["iou"]))

    print("\nNo longer detected ({}):".format(len(result["no_longer_detected"])))
    for d in result["no_longer_detected"]:
        print("  id={}  class={}".format(d.get("detection_id"), d.get("class_name")))

    print("\nComparison space:", result["comparison_space"])
    print("Warnings:", result["warnings"])
