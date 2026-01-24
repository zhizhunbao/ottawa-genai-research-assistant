"""
Ottawa GenAI Research Assistant Backend

FastAPI 应用入口模块。
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.users.routes import router as users_router
from app.research.routes import router as research_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期管理"""
    # 启动时执行
    print(f"Starting {settings.app_name}...")
    yield
    # 关闭时执行
    print("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="Ottawa GenAI Research Assistant API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(research_router, prefix="/api/v1/research", tags=["research"])


@app.get("/")
async def root() -> dict[str, str]:
    """根路径健康检查"""
    return {"message": "Ottawa GenAI Research Assistant API", "status": "healthy"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """健康检查端点"""
    return {"status": "healthy"}
