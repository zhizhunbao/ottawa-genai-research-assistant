"""System repository."""

import json
from pathlib import Path
from typing import Any

from app.models.system import SystemSettings


class SystemRepository:
    """Repository for system settings operations."""

    def __init__(self, data_file: str = "backend/monk/system/settings.json"):
        self.data_file = Path(data_file)
        self.data_file.parent.mkdir(parents=True, exist_ok=True)

    def _load_settings(self) -> dict[str, Any]:
        """Load settings from JSON file."""
        if not self.data_file.exists():
            # Return default settings if file doesn't exist
            return SystemSettings().dict()

        try:
            with open(self.data_file, encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return SystemSettings().dict()

    def _save_settings(self, settings: dict[str, Any]) -> None:
        """Save settings to JSON file."""
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(settings, f, indent=2, ensure_ascii=False)

    def get_settings(self) -> SystemSettings:
        """Get system settings."""
        data = self._load_settings()
        return SystemSettings(**data)

    def update_settings(self, settings: SystemSettings) -> SystemSettings:
        """Update system settings."""
        self._save_settings(settings.dict())
        return settings

    def update_partial_settings(
        self, updates: dict[str, Any]
    ) -> SystemSettings:
        """Update partial system settings."""
        current_data = self._load_settings()

        # Deep merge updates
        def deep_merge(base: dict, updates: dict) -> dict:
            result = base.copy()
            for key, value in updates.items():
                if (
                    key in result
                    and isinstance(result[key], dict)
                    and isinstance(value, dict)
                ):
                    result[key] = deep_merge(result[key], value)
                else:
                    result[key] = value
            return result

        updated_data = deep_merge(current_data, updates)
        self._save_settings(updated_data)
        return SystemSettings(**updated_data)

    def get_language_config(self) -> dict[str, Any]:
        """Get language configuration."""
        settings = self.get_settings()
        return settings.languages.dict()

    def get_ai_config(self) -> dict[str, Any]:
        """Get AI configuration."""
        settings = self.get_settings()
        return settings.ai.dict()

    def get_search_config(self) -> dict[str, Any]:
        """Get search configuration."""
        settings = self.get_settings()
        return settings.search.dict()

    def get_feature_flags(self) -> dict[str, bool]:
        """Get feature flags."""
        settings = self.get_settings()
        return settings.features.dict()

    def update_feature_flag(
        self, feature: str, enabled: bool
    ) -> SystemSettings:
        """Update a specific feature flag."""
        return self.update_partial_settings({"features": {feature: enabled}})
