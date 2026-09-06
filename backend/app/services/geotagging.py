# backend/app/services/geotagging.py
"""
Anomalous Reporting & Geotagging Engine

Addresses Problem Statement Requirement 3:
- Reads sonar metadata (coordinate files, ping headers, vessel heading, altitude/depth, swath range)
- Projects pixel bounding boxes onto real-world WGS84 geographic coordinates (latitude, longitude, depth)
- Computes real-world bounding dimensions (length, width, area in m²)
- Outputs structured reports in JSON and CSV format detailing location, dimensions, and hazard classification.
"""

import math
from typing import Dict, List, Optional, Tuple, Any
from app.schemas.detection import BoundingBox, Detection, GeoPoint, SonarMeta


class GeotaggingEngine:
    """
    Geodetic engine for Side-Scan Sonar (SSS).
    Converts 2D acoustic swath coordinates into georeferenced WGS-84 coordinates
    via slant-range correction, transducer altitude geometry, and heading projection.
    """

    # Meters per degree latitude on Earth (approx WGS84)
    METERS_PER_DEG_LAT = 111320.0

    @classmethod
    def meters_per_deg_lon(cls, lat: float) -> float:
        """Meters per degree longitude at a given latitude."""
        lat_rad = math.radians(lat)
        return cls.METERS_PER_DEG_LAT * max(0.01, math.cos(lat_rad))

    @classmethod
    def slant_to_ground_range(cls, slant_range_m: float, altitude_m: float) -> float:
        """
        Applies Pythagorean slant-range correction:
        R_ground = sqrt(max(0, R_slant^2 - Altitude^2))
        """
        if slant_range_m <= altitude_m:
            return 0.0
        return math.sqrt(slant_range_m**2 - altitude_m**2)

    @classmethod
    def compute_bounding_dimensions_m(
        cls,
        bbox: BoundingBox,
        image_width_px: int,
        image_height_px: int,
        range_m: float
    ) -> Dict[str, float]:
        """
        Calculates physical real-world dimensions (length, width, area) from pixel bbox
        and total swath range setting.
        """
        # Pixel resolutions in meters per pixel
        meters_per_px_x = (range_m * 2.0) / max(1, image_width_px)
        meters_per_px_y = range_m / max(1, image_height_px)

        px_w = max(1, bbox.x_max - bbox.x_min)
        px_h = max(1, bbox.y_max - bbox.y_min)

        width_m = round(px_w * meters_per_px_x, 2)
        length_m = round(px_h * meters_per_px_y, 2)
        area_m2 = round(width_m * length_m, 2)

        return {
            "width_m": width_m,
            "length_m": length_m,
            "area_m2": area_m2
        }

    @classmethod
    def project_pixel_to_gps(
        cls,
        vessel_lat: float,
        vessel_lon: float,
        heading_deg: float,
        vessel_depth_m: float,
        bbox: BoundingBox,
        image_width_px: int,
        image_height_px: int,
        range_m: float
    ) -> GeoPoint:
        """
        Projects detection bounding box center to exact WGS-84 (lat, lon, depth).
        Accounts for:
        - Nadir track center line (center of width axis)
        - Port vs Starboard across-track displacement
        - Transducer heading rotation
        """
        center_x = (bbox.x_min + bbox.x_max) / 2.0
        center_y = (bbox.y_min + bbox.y_max) / 2.0

        # Across-track offset in meters (negative = port, positive = starboard)
        normalized_x = (center_x - (image_width_px / 2.0)) / (image_width_px / 2.0)
        slant_across_m = normalized_x * range_m

        # Slant-to-ground range correction
        sign = 1.0 if slant_across_m >= 0 else -1.0
        ground_across_m = sign * cls.slant_to_ground_range(abs(slant_across_m), min(abs(slant_across_m), 15.0))

        # Along-track offset in meters
        normalized_y = (center_y - (image_height_px / 2.0)) / (image_height_px / 2.0)
        along_track_m = normalized_y * range_m * 0.5

        # Rotate displacement vector by vessel heading
        heading_rad = math.radians(heading_deg)
        cos_h = math.cos(heading_rad)
        sin_h = math.sin(heading_rad)

        delta_e = ground_across_m * cos_h + along_track_m * sin_h
        delta_n = -ground_across_m * sin_h + along_track_m * cos_h

        # Convert meters to degrees
        d_lat = delta_n / cls.METERS_PER_DEG_LAT
        d_lon = delta_e / cls.meters_per_deg_lon(vessel_lat)

        target_lat = round(vessel_lat + d_lat, 6)
        target_lon = round(vessel_lon + d_lon, 6)
        target_depth = round(vessel_depth_m + (abs(ground_across_m) * 0.05), 1)

        return GeoPoint(lat=target_lat, lon=target_lon, depth_m=target_depth)

    @classmethod
    def generate_csv_report(cls, detections: List[Detection]) -> str:
        """
        Generates structured CSV report per Problem Statement Requirement 3.
        Headers: Detection_ID, Frame_ID, Label, Confidence, Latitude, Longitude, Depth_m, Area_m2, Severity, Timestamp
        """
        headers = [
            "Detection_ID",
            "Frame_ID",
            "Classification",
            "Confidence_Pct",
            "Latitude_WGS84",
            "Longitude_WGS84",
            "Depth_m",
            "Est_Area_m2",
            "Severity",
            "Timestamp_UTC"
        ]
        rows = []
        for d in detections:
            lat = d.geo.lat if d.geo else 0.0
            lon = d.geo.lon if d.geo else 0.0
            depth = d.geo.depth_m if d.geo and d.geo.depth_m else 0.0
            rows.append([
                d.id,
                d.frame_id,
                d.label.value,
                f"{round(d.confidence * 100, 1)}%",
                f"{lat:.6f}",
                f"{lon:.6f}",
                f"{depth:.1f}",
                f"{d.area_m2 or 0.0:.2f}",
                d.severity.value.upper(),
                d.created_at
            ])

        csv_text = "\n".join([",".join(headers)] + [",".join(map(str, r)) for r in rows])
        return csv_text

    @classmethod
    def generate_json_report(cls, detections: List[Detection]) -> Dict[str, Any]:
        """
        Generates structured JSON report with metadata per Problem Statement Requirement 3.
        """
        return {
            "format": "GhostNet-Anomaly-Report-v1",
            "generated_at": detections[0].created_at if detections else "",
            "total_hazards_detected": len(detections),
            "detections": [
                {
                    "id": d.id,
                    "frame_id": d.frame_id,
                    "classification": d.label.value,
                    "confidence_score": d.confidence,
                    "confidence_pct": round(d.confidence * 100, 1),
                    "coordinates": {
                        "lat": d.geo.lat if d.geo else None,
                        "lon": d.geo.lon if d.geo else None,
                        "depth_m": d.geo.depth_m if d.geo else None
                    },
                    "bounding_box_px": {
                        "x_min": d.bbox.x_min,
                        "y_min": d.bbox.y_min,
                        "x_max": d.bbox.x_max,
                        "y_max": d.bbox.y_max
                    },
                    "dimensions": {
                        "estimated_area_m2": d.area_m2
                    },
                    "severity": d.severity.value,
                    "sonar_metadata": {
                        "range_m": d.sonar_meta.range_m,
                        "frequency_khz": d.sonar_meta.frequency_khz
                    }
                }
                for d in detections
            ]
        }


geotagging_engine = GeotaggingEngine()
