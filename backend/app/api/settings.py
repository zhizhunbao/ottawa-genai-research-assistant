"""
⚙️ Settings API Endpoints

Handles application settings and user preferences.
"""

from app.api.auth import get_current_user
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter()


# Request/Response Models
class UserPreferences(BaseModel):
    language: str = "en"
    theme: str = "auto"  # light, dark, auto
    font_size: str = "medium"  # small, medium, large, extra_large
    high_contrast: bool = False
    reduce_motion: bool = False
    notifications: bool = True

    @field_validator('language')
    @classmethod
    def validate_language(cls, v):
        if v not in ["en", "fr"]:
            raise ValueError('Language must be either "en" or "fr"')
        return v

    @field_validator('theme')
    @classmethod
    def validate_theme(cls, v):
        if v not in ["light", "dark", "auto"]:
            raise ValueError('Theme must be one of "light", "dark", or "auto"')
        return v

    @field_validator('font_size')
    @classmethod
    def validate_font_size(cls, v):
        if v not in ["small", "medium", "large", "extra_large"]:
            raise ValueError('Font size must be one of "small", "medium", "large", or "extra_large"')
        return v


class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
    supported: bool


class SystemInfo(BaseModel):
    version: str
    build_date: str
    features: list[str]
    ai_models: list[str]
    max_file_size_mb: int


@router.get("/languages")
async def get_supported_languages() -> dict[str, list[LanguageInfo]]:
    """
    Get list of supported languages for the application.
    """
    try:
        languages = [
            LanguageInfo(
                code="en",
                name="English",
                native_name="English",
                supported=True,
            ),
            LanguageInfo(
                code="fr",
                name="French",
                native_name="Français",
                supported=True,
            ),
        ]

        return {"languages": languages}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving languages: {str(e)}"
        )


@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences(current_user: User = Depends(get_current_user)):
    """
    Get current user preferences.
    """
    try:
        from app.repositories.user_repository import UserRepository
        
        user_repo = UserRepository()
        user = user_repo.find_by_id(current_user.id)
        
        if user and user.preferences:
            # Convert user preferences to API model
            return UserPreferences(
                language=getattr(user.preferences, 'language', 'en'),
                theme=getattr(user.preferences, 'theme', 'auto'),
                font_size=getattr(user.preferences, 'font_size', 'medium'),
                high_contrast=getattr(user.preferences, 'high_contrast', False),
                reduce_motion=getattr(user.preferences, 'reduce_motion', False),
                notifications=getattr(user.preferences, 'notifications', True),
            )
        else:
            # Return default preferences if user not found or no preferences set
            return UserPreferences()

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving preferences: {str(e)}"
        )


@router.post("/preferences", response_model=UserPreferences)
async def save_user_preferences(
    preferences: UserPreferences,
    current_user: User = Depends(get_current_user),
):
    """
    Save user preferences.

    - **language**: Preferred language (en/fr)
    - **theme**: UI theme preference (light/dark/auto)
    - **font_size**: Font size preference (small/medium/large/extra_large)
    - **high_contrast**: Enable high contrast mode
    - **reduce_motion**: Reduce animations and motion
    - **notifications**: Enable notifications
    """
    try:
        from app.models.user import UserPreferences as UserPrefModel
        from app.repositories.user_repository import UserRepository
        
        user_repo = UserRepository()
        
        # Create user preferences model (with validation)
        try:
            user_preferences = UserPrefModel(
                language=preferences.language,
                theme=preferences.theme,
                font_size=preferences.font_size,
                high_contrast=preferences.high_contrast,
                reduce_motion=preferences.reduce_motion,
                notifications=preferences.notifications,
                default_topics=getattr(preferences, 'default_topics', [])
            )
        except ValueError as ve:
            raise HTTPException(status_code=422, detail=str(ve))
        
        # Update user record
        updates = {
            "preferences": user_preferences.model_dump(),
        }
        
        updated_user = user_repo.update(current_user.id, updates)
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return preferences

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error saving preferences: {str(e)}"
        )


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
                "Accessibility Features",
            ],
            ai_models=["GPT-3.5-Turbo", "GPT-4", "Claude-3-Sonnet"],
            max_file_size_mb=50,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving system info: {str(e)}"
        )


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
                {"value": "extra_large", "label": "Extra Large", "px": 20},
            ],
            "contrast_modes": [
                {"value": "normal", "label": "Normal Contrast"},
                {"value": "high", "label": "High Contrast"},
                {"value": "extra_high", "label": "Extra High Contrast"},
            ],
            "motion_preferences": [
                {"value": "normal", "label": "Normal Motion"},
                {"value": "reduced", "label": "Reduced Motion"},
                {"value": "none", "label": "No Motion"},
            ],
            "screen_reader_support": True,
            "keyboard_navigation": True,
            "focus_indicators": True,
        }

        return accessibility_options

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving accessibility settings: {str(e)}",
        )


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
                    "description": (
                        "Portable Document Format with preserved formatting"
                    ),
                    "supports_charts": True,
                },
                {
                    "value": "word",
                    "label": "Microsoft Word",
                    "description": "Editable Word document (.docx)",
                    "supports_charts": True,
                },
                {
                    "value": "html",
                    "label": "Web Page",
                    "description": "HTML format for web viewing",
                    "supports_charts": True,
                },
                {
                    "value": "csv",
                    "label": "CSV Data",
                    "description": "Comma-separated values for data analysis",
                    "supports_charts": False,
                },
            ],
            "quality_options": ["low", "medium", "high"],
            "page_sizes": ["letter", "a4", "legal"],
            "orientations": ["portrait", "landscape"],
        }

        return export_options

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving export options: {str(e)}",
        )


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
                "description": "Fast and efficient AI model suitable for general chat and basic analysis tasks",
                "capabilities": ["chat", "analysis", "summarization"],
                "languages": ["en", "fr"],
                "max_tokens": 4000,
                "cost": "low",
                "speed": "fast",
            },
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "OpenAI",
                "description": "Advanced AI model with superior reasoning capabilities for complex tasks",
                "capabilities": [
                    "chat",
                    "analysis",
                    "summarization",
                    "complex_reasoning",
                ],
                "languages": ["en", "fr"],
                "max_tokens": 8000,
                "cost": "high",
                "speed": "medium",
            },
            {
                "id": "claude-3-sonnet",
                "name": "Claude 3 Sonnet",
                "provider": "Anthropic",
                "description": "Powerful AI model with exceptional document processing and analytical capabilities",
                "capabilities": [
                    "chat",
                    "analysis",
                    "summarization",
                    "document_processing",
                ],
                "languages": ["en", "fr"],
                "max_tokens": 200000,
                "cost": "medium",
                "speed": "fast",
            },
        ]

        return {"models": ai_models}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving AI models: {str(e)}"
        )


@router.post("/reset")
async def reset_settings(current_user: User = Depends(get_current_user)):
    """
    Reset all settings to default values.
    """
    try:
        from app.models.user import UserPreferences as UserPrefModel
        from app.repositories.user_repository import UserRepository
        
        user_repo = UserRepository()
        
        # Reset to default preferences
        default_preferences = UserPrefModel()
        
        updates = {
            "preferences": default_preferences.model_dump(),
        }
        
        updated_user = user_repo.update(current_user.id, updates)
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "message": "Settings reset to defaults successfully",
            "preferences": UserPreferences(),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error resetting settings: {str(e)}"
        )
