"""
📂 Data Paths Management

统一管理所有数据文件路径，确保所有生成的数据都存放在 monk/ 目录下
"""

from pathlib import Path
from typing import Dict


class MonkDataPaths:
    """monk/ 目录数据路径管理器"""
    
    # 基础路径
    MONK_BASE_DIR = "monk"
    
    # 各模块数据路径
    USERS_FILE = f"{MONK_BASE_DIR}/users/users.json"
    DOCUMENTS_FILE = f"{MONK_BASE_DIR}/documents/documents.json"
    CHUNKS_FILE = f"{MONK_BASE_DIR}/documents/chunks.json"
    CONVERSATIONS_FILE = f"{MONK_BASE_DIR}/chats/conversations.json"
    MESSAGES_FILE = f"{MONK_BASE_DIR}/chats/messages.json"
    REPORTS_FILE = f"{MONK_BASE_DIR}/reports/reports.json"
    SYSTEM_SETTINGS_FILE = f"{MONK_BASE_DIR}/system/settings.json"
    
    # 目录路径
    USERS_DIR = f"{MONK_BASE_DIR}/users"
    DOCUMENTS_DIR = f"{MONK_BASE_DIR}/documents"
    CHATS_DIR = f"{MONK_BASE_DIR}/chats"
    REPORTS_DIR = f"{MONK_BASE_DIR}/reports"
    SYSTEM_DIR = f"{MONK_BASE_DIR}/system"
    VECTOR_DB_DIR = f"{MONK_BASE_DIR}/vector_db"
    
    @classmethod
    def ensure_monk_directories(cls) -> None:
        """确保所有monk目录存在"""
        directories = [
            cls.USERS_DIR,
            cls.DOCUMENTS_DIR,
            cls.CHATS_DIR,
            cls.REPORTS_DIR,
            cls.SYSTEM_DIR,
            cls.VECTOR_DB_DIR,
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_data_file_path(cls, data_type: str) -> str:
        """根据数据类型获取对应的文件路径"""
        path_mapping = {
            "users": cls.USERS_FILE,
            "documents": cls.DOCUMENTS_FILE,
            "chunks": cls.CHUNKS_FILE,
            "conversations": cls.CONVERSATIONS_FILE,
            "messages": cls.MESSAGES_FILE,
            "reports": cls.REPORTS_FILE,
            "system_settings": cls.SYSTEM_SETTINGS_FILE,
        }
        
        if data_type not in path_mapping:
            raise ValueError(f"Unknown data type: {data_type}")
        
        return path_mapping[data_type]
    
    @classmethod
    def get_directory_path(cls, directory_type: str) -> str:
        """根据目录类型获取对应的目录路径"""
        directory_mapping = {
            "users": cls.USERS_DIR,
            "documents": cls.DOCUMENTS_DIR,
            "chats": cls.CHATS_DIR,
            "reports": cls.REPORTS_DIR,
            "system": cls.SYSTEM_DIR,
            "vector_db": cls.VECTOR_DB_DIR,
        }
        
        if directory_type not in directory_mapping:
            raise ValueError(f"Unknown directory type: {directory_type}")
        
        return directory_mapping[directory_type]
    
    @classmethod
    def validate_monk_path(cls, path: str) -> bool:
        """验证路径是否在monk目录下"""
        path_parts = Path(path).parts
        # 检查路径的第一部分是否为"monk"（正常情况）
        # 或者路径中包含"monk"目录（测试环境临时目录）
        return path_parts[0] == "monk" or "monk" in path_parts
    
    @classmethod
    def get_all_data_files(cls) -> Dict[str, str]:
        """获取所有数据文件路径"""
        return {
            "users": cls.USERS_FILE,
            "documents": cls.DOCUMENTS_FILE,
            "chunks": cls.CHUNKS_FILE,
            "conversations": cls.CONVERSATIONS_FILE,
            "messages": cls.MESSAGES_FILE,
            "reports": cls.REPORTS_FILE,
            "system_settings": cls.SYSTEM_SETTINGS_FILE,
        }


# 全局实例
monk_paths = MonkDataPaths()

# 初始化monk目录结构
monk_paths.ensure_monk_directories() 