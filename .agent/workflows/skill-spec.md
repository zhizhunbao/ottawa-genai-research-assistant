---
description: SKILL.md 文件规范 - 创建或编辑 skill 时遵循此规范
---

# Skill File Specification

Follow this specification when creating or editing SKILL.md files in `.skills/`.

## Directory Structure

```
skill-name/
├── SKILL.md          (required - main skill definition)
├── metadata.json     (optional - skill metadata and keywords)
├── references/       (optional - detailed documentation)
│   ├── guide.md
│   └── examples.md
└── scripts/          (optional - executable helper scripts)
    └── helper.py
```

## SKILL.md Format

### Front Matter (Required)

```yaml
---
name: skill-name
description: Brief skill purpose + trigger conditions. Use when (1) ..., (2) ..., (3) ...
---
```

**Requirements:**

- `name`: Matches directory name (use underscores for this project)
- `description`: Must include both functionality AND specific trigger conditions
- Keep description under 100 words for efficient metadata loading

### Body Content (Required)

Direct instructions for the AI assistant:

- **Be concise**: Avoid redundant explanations
- **Use imperative mood**: "Read the file", "Apply these steps"
- **Reference external docs**: Point to `references/` for detailed content
- **Structure clearly**: Use headings, lists, and code blocks

**Typical sections:**

- Objectives (what to accomplish)
- Key instructions (how to accomplish it)
- Validation steps (how to verify success)
- References (where to find more details)

## Core Principles

### 1. Context Efficiency

Only include information that:

- Is specific to this skill domain
- Cannot be inferred from general AI knowledge
- Directly impacts task execution

### 2. Progressive Disclosure

Load information in layers:

1. **Metadata** (name + description) - Always loaded (~100 words)
2. **SKILL.md body** - Loaded when skill is triggered (<5000 words)
3. **references/** - Loaded on-demand when explicitly referenced

### 3. Maintainability

- Keep SKILL.md under 500 lines
- Move detailed content to `references/`
- Use clear section headings for navigation

## Validation Checklist

Before finalizing a SKILL.md file, verify:

- [ ] Front matter includes both `name` and `description`
- [ ] `name` matches directory name
- [ ] Description specifies clear trigger conditions
- [ ] Body uses imperative instructions
- [ ] Content is under 500 lines
- [ ] No redundant explanations

## Anti-Patterns (Do Not)

- ❌ Create README.md, CHANGELOG.md, or other extraneous files
- ❌ Include "When to Use" section in body (belongs in description)
- ❌ Write verbose explanations of concepts AI already understands
- ❌ Duplicate content between SKILL.md and references/
- ❌ Exceed 500 lines without moving content to references/

## Example Structure

```markdown
---
name: example_skill
description: Helps with X task. Use when (1) user asks about X, (2) working with Y files, (3) need to validate Z.
---

# Example Skill

## Objectives

- Accomplish primary goal A
- Validate condition B
- Generate output C

## Instructions

1. Read the input file
2. Apply transformation X
3. Validate result meets criteria Y
4. Output in format Z

**For detailed rules:** See `references/guide.md`

## Validation

- Criterion 1: Check that...
- Criterion 2: Ensure that...

## Common Issues

- Issue A: Solution X
- Issue B: Solution Y
```
