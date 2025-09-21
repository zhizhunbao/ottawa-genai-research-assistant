"""
🔒 Data Constraints

确保所有数据生成和存储都遵循monk目录约束
"""

import functools
from pathlib import Path
from typing import Any, Callable, TypeVar, Union

from app.core.data_paths import monk_paths

F = TypeVar("F", bound=Callable[..., Any])


class DataConstraintError(Exception):
    """数据约束违规异常"""
    pass


def validate_monk_path(path: Union[str, Path]) -> Path:
    """验证路径是否在monk目录下"""
    path_obj = Path(path)
    
    # 检查路径是否以monk开头
    if not monk_paths.validate_monk_path(str(path)):
        raise DataConstraintError(
            f"数据文件路径必须在monk目录下: {path}. "
            f"请使用monk_paths.get_data_file_path()获取正确路径。"
        )
    
    return path_obj


def enforce_monk_directory(func: F) -> F:
    """装饰器：强制函数的data_file参数必须在monk目录下"""
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # 检查data_file参数
        if 'data_file' in kwargs:
            if kwargs['data_file'] is not None:
                validate_monk_path(kwargs['data_file'])
        
        # 检查位置参数中的data_file（通常是第一个参数）
        if len(args) > 1 and isinstance(args[1], str):
            validate_monk_path(args[1])
        
        return func(*args, **kwargs)
    
    return wrapper


def validate_data_operation(operation_type: str, file_path: str) -> bool:
    """验证数据操作是否符合约束"""
    try:
        validate_monk_path(file_path)
        print(f"✅ 数据操作验证通过: {operation_type} -> {file_path}")
        return True
    except DataConstraintError as e:
        print(f"❌ 数据操作违反约束: {operation_type} -> {file_path}")
        print(f"   错误: {e}")
        return False


class MonkDataValidator:
    """monk目录数据验证器"""
    
    @staticmethod
    def validate_create_operation(file_path: str) -> None:
        """验证数据创建操作"""
        if not validate_data_operation("CREATE", file_path):
            raise DataConstraintError(f"数据创建操作被拒绝: {file_path}")
    
    @staticmethod
    def validate_write_operation(file_path: str) -> None:
        """验证数据写入操作"""
        if not validate_data_operation("WRITE", file_path):
            raise DataConstraintError(f"数据写入操作被拒绝: {file_path}")
    
    @staticmethod
    def validate_repository_init(data_file: str) -> None:
        """验证仓库初始化"""
        if not validate_data_operation("REPOSITORY_INIT", data_file):
            raise DataConstraintError(f"仓库初始化被拒绝: {data_file}")
    
    @staticmethod
    def get_recommended_paths() -> dict[str, str]:
        """获取推荐的数据路径"""
        return {
            "用户数据": monk_paths.USERS_FILE,
            "文档数据": monk_paths.DOCUMENTS_FILE,
            "文档块数据": monk_paths.CHUNKS_FILE,
            "对话数据": monk_paths.CONVERSATIONS_FILE,
            "消息数据": monk_paths.MESSAGES_FILE,
            "报告数据": monk_paths.REPORTS_FILE,
            "系统设置": monk_paths.SYSTEM_SETTINGS_FILE,
        }


# 全局验证器实例
data_validator = MonkDataValidator()


def print_data_constraints_info():
    """打印数据约束信息"""
    print("\n" + "="*60)
    print("📂 MONK 数据目录约束")
    print("="*60)
    print("✅ 所有数据必须存储在 monk/ 目录下")
    print("✅ 使用 monk_paths 获取标准路径")
    print("✅ 仓库类已配置默认monk路径")
    print("\n推荐路径:")
    
    for desc, path in data_validator.get_recommended_paths().items():
        print(f"  📁 {desc}: {path}")
    
    print("="*60 + "\n")


# 启动时显示约束信息
if __name__ != "__main__":
    print_data_constraints_info() 