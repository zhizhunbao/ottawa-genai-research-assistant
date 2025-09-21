"""
📊 Report Generation API Endpoints

Handles automated report generation with visualizations.
"""

import uuid
from datetime import datetime
from typing import Any

from app.api.auth import get_current_user
from app.core.config import get_settings
from app.models.user import User
from app.services.report_service import ReportService
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter()


# Request/Response Models
class ReportRequest(BaseModel):
    query: str
    language: str | None = "en"
    include_charts: bool = True
    format: str | None = "html"  # html, pdf, word
    document_ids: list[str] | None = None


class ReportSection(BaseModel):
    title: str
    content: str
    charts: list[dict[str, Any]] | None = None


class ReportResponse(BaseModel):
    id: str
    title: str
    summary: str
    sections: list[ReportSection]
    generated_at: datetime
    language: str
    sources: list[str]
    format: str


class ReportList(BaseModel):
    reports: list[dict[str, Any]]
    total: int


@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    current_user: User = Depends(get_current_user),
    settings=Depends(get_settings),
):
    """
    Generate a comprehensive report based on a query.

    - **query**: The topic or question for the report
    - **language**: Language preference (en/fr)
    - **include_charts**: Whether to include data visualizations
    - **format**: Output format (html/pdf/word)
    - **document_ids**: Specific documents to use (optional)
    """
    try:
        report_service = ReportService(settings)

        # Generate the report
        report_data = await report_service.generate_report(
            query=request.query,
            language=request.language,
            include_charts=request.include_charts,
            document_ids=request.document_ids,
        )

        # Create report sections
        sections = [
            ReportSection(
                title="Executive Summary",
                content=report_data.get("summary", ""),
                charts=report_data.get("summary_charts", []),
            ),
            ReportSection(
                title="Detailed Analysis",
                content=report_data.get("analysis", ""),
                charts=report_data.get("analysis_charts", []),
            ),
            ReportSection(
                title="Key Findings",
                content=report_data.get("findings", ""),
                charts=report_data.get("findings_charts", []),
            ),
            ReportSection(
                title="Recommendations",
                content=report_data.get("recommendations", ""),
                charts=report_data.get("recommendation_charts", []),
            ),
        ]

        report_id = str(uuid.uuid4())

        return ReportResponse(
            id=report_id,
            title=report_data.get("title", f"Report: {request.query}"),
            summary=report_data.get("brief_summary", ""),
            sections=sections,
            generated_at=datetime.now(),
            language=request.language or "en",
            sources=report_data.get("sources", []),
            format=request.format or "html",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating report: {str(e)}"
        )


