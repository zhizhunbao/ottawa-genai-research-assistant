# Claude Code Configuration

This directory contains Claude Code configuration and custom commands for the Ottawa GenAI Research Assistant project.

## Directory Structure

```
.claude/
├── README.md           # This file
├── settings.json       # Claude Code settings
└── commands/           # Custom slash commands
    ├── full-dev.md     # Complete development workflow
    ├── plan.md         # Implementation planning
    ├── code-review.md  # Security & quality review
    ├── build-fix.md    # Fix build errors
    ├── test.md         # Run and fix tests
    ├── e2e.md          # Generate E2E tests
    ├── security.md     # Security audit
    ├── performance.md  # Performance optimization
    ├── commit.md       # Create git commits
    └── story.md        # Implement user stories
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/full-dev` | Complete development workflow (requirements to deployment) |
| `/plan` | Create implementation plan before coding |
| `/code-review` | Comprehensive security and quality review |
| `/build-fix` | Fix TypeScript/Python build errors incrementally |
| `/test` | Run tests and fix failures |
| `/e2e` | Generate end-to-end tests |
| `/security` | Security audit of codebase |
| `/performance` | Performance analysis and optimization |
| `/commit` | Create well-formatted git commit |
| `/story US-XXX` | Implement specific user story |

## Usage Examples

```bash
# Start complete development workflow
/full-dev

# Check progress
/full-dev status

# Plan before implementing
/plan Add user authentication

# Review code before commit
/code-review

# Fix build errors
/build-fix

# Run tests
/test
/test backend
/test fix

# Security check
/security

# Implement a story
/story US-201
```

## Integration with .agent/

This configuration works alongside the existing `.agent/` directory:
- `.agent/workflows/` - Detailed step files for each development phase
- `.agent/skills/` - Specialized skill definitions with references
- `.claude/commands/` - Claude Code compatible command interface

The `/full-dev` command references step files from `.agent/workflows/full-development-steps/`.

## Related Files

- `CLAUDE.md` - Project-level configuration (root directory)
- `.dev-state.yaml` - Development workflow state tracking
- `docs/plans/` - Implementation plans
