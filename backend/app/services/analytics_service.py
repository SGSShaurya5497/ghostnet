# backend/app/services/analytics_service.py
"""
Analytics Service — computes all dashboard metrics from real stored detections.

Data basis transparency:
  data_basis: "live"         — computed entirely from real (seeded=0) detections in DB
  data_basis: "seeded_demo"  — only seeded demo data available; no live detections yet
  data_basis: "mixed"        — mix of live and seeded data

The API response includes a data_basis field per section so the frontend
can display a "DEMO DATA" badge when appropriate.
"""

import sys
import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from app.core import db

# Mass estimates per detection (rough heuristics, used only when area_m2 is unavailable)
_MASS_KG_PER_M2 = {
    "ghost_net": 2.5,
    "rope": 0.8,
    "trawl_door": 15.0,
    "debris_patch": 1.2,
    "unknown": 2.0,
}


def _compute_data_basis(all_rows: List[dict]) -> str:
    if not all_rows:
        return "seeded_demo"
    live = [r for r in all_rows if not r.get("seeded")]
    seeded = [r for r in all_rows if r.get("seeded")]
    if live and not seeded:
        return "live"
    if seeded and not live:
        return "seeded_demo"
    return "mixed"


class AnalyticsService:

    def get_overview(self) -> Dict[str, Any]:
        """
        Compute analytics overview from real stored detections.
        Returns data_basis per section to indicate whether numbers are live or seeded.
        """
        detections = db.get_all_detections(include_seeded=True)
        reports = db.get_reports(limit=1000, offset=0)

        data_basis = _compute_data_basis(detections)

        # Per-class counts and estimated mass
        class_counts: Dict[str, int] = defaultdict(int)
        class_mass_kg: Dict[str, float] = defaultdict(float)
        for d in detections:
            label = d.get("label", "unknown")
            class_counts[label] += 1
            area = d.get("area_m2") or 0.0
            mass_per_m2 = _MASS_KG_PER_M2.get(label, 2.0)
            class_mass_kg[label] += area * mass_per_m2

        total_detections = sum(class_counts.values())
        total_mass_kg = sum(class_mass_kg.values())

        # Friendly channel names
        channel_map = {
            "ghost_net": "Ghost Nets",
            "rope": "Synthetic Ropes",
            "trawl_door": "Trawl Doors & Metal",
            "debris_patch": "Traps & Cages",
            "unknown": "Unknown Debris",
        }
        channels = []
        for label, friendly in channel_map.items():
            count = class_counts.get(label, 0)
            if count > 0 or label in ["ghost_net", "rope"]:  # always show primary classes
                channels.append({
                    "name": friendly,
                    "count": count,
                    "mass_kg": round(class_mass_kg.get(label, 0.0), 1),
                    "data_basis": data_basis,
                })

        # Monthly trends bucketed from created_at timestamps
        monthly: Dict[str, int] = defaultdict(int)
        for d in detections:
            try:
                ts = datetime.fromisoformat(d["created_at"].replace("Z", "+00:00"))
                key = ts.strftime("%b %Y")
                monthly[key] += 1
            except (KeyError, ValueError):
                pass

        # Sort by date and take last 7 months
        month_order = sorted(
            monthly.keys(),
            key=lambda m: datetime.strptime(m, "%b %Y")
        )[-7:]
        monthly_trends = [
            {"month": m.split()[0], "actual": monthly[m], "data_basis": data_basis}
            for m in month_order
        ]

        return {
            "total_detections": total_detections,
            "total_mass_tonnage": round(total_mass_kg / 1000, 2),
            "verified_resolution_pct": None,  # Requires Human-in-the-Loop confirm/reject (not yet stored)
            "active_swath_area_km2": None,    # Requires real vessel telemetry
            "data_basis": data_basis,
            "channels": channels,
            "monthly_trends": monthly_trends,
            "note": (
                "Metrics computed from stored detections. "
                f"Data basis: '{data_basis}'. "
                "Fields marked null require real hardware telemetry not yet connected."
            ),
        }

    def get_hotspots(self) -> Dict[str, Any]:
        """
        Cluster stored detections into spatial hotspots using features/hotspot_detection.py.

        Honestly handles the no-geo case: if detections lack real lat/lon,
        clusters in image-space and clearly labels results as such.
        Never fabricates geographic coordinates.
        """
        from features.hotspot_detection import detect_hotspots

        detections = db.get_all_detections(include_seeded=True)
        data_basis = _compute_data_basis(detections)

        if not detections:
            return {
                "clusters": [],
                "total_hotspots": 0,
                "coordinate_space": "n/a",
                "data_basis": data_basis,
                "note": "No detections stored yet. Upload and detect images to populate hotspot analysis.",
                "simulated": False,
            }

        # Convert DB rows to feature module Detection dicts
        feature_dets = []
        for d in detections:
            geo = d.get("geo")
            bbox = d.get("bbox", {})
            # Compute normalised cx, cy from pixel bbox (needed for image-space clustering)
            # We don't know original image dimensions, so we use a rough normalisation
            # based on typical sonar image aspect ratio. This is only used when geo is absent.
            cx = ((bbox.get("x_min", 0) + bbox.get("x_max", 640)) / 2.0) / 640.0
            cy = ((bbox.get("y_min", 0) + bbox.get("y_max", 480)) / 2.0) / 480.0
            bw = max(0.01, (bbox.get("x_max", 0) - bbox.get("x_min", 0)) / 640.0)
            bh = max(0.01, (bbox.get("y_max", 0) - bbox.get("y_min", 0)) / 480.0)

            feat_det = {
                "class_id": 0,
                "class_name": d.get("label", "ghost_net"),
                "confidence": d.get("confidence", 0.5),
                "cx": cx,
                "cy": cy,
                "bw": bw,
                "bh": bh,
            }
            if geo:
                feat_det["latitude"] = geo.get("lat")
                feat_det["longitude"] = geo.get("lon")
                feat_det["depth_m"] = geo.get("depth_m")

            feature_dets.append(feat_det)

        # Run clustering — hotspot_detection.py handles geo vs image-space automatically
        result = detect_hotspots(feature_dets, config={"min_cluster_size": 2})

        # Convert to API response format
        clusters = []
        for h in result["hotspots"]:
            dets = h["detections"]
            if not dets:
                continue

            # Compute cluster centre
            has_geo = all(
                d.get("latitude") is not None and d.get("longitude") is not None
                for d in dets
            )
            if has_geo:
                center_lat = sum(d["latitude"] for d in dets) / len(dets)
                center_lon = sum(d["longitude"] for d in dets) / len(dets)
            else:
                center_lat = None
                center_lon = None

            avg_conf = sum(d.get("confidence", 0.5) for d in dets) / len(dets)
            if avg_conf >= 0.7:
                risk = "critical"
            elif avg_conf >= 0.5:
                risk = "high"
            else:
                risk = "medium"

            clusters.append({
                "cluster_id": h["hotspot_id"],
                "detection_count": h["count"],
                "center_lat": center_lat,
                "center_lon": center_lon,
                "risk_level": risk,
                "estimated_debris_m2": round(sum(
                    d.get("bw", 0.1) * d.get("bh", 0.1) * 100
                    for d in dets
                ), 1),
                "coordinate_space": h["coordinate_space"],
                "data_basis": data_basis,
            })

        return {
            "clusters": clusters,
            "total_hotspots": len(clusters),
            "coordinate_space": result["coordinate_space"],
            "data_basis": data_basis,
            "warnings": result.get("warnings", []),
            "simulated": False,
            "note": (
                f"Hotspots computed via spatial clustering of {len(detections)} stored detections. "
                f"Coordinate space: {result['coordinate_space']}. "
                f"Data basis: '{data_basis}'."
            ),
        }

    def get_risk_summary(self) -> Dict[str, Any]:
        """Compute risk summary from real stored detection severities."""
        detections = db.get_all_detections(include_seeded=True)
        data_basis = _compute_data_basis(detections)

        severity_counts = defaultdict(int)
        depth_buckets: Dict[str, int] = {"0-20m": 0, "20-40m": 0, "40-60m": 0, "60m+": 0}

        for d in detections:
            sev = d.get("severity", "low")
            severity_counts[sev] += 1

            geo = d.get("geo")
            if geo and geo.get("depth_m") is not None:
                depth = abs(geo["depth_m"])
                if depth < 20:
                    depth_buckets["0-20m"] += 1
                elif depth < 40:
                    depth_buckets["20-40m"] += 1
                elif depth < 60:
                    depth_buckets["40-60m"] += 1
                else:
                    depth_buckets["60m+"] += 1

        critical = severity_counts.get("critical", 0)
        high = severity_counts.get("high", 0)
        medium = severity_counts.get("medium", 0)
        low = severity_counts.get("low", 0)

        # Compute hazard index (0-10 scale based on severity distribution)
        total = max(1, len(detections))
        hazard_index = round(
            (critical * 10 + high * 7 + medium * 4 + low * 1) / (total * 10) * 10,
            1
        )

        depth_distribution = [
            {"range": r, "count": c, "hazard": "Critical" if r == "40-60m" else "High" if r == "60m+" else "Medium" if r == "20-40m" else "Low"}
            for r, c in depth_buckets.items()
        ]

        return {
            "overall_hazard_index": hazard_index,
            "critical_hotspots": critical,
            "high_severity_detections": high,
            "medium_severity_detections": medium,
            "low_severity_detections": low,
            "total_detections_analyzed": total,
            "entanglement_risk_level": "High" if critical > 0 else "Medium" if high > 0 else "Low",
            "navigational_hazard_count": critical + high,
            "depth_distribution": depth_distribution,
            "data_basis": data_basis,
            "note": f"Risk computed from {total} stored detection(s). Data basis: '{data_basis}'.",
        }


analytics_service = AnalyticsService()
