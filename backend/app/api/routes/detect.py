# backend/app/api/routes/detect.py
import uuid
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status

from app.core.preprocessing import load_image_from_bytes
from app.schemas.detection import DetectionResponse, GeoPoint, GeoSource, SonarMeta
from app.services.detection_service import detection_service

router = APIRouter(prefix="/detect", tags=["Detection"])


@router.post("/{frame_id}", response_model=DetectionResponse)
async def detect_frame(
    frame_id: str,
    conf: Optional[float] = Query(None, ge=0.0, le=1.0, description="Confidence threshold override")
):
    """Run YOLO marine debris detection on a previously uploaded frame."""
    frame_data = detection_service.get_frame(frame_id)
    if not frame_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Frame '{frame_id}' not found. Please upload it first via /api/v1/upload"
        )

    image, geo, meta = frame_data

    # geo_source: uploaded frames supply geo via form on /upload — manual_entry if present
    geo_source = GeoSource.MANUAL_ENTRY if geo is not None else GeoSource.NONE

    try:
        response = detection_service.detect_on_image(
            image=image,
            frame_id=frame_id,
            geo=geo,
            sonar_meta=meta,
            conf_threshold=conf,
            geo_source=geo_source,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@router.post("", response_model=DetectionResponse)
async def detect_direct_image(
    file: UploadFile = File(...),
    conf: Optional[float] = Form(None),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    depth_m: Optional[float] = Form(None),
    range_m: Optional[float] = Form(75.0),
    frequency_khz: Optional[float] = Form(450.0),
):
    """
    Upload and detect ghost nets / debris in a single request.

    geo_source in the response indicates how coordinates were obtained:
      - 'manual_entry'  — lat/lon were manually supplied as form fields (current implementation)
      - 'none'          — no coordinates provided
      - 'parsed_navigation_metadata' — reserved for future sonar file metadata parsing
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )

    try:
        image = load_image_from_bytes(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot decode image: {str(e)}"
        )

    frame_id = f"frame_{uuid.uuid4().hex[:12]}"
    geo = GeoPoint(lat=lat, lon=lon, depth_m=depth_m) if lat is not None and lon is not None else None
    meta = SonarMeta(range_m=range_m or 75.0, frequency_khz=frequency_khz or 450.0)

    # Determine geo_source: currently only manual form entry is supported.
    # When real sonar file navigation metadata parsing is implemented, set
    # geo_source = GeoSource.PARSED_NAVIGATION_METADATA for that path.
    if geo is not None:
        geo_source = GeoSource.MANUAL_ENTRY
    else:
        geo_source = GeoSource.NONE

    try:
        response = detection_service.detect_on_image(
            image=image,
            frame_id=frame_id,
            geo=geo,
            sonar_meta=meta,
            conf_threshold=conf,
            geo_source=geo_source,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )
