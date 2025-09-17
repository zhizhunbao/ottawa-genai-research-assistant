"""
聊天相关的数据访问层
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.chat import Conversation, Message
from app.repositories.base import BaseRepository


class ChatRepository(BaseRepository[Conversation]):
    """聊天仓库类"""
    
    def __init__(self, db: Session):
        super().__init__(Conversation, db)
    
    def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """获取用户的所有对话"""
        return self.db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.created_at.desc()).all()
    
    def get_conversation_with_messages(self, conversation_id: str) -> Optional[Conversation]:
        """获取包含消息的对话"""
        return self.db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
    
    def add_message(self, message: Message) -> Message:
        """添加消息到对话"""
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
    
    def get_conversation_messages(self, conversation_id: str) -> List[Message]:
        """获取对话的所有消息"""
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
    
    def update_conversation_title(self, conversation_id: str, title: str) -> Optional[Conversation]:
        """更新对话标题"""
        conversation = self.get(conversation_id)
        if conversation:
            conversation.title = title
            self.db.commit()
            self.db.refresh(conversation)
        return conversation
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """删除对话及其所有消息"""
        conversation = self.get(conversation_id)
        if conversation:
            # 删除所有消息
            self.db.query(Message).filter(
                Message.conversation_id == conversation_id
            ).delete()
            # 删除对话
            self.db.delete(conversation)
            self.db.commit()
            return True
        return False


class MessageRepository(BaseRepository[Message]):
    """消息仓库类"""
    
    def __init__(self, db: Session):
        super().__init__(Message, db)
    
    def get_messages_by_conversation(self, conversation_id: str) -> List[Message]:
        """根据对话ID获取消息"""
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
    
    def get_latest_message(self, conversation_id: str) -> Optional[Message]:
        """获取对话的最新消息"""
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.desc()).first()
    
    def update_message_content(self, message_id: str, content: str) -> Optional[Message]:
        """更新消息内容"""
        message = self.get(message_id)
        if message:
            message.content = content
            self.db.commit()
            self.db.refresh(message)
        return message 