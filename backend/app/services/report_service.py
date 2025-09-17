"""
📊 Report Service

Handles report generation and management through the repository layer.
Demonstrates the complete Service → Repository → monk/ architecture.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.models.report import Report, ReportMetadata
from app.repositories.report_repository import ReportRepository
from app.core.config import get_settings


class ReportService:
    """Service for handling report operations through repository layer."""
    
    def __init__(self):
        self.report_repo = ReportRepository()
        self.settings = get_settings()
    
    async def create_report(
        self,
        title: str,
        description: str,
        report_type: str,
        author: str,
        content: str = "",
        status: str = "draft"
    ) -> Report:
        """Create a new report."""
        
        # Create report metadata
        metadata = ReportMetadata(
            word_count=len(content.split()) if content else 0,
            section_count=content.count("\n\n") + 1 if content else 0
        )
        
        # Create new report
        report = Report(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            type=report_type,
            status=status,
            author=author,
            content=content,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            metadata=metadata,
            tags=[],
            version=1
        )
        
        # Save through repository
        saved_report = self.report_repo.create(report)
        return saved_report
    
    async def get_report_by_id(self, report_id: str) -> Optional[Report]:
        """Get report by ID."""
        return self.report_repo.get_by_id(report_id)
    
    async def list_reports(self) -> List[Report]:
        """Get all reports."""
        return self.report_repo.get_all()
    
    async def get_reports_by_type(self, report_type: str) -> List[Report]:
        """Get reports by type."""
        return self.report_repo.find_by_type(report_type)
    
    async def get_reports_by_status(self, status: str) -> List[Report]:
        """Get reports by status."""
        return self.report_repo.find_by_status(status)
    
    async def get_reports_by_author(self, author: str) -> List[Report]:
        """Get reports by author."""
        return self.report_repo.find_by_author(author)
    
    async def update_report(self, report_id: str, **kwargs) -> Optional[Report]:
        """Update report information."""
        report = self.report_repo.get_by_id(report_id)
        if not report:
            return None
        
        # Update fields
        for field, value in kwargs.items():
            if hasattr(report, field):
                setattr(report, field, value)
        
        # Update metadata if content changed
        if 'content' in kwargs:
            content = kwargs['content']
            report.metadata.word_count = len(content.split()) if content else 0
            report.metadata.section_count = content.count("\n\n") + 1 if content else 0
        
        # Update timestamps and version
        report.updated_at = datetime.utcnow()
        report.version += 1
        
        # Save through repository
        return self.report_repo.update(report_id, report)
    
    async def update_report_content(self, report_id: str, content: str) -> Optional[Report]:
        """Update report content specifically."""
        return await self.update_report(report_id, content=content)
    
    async def update_report_status(self, report_id: str, status: str) -> Optional[Report]:
        """Update report status."""
        return await self.update_report(report_id, status=status)
    
    async def publish_report(self, report_id: str) -> Optional[Report]:
        """Publish a report (change status to published)."""
        return await self.update_report_status(report_id, "published")
    
    async def archive_report(self, report_id: str) -> Optional[Report]:
        """Archive a report (change status to archived)."""
        return await self.update_report_status(report_id, "archived")
    
    async def delete_report(self, report_id: str) -> bool:
        """Delete a report."""
        return self.report_repo.delete(report_id)
    
    async def get_reports_summary(self) -> Dict[str, Any]:
        """Get summary statistics of all reports."""
        try:
            all_reports = self.report_repo.get_all()
            
            # Calculate statistics
            total_reports = len(all_reports)
            status_counts = {}
            type_counts = {}
            author_counts = {}
            
            for report in all_reports:
                # Count by status
                status_counts[report.status] = status_counts.get(report.status, 0) + 1
                
                # Count by type
                type_counts[report.type] = type_counts.get(report.type, 0) + 1
                
                # Count by author
                author_counts[report.author] = author_counts.get(report.author, 0) + 1
            
            return {
                "total_reports": total_reports,
                "status_breakdown": status_counts,
                "type_breakdown": type_counts,
                "author_breakdown": author_counts,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            raise Exception(f"Error generating reports summary: {str(e)}")
    
    async def search_reports(self, query: str) -> List[Report]:
        """Search reports by title, description, or content."""
        try:
            all_reports = self.report_repo.get_all()
            query_lower = query.lower()
            
            matching_reports = []
            for report in all_reports:
                # Search in title, description, and content
                if (query_lower in report.title.lower() or 
                    query_lower in report.description.lower() or
                    query_lower in report.content.lower()):
                    matching_reports.append(report)
            
            return matching_reports
            
        except Exception as e:
            raise Exception(f"Error searching reports: {str(e)}")
    
    async def get_recent_reports(self, limit: int = 10) -> List[Report]:
        """Get most recently updated reports."""
        try:
            all_reports = self.report_repo.get_all()
            
            # Sort by updated_at in descending order
            sorted_reports = sorted(all_reports, key=lambda r: r.updated_at, reverse=True)
            
            return sorted_reports[:limit]
            
        except Exception as e:
            raise Exception(f"Error retrieving recent reports: {str(e)}")
    
    async def duplicate_report(self, report_id: str, new_title: str) -> Optional[Report]:
        """Create a copy of an existing report."""
        try:
            original_report = self.report_repo.get_by_id(report_id)
            if not original_report:
                return None
            
            # Create duplicate with new ID and title
            duplicate = await self.create_report(
                title=new_title,
                description=f"Copy of: {original_report.description}",
                report_type=original_report.type,
                author=original_report.author,
                content=original_report.content,
                status="draft"
            )
            
            return duplicate
            
        except Exception as e:
            raise Exception(f"Error duplicating report: {str(e)}") 