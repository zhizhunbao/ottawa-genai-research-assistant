# PRD Writing Skill

## Objective

Guide the creation of comprehensive Product Requirements Documents (PRDs) that clearly define product vision, features, user stories, and technical requirements.

## Use Cases

- Creating new product requirement documents
- Structuring product specifications
- Defining user stories and acceptance criteria
- Documenting feature requirements
- Aligning stakeholders on product scope
- Planning product iterations

## PRD Structure

### 1. Executive Summary
- Product name and version
- Brief overview (2-3 sentences)
- Key objectives
- Target launch date

### 2. Product Vision & Goals
- Problem statement
- Target users/personas
- Value proposition
- Success metrics (KPIs)
- Business objectives

### 3. User Stories & Personas
- Primary personas with demographics, goals, pain points
- User journey maps
- Use cases and scenarios

### 4. Functional Requirements
- Feature list with priority (Must-have, Should-have, Nice-to-have)
- Detailed feature descriptions
- User flows and interactions
- Acceptance criteria for each feature

### 5. Non-Functional Requirements
- Performance requirements (response time, throughput)
- Security requirements
- Scalability needs
- Accessibility standards
- Browser/device compatibility

### 6. Technical Specifications
- System architecture overview
- Technology stack
- API requirements
- Data models
- Integration points
- Third-party dependencies

### 7. Design Requirements
- UI/UX guidelines
- Wireframes/mockups references
- Design system components
- Responsive design requirements

### 8. Constraints & Assumptions
- Technical constraints
- Business constraints
- Timeline constraints
- Budget limitations
- Assumptions made

### 9. Success Criteria
- Definition of Done
- Acceptance criteria
- Testing requirements
- Launch criteria

### 10. Timeline & Milestones
- Development phases
- Key milestones
- Dependencies
- Release schedule

### 11. Risks & Mitigation
- Identified risks
- Impact assessment
- Mitigation strategies

### 12. Appendix
- Glossary
- References
- Supporting documents

## Best Practices

### Writing Style
- **Be specific**: Use concrete examples, not vague descriptions
- **Be measurable**: Include quantifiable metrics where possible
- **Be clear**: Avoid jargon; define technical terms
- **Be concise**: One idea per sentence, short paragraphs
- **Use active voice**: "The system will send..." not "An email will be sent..."

### User Stories Format
```
As a [persona],
I want to [action],
So that [benefit/value].

Acceptance Criteria:
- Given [context]
- When [action]
- Then [expected outcome]
```

### Feature Prioritization
Use MoSCoW method:
- **Must have**: Critical for launch
- **Should have**: Important but not critical
- **Could have**: Nice to have if time permits
- **Won't have**: Out of scope for this release

### Requirements Checklist
Each requirement should be:
- [ ] Clear and unambiguous
- [ ] Testable/verifiable
- [ ] Feasible within constraints
- [ ] Necessary for the product
- [ ] Traceable to business goals

## Common Pitfalls to Avoid

1. **Too vague**: "The system should be fast" → "API response time < 200ms for 95% of requests"
2. **Solution-focused**: Describe the problem and outcome, not the implementation
3. **Missing acceptance criteria**: Every feature needs clear success criteria
4. **Scope creep**: Keep "nice-to-haves" separate from "must-haves"
5. **Ignoring edge cases**: Document error states and boundary conditions
6. **No metrics**: Define how success will be measured

## Templates & Examples

### Feature Template
```markdown
## Feature: [Feature Name]

**Priority**: Must-have / Should-have / Could-have

**Description**: 
[2-3 sentences describing what this feature does and why it's needed]

**User Story**:
As a [persona],
I want to [action],
So that [benefit].

**Acceptance Criteria**:
1. Given [context], when [action], then [outcome]
2. Given [context], when [action], then [outcome]

**Technical Notes**:
- [Any technical considerations]
- [Dependencies or constraints]

**Design Notes**:
- [UI/UX considerations]
- [Reference to mockups if available]
```

### Non-Functional Requirement Template
```markdown
## Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Page Load Time | < 2s | Lighthouse score |
| API Response Time | < 200ms (p95) | APM monitoring |
| Concurrent Users | 10,000 | Load testing |
| Uptime | 99.9% | Status monitoring |
```

## Workflow

1. **Discovery Phase**
   - Conduct stakeholder interviews
   - Research user needs
   - Analyze competitors
   - Define success metrics

2. **Drafting Phase**
   - Start with executive summary and vision
   - List all features (brain dump)
   - Prioritize features
   - Write detailed requirements

3. **Review Phase**
   - Share with stakeholders
   - Gather feedback
   - Clarify ambiguities
   - Update based on input

4. **Finalization Phase**
   - Get sign-off from key stakeholders
   - Version and date the document
   - Distribute to team
   - Set up tracking system

5. **Maintenance Phase**
   - Track changes with version control
   - Update as requirements evolve
   - Document decisions and rationale

## Tools & References

- **Collaboration**: Google Docs, Notion, Confluence
- **Diagramming**: Miro, Figma, Lucidchart
- **Project Management**: Jira, Linear, Asana
- **Version Control**: Git for markdown PRDs

## Questions to Ask

Before writing a PRD, clarify:
- Who are the target users?
- What problem does this solve?
- What are the must-have features for v1?
- What are the success metrics?
- What are the technical constraints?
- What's the timeline?
- Who are the stakeholders?
- What's the budget?

## Output Format

Prefer **Markdown** for PRDs because:
- Version control friendly (Git)
- Easy to read and write
- Portable across tools
- Supports tables, code blocks, links
- Can be converted to PDF/HTML

Alternative: Google Docs for heavy collaboration with non-technical stakeholders.
