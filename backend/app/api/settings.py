"""
⚙️ Settings API Endpoints

Handles application settings and user preferences.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

# Request/Response Models
class UserPreferences(BaseModel):
    language: str = "en"
    theme: str = "auto"  # light, dark, auto
    font_size: str = "medium"  # small, medium, large
    high_contrast: bool = False
    reduce_motion: bool = False
    notifications: bool = True

class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
    supported: bool

class SystemInfo(BaseModel):
    version: str
    build_date: str
    features: List[str]
    ai_models: List[str]
    max_file_size_mb: int

@router.get("/languages")
async def get_supported_languages() -> Dict[str, List[LanguageInfo]]:
    """
    Get list of supported languages for the application.
    """
    try:
        languages = [
            LanguageInfo(
                code="en",
                name="English",
                native_name="English",
                supported=True
            ),
            LanguageInfo(
                code="fr",
                name="French",
                native_name="Français",
                supported=True
            )
        ]
        
        return {"languages": languages}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving languages: {str(e)}")

@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences():
    """
    Get current user preferences.
    """
    try:
        # TODO: Implement actual user preference retrieval
        # For now, return default preferences
        return UserPreferences()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving preferences: {str(e)}")

@router.post("/preferences", response_model=UserPreferences)
async def save_user_preferences(preferences: UserPreferences):
    """
    Save user preferences.
    
    - **language**: Preferred language (en/fr)
    - **theme**: UI theme preference (light/dark/auto)
    - **font_size**: Font size preference (small/medium/large)
    - **high_contrast**: Enable high contrast mode
    - **reduce_motion**: Reduce animations and motion
    - **notifications**: Enable notifications
    """
    try:
        # TODO: Implement actual preference saving to database
        # For now, just return the received preferences
        
        return preferences
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving preferences: {str(e)}")

@router.get("/system-info", response_model=SystemInfo)
async def get_system_info():
    """
    Get system information and capabilities.
    """
    try:
        return SystemInfo(
            version="1.0.0",
            build_date="2024-01-15",
            features=[
                "Natural Language Chat",
                "PDF Document Processing",
                "Report Generation",
                "Data Visualization",
                "Bilingual Support",
                "Accessibility Features"
            ],
            ai_models=[
                "GPT-3.5-Turbo",
                "GPT-4",
                "Claude-3-Sonnet"
            ],
            max_file_size_mb=50
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving system info: {str(e)}")

@router.get("/accessibility")
async def get_accessibility_settings():
    """
    Get accessibility-specific settings and options.
    """
    try:
        accessibility_options = {
            "font_sizes": [
                {"value": "small", "label": "Small", "px": 14},
                {"value": "medium", "label": "Medium", "px": 16},
                {"value": "large", "label": "Large", "px": 18},
                {"value": "extra_large", "label": "Extra Large", "px": 20}
            ],
            "contrast_modes": [
                {"value": "normal", "label": "Normal Contrast"},
                {"value": "high", "label": "High Contrast"},
                {"value": "extra_high", "label": "Extra High Contrast"}
            ],
            "motion_preferences": [
                {"value": "normal", "label": "Normal Motion"},
                {"value": "reduced", "label": "Reduced Motion"},
                {"value": "none", "label": "No Motion"}
            ],
            "screen_reader_support": True,
            "keyboard_navigation": True,
            "focus_indicators": True
        }
        
        return accessibility_options
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving accessibility settings: {str(e)}")

@router.get("/export-options")
async def get_export_options():
    """
    Get available export formats and options.
    """
    try:
        export_options = {
            "formats": [
                {
                    "value": "pdf",
                    "label": "PDF Document",
                    "description": "Portable Document Format with preserved formatting",
                    "supports_charts": True
                },
                {
                    "value": "word",
                    "label": "Microsoft Word",
                    "description": "Editable Word document (.docx)",
                    "supports_charts": True
                },
                {
                    "value": "html",
                    "label": "Web Page",
                    "description": "HTML format for web viewing",
                    "supports_charts": True
                },
                {
                    "value": "csv",
                    "label": "CSV Data",
                    "description": "Comma-separated values for data analysis",
                    "supports_charts": False
                }
            ],
            "quality_options": ["low", "medium", "high"],
            "page_sizes": ["letter", "a4", "legal"],
            "orientations": ["portrait", "landscape"]
        }
        
        return export_options
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving export options: {str(e)}")

@router.get("/ai-models")
async def get_ai_models():
    """
    Get available AI models and their capabilities.
    """
    try:
        ai_models = [
            {
                "id": "gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo",
                "provider": "OpenAI",
                "capabilities": ["chat", "analysis", "summarization"],
                "languages": ["en", "fr"],
                "max_tokens": 4000,
                "cost": "low",
                "speed": "fast"
            },
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "OpenAI",
                "capabilities": ["chat", "analysis", "summarization", "complex_reasoning"],
                "languages": ["en", "fr"],
                "max_tokens": 8000,
                "cost": "high",
                "speed": "medium"
            },
            {
                "id": "claude-3-sonnet",
                "name": "Claude 3 Sonnet",
                "provider": "Anthropic",
                "capabilities": ["chat", "analysis", "summarization", "document_processing"],
                "languages": ["en", "fr"],
                "max_tokens": 200000,
                "cost": "medium",
                "speed": "fast"
            }
        ]
        
        return {"models": ai_models}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving AI models: {str(e)}")

@router.post("/reset")
async def reset_settings():
    """
    Reset all settings to default values.
    """
    try:
        # TODO: Implement actual settings reset
        return {
            "message": "Settings reset to defaults successfully",
            "preferences": UserPreferences()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting settings: {str(e)}") 