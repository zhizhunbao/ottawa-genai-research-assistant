#!/usr/bin/env python3
"""
🧪 Test Runner Script

使用真实monk数据的测试运行脚本
支持多种测试运行模式和配置
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd, description=""):
    """运行命令并处理结果"""
    print(f"\n🚀 {description}")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=False)
        print(f"✅ {description} - Success!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed with exit code {e.returncode}")
        return False


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="运行Ottawa GenAI研究助手测试套件")
    
    # 测试类型选项
    parser.add_argument(
        "--type", 
        choices=["all", "unit", "integration", "api", "auth", "chat", "user"],
        default="all",
        help="选择要运行的测试类型"
    )
    
    # 测试模式选项
    parser.add_argument(
        "--mode",
        choices=["fast", "full", "coverage"],
        default="fast", 
        help="选择测试运行模式"
    )
    
    # 详细输出
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="启用详细输出"
    )
    
    # 停止在第一个失败
    parser.add_argument(
        "--fail-fast", "-x",
        action="store_true",
        help="在第一个失败时停止"
    )
    
    # 并行运行
    parser.add_argument(
        "--parallel", "-n",
        type=int,
        help="并行运行测试的进程数"
    )
    
    # 特定测试文件
    parser.add_argument(
        "--file",
        help="运行特定测试文件"
    )
    
    # 生成HTML报告
    parser.add_argument(
        "--html-report",
        action="store_true",
        help="生成HTML测试报告"
    )
    
    args = parser.parse_args()
    
    # 确保在正确的目录中
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("🏛️ Ottawa GenAI Research Assistant - Test Suite")
    print("=" * 60)
    print(f"📍 Working directory: {backend_dir}")
    print(f"🎯 Test type: {args.type}")
    print(f"⚙️  Test mode: {args.mode}")
    
    # 检查monk数据
    monk_dir = backend_dir / "monk"
    if monk_dir.exists():
        print(f"✅ Found monk data directory: {monk_dir}")
        
        # 检查用户数据
        users_file = monk_dir / "users" / "users.json"
        if users_file.exists():
            print(f"✅ Found users data: {users_file}")
        else:
            print(f"⚠️  Users data not found: {users_file}")
        
        # 检查聊天数据
        chats_dir = monk_dir / "chats"
        if chats_dir.exists():
            print(f"✅ Found chats directory: {chats_dir}")
        else:
            print(f"⚠️  Chats directory not found: {chats_dir}")
    else:
        print(f"⚠️  Monk data directory not found: {monk_dir}")
        print("   Tests will use fallback sample data")
    
    # 构建pytest命令
    cmd = ["python", "-m", "pytest"]
    
    # 添加基本选项
    if args.verbose:
        cmd.append("-v")
    else:
        cmd.append("-q")
    
    if args.fail_fast:
        cmd.append("-x")
    
    # 添加并行选项
    if args.parallel:
        cmd.extend(["-n", str(args.parallel)])
    
    # 添加测试类型标记
    if args.type != "all":
        cmd.extend(["-m", args.type])
    
    # 添加特定文件
    if args.file:
        cmd.append(args.file)
    else:
        cmd.append(".")
    
    # 根据模式添加选项
    if args.mode == "coverage":
        cmd.extend([
            "--cov=app",
            "--cov-report=html:htmlcov",
            "--cov-report=term-missing",
            "--cov-report=xml"
        ])
        print("📊 Coverage reporting enabled")
    
    elif args.mode == "full":
        cmd.extend([
            "--tb=long",
            "--durations=20"
        ])
        print("🔍 Full test mode with detailed output")
    
    else:  # fast mode
        cmd.extend([
            "--tb=short",
            "--durations=5"
        ])
        print("⚡ Fast test mode")
    
    # 添加HTML报告
    if args.html_report:
        cmd.extend([
            "--html=test_report.html",
            "--self-contained-html"
        ])
        print("📝 HTML report will be generated")
    
    # 运行测试
    success = run_command(cmd, "Running tests")
    
    # 显示结果摘要
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests completed successfully!")
        
        # 显示生成的报告文件
        reports = []
        if args.mode == "coverage":
            if (backend_dir / "htmlcov" / "index.html").exists():
                reports.append("Coverage report: htmlcov/index.html")
            if (backend_dir / "coverage.xml").exists():
                reports.append("Coverage XML: coverage.xml")
        
        if args.html_report and (backend_dir / "test_report.html").exists():
            reports.append("Test report: test_report.html")
        
        if reports:
            print("\n📊 Generated reports:")
            for report in reports:
                print(f"   - {report}")
    else:
        print("💥 Some tests failed!")
        print("   Check the output above for details")
        sys.exit(1)


if __name__ == "__main__":
    main() 