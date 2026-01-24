"""
🛡️ Path Validation Utilities

Provides security and validation for file paths to prevent creating
directories in unexpected locations.
"""

from pathlib import Path

# 定义允许的根目录
ALLOWED_ROOT_DIRS = {
    "backend",
    "frontend",
    "docs",
    "scripts",
    ".git",
    ".vscode",
    "node_modules",
}

# 定义项目根目录（相对于当前工作目录）
PROJECT_ROOT = Path.cwd()


def validate_path(path: str | Path) -> Path:
    """
    验证路径是否安全，确保不会在项目根目录创建意外的目录。

    Args:
        path: 要验证的路径

    Returns:
        Path: 验证后的安全路径

    Raises:
        ValueError: 如果路径不安全
    """
    path = Path(path)

    # 如果是绝对路径，检查是否在项目目录内
    if path.is_absolute():
        try:
            relative_path = path.relative_to(PROJECT_ROOT)
        except ValueError:
            raise ValueError(f"绝对路径必须在项目目录内: {path}")
    else:
        relative_path = path

    # 检查路径的第一个部分
    parts = relative_path.parts
    if parts and parts[0] not in ALLOWED_ROOT_DIRS:
        # 如果不在允许的根目录中，检查是否是隐藏文件/目录
        if not parts[0].startswith("."):
            allowed_dirs = ", ".join(ALLOWED_ROOT_DIRS)
            raise ValueError(
                f"不允许在项目根目录创建目录 '{parts[0]}'。允许的根目录: {allowed_dirs}"
            )

    return path


def safe_mkdir(path: str | Path, parents: bool = True, exist_ok: bool = True) -> Path:
    """
    安全地创建目录，包含路径验证。

    Args:
        path: 要创建的目录路径
        parents: 是否创建父目录
        exist_ok: 如果目录已存在是否忽略错误

    Returns:
        Path: 创建的目录路径

    Raises:
        ValueError: 如果路径不安全
    """
    validated_path = validate_path(path)
    validated_path.mkdir(parents=parents, exist_ok=exist_ok)
    return validated_path


def safe_resolve_path(path: str | Path, base_dir: str = "backend") -> Path:
    """
    安全地解析相对路径，确保在指定的基础目录下。

    Args:
        path: 要解析的路径
        base_dir: 基础目录，默认为 "backend"

    Returns:
        Path: 解析后的安全路径
    """
    path = Path(path)

    # 如果已经是绝对路径或以基础目录开头，直接验证
    if path.is_absolute() or (path.parts and path.parts[0] == base_dir):
        return validate_path(path)

    # 否则，将路径放在基础目录下
    safe_path = Path(base_dir) / path
    return validate_path(safe_path)


def get_project_relative_path(path: str | Path) -> str:
    """
    获取相对于项目根目录的路径字符串。

    Args:
        path: 输入路径

    Returns:
        str: 相对于项目根目录的路径字符串
    """
    path = Path(path)

    if path.is_absolute():
        try:
            return str(path.relative_to(PROJECT_ROOT))
        except ValueError:
            return str(path)

    return str(path)
