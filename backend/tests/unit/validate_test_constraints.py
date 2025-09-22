#!/usr/bin/env python3
"""
测试约束验证器 | Test Constraint Validator

检查测试是否违反了目录约束规则：
- 测试不应在项目根目录创建文件或目录
- 测试不应在tests/目录之外创建临时文件

Check if tests violate directory constraint rules:
- Tests should not create files or directories in project root
- Tests should not create temporary files outside tests/ directory
"""

import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import List, Set


class TestConstraintValidator:
    """测试约束验证器"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.before_files: Set[Path] = set()
        self.before_dirs: Set[Path] = set()
        
    def capture_initial_state(self) -> None:
        """捕获测试前的文件系统状态"""
        print("📸 Capturing initial filesystem state...")
        
        # 记录根目录下的文件和目录
        for item in self.project_root.iterdir():
            if item.is_file():
                self.before_files.add(item)
            elif item.is_dir():
                self.before_dirs.add(item)
    
    def run_tests(self) -> bool:
        """运行测试"""
        print("🧪 Running tests...")
        
        try:
            # 确定测试目录路径
            backend_dir = self.project_root / "backend"
            tests_dir = backend_dir / "tests"
            
            if not tests_dir.exists():
                print(f"❌ Tests directory not found: {tests_dir}")
                return False
            
            # 运行pytest
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                str(tests_dir), "-v", "--tb=short"
            ], cwd=backend_dir, capture_output=True, text=True)
            
            print(f"Test exit code: {result.returncode}")
            if result.stdout:
                print("STDOUT:", result.stdout[-500:])  # 显示最后500字符
            if result.stderr:
                print("STDERR:", result.stderr[-500:])  # 显示最后500字符
                
            return result.returncode == 0
            
        except Exception as e:
            print(f"❌ Error running tests: {e}")
            return False
    
    def check_violations(self) -> List[str]:
        """检查是否有违规的文件创建"""
        print("🔍 Checking for constraint violations...")
        
        violations = []
        
        # 检查新创建的文件
        current_files = set()
        current_dirs = set()
        
        for item in self.project_root.iterdir():
            if item.is_file():
                current_files.add(item)
            elif item.is_dir():
                current_dirs.add(item)
        
        # 找出新增的文件
        new_files = current_files - self.before_files
        new_dirs = current_dirs - self.before_dirs
        
        # 过滤掉允许的文件（如.pytest_cache等）
        allowed_patterns = {
            '.pytest_cache',
            '__pycache__',
            '.coverage',
            'htmlcov',
            '.tox'
        }
        
        for file_path in new_files:
            if not any(pattern in str(file_path) for pattern in allowed_patterns):
                violations.append(f"❌ Unexpected file created in root: {file_path}")
        
        for dir_path in new_dirs:
            if not any(pattern in str(dir_path) for pattern in allowed_patterns):
                violations.append(f"❌ Unexpected directory created in root: {dir_path}")
        
        return violations
    
    def validate(self) -> bool:
        """执行完整的验证流程"""
        print("🚀 Starting test constraint validation...")
        print(f"Project root: {self.project_root}")
        
        # 1. 捕获初始状态
        self.capture_initial_state()
        
        # 2. 运行测试
        test_success = self.run_tests()
        
        # 3. 检查违规
        violations = self.check_violations()
        
        # 4. 报告结果
        if violations:
            print("\n❌ Test constraint violations detected:")
            for violation in violations:
                print(f"  {violation}")
            print("\n📋 Tests should only create files under tests/ directory!")
            print("📋 测试应该只在tests/目录下创建文件！")
            return False
        else:
            print("\n✅ All test constraints satisfied!")
            print("✅ 所有测试约束都满足！")
            print("✅ No files or directories created in project root")
            print("✅ 项目根目录下没有创建文件或目录")
            return True


def main():
    """主函数"""
    # 确定项目根目录
    current_dir = Path(__file__).parent  # tests目录
    backend_dir = current_dir.parent     # backend目录
    project_root = backend_dir.parent    # 项目根目录
    
    print(f"🎯 Test Constraint Validator")
    print(f"Working directory: {os.getcwd()}")
    print(f"Project root: {project_root}")
    
    # 创建验证器并执行验证
    validator = TestConstraintValidator(project_root)
    success = validator.validate()
    
    # 根据结果退出
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main() 