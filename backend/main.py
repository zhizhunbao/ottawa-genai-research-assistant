"""
🚀 Ottawa GenAI Research Assistant - Application Entry Point

This is the main entry point for running the FastAPI application with uvicorn.
The actual FastAPI app is defined in app/main.py
"""

import os
import sys
from pathlib import Path

import uvicorn


def setup_python_path():
    """设置Python路径以支持从任何目录启动"""
    current_dir = Path(__file__).parent.absolute()
    project_root = current_dir.parent  # 项目根目录
    
    # 检查当前是否在backend目录中
    if current_dir.name == "backend":
        # 从backend目录启动，添加backend目录到Python路径
        if str(current_dir) not in sys.path:
            sys.path.insert(0, str(current_dir))
        
        # 设置工作目录为backend目录
        os.chdir(current_dir)
        app_module = "app.main:app"
        
        print(f"🏠 启动目录: backend/")
        print(f"📍 工作目录: {current_dir}")
        
    else:
        # 从项目根目录启动，使用完整模块路径
        if str(project_root) not in sys.path:
            sys.path.insert(0, str(project_root))
            
        # 设置工作目录为项目根目录
        os.chdir(project_root)
        app_module = "backend.app.main:app"
        
        print(f"🏠 启动目录: 项目根目录")
        print(f"📍 工作目录: {project_root}")
    
    return app_module

if __name__ == "__main__":
    # 设置路径并获取正确的app模块路径
    app_module = setup_python_path()
    
    # 动态导入配置以避免路径问题
    try:
        if "backend" in str(Path.cwd()):
            from app.core.config import get_settings
        else:
            from backend.app.core.config import get_settings
        
        settings = get_settings()
        
        print(f"🚀 启动服务器...")
        print(f"🔧 模块路径: {app_module}")
        print(f"🐛 调试模式: {settings.DEBUG}")
        
        uvicorn.run(
            app_module,
            host="0.0.0.0",
            port=8000,
            reload=settings.DEBUG,
            log_level=settings.LOG_LEVEL.lower(),
        )
        
    except ImportError as e:
        print(f"❌ 导入配置失败: {e}")
        print("🔄 使用默认配置启动...")
        
        uvicorn.run(
            app_module,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
        )
