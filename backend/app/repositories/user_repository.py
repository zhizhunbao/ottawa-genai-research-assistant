"""User repository."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from app.models.user import User, UserMetadata, UserPreferences

from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for user data operations."""

    def __init__(self, data_file: str = "monk/users/users.json"):
        super().__init__(data_file)

    def _to_dict(self, user: User) -> Dict[str, Any]:
        """Convert User model to dictionary."""
        return user.model_dump()

    def _from_dict(self, data: Dict[str, Any]) -> User:
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

        # Handle metadata - ensure it's a dict or create default
        metadata = data.get("metadata")
        if isinstance(metadata, str):
            # If it's a string, create default metadata
            data["metadata"] = UserMetadata().model_dump()
        elif not metadata:
            data["metadata"] = UserMetadata().model_dump()

        return User(**data)

    def find_by_username(self, username: str) -> Optional[User]:
        """Find user by username."""
        data = self._load_data()
        for item in data:
            if item.get("username") == username:
                return self._from_dict(item)
        return None

    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email."""
        data = self._load_data()
        for item in data:
            if item.get("email") == email:
                return self._from_dict(item)
        return None

    def find_by_role(self, role: str) -> List[User]:
        """Find users by role."""
        data = self._load_data()
        users = []
        for item in data:
            if item.get("role") == role:
                users.append(self._from_dict(item))
        return users

    def find_active_users(self) -> List[User]:
        """Find all active users."""
        data = self._load_data()
        users = []
        for item in data:
            if item.get("status") == "active":
                users.append(self._from_dict(item))
        return users

    def update_last_login(self, user_id: str, login_time: datetime) -> Optional[User]:
        """Update user's last login time."""
        return self.update(user_id, {"last_login": login_time.isoformat()})

    def update_preferences(
        self, user_id: str, preferences: UserPreferences
    ) -> Optional[User]:
        """Update user preferences."""
        return self.update(user_id, {"preferences": preferences.model_dump()})
