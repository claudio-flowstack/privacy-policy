# Meta Principles Cluster

**Load when**: Debugging persistent issues, stuck in loops, concept analysis

**Principles**: #9, #12 (applicable), #17 (not applicable - standalone project)

**Related**: [Thinking Process Architecture](../diagrams/thinking-process-architecture.md)

---

## Principle #9: Feedback Loop Awareness (APPLICABLE)

When failures persist, use `/reflect` to identify which loop type you're using:

| Loop Type | When to Use | Pattern |
|-----------|-------------|---------|
| **Retrying** | Fix execution errors | Same approach, different input |
| **Initial-sensitive** | Change assumptions | Same goal, different starting point |
| **Branching** | Try different path | Same goal, different approach |
| **Synchronize** | Align knowledge | Update understanding to match reality |
| **Meta-loop** | Change loop type | Stop and reconsider strategy |

**Thinking tools for loop identification**:
- `/trace` - Root cause analysis (why did this fail?)
- `/hypothesis` - Generate new assumptions
- `/compare` - Evaluate alternative paths
- `/reflect` - Identify current loop pattern

**When to switch loops**:
- 2+ failed retries → Switch from retrying to research
- Same error repeated → Initial-sensitive (wrong assumptions)
- No progress → Meta-loop (change strategy entirely)

**ss-automation examples**:
- Meta API rate limit → Retrying loop (with backoff)
- Google Sheets auth fails → Synchronize loop (update credentials)
- Wrong data format → Initial-sensitive (check API response structure)

See [Thinking Process Architecture - Feedback Loops](../diagrams/thinking-process-architecture.md#11-feedback-loop-types-self-healing-properties).

---

## Principle #12: OWL-Based Relationship Analysis (APPLICABLE)

Use formal ontology relationships (OWL, RDF) for structured concept comparison. Eliminates "it depends" answers by applying 4 fundamental relationship types:

| Relationship | Question | Example |
|--------------|----------|---------|
| **Part-whole** | Is X part of Y? | "Is data parsing part of the automation pipeline?" |
| **Complement** | Does X complete Y? | "Does caching complement API requests?" |
| **Substitution** | Can X replace Y? | "Can CSV export substitute Google Sheets?" |
| **Composition** | Is X composed of Y+Z? | "Is the pipeline composed of fetch + parse + write?" |

**Usage**:
```
/compare "CSV export vs Google Sheets"

Apply relationship analysis:
1. Part-whole: Both are parts of data export pipeline
2. Complement: CSV complements Sheets (backup/portability)
3. Substitution: Partial - CSV can replace Sheets for archival
4. Composition: Google Sheets = write API + formatting + sharing
```

**Benefit**: Transforms vague "X vs Y" questions into precise analytical frameworks with concrete examples.

See [Relationship Analysis Guide](../../docs/RELATIONSHIP_ANALYSIS.md).

---

## Principle #17: Shared Virtual Environment Pattern (NOT APPLICABLE)

> **Note**: ss-automation is a standalone project, not part of a multi-repository ecosystem.

This principle applies to related codebases sharing dependencies. For ss-automation, use standard isolated virtual environment:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Quick Checklist

Stuck debugging:
- [ ] Identify current loop type (retrying? branching?)
- [ ] After 2 retries, switch to research
- [ ] Use `/reflect` to assess progress
- [ ] Use `/trace` for root cause

Concept comparison:
- [ ] Apply 4 relationship types
- [ ] Provide concrete examples
- [ ] Avoid "it depends" without framework

---

*Cluster: meta-principles*
