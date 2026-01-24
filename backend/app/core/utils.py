"""
基础工具模块

提供全局可用的工具函数，如 ID 生成。
遵循 dev-backend_patterns skill 规范。
"""

import uuid


def generate_uuid() -> str:
    """生成 UUID 字符串"""
    return str(uuid.uuid4())
