"""
Base Utility Module

Provides globally available utility functions, such as ID generation.

@template — Custom Implementation (Shared Utilities)
"""

import uuid


def generate_uuid() -> str:
    """生成 UUID 字符串"""
    return str(uuid.uuid4())
