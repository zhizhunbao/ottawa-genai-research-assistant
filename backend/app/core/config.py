"""
应用配置模块

使用 pydantic-settings 管理环境变量和应用配置。
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Ottawa GenAI Research Assistant"
    app_env: str = "development"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite+aiosqlite:///./app.db"

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    # Azure OpenAI
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_deployment: str = "gpt-4"
    azure_openai_api_version: str = "2024-02-15-preview"

    # Azure AI Search
    azure_search_endpoint: str = ""
    azure_search_api_key: str = ""
    azure_search_index_name: str = "research-index"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @property
    def is_production(self) -> bool:
        """检查是否为生产环境"""
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """获取缓存的配置实例"""
    return Settings()


settings = get_settings()
