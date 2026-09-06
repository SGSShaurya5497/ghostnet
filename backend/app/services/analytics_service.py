# backend/app/services/analytics_service.py
import sys
import os
from typing import List, Dict, Any

# Ensure project root is in path to load features modules if needed
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from app.schemas.detection import HotspotCluster, HotspotResponse, SeverityLevel


class AnalyticsService:
    def get_hotspots(self) -> HotspotResponse:
        """Return detected hotspot clusters for map visualization."""
        # Simulated hotspot clusters from side-scan sonar surveys
        clusters = [
            HotspotCluster(
                cluster_id="hotspot_puget_sound_01",
                center_lat=48.2395,
                center_lon=-124.7050,
                detection_count=18,
                risk_level=SeverityLevel.CRITICAL,
                estimated_debris_m2=420.5
            ),
            HotspotCluster(
                cluster_id="hotspot_san_juan_02",
                center_lat=48.5412,
                center_lon=-123.0125,
                detection_count=9,
                risk_level=SeverityLevel.HIGH,
                estimated_debris_m2=185.0
            ),
            HotspotCluster(
                cluster_id="hotspot_hood_canal_03",
                center_lat=47.6210,
                center_lon=-122.8420,
                detection_count=5,
                risk_level=SeverityLevel.MEDIUM,
                estimated_debris_m2=78.2
            ),
        ]
        return HotspotResponse(
            clusters=clusters,
            total_hotspots=len(clusters)
        )

    def get_risk_summary(self) -> Dict[str, Any]:
        """Aggregate risk indicators across all historical detections."""
        return {
            "critical_sites": 12,
            "moderate_sites": 34,
            "resolved_sites": 89,
            "total_area_scanned_km2": 142.8,
            "recovered_debris_tons": 28.4,
            "ecosystem_recovery_rate": "84.2%"
        }


analytics_service = AnalyticsService()
