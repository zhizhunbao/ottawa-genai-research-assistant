---
name: dev-code_quality_check
description: Automated code quality checker using AST analysis. Use when (1) checking code quality manually, (2) reviewing code before commit, (3) analyzing function/file size, (4) checking nesting depth.
---

# Code Quality Checker

Automated code quality analysis tool using AST (Abstract Syntax Tree) parsing.

## Objectives

- Check function size (max 50 lines)
- Check file size (max 800 lines)
- Check nesting depth (max 4 levels)
- Detect code smells
- Generate quality reports

## Usage

### Check Single File

```powershell
uv run python .skills/dev-code_quality_check/scripts/code_quality_checker.py <file_path>
```

### Check Multiple Files

```powershell
Get-ChildItem -Recurse -Include *.py | ForEach-Object {
    uv run python .skills/dev-code_quality_check/scripts/code_quality_checker.py $_.FullName
}
```

## Quality Standards

### Function Size
- **Ideal**: 10-20 lines
- **Maximum**: 50 lines
- **Action**: Split functions exceeding 50 lines

### File Size
- **Ideal**: 200-400 lines
- **Maximum**: 800 lines
- **Action**: Split files exceeding 800 lines

### Nesting Depth
- **Maximum**: 4 levels
- **Action**: Use early returns or extract functions

## Output Format

```
Checking: app/services/user_service.py

Issues Found:
- Function 'process_user_data' is too long (85 lines, max 50)
- Function 'validate_input' has deep nesting (5 levels, max 4)
- File is too long (950 lines, max 800)

Summary:
- Total Issues: 3
- Functions Checked: 12
- Average Function Size: 35 lines
```

## Integration with Hooks

This script is automatically called by the `code-quality-check` hook when you save Python files.

## Related

- **Rule**: `.kiro/steering/code-quality.md`
- **Hook**: `.kiro/hooks/code-quality-check.json`
