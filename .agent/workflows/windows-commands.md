---
description: Windows PowerShell command standards - ALWAYS follow these rules
---

# Windows Command Standards

This workspace runs on Windows with PowerShell. All commands must follow Windows conventions.

## Critical Rules

1. **ALWAYS prefix Python commands with `uv run`** - Never invoke `python` directly
2. **NEVER use `cd` command** - Use the `cwd` parameter in tool calls instead
3. **Use PowerShell syntax** - Not bash/Linux commands (`dir` not `ls`, `Remove-Item` not `rm`)
4. **Use semicolon (`;`) for command chaining** - Not `&&` or `||`

## Python Package Management

**REQUIRED: Use `uv` exclusively for all Python package operations.**

```powershell
# Install packages
uv add package-name
uv add --dev dev-package-name

# Execute Python
uv run python script.py
uv run python -m module.name

# Sync dependencies
uv sync
```

**FORBIDDEN:**

- `pip install` - Use `uv add`
- `conda install` - Use `uv add`
- `python script.py` - Use `uv run python script.py`

## Working Directory Management

**CRITICAL: Never use `cd` command. Always use `cwd` parameter in tool calls.**

## PowerShell File Operations

Use PowerShell cmdlets, not Linux commands:

```powershell
# List files
dir
Get-ChildItem

# Create directory
mkdir dirname
New-Item -ItemType Directory -Path dirname

# Remove file/directory
Remove-Item file.txt
Remove-Item -Recurse -Force dirname

# Copy/Move
Copy-Item source.txt destination.txt
Move-Item source.txt destination.txt

# Read file
Get-Content file.txt

# Check existence
Test-Path file.txt
```

**FORBIDDEN Linux commands:**

- `ls` → Use `dir` or `Get-ChildItem`
- `rm` → Use `Remove-Item`
- `cp` → Use `Copy-Item`
- `mv` → Use `Move-Item`
- `cat` → Use `Get-Content`

## Command Chaining

```powershell
# ✅ CORRECT - Use semicolon
command1; command2; command3

# ✅ CORRECT - Use pipeline
Get-ChildItem | Where-Object {$_.Extension -eq ".py"}

# ❌ FORBIDDEN
command1 && command2    # Not supported
command1 || command2    # Not supported
```

## Quick Reference Table

| Operation        | ✅ Use                    | ❌ Never Use          |
| ---------------- | ------------------------- | --------------------- | --- | --- |
| Install package  | `uv add package`          | `pip install package` |
| Run Python       | `uv run python script.py` | `python script.py`    |
| List files       | `dir` or `Get-ChildItem`  | `ls`                  |
| Remove file      | `Remove-Item file.txt`    | `rm file.txt`         |
| Copy file        | `Copy-Item src dst`       | `cp src dst`          |
| Change directory | Use `cwd` parameter       | `cd directory`        |
| Chain commands   | `;`                       | `&&` or `             |     | `   |

## Pre-Execution Checklist

Before executing any command, verify:

- [ ] Python commands prefixed with `uv run`
- [ ] No `cd` commands (using `cwd` parameter instead)
- [ ] PowerShell syntax (not Linux commands)
- [ ] Semicolon (`;`) for command chaining (not `&&`)
- [ ] Consistent path separators within each path