@router.get("/list", response_model=ReportList)
async def list_reports(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    settings=Depends(get_settings),
):
    """
    Get list of generated reports.

    - **limit**: Maximum number of reports to return
    - **offset**: Number of reports to skip (for pagination)
    """
    try:
        from app.repositories.report_repository import ReportRepository
        
        report_repo = ReportRepository()
        
        # Get all reports for the user (assuming reports have user_id field)
        all_reports = report_repo.find_all()
        user_reports = []
        
        for report in all_reports:
            # Filter by user if the report has user_id field
            if hasattr(report, 'user_id') and report.user_id == current_user.id:
                user_reports.append({
                    "id": report.id,
                    "title": report.title,
                    "summary": report.summary[:200] + "..." if len(report.summary) > 200 else report.summary,
                    "generated_at": report.created_at.isoformat(),
                    "language": report.language,
                    "format": getattr(report, 'format', 'html'),
                    "status": report.status,
                })
            elif not hasattr(report, 'user_id'):
                # If no user_id field, include all reports (for backward compatibility)
                user_reports.append({
                    "id": report.id,
                    "title": report.title,
                    "summary": report.summary[:200] + "..." if len(report.summary) > 200 else report.summary,
                    "generated_at": report.created_at.isoformat(),
                    "language": report.language,
                    "format": getattr(report, 'format', 'html'),
                    "status": report.status,
                })

        # Sort by creation date (newest first)
        user_reports.sort(key=lambda x: x["generated_at"], reverse=True)

        # Apply pagination
        paginated_reports = user_reports[offset: offset + limit]

        return ReportList(
            reports=paginated_reports,
            total=len(user_reports),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error listing reports: {str(e)}"
        )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str, 
    current_user: User = Depends(get_current_user),
    settings=Depends(get_settings),
):
    """
    Get a specific generated report.

    - **report_id**: Unique report identifier
    """
    try:
        from app.repositories.report_repository import ReportRepository
        
        report_repo = ReportRepository()
        report = report_repo.find_by_id(report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Check ownership if user_id field exists
        if hasattr(report, 'user_id') and report.user_id != current_user.id:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Create report sections from the stored report content
        sections = []
        
        # Parse content if it's structured
        if hasattr(report, 'content') and report.content:
            try:
                import json
                content_data = json.loads(report.content) if isinstance(report.content, str) else report.content
                
                if isinstance(content_data, dict) and 'sections' in content_data:
                    for section_data in content_data['sections']:
                        sections.append(ReportSection(
                            title=section_data.get('title', 'Section'),
                            content=section_data.get('content', ''),
                            charts=section_data.get('charts', [])
                        ))
                else:
                    # Fallback: create a single section with all content
                    sections.append(ReportSection(
                        title="Report Content",
                        content=str(content_data),
                        charts=[]
                    ))
            except (json.JSONDecodeError, TypeError):
                # Fallback: treat content as plain text
                sections.append(ReportSection(
                    title="Report Content",
                    content=str(report.content),
                    charts=[]
                ))
        else:
            # Create mock sections if no content is available
            sections = [
                ReportSection(
                    title="Executive Summary",
                    content="This report provides a comprehensive analysis...",
                    charts=[
                        {
                            "type": "line",
                            "data": {
                                "labels": ["Q1", "Q2", "Q3"],
                                "values": [100, 120, 135],
                            },
                            "title": "Quarterly Growth",
                        }
                    ],
                )
            ]

        return ReportResponse(
            id=report.id,
            title=report.title,
            summary=report.summary,
            sections=sections,
            generated_at=report.created_at,
            language=report.language,
            sources=getattr(report, 'sources', []) or ["Local Data Repository"],
            format=getattr(report, 'format', 'html'),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving report: {str(e)}"
        )


@router.delete("/{report_id}")
async def delete_report(
    report_id: str, 
    current_user: User = Depends(get_current_user),
    settings=Depends(get_settings),
):
    """
    Delete a generated report.

    - **report_id**: Unique report identifier
    """
    try:
        from app.repositories.report_repository import ReportRepository
        
        report_repo = ReportRepository()
        report = report_repo.find_by_id(report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Check ownership if user_id field exists
        if hasattr(report, 'user_id') and report.user_id != current_user.id:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Delete the report
        success = report_repo.delete(report_id)
        
        if success:
            return {"message": f"Report {report_id} deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete report")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting report: {str(e)}"
        )


@router.post("/{report_id}/export")
async def export_report(
    report_id: str,
    format: str = "pdf",
    current_user: User = Depends(get_current_user),
    settings=Depends(get_settings),
):
    """
    Export a report in the specified format.

    - **report_id**: Unique report identifier
    - **format**: Export format (pdf/word/html)
    """
    try:
        from app.repositories.report_repository import ReportRepository
        from app.services.report_service import ReportService
        
        report_repo = ReportRepository()
        report = report_repo.find_by_id(report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Check ownership if user_id field exists
        if hasattr(report, 'user_id') and report.user_id != current_user.id:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Validate format
        valid_formats = ["pdf", "word", "html"]
        if format not in valid_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid format. Supported formats: {', '.join(valid_formats)}"
            )
        
        # Use report service to export
        report_service = ReportService(settings)
        export_result = await report_service.export_report(report, format)

        return {
            "message": f"Report {report_id} exported successfully",
            "format": format,
            "download_url": f"/api/v1/reports/{report_id}/download?format={format}",
            "file_path": export_result.get("file_path"),
            "expires_at": export_result.get("expires_at"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error exporting report: {str(e)}"
        )


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    format: str = "pdf",
    current_user: User = Depends(get_current_user),
    settings=Depends(get_settings),
):
    """
    Download an exported report file.

    - **report_id**: Unique report identifier
    - **format**: File format to download
    """
    try:
        import os

        from app.repositories.report_repository import ReportRepository
        from app.services.report_service import ReportService
        from fastapi.responses import FileResponse
        
        report_repo = ReportRepository()
        report = report_repo.find_by_id(report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Check ownership if user_id field exists
        if hasattr(report, 'user_id') and report.user_id != current_user.id:
            raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
        
        # Get file path for the exported report
        report_service = ReportService(settings)
        file_path = await report_service.get_export_file_path(report_id, format)
        
        if not file_path or not os.path.exists(file_path):
            # Try to export the report first
            export_result = await report_service.export_report(report, format)
            file_path = export_result.get("file_path")
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, 
                detail="Export file not found. Please export the report first."
            )
        
        # Determine MIME type and filename
        mime_types = {
            "pdf": "application/pdf",
            "word": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "html": "text/html",
        }
        
        extensions = {
            "pdf": ".pdf",
            "word": ".docx", 
            "html": ".html",
        }
        
        filename = f"{report.title.replace(' ', '_')}_{report_id[:8]}{extensions.get(format, '.txt')}"
        
        return FileResponse(
            path=file_path,
            media_type=mime_types.get(format, "application/octet-stream"),
            filename=filename,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error downloading report: {str(e)}"
        )


@router.get("/templates/list")
async def list_report_templates(
    current_user: User = Depends(get_current_user),
):
    """
    Get available report templates.
    """
    try:
        templates = [
            {
                "id": "economic_overview",
                "name": "Economic Overview",
                "description": "Comprehensive economic development overview",
                "sections": [
                    "summary",
                    "trends",
                    "indicators",
                    "recommendations",
                ],
            },
            {
                "id": "business_support",
                "name": "Business Support Analysis",
                "description": (
                    "Analysis of business support programs and their impact"
                ),
                "sections": [
                    "programs",
                    "participation",
                    "outcomes",
                    "improvements",
                ],
            },
            {
                "id": "sector_analysis",
                "name": "Sector Analysis",
                "description": "Deep dive into specific economic sectors",
                "sections": [
                    "overview",
                    "performance",
                    "challenges",
                    "opportunities",
                ],
            },
        ]

        return {"templates": templates}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error listing templates: {str(e)}"
        )
