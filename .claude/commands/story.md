# Story Implementation

Implement a user story from start to finish.

## Usage

```
/story US-XXX            # Implement specific user story
/story                   # Show available stories
```

## Execution Instructions

### 1. Load Story

Read the story from:
- `docs/plans/US-XXX-*.md` (implementation plan)
- `docs/stories.md` (story definition)
- `.dev-state.yaml` (current progress)

### 2. Understand Requirements

Extract from story:
- **Title**: What are we building?
- **Acceptance Criteria**: What defines "done"?
- **Technical Notes**: Any specific requirements?
- **Dependencies**: What must be done first?

### 3. Create/Update Plan

If no plan exists, create one using `/plan` workflow.
Save to `docs/plans/US-XXX-<story-name>-plan.md`.

### 4. Implementation Loop

For each task in the plan:

```
1. Read task requirements
2. Implement changes
3. Run relevant tests
4. Verify acceptance criteria
5. Mark task complete
6. Move to next task
```

### 5. Testing

- Write unit tests for new code
- Update existing tests if behavior changed
- Run full test suite before completing

### 6. Documentation

Update as needed:
- Code comments for complex logic
- API documentation if endpoints changed
- README if setup steps changed

### 7. Completion Checklist

Before marking story complete:

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed (self or `/code-review`)
- [ ] No linting errors
- [ ] No type errors
- [ ] Documentation updated
- [ ] Changes committed

## Story Format Reference

```markdown
# US-XXX: Story Title

## Description
As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
- Note 1
- Note 2

## Dependencies
- US-YYY (must be complete)

## Estimate
- Complexity: Medium
- Points: 5
```

## Progress Tracking

Update `.dev-state.yaml` or story status:

```yaml
stories:
  US-XXX:
    status: in_progress  # pending | in_progress | completed
    started_at: "2024-01-15T10:00:00Z"
    tasks_completed: 3
    tasks_total: 5
```

## Output

After implementation:
1. Summary of changes made
2. Files modified/created
3. Tests added/updated
4. Any remaining items or follow-ups
