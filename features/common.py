# -*- coding: utf-8 -*-
"""
common.py — Shared dataclass and validation helpers for GhostNetPINGE features.

Only contains things used by MORE than one feature module.
Do NOT add feature-specific logic here.

Confirmed real data fields (from Step 0 inspection of runs/detect/predict/labels/):
  - class_id    : int   — class index from YOLO .txt output (always 0 in observed output)
  - class_name  : str   — human-readable label (pipeline prints "Crab-Pot"; treat as
                          unverified until model.names is live-loaded; stored as-is)
  - confidence  : float — detection confidence score (field 5 in save_conf .txt format)
  - cx, cy      : float — normalised bounding-box centre (0–1 relative to image dims)
  - bw, bh      : float — normalised bounding-box width/height (0–1)

NOT confirmed to exist anywhere in the pipeline (no GPS, depth, physical scale, survey ID,
or timestamp found in any file):
  - latitude, longitude, depth_m, area_m2, survey_id, timestamp
  These appear as Optional fields below and must never be fabricated by callers.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Core detection dataclass
# ---------------------------------------------------------------------------

@dataclass
class Detection:
    """
    Lightweight representation of a single YOLO detection.

    Required fields are those confirmed to exist in the pipeline output.
    Optional fields are placeholders for metadata the pipeline does NOT
    currently expose; leave them as None unless real data is available.

    Coordinate system note
    ----------------------
    cx, cy, bw, bh are **normalised** YOLO coordinates (0.0-1.0 relative to
    image width/height).  They are NOT geographic coordinates.
    """

    # --- Fields confirmed to exist in runs/detect/predict/labels/*.txt ---
    class_id: int                        # Integer class index (observed: always 0)
    class_name: str                      # Human label (pipeline prints "Crab-Pot")
    confidence: float                    # Detection confidence, range [0.0, 1.0]
    cx: float                            # Normalised bbox centre-x  (0-1)
    cy: float                            # Normalised bbox centre-y  (0-1)
    bw: float                            # Normalised bbox width     (0-1)
    bh: float                            # Normalised bbox height    (0-1)

    # --- Optional: NOT in the current pipeline; must remain None by default ---
    detection_id: Optional[str] = None   # Unique ID for dedup logic (not in pipeline)
    latitude: Optional[float] = None     # Geographic lat -- pipeline does not expose this
    longitude: Optional[float] = None    # Geographic lon -- pipeline does not expose this
    depth_m: Optional[float] = None      # Depth in metres -- pipeline does not expose this
    survey_id: Optional[str] = None      # Survey identifier -- not in pipeline
    timestamp: Optional[str] = None      # ISO-8601 timestamp -- not in pipeline
    risk_score: Optional[float] = None   # Populated by risk_scoring.py if called

    # --- Derived convenience properties ---

    @property
    def pixel_area_proxy(self) -> float:
        """
        Product of normalised width x height.
        This is a *proxy* for bounding-box area in image-space (0-1 range),
        NOT physical square metres.  Label it as such whenever displayed.
        """
        return self.bw * self.bh

    @property
    def has_geo(self) -> bool:
        """True only if both latitude AND longitude are non-None real values."""
        return self.latitude is not None and self.longitude is not None

    @property
    def has_depth(self) -> bool:
        """True only if depth_m is a non-None real value."""
        return self.depth_m is not None


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_detection(d: Detection) -> list:
    """
    Sanity-check a Detection object.  Returns a list of warning strings
    (empty list = no issues found).

    Parameters
    ----------
    d : Detection

    Returns
    -------
    list[str]
        Human-readable warnings; empty if the detection looks clean.
    """
    warnings = []

    if not (0.0 <= d.confidence <= 1.0):
        warnings.append(
            "confidence {} out of [0,1] range".format(d.confidence)
        )
    for name, val in [("cx", d.cx), ("cy", d.cy), ("bw", d.bw), ("bh", d.bh)]:
        if not (0.0 <= val <= 1.0):
            warnings.append("{}={} outside normalised [0,1] range".format(name, val))
    if d.bw <= 0 or d.bh <= 0:
        warnings.append("bbox has zero or negative width/height")

    return warnings


def detection_from_dict(data):
    """
    Build a Detection from a plain dict (e.g., from JSON).
    Raises KeyError / TypeError if required fields are missing or wrong type.

    Required keys: class_id, class_name, confidence, cx, cy, bw, bh
    Optional keys: detection_id, latitude, longitude, depth_m,
                   survey_id, timestamp, risk_score
    """
    return Detection(
        class_id=int(data["class_id"]),
        class_name=str(data["class_name"]),
        confidence=float(data["confidence"]),
        cx=float(data["cx"]),
        cy=float(data["cy"]),
        bw=float(data["bw"]),
        bh=float(data["bh"]),
        detection_id=data.get("detection_id"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        depth_m=data.get("depth_m"),
        survey_id=data.get("survey_id"),
        timestamp=data.get("timestamp"),
        risk_score=data.get("risk_score"),
    )


def clamp(value, lo, hi):
    """Clamp *value* into [lo, hi]."""
    return max(lo, min(hi, value))


# ---------------------------------------------------------------------------
# __main__ -- quick self-test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== common.py self-test ===")

    # DEMO / TEST DATA -- not real detections
    d = detection_from_dict({
        "class_id": 0,
        "class_name": "Crab-Pot",
        "confidence": 0.72,
        "cx": 0.45,
        "cy": 0.60,
        "bw": 0.12,
        "bh": 0.09,
        "detection_id": "det_001",
    })
    print("Detection: {}".format(d))
    print("pixel_area_proxy: {:.6f}  (NOT physical m2)".format(d.pixel_area_proxy))
    print("has_geo: {}".format(d.has_geo))
    print("has_depth: {}".format(d.has_depth))
    print("warnings: {}".format(validate_detection(d)))

    # Bad detection
    bad = Detection(class_id=0, class_name="Crab-Pot",
                    confidence=1.5, cx=0.5, cy=0.5, bw=-0.1, bh=0.1)
    print("\nBad detection warnings: {}".format(validate_detection(bad)))
