# Principle Clusters

**Purpose**: Context-specific principles organized by task/domain for efficient loading.

**Project**: ss-automation (Meta Ads → Google Sheets Automation)

**Design Philosophy**: Principles have different applicability levels. Core principles (Tier-0) apply to EVERY task and live in CLAUDE.md. Domain and task-specific principles live here, loaded only when relevant.

---

## Architecture

```
CLAUDE.md (~80 lines)
├── Project Context (always loaded)
├── Tier-0: Core Principles (ALWAYS apply)
│   └── 8 principles that guide ALL work
└── Routing Index → points here

.claude/principles/
├── index.md (routing table with triggers)
├── deployment-principles.md (future - when deployment added)
├── data-principles.md (timezone only - no database)
├── configuration-principles.md (secrets, Meta API, Google Sheets)
├── testing-principles.md (test patterns)
├── integration-principles.md (API integration, error handling)
└── meta-principles.md (debugging, analysis)
```

---

## ss-automation Applicability

| Cluster | Principles | Applicable | Notes |
|---------|-----------|------------|-------|
| Core | #1, #2, #18, #20, #23, #25, #26, #27 | Yes | Always apply |
| Configuration | #13, #24 | Yes | Meta API + Google Sheets creds |
| Integration | #4, #7, #8 | Yes | API integration patterns |
| Testing | #10, #19 | Yes | Test patterns |
| Data | #16 | Yes | Timezone only |
| Meta | #9, #12 | Yes | Debugging patterns |
| Deployment | #6, #11, #15, #19, #21 | Future | When automation scheduled |
| Database | #3, #5, #14 | No | No database in project |
| LLM | #22 | No | No LLM operations |
| Environment | #17 | No | Standalone project |

---

## Tier Classification

### Tier-0: Core (ALWAYS Apply)
These principles guide every task. They live in CLAUDE.md.

| # | Principle | Why Always |
|---|-----------|-----------|
| 1 | Defensive Programming | Every code change |
| 2 | Progressive Evidence | Every verification |
| 18 | Logging Discipline | Any logging |
| 20 | Execution Boundary | Before claiming "works" |
| 23 | Configuration Variation | Any config decision |
| 25 | Behavioral Invariant | Before claiming "done" |
| 26 | Thinking Tuple Protocol | Every reasoning episode |
| 27 | Commands as Strategy Modes | Every command execution |

### Tier-1: Domain (Load by Context)
These principles apply to specific domains.

| Cluster | Principles | ss-automation |
|---------|-----------|---------------|
| Data | #16 (timezone) | Applicable |
| Data | #3, #5, #14 (database) | N/A |
| LLM | #22 | N/A |

### Tier-2: Task (Load by Task)
These principles apply to specific tasks.

| Cluster | Principles | ss-automation |
|---------|-----------|---------------|
| Configuration | #13, #24 | Applicable |
| Integration | #4, #7, #8 | Applicable |
| Testing | #10, #19 | Applicable |
| Deployment | #6, #11, #15, #19, #21 | Future |

### Tier-3: Meta/Environment
These principles apply to specific situations.

| Cluster | Principles | ss-automation |
|---------|-----------|---------------|
| Meta | #9, #12 | Applicable |
| Environment | #17 | N/A |

---

## How to Use

### For Claude (Agent)
1. CLAUDE.md is always loaded (Tier-0 principles)
2. Check routing index for task-specific clusters
3. Load relevant cluster(s) based on current task
4. Skip clusters marked N/A for ss-automation

### For Humans
1. Read CLAUDE.md for core principles
2. Focus on Configuration and Integration clusters (most relevant)
3. Each cluster is self-contained with full principle text

---

## Cluster Files

- **[index.md](index.md)** - Routing table with triggers
- **[configuration-principles.md](configuration-principles.md)** - Secrets, Meta API, Google Sheets credentials
- **[integration-principles.md](integration-principles.md)** - API integration, error handling
- **[testing-principles.md](testing-principles.md)** - Test patterns
- **[data-principles.md](data-principles.md)** - Timezone (database sections N/A)
- **[meta-principles.md](meta-principles.md)** - Debugging, analysis
- **[deployment-principles.md](deployment-principles.md)** - Future use

---

*Architecture: Tier-based classification with connascent clustering*
