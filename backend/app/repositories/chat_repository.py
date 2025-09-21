"""Chat repository for JSON file storage."""






from datetime import datetime, timezone
from datetime import datetime, timezone
from typing import Any
from app.core.data_paths import monk_paths
from app.models.chat import Conversation, Message
from .base import BaseRepository

class ConversationRepository(BaseRepository[Conversation]):
    """Repository for conversation data operations."""

    def __init__(self, data_file: str | None = None):
        if data_file is None:
            data_file = monk_paths.get_data_file_path("conversations")
        super().__init__(data_file)

    def _to_dict(self, conversation: Conversation) -> dict[str, Any]:
        """Convert Conversation model to dictionary."""
        return conversation.model_dump()

    def _from_dict(self, data: dict[str, Any]) -> Conversation:
        """Convert dictionary to Conversation model."""
        # Convert string dates to datetime objects
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(
                data["created_at"].replace("Z", "+00:00")
            )
        if isinstance(data.get("updated_at"), str):
            data["updated_at"] = datetime.fromisoformat(
                data["updated_at"].replace("Z", "+00:00")
            )

        return Conversation(**data)

    def find_by_user(self, user_id: str) -> list[Conversation]:
        """Find all conversations for a user."""
        data = self._load_data()
        conversations = []
        for item in data:
            if item.get("user_id") == user_id:
                conversations.append(self._from_dict(item))
        return sorted(conversations, key=lambda x: x.updated_at, reverse=True)

    def find_by_status(self, status: str) -> list[Conversation]:
        """Find conversations by status."""
        data = self._load_data()
        conversations = []
        for item in data:
            if item.get("status") == status:
                conversations.append(self._from_dict(item))
        return conversations

    def find_by_language(self, language: str) -> list[Conversation]:
        """Find conversations by language."""
        data = self._load_data()
        conversations = []
        for item in data:
            if item.get("language") == language:
                conversations.append(self._from_dict(item))
        return conversations

    def update_title(self, conversation_id: str, title: str) -> Conversation | None:
        """Update conversation title."""
        updates = {
            "title": title,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        return self.update(conversation_id, updates)

    def update_status(self, conversation_id: str, status: str) -> Conversation | None:
        """Update conversation status."""
        updates = {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        return self.update(conversation_id, updates)

    def clear_user_conversations(self, user_id: str) -> bool:
        """Clear all conversations for a user."""
        try:
            data = self._load_data()
            # Remove all conversations for the user
            data = [item for item in data if item.get("user_id") != user_id]
            self._save_data(data)
            return True
        except Exception:
            return False


class MessageRepository(BaseRepository[Message]):
    """Repository for message data operations."""

    def __init__(self, data_file: str | None = None):
        if data_file is None:
            data_file = monk_paths.get_data_file_path("messages")
        super().__init__(data_file)

    def _to_dict(self, message: Message) -> dict[str, Any]:
        """Convert Message model to dictionary."""
        return message.model_dump()

    def _from_dict(self, data: dict[str, Any]) -> Message:
        """Convert dictionary to Message model."""
        # Convert string dates to datetime objects
        if isinstance(data.get("timestamp"), str):
            data["timestamp"] = datetime.fromisoformat(
                data["timestamp"].replace("Z", "+00:00")
            )

        return Message(**data)

    def find_by_conversation(
        self, conversation_id: str, limit: int = 50, offset: int = 0
    ) -> list[Message]:
        """Find messages by conversation ID with pagination."""
        data = self._load_data()
        messages = []
        for item in data:
            if item.get("conversation_id") == conversation_id:
                messages.append(self._from_dict(item))
        
        # Sort by timestamp
        messages.sort(key=lambda x: x.timestamp)
        
        # Apply pagination
        return messages[offset: offset + limit]

    def find_by_role(self, role: str) -> list[Message]:
        """Find messages by role."""
        data = self._load_data()
        messages = []
        for item in data:
            if item.get("role") == role:
                messages.append(self._from_dict(item))
        return messages

    def get_latest_message(self, conversation_id: str) -> Message | None:
        """Get the latest message in a conversation."""
        data = self._load_data()
        latest_message = None
        latest_timestamp = None
        
        for item in data:
            if item.get("conversation_id") == conversation_id:
                timestamp = datetime.fromisoformat(
                    item["timestamp"].replace("Z", "+00:00")
                )
                if latest_timestamp is None or timestamp > latest_timestamp:
                    latest_timestamp = timestamp
                    latest_message = self._from_dict(item)
        
        return latest_message

    def count_messages_in_conversation(self, conversation_id: str) -> int:
        """Count messages in a conversation."""
        data = self._load_data()
        count = 0
        for item in data:
            if item.get("conversation_id") == conversation_id:
                count += 1
        return count

    def clear_conversation_messages(self, conversation_id: str) -> bool:
        """Clear all messages in a conversation."""
        try:
            data = self._load_data()
            # Remove all messages for the conversation
            data = [item for item in data if item.get("conversation_id") != conversation_id]
            self._save_data(data)
            return True
        except Exception:
            return False
