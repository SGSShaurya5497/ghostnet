# backend/app/services/detection_service.py
from datetime import datetime, timezone
import time
import uuid
from typing import Dict, List, Optional, Tuple
import numpy as np

from app.core.preprocessing import load_image_from_bytes, apply_sonar_enhancement
from app.models.inference import model_manager
from app.schemas.detection import (
    BoundingBox,
    Detection,
    DetectionLabel,
    DetectionResponse,
    GeoPoint,
    ReportItem,
    SeverityLevel,
    SonarMeta,
)


class DetectionService:
    def __init__(self):
        # In-memory storage for demo and caching uploaded frames
        self._frame_store: Dict[str, Tuple[np.ndarray, Optional[GeoPoint], SonarMeta]] = {}
        self._reports_store: List[ReportItem] = []
        self._seed_mock_reports()

    def _seed_mock_reports(self):
        """Seed initial history reports for dashboard analytics."""
        self._reports_store = [
            ReportItem(
                report_id="rep_01J982A1B2C3",
                frame_id="frame_20240315_001",
                detection_count=3,
                highest_severity=SeverityLevel.CRITICAL,
                created_at=datetime.now(timezone.utc).isoformat(),
                summary="Detected high-density monofilament gillnet cluster near shelf dropoff."
            ),
            ReportItem(
                report_id="rep_01J982A1B2C4",
                frame_id="frame_20240315_002",
                detection_count=1,
                highest_severity=SeverityLevel.HIGH,
                created_at=datetime.now(timezone.utc).isoformat(),
                summary="Isolated crab pot and synthetic line entanglement."
            ),
            ReportItem(
                report_id="rep_01J982A1B2C5",
                frame_id="frame_20240315_003",
                detection_count=2,
                highest_severity=SeverityLevel.MEDIUM,
                created_at=datetime.now(timezone.utc).isoformat(),
                summary="Submerged trawl netting fragment partially silted."
            )
        ]

    def store_frame(
        self,
        frame_id: str,
        image_bytes: bytes,
        geo: Optional[GeoPoint] = None,
        sonar_meta: Optional[SonarMeta] = None
    ) -> str:
        """Decode and store a frame in the cache."""
        image = load_image_from_bytes(image_bytes)
        meta = sonar_meta or SonarMeta()
        self._frame_store[frame_id] = (image, geo, meta)
        return frame_id

    def get_frame(self, frame_id: str) -> Optional[Tuple[np.ndarray, Optional[GeoPoint], SonarMeta]]:
        return self._frame_store.get(frame_id)

    def calculate_severity(self, confidence: float, area_m2: Optional[float]) -> SeverityLevel:
        area = area_m2 if area_m2 is not None else 0.0
        if confidence >= 0.9 and area >= 50.0:
            return SeverityLevel.CRITICAL
        elif confidence >= 0.7 and area >= 10.0:
            return SeverityLevel.HIGH
        elif confidence >= 0.5:
            return SeverityLevel.MEDIUM
        return SeverityLevel.LOW

    def detect_on_image(
        self,
        image: np.ndarray,
        frame_id: str,
        geo: Optional[GeoPoint] = None,
        sonar_meta: Optional[SonarMeta] = None,
        conf_threshold: Optional[float] = None
    ) -> DetectionResponse:
        start_time = time.time()
        
        # Apply preprocessing
        enhanced = apply_sonar_enhancement(image)
        h, w, _ = enhanced.shape

        # Run YOLO inference
        results = model_manager.predict(enhanced, conf=conf_threshold)

        detections: List[Detection] = []
        meta = sonar_meta or SonarMeta()
        timestamp = datetime.now(timezone.utc).isoformat()

        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes
            for i, box in enumerate(boxes):
                coords = box.xyxy[0].cpu().numpy().astype(int)
                x_min, y_min, x_max, y_max = coords.tolist()
                
                # Clip box inside image boundaries
                x_min = max(0, min(w - 1, x_min))
                y_min = max(0, min(h - 1, y_min))
                x_max = max(x_min + 1, min(w, x_max))
                y_max = max(y_min + 1, min(h, y_max))

                conf = float(box.conf[0].cpu().numpy())
                
                # Estimate area proxy based on bounding box size and sonar range
                box_area_ratio = ((x_max - x_min) * (y_max - y_min)) / (w * h)
                estimated_area_m2 = round(box_area_ratio * (meta.range_m ** 2) * 0.1, 2)
                
                severity = self.calculate_severity(conf, estimated_area_m2)
                det_id = f"det_{uuid.uuid4().hex[:14]}"

                detections.append(
                    Detection(
                        id=det_id,
                        frame_id=frame_id,
                        label=DetectionLabel.GHOST_NET,
                        confidence=round(conf, 3),
                        bbox=BoundingBox(
                            x_min=x_min,
                            y_min=y_min,
                            x_max=x_max,
                            y_max=y_max
                        ),
                        geo=geo,
                        sonar_meta=meta,
                        severity=severity,
                        area_m2=estimated_area_m2,
                        created_at=timestamp
                    )
                )

        duration_ms = int((time.time() - start_time) * 1000)

        # Record report
        if detections:
            highest_sev = max(detections, key=lambda d: ["low", "medium", "high", "critical"].index(d.severity.value)).severity
            self._reports_store.insert(
                0,
                ReportItem(
                    report_id=f"rep_{uuid.uuid4().hex[:12]}",
                    frame_id=frame_id,
                    detection_count=len(detections),
                    highest_severity=highest_sev,
                    created_at=timestamp,
                    summary=f"Processed frame {frame_id} with {len(detections)} detection(s)."
                )
            )

        return DetectionResponse(
            frame_id=frame_id,
            detections=detections,
            processing_time_ms=duration_ms,
            model_version="ghostnet-yolo-v1"
        )

    def list_reports(self, limit: int = 20, offset: int = 0) -> List[ReportItem]:
        return self._reports_store[offset : offset + limit]

    def total_reports_count(self) -> int:
        return len(self._reports_store)


detection_service = DetectionService()
