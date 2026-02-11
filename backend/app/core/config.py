"""
应用配置模块

使用 pydantic-settings 管理环境变量和应用配置。
遵循 dev-backend_patterns skill 规范。
遵循 dev-tdd_workflow skill 规范。
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 应用配置
    app_name: str = "Ottawa GenAI Research Assistant"
    app_env: str = "development"
    debug: bool = True

    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 8000

    # 数据库配置
    database_url: str = "sqlite+aiosqlite:///./app.db"

    # 安全配置
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    # Azure OpenAI
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_api_version: str = "2024-02-15-preview"
    azure_openai_chat_deployment: str = "gpt-4o-mini"
    azure_openai_embedding_deployment: str = "text-embedding-ada-002"

    # Azure AI Search
    azure_search_endpoint: str = ""
    azure_search_api_key: str = ""
    azure_search_index_name: str = "research-index"

    # Azure Blob Storage
    azure_storage_connection_string: str = ""
    azure_storage_container_name: str = "documents"

    # Azure Key Vault (Production)
    azure_key_vault_url: str = ""

    # Azure AD / Entra ID Authentication
    azure_ad_tenant_id: str = ""
    azure_ad_client_id: str = ""

    # CORS 配置
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def is_production(self) -> bool:
        """检查是否为生产环境"""
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """获取缓存的配置实例"""
    return Settings()


settings = get_settings()
