# backend/app/api/routes/upload.py
import uuid
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.detection import GeoPoint, SonarMeta, UploadResponse
from app.services.detection_service import detection_service

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_sonar_frame(
    file: UploadFile = File(...),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    depth_m: Optional[float] = Form(None),
    range_m: Optional[float] = Form(75.0),
    frequency_khz: Optional[float] = Form(450.0),
):
    """
    Upload a sonar image (.png, .jpg, .jpeg, .tiff) for processing.
    Returns a unique frame_id to use with /api/v1/detect/{frame_id}.
    """
    if not file.content_type or not any(file.content_type.startswith(t) for t in ["image/", "application/octet-stream"]):
        if not any(file.filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must be a valid sonar image (.png, .jpg, .jpeg, .tiff, .bmp)"
            )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )

    frame_id = f"frame_{uuid.uuid4().hex[:12]}"
    geo = GeoPoint(lat=lat, lon=lon, depth_m=depth_m) if lat is not None and lon is not None else None
    sonar_meta = SonarMeta(range_m=range_m or 75.0, frequency_khz=frequency_khz or 450.0)

    try:
        detection_service.store_frame(frame_id, image_bytes, geo=geo, sonar_meta=sonar_meta)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse image data: {str(e)}"
        )

    return UploadResponse(
        frame_id=frame_id,
        status="ready",
        message=f"File received. Detection is available at /api/v1/detect/{frame_id}",
        filename=file.filename
    )
