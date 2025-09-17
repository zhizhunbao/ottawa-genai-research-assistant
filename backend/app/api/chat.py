"""
💬 Chat API Endpoints

Handles natural language conversation with AI assistant.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.config import get_settings
from app.services.chat_service import ChatService

router = APIRouter()

# Request/Response Models
class ChatMessage(BaseModel):
    message: str
    language: Optional[str] = "en"
    context: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    response: str
    language: str
    timestamp: datetime
    sources: Optional[List[str]] = None
    charts: Optional[dict] = None

class ChatHistory(BaseModel):
    messages: List[dict]
    total: int

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatMessage,
    settings = Depends(get_settings)
):
    """
    Send a message to the AI assistant and get a response.
    
    - **message**: The user's question or message
    - **language**: Language preference (en/fr)
    - **context**: Optional context for the conversation
    """
    try:
        chat_service = ChatService(settings)
        
        # Process the message
        response = await chat_service.process_message(
            message=request.message,
            language=request.language,
            context=request.context
        )
        
        return ChatResponse(
            id=str(uuid.uuid4()),
            response=response["text"],
            language=request.language or "en",
            timestamp=datetime.now(),
            sources=response.get("sources", []),
            charts=response.get("charts")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/history", response_model=ChatHistory)
async def get_chat_history(
    limit: int = 50,
    offset: int = 0
):
    """
    Get chat history for the current session.
    
    - **limit**: Maximum number of messages to return
    - **offset**: Number of messages to skip (for pagination)
    """
    try:
        # TODO: Implement actual chat history retrieval from database
        # For now, return mock data
        mock_messages = [
            {
                "id": "1",
                "message": "What were the key economic indicators for Q3?",
                "response": "Based on the Q3 Economic Development Update...",
                "timestamp": "2024-01-15T10:30:00",
                "language": "en"
            }
        ]
        
        return ChatHistory(
            messages=mock_messages[offset:offset+limit],
            total=len(mock_messages)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@router.delete("/history")
async def clear_chat_history():
    """
    Clear all chat history for the current session.
    """
    try:
        # TODO: Implement actual chat history clearing
        return {"message": "Chat history cleared successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")

@router.get("/suggestions")
async def get_suggestions():
    """
    Get suggested questions based on available documents and common queries.
    """
    try:
        # TODO: Generate dynamic suggestions based on available documents
        suggestions = [
            "What are the main economic trends in Ottawa this quarter?",
            "Show me small business support program statistics",
            "How has employment changed in the tech sector?",
            "What are the key infrastructure projects planned?",
            "Summarize the latest economic development initiatives"
        ]
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggestions: {str(e)}") 