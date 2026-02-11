# Plan Command

Create a comprehensive implementation plan before writing any code. **WAIT for user confirmation before coding.**

## When to Use

- Starting new feature development
- Major architectural changes
- Complex refactoring work
- Changes affecting multiple files/components
- Unclear or ambiguous requirements

## Planning Process

### 1. Restate Requirements

- Restate requirements in clear terms
- Confirm understanding is correct
- List assumptions and constraints

### 2. Break Into Phases

- Decompose implementation into concrete, actionable steps
- Identify dependencies between components
- Assess risk for each phase

### 3. Assess Complexity

- Rate: High/Medium/Low
- Estimate time for each phase

### 4. Wait for Confirmation

- **CRITICAL**: Do not write any code until user explicitly confirms
- User may modify, adjust, or reject the plan

## Plan Format Template

```markdown
# Implementation Plan: [Feature Name]

## Overview
[2-3 sentence summary]

## Requirements Restated
- [Requirement 1]
- [Requirement 2]

## Implementation Phases

### Phase 1: [Phase Name]
1. **[Step Name]** (File: path/to/file)
   - Action: Specific action
   - Reason: Why this approach
   - Depends on: None / Step X
   - Risk: Low/Medium/High

### Phase 2: [Phase Name]
...

## Test Strategy
- Unit tests: [Files to test]
- Integration tests: [Flows to test]
- E2E tests: [User journeys to test]

## Risks & Mitigations
- **Risk**: [Description]
  - Mitigation: [How to address]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Complexity Estimate: [HIGH/MEDIUM/LOW]
- Backend: X-Y hours
- Frontend: X-Y hours
- Testing: X-Y hours
- Total: X-Y hours

**Awaiting Confirmation**: Proceed with this plan? (yes/no/modify)
```

## Best Practices

1. **Be Specific**: Use exact file paths, function names, variable names
2. **Consider Edge Cases**: Error scenarios, null values, boundaries
3. **Minimize Changes**: Prefer extending existing code over rewriting
4. **Follow Existing Patterns**: Maintain project consistency
5. **Design for Testing**: Structure changes to be easily testable
6. **Incremental Verification**: Each step should be verifiable
7. **Document Decisions**: Explain why, not just what

## Red Flag Checklist

Before finalizing plan, check for:
- Large functions (>50 lines)
- Deep nesting (>4 levels)
- Duplicate code
- Missing error handling
- Hardcoded values
- Missing tests
- Performance bottlenecks

## Output Location

Save the plan to `docs/plans/[feature-name]-plan.md`
