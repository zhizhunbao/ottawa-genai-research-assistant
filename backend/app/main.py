"""
Ottawa GenAI Research Assistant Backend

FastAPI 应用入口模块。
遵循 dev-backend_patterns 和 dev-tdd_workflow skill 规范。
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import AppException
from app.users import models as user_models
from app.core import models as shared_models
from app.users.routes import router as users_router
from app.research.routes import router as research_router
from app.analysis.routes import router as analysis_router
from app.documents.routes import router as documents_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期管理"""
    # 启动时执行
    print(f"Starting {settings.app_name}...")
    await init_db()
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

# 注册路由（prefix 在各模块的 routes.py 中定义）
app.include_router(users_router)
app.include_router(research_router)
app.include_router(analysis_router)
app.include_router(documents_router)


# 全局异常处理器
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """处理自定义应用异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": exc.message,
            "detail": exc.detail,
        },
    )


@app.get("/")
async def root() -> dict[str, str]:
    """根路径健康检查"""
    return {"message": "Ottawa GenAI Research Assistant API", "status": "healthy"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """健康检查端点"""
    return {"status": "healthy"}
