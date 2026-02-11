"""
自定义异常模块

定义应用级别的自定义异常类。
遵循 dev-security_review skill 的错误处理规范。
遵循 dev-tdd_workflow skill 规范。
"""

from typing import Any


class AppError(Exception):
    """应用基础异常类"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        detail: Any | None = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)


class NotFoundError(AppError):
    """资源不存在异常"""

    def __init__(self, resource: str, resource_id: str | None = None) -> None:
        message = f"{resource} 不存在"
        if resource_id:
            message = f"{resource} (ID: {resource_id}) 不存在"
        super().__init__(message=message, status_code=404)


class ValidationError(AppError):
    """验证失败异常"""

    def __init__(self, message: str, detail: Any | None = None) -> None:
        super().__init__(message=message, status_code=400, detail=detail)


class UnauthorizedError(AppError):
    """未授权异常"""

    def __init__(self, message: str = "未授权访问") -> None:
        super().__init__(message=message, status_code=401)


class ForbiddenError(AppError):
    """禁止访问异常"""

    def __init__(self, message: str = "权限不足") -> None:
        super().__init__(message=message, status_code=403)


class ConflictError(AppError):
    """资源冲突异常"""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=409)


class RateLimitError(AppError):
    """速率限制异常"""

    def __init__(self, message: str = "请求过于频繁，请稍后重试") -> None:
        super().__init__(message=message, status_code=429)


class ExternalServiceError(AppError):
    """外部服务异常"""

    def __init__(self, service: str, message: str | None = None) -> None:
        msg = f"外部服务 {service} 调用失败"
        if message:
            msg = f"{msg}: {message}"
        super().__init__(message=msg, status_code=503)
