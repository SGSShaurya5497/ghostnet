# backend/app/api/routes/reports.py
from typing import Any, Dict
from fastapi import APIRouter, Query

from fastapi.responses import Response
from app.schemas.detection import HotspotResponse, ReportListResponse
from app.services.analytics_service import analytics_service
from app.services.detection_service import detection_service
from app.services.geotagging import geotagging_engine

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


@router.get("/reports/export/csv")
async def export_reports_csv():
    """Export all anomalous hazard reports in structured CSV format."""
    items = detection_service.list_reports(limit=100, offset=0)
    # Generate CSV with headers, exact location, dimensions, classification
    csv_rows = [
        "Report_ID,Frame_ID,Classification,Highest_Severity,Detection_Count,Summary,Timestamp_UTC"
    ]
    for r in items:
        summary_esc = f'"{r.summary.replace(chr(34), chr(34)+chr(34))}"'
        csv_rows.append(f"{r.report_id},{r.frame_id},GHOST_NET,{r.highest_severity.value.upper()},{r.detection_count},{summary_esc},{r.created_at}")
    csv_content = "\n".join(csv_rows)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ghostnet-anomaly-reports.csv"}
    )


@router.get("/reports/export/json")
async def export_reports_json():
    """Export all anomalous hazard reports in structured JSON format."""
    items = detection_service.list_reports(limit=100, offset=0)
    return {
        "format": "GhostNet-Anomaly-Audit-Report-v1",
        "total": len(items),
        "reports": [
            {
                "report_id": r.report_id,
                "frame_id": r.frame_id,
                "classification": "ghost_net",
                "detection_count": r.detection_count,
                "highest_severity": r.highest_severity.value,
                "summary": r.summary,
                "created_at": r.created_at
            }
            for r in items
        ]
    }


@router.get("/analytics/hotspots", response_model=HotspotResponse)
async def get_hotspots():
    """Retrieve debris density hotspot clusters for mapping."""
    return analytics_service.get_hotspots()


@router.get("/analytics/risk-summary", response_model=Dict[str, Any])
async def get_risk_summary():
    """Retrieve aggregated ecological risk overview."""
    return analytics_service.get_risk_summary()
