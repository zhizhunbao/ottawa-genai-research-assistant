"""Report repository."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from app.models.report import Report, ReportMetadata
from .base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Repository for report data operations."""
    
    def __init__(self, data_file: str = "backend/monk/reports/reports.json"):
        super().__init__(data_file)
    
    def _to_dict(self, report: Report) -> Dict[str, Any]:
        """Convert Report model to dictionary."""
        return report.dict()
    
    def _from_dict(self, data: Dict[str, Any]) -> Report:
        """Convert dictionary to Report model."""
        # Convert string dates to datetime objects
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
        
        return Report(**data)
    
    def find_by_type(self, report_type: str) -> List[Report]:
        """Find reports by type."""
        data = self._load_data()
        reports = []
        for item in data:
            if item.get('type') == report_type:
                reports.append(self._from_dict(item))
        return reports
    
    def find_by_status(self, status: str) -> List[Report]:
        """Find reports by status."""
        data = self._load_data()
        reports = []
        for item in data:
            if item.get('status') == status:
                reports.append(self._from_dict(item))
        return reports
    
    def find_by_author(self, author: str) -> List[Report]:
        """Find reports by author."""
        data = self._load_data()
        reports = []
        for item in data:
            if item.get('author') == author:
                reports.append(self._from_dict(item))
        return reports
    
    def find_by_language(self, language: str) -> List[Report]:
        """Find reports by language."""
        data = self._load_data()
        reports = []
        for item in data:
            if item.get('language') == language:
                reports.append(self._from_dict(item))
        return reports
    
    def find_by_tags(self, tags: List[str]) -> List[Report]:
        """Find reports containing any of the specified tags."""
        data = self._load_data()
        reports = []
        for item in data:
            item_tags = item.get('tags', [])
            if any(tag in item_tags for tag in tags):
                reports.append(self._from_dict(item))
        return reports
    
    def find_published_reports(self) -> List[Report]:
        """Find all published reports."""
        return self.find_by_status('published')
    
    def update_status(self, report_id: str, status: str) -> Optional[Report]:
        """Update report status."""
        updates = {
            'status': status,
            'updated_at': datetime.utcnow().isoformat()
        }
        return self.update(report_id, updates) 