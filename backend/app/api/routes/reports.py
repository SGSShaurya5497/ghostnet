# backend/app/api/routes/reports.py
from typing import Any, Dict
from fastapi import APIRouter, Query

from app.schemas.detection import HotspotResponse, ReportListResponse
from app.services.analytics_service import analytics_service
from app.services.detection_service import detection_service

router = APIRouter(tags=["Reports & Analytics"])


@router.get("/reports", response_model=ReportListResponse)
async def get_reports(
    limit: int = Query(20, ge=1, le=100, description="Max number of reports to return"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """List detection history reports."""
    items = detection_service.list_reports(limit=limit, offset=offset)
    total = detection_service.total_reports_count()
    return ReportListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=items
    )


@router.get("/analytics/hotspots", response_model=HotspotResponse)
async def get_hotspots():
    """Retrieve debris density hotspot clusters for mapping."""
    return analytics_service.get_hotspots()


@router.get("/analytics/risk-summary", response_model=Dict[str, Any])
async def get_risk_summary():
    """Retrieve aggregated ecological risk overview."""
    return analytics_service.get_risk_summary()
