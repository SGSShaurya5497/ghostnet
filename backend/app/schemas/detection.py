# backend/app/schemas/detection.py
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class DetectionLabel(str, Enum):
    GHOST_NET = "ghost_net"
    ROPE = "rope"
    TRAWL_DOOR = "trawl_door"
    DEBRIS_PATCH = "debris_patch"
    UNKNOWN = "unknown"


class SeverityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class BoundingBox(BaseModel):
    x_min: int = Field(..., description="Left edge of bounding box in pixels")
    y_min: int = Field(..., description="Top edge of bounding box in pixels")
    x_max: int = Field(..., description="Right edge of bounding box in pixels")
    y_max: int = Field(..., description="Bottom edge of bounding box in pixels")


class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees (WGS84)")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees (WGS84)")
    depth_m: Optional[float] = Field(None, description="Depth in metres below sea surface")


class SonarMeta(BaseModel):
    range_m: float = Field(75.0, description="Sonar range setting in metres")
    frequency_khz: float = Field(450.0, description="Sonar frequency in kHz")
    slant_corrected: bool = Field(True, description="Whether slant-range correction was applied")


class Detection(BaseModel):
    id: str = Field(..., description="Unique detection ID prefix det_")
    frame_id: str = Field(..., description="Identifier of the sonar frame")
    label: DetectionLabel = Field(DetectionLabel.GHOST_NET, description="Classification label")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    bbox: BoundingBox
    geo: Optional[GeoPoint] = None
    sonar_meta: SonarMeta = Field(default_factory=SonarMeta)
    severity: SeverityLevel = Field(SeverityLevel.MEDIUM, description="Derived severity level")
    area_m2: Optional[float] = Field(None, description="Estimated real-world area in m²")
    created_at: str = Field(..., description="ISO 8601 UTC timestamp")


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    model_loaded: bool = False


class UploadResponse(BaseModel):
    frame_id: str
    status: str = "ready"
    message: str
    filename: Optional[str] = None


class DetectionResponse(BaseModel):
    frame_id: str
    detections: List[Detection]
    processing_time_ms: int
    model_version: str = "ghostnet-yolo-v1"


class ReportItem(BaseModel):
    report_id: str
    frame_id: str
    detection_count: int
    highest_severity: SeverityLevel
    created_at: str
    summary: str


class ReportListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[ReportItem]


class HotspotCluster(BaseModel):
    cluster_id: str
    center_lat: float
    center_lon: float
    detection_count: int
    risk_level: SeverityLevel
    estimated_debris_m2: float


class HotspotResponse(BaseModel):
    clusters: List[HotspotCluster]
    total_hotspots: int
