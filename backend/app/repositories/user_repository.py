"""User repository."""

from datetime import datetime
from typing import Any

from app.core.data_paths import monk_paths
from app.models.user import User, UserMetadata, UserPreferences

from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for user data operations."""

    def __init__(self, data_file: str | None = None):
        if data_file is None:
            data_file = monk_paths.get_data_file_path("users")
        super().__init__(data_file)

    def _to_dict(self, user: User) -> dict[str, Any]:
        """Convert User model to dictionary."""
        return user.model_dump()

    def _from_dict(self, data: dict[str, Any]) -> User:
        """Convert dictionary to User model."""
        # Convert string dates to datetime objects
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(
                data["created_at"].replace("Z", "+00:00")
            )
        if isinstance(data.get("last_login"), str):
            data["last_login"] = datetime.fromisoformat(
                data["last_login"].replace("Z", "+00:00")
            )

        # Handle preferences - ensure it's a dict or create default
        preferences = data.get("preferences")
        if isinstance(preferences, str):
            # If it's a string, create default preferences
            data["preferences"] = UserPreferences().model_dump()
        elif not preferences:
            data["preferences"] = UserPreferences().model_dump()
        elif isinstance(preferences, dict):
            # Merge existing preferences with defaults for any missing fields
            default_prefs = UserPreferences().model_dump()
            merged_prefs = {**default_prefs, **preferences}
            data["preferences"] = merged_prefs

        # Handle metadata - ensure it's a dict or create default
        metadata = data.get("metadata")
        if isinstance(metadata, str):
            # If it's a string, create default metadata
            data["metadata"] = UserMetadata().model_dump()
        elif not metadata:
            data["metadata"] = UserMetadata().model_dump()

        return User(**data)

    def find_by_username(self, username: str) -> User | None:
        """Find user by username."""
        data = self._load_data()
        for item in data:
            if item.get("username") == username:
                return self._from_dict(item)
        return None

    def find_by_email(self, email: str) -> User | None:
        """Find user by email."""
        data = self._load_data()
        for item in data:
            if item.get("email") == email:
                return self._from_dict(item)
        return None

    def find_by_role(self, role: str) -> list[User]:
        """Find users by role."""
        data = self._load_data()
        users = []
        for item in data:
            if item.get("role") == role:
                users.append(self._from_dict(item))
        return users

    def find_active_users(self) -> list[User]:
        """Find all active users."""
        data = self._load_data()
        users = []
        for item in data:
            if item.get("status") == "active":
                users.append(self._from_dict(item))
        return users

    def update_last_login(self, user_id: str, login_time: datetime) -> User | None:
        """Update user's last login time."""
        return self.update(user_id, {"last_login": login_time.isoformat()})

    def update_preferences(
        self, user_id: str, preferences: UserPreferences
    ) -> User | None:
        """Update user preferences."""
        return self.update(user_id, {"preferences": preferences.model_dump()})

    def update(self, user_id: str, updates) -> User | None:
        """Update user with UserUpdate object or dict."""
        # If updates is a UserUpdate object, convert to dict and exclude None values
        if hasattr(updates, 'model_dump'):
            update_dict = updates.model_dump(exclude_none=True)
        else:
            update_dict = updates
            
        # Convert any Pydantic models to dicts
        for key, value in update_dict.items():
            if hasattr(value, 'model_dump'):
                update_dict[key] = value.model_dump()
                
        return super().update(user_id, update_dict)
