#!/usr/bin/env python3
"""
项目迁移文件打包脚本
用途：将需要迁移到新 Azure 项目的文件打包
"""

import os
import shutil
import zipfile
from datetime import datetime
from pathlib import Path


def print_header(text: str, color: str = "cyan"):
    """打印带颜色的标题"""
    colors = {
        "cyan": "\033[96m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "red": "\033[91m",
        "reset": "\033[0m"
    }
    print(f"\n{colors.get(color, '')}{text}{colors['reset']}")


def print_status(text: str, status: str = "success"):
    """打印状态信息"""
    symbols = {
        "success": "✅",
        "warning": "⚠️",
        "error": "❌",
        "info": "ℹ️"
    }
    print(f"  {symbols.get(status, '•')} {text}")


def create_migration_package():
    """创建迁移包"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    package_name = f"ottawa-genai-migration-{timestamp}.zip"
    temp_dir = Path("migration-temp")
    
    print_header("🎯 开始创建迁移包...")
    
    # 清理并创建临时目录
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir()
    
    # ========================================
    # 1. 复制配置文件
    # ========================================
    print_header("📋 复制配置文件...", "yellow")
    
    config_files = [
        ".gitignore",
        ".gitattributes",
        ".pre-commit-config.yaml",
        "LICENSE"
    ]
    
    for file in config_files:
        if Path(file).exists():
            shutil.copy2(file, temp_dir / file)
            print_status(file, "success")
        else:
            print_status(f"{file} (未找到)", "warning")
    
    # ========================================
    # 2. 复制 .skills 目录（完整）
    # ========================================
    print_header("🧠 复制 Skills 目录...", "yellow")
    
    if Path(".skills").exists():
        shutil.copytree(".skills", temp_dir / ".skills")
        skill_count = len(list((temp_dir / ".skills").glob("*/")))
        print_status(f"已复制 {skill_count} 个 skills", "success")
    else:
        print_status(".skills 目录未找到", "warning")
    
    # ========================================
    # 3. 复制 .kiro 目录（完整）
    # ========================================
    print_header("⚙️  复制 Kiro 配置...", "yellow")
    
    if Path(".kiro").exists():
        shutil.copytree(".kiro", temp_dir / ".kiro")
        print_status("Kiro 配置已复制", "success")
    else:
        print_status(".kiro 目录未找到", "warning")
    
    # ========================================
    # 4. 复制 .github 目录（需要后续调整）
    # ========================================
    print_header("🔧 复制 GitHub 配置...", "yellow")
    
    if Path(".github").exists():
        # 复制 .github 但跳过 .git 子目录
        shutil.copytree(
            ".github", 
            temp_dir / ".github",
            ignore=shutil.ignore_patterns('.git', '*.git')
        )
        print_status("GitHub workflows 已复制", "success")
        print_status("注意：workflows 可能需要调整以适配 Azure", "warning")
    else:
        print_status(".github 目录未找到", "warning")
    
    # ========================================
    # 5. 复制所有文档
    # ========================================
    print_header("📚 复制文档...", "yellow")
    
    if Path("docs").exists():
        shutil.copytree("docs", temp_dir / "docs")
        doc_count = len(list((temp_dir / "docs").glob("*")))
        print_status(f"已复制 {doc_count} 个文档文件", "success")
        print_status("包含: Architecture.md, prd.md, PRD.md, brief.md, Code Review.txt 等", "info")
    else:
        print_status("docs 目录未找到", "warning")
    
    # ========================================
    # 6. 创建迁移说明文件
    # ========================================
    print_header("📝 创建迁移说明...", "yellow")
    
    migration_guide = f"""# Migration Package Guide

**Created**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Source**: ottawa-genai-research-assistant
**Target**: New Azure Architecture Project

## 📦 Package Contents

### ✅ Config Files
- .gitignore
- .gitattributes
- .pre-commit-config.yaml
- LICENSE

### ✅ Skills (Complete)
- .skills/ - All skill definitions and workflows

### ✅ Kiro Config (Complete)
- .kiro/ - IDE configuration and steering rules

### ✅ GitHub Config
- .github/ - CI/CD workflows (needs adjustment)

### ✅ Project Docs
- docs/ed-research-tool-brief.md - Project requirements
- docs/Project Code Review.txt - Improvement requirements

## 🚫 Not Included (Need Regeneration)

### ❌ Code
- backend/ - Needs Azure rewrite
- frontend/ - Needs Vite migration

### ❌ Docs (Need Update)
- docs/prd.md - Regenerate for Azure
- docs/Architecture.md - Regenerate for Azure
- README.md - Regenerate

### ❌ Dependencies
- .venv/, node_modules/ - Not migrated
- pyproject.toml, package.json - Regenerate

## 📋 Next Steps

### 1. Create New Project
```bash
mkdir ottawa-genai-azure
cd ottawa-genai-azure
git init
```

### 2. Extract Package
```bash
# Windows PowerShell
Expand-Archive -Path ..\\{package_name} -DestinationPath .

# Linux/Mac
unzip ../{package_name}
```

### 3. Generate New Content
Let AI assistant generate:
- [ ] docs/prd.md (Azure + Code Review)
- [ ] docs/architecture.md (Azure architecture)
- [ ] docs/azure-setup.md (Setup guide)
- [ ] backend/ (FastAPI + Azure)
- [ ] frontend/ (React + Vite)
- [ ] README.md (New project)

### 4. Configure Azure Services
- [ ] Azure OpenAI
- [ ] Azure AI Search
- [ ] Azure Blob Storage
- [ ] Azure Entra ID
- [ ] Azure Key Vault

### 5. Adjust GitHub Workflows
- [ ] Azure deployment
- [ ] Azure service tests
- [ ] Environment variables

## 📞 Need Help?
1. Check .skills/ documentation
2. Review docs/Project Code Review.txt
3. Ask AI assistant for guidance

---
**Generated**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
"""
    
    (temp_dir / "MIGRATION-GUIDE.md").write_text(migration_guide, encoding="utf-8")
    print_status("MIGRATION-GUIDE.md 已创建", "success")
    
    # ========================================
    # 7. 创建文件清单
    # ========================================
    print_header("📋 生成文件清单...", "yellow")
    
    manifest_lines = [
        "# Migration Package File Manifest",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## File List",
        ""
    ]
    
    for root, dirs, files in os.walk(temp_dir):
        level = root.replace(str(temp_dir), "").count(os.sep)
        indent = "  " * level
        rel_path = Path(root).relative_to(temp_dir)
        if str(rel_path) != ".":
            manifest_lines.append(f"{indent}📁 {rel_path}/")
        
        sub_indent = "  " * (level + 1)
        for file in files:
            file_path = Path(root) / file
            size_kb = file_path.stat().st_size / 1024
            rel_file = file_path.relative_to(temp_dir)
            manifest_lines.append(f"{sub_indent}📄 {rel_file} ({size_kb:.2f} KB)")
    
    (temp_dir / "FILE-MANIFEST.txt").write_text("\n".join(manifest_lines), encoding="utf-8")
    print_status("FILE-MANIFEST.txt 已创建", "success")
    
    # ========================================
    # 8. 创建压缩包
    # ========================================
    print_header("📦 创建压缩包...", "yellow")
    
    with zipfile.ZipFile(package_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(temp_dir)
                zipf.write(file_path, arcname)
    
    package_size = Path(package_name).stat().st_size / (1024 * 1024)
    
    # 清理临时目录（处理权限问题）
    try:
        shutil.rmtree(temp_dir)
    except PermissionError:
        print_status("临时目录清理失败（权限问题），请手动删除 migration-temp/", "warning")
    
    # ========================================
    # 完成
    # ========================================
    print_header("=" * 40, "green")
    print_header("✅ 迁移包创建成功！", "green")
    print_header("=" * 40, "green")
    print()
    print(f"📦 文件名: {package_name}")
    print(f"📊 大小: {package_size:.2f} MB")
    print(f"📍 位置: {Path.cwd() / package_name}")
    print()
    print_header("📖 下一步:", "yellow")
    print("  1. 解压压缩包到新项目目录")
    print("  2. 阅读 MIGRATION-GUIDE.md")
    print("  3. 让 AI 助手生成新的代码和文档")
    print()


if __name__ == "__main__":
    try:
        create_migration_package()
    except Exception as e:
        print_header(f"❌ 错误: {e}", "red")
        raise
