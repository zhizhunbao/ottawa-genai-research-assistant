"""Base repository class."""

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseRepository(ABC, Generic[T]):
    """Base repository class for data access operations."""

    def __init__(self, data_file: str):
        """Initialize repository with data file path."""
        self.data_file = Path(data_file)
        self.data_file.parent.mkdir(parents=True, exist_ok=True)

    def _load_data(self) -> List[Dict[str, Any]]:
        """Load data from JSON file."""
        if not self.data_file.exists():
            return []

        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else [data]
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _save_data(self, data: List[Dict[str, Any]]) -> None:
        """Save data to JSON file."""

        def json_serializer(obj):
            """Custom JSON serializer for complex objects."""
            if hasattr(obj, "isoformat"):
                return obj.isoformat()
            return str(obj)

        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=json_serializer)

    @abstractmethod
    def _to_dict(self, item: T) -> Dict[str, Any]:
        """Convert model to dictionary."""
        pass

    @abstractmethod
    def _from_dict(self, data: Dict[str, Any]) -> T:
        """Convert dictionary to model."""
        pass

    def find_all(self) -> List[T]:
        """Find all items."""
        data = self._load_data()
        return [self._from_dict(item) for item in data]

    def find_by_id(self, item_id: str) -> Optional[T]:
        """Find item by ID."""
        data = self._load_data()
        for item in data:
            if item.get("id") == item_id:
                return self._from_dict(item)
        return None

    def create(self, item: T) -> T:
        """Create new item."""
        data = self._load_data()
        item_dict = self._to_dict(item)
        data.append(item_dict)
        self._save_data(data)
        return item

    def update(self, item_id: str, updates: Dict[str, Any]) -> Optional[T]:
        """Update item by ID."""
        data = self._load_data()
        for i, item in enumerate(data):
            if item.get("id") == item_id:
                item.update(updates)
                data[i] = item
                self._save_data(data)
                return self._from_dict(item)
        return None

    def delete(self, item_id: str) -> bool:
        """Delete item by ID."""
        data = self._load_data()
        for i, item in enumerate(data):
            if item.get("id") == item_id:
                del data[i]
                self._save_data(data)
                return True
        return False

    def exists(self, item_id: str) -> bool:
        """Check if item exists."""
        return self.find_by_id(item_id) is not None
