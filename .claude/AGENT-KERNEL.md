# Agent Kernel

**The cognitive operating system for AI-assisted development.**

The **Agent Kernel** is the complete system of prompts, skills, commands, principles, and documentation that shapes how Claude reasons about and executes tasks in this project.

---

## What is the Agent Kernel?

The Agent Kernel is analogous to an operating system kernel:
- **OS Kernel**: Manages hardware resources, provides system calls, enforces security
- **Agent Kernel**: Manages reasoning patterns, provides commands, enforces principles

Just as applications run on top of an OS kernel, your tasks run on top of the Agent Kernel.

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR TASKS                              │
│   "Deploy to production"  "Fix this bug"  "Review PR"       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AGENT KERNEL                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Commands   │  │   Skills    │  │ Principles  │          │
│  │  /explore   │  │  deployment │  │ Tier-0 Core │          │
│  │  /validate  │  │  testing    │  │ Tier-1/2/3  │          │
│  │  /trace     │  │  refacter   │  │ Task-based  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │    Specs    │  │   Guides    │  │   State     │          │
│  │ .claude/    │  │  docs/      │  │ convergence │          │
│  │  specs/     │  │  guides/    │  │ checkpoints │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE LLM                                │
│              (Underlying reasoning engine)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Kernel Components

### 1. Commands (`.claude/commands/`)

**System calls for reasoning operations.**

Commands are slash-invokable operations that trigger specific reasoning modes. They are the "API" of the Agent Kernel.

| Command | Mode | Purpose |
|---------|------|---------|
| `/explore` | Divergent | Generate alternatives before committing |
| `/validate` | Verify | Test claims with evidence |
| `/trace` | Causal | Follow cause-effect chains |
| `/understand` | Clarify | Build mental models |
| `/consolidate` | Converge | Synthesize into decisions |
| `/step` | Execute | Goal-oriented task execution |

**Key insight**: Commands are not independent tools—they are **modes within Strategy** (see Thinking Tuple Protocol).

**Location**: `.claude/commands/`
**Index**: `.claude/commands/README.md`

---

### 2. Skills (`.claude/skills/`)

**Specialized knowledge modules.**

Skills are auto-discovered capabilities that provide domain-specific expertise. Claude invokes skills automatically when task context matches skill description.

| Skill | Domain | Trigger |
|-------|--------|---------|
| `deployment` | Zero-downtime deployments | "deploy", "production" |
| `testing-workflow` | Test patterns | "test", "pytest" |
| `code-review` | Security, performance | "review", "PR" |
| `refacter` | Complexity analysis | "refactor", "complex" |
| `error-investigation` | AWS debugging | "debug", "logs" |
| `research` | Investigation methodology | "investigate", "root cause" |

**Key insight**: Skills use **progressive disclosure**:
1. `SKILL.md` - Quick reference, decision tree
2. Supporting docs - Detailed patterns, checklists
3. Scripts - Automation tools (optional)

**Location**: `.claude/skills/`
**Index**: `.claude/skills/README.md`

---

### 3. Principles (`.claude/principles/`)

**Decision-making rules organized by applicability.**

Principles guide HOW Claude reasons about trade-offs. They are organized in tiers:

| Tier | Scope | Location |
|------|-------|----------|
| **Tier-0** | ALWAYS apply | `CLAUDE.md` (inline) |
| **Tier-1** | Domain-specific | `.claude/principles/data-principles.md` |
| **Tier-2** | Task-specific | `.claude/principles/deployment-principles.md` |
| **Tier-3** | Context-specific | `.claude/principles/meta-principles.md` |

**Key insight**: Tier-0 principles (~8) are always loaded. Higher tiers are loaded dynamically based on task type. This reduces token usage by ~60%.

**Location**: `.claude/principles/`
**Index**: `.claude/principles/index.md`

---

### 4. Specifications (`.claude/specs/`)

**Feature contracts for spec-driven development.**

Specs define WHAT must be true for a feature to be complete. They are the "acceptance criteria" that guide implementation.

```
.claude/specs/<feature>/
├── spec.yaml         # Machine-readable contract
├── invariants.md     # What must hold
├── constraints.md    # What limits apply
└── acceptance.md     # How to verify
```

**Key insight**: Specs are the **source of truth** for `/invariant` checks. They survive context switches and session boundaries.

**Location**: `.claude/specs/`

---

### 5. Guides (`docs/guides/`)

**How-to documentation for humans and Claude.**

Guides explain HOW to apply principles and skills in practice. They bridge abstract rules to concrete actions.

| Guide | Purpose |
|-------|---------|
| `thinking-tuple-protocol.md` | How to use the Thinking Tuple |
| `behavioral-invariant-verification.md` | How to verify "done" |
| `execution-boundary-discipline.md` | How to verify code works |
| `logging-discipline.md` | How to log for reconstruction |

**Key insight**: Guides are referenced by principles. When CLAUDE.md says "See guide", Claude loads the detailed how-to.

**Location**: `docs/guides/`
**Index**: `docs/guides/README.md`

---

### 6. State (`.claude/state/`)

**Runtime verification and convergence tracking.**

State tracks the progress of long-running tasks, verification status, and convergence toward goals.

```
.claude/state/
├── convergence/      # Verification status by feature
├── checkpoints/      # Session checkpoints
└── observations/     # Runtime observations
```

**Key insight**: State enables **resumable tasks**. If a session ends, Claude can resume from the last checkpoint.

**Location**: `.claude/state/`

---

## Kernel Protocols

### Thinking Tuple Protocol (Core)

Every reasoning episode runs through a Thinking Tuple:

```
Tuple = (Constraints, Invariant, Principles, Strategy, Check)
```

| Component | Question | Source |
|-----------|----------|--------|
| **Constraints** | What do we have/know? | Current state, specs |
| **Invariant** | What must be true at end? | Success criteria |
| **Principles** | What trade-offs guide us? | Tier-0 + task-specific |
| **Strategy** | What modes to execute? | Pipeline of commands |
| **Check** | Did we satisfy invariant? | Progressive Evidence |

**See**: `docs/guides/thinking-tuple-protocol.md`

---

### Progressive Evidence Strengthening

Verification uses increasingly strong evidence layers:

| Layer | Type | Example |
|-------|------|---------|
| 1 | Surface | Status code 200 |
| 2 | Content | Response body valid |
| 3 | Observability | Logs show success |
| 4 | Ground Truth | Data in database |

**Rule**: Never stop at Layer 1. Progress until ground truth verified.

---

### Command as Strategy Mode

Commands are modes within Strategy, not independent tools:

```
Strategy = [
  { mode: "/explore", prompt: "find alternatives" },
  { mode: "/validate", prompt: "test top choice" },
  { mode: "/consolidate", prompt: "synthesize decision" }
]
```

Each mode updates tuple state before next mode executes.

---

## File Structure

```
.claude/
├── CLAUDE.md              # Ground truth contract (Tier-0 principles)
├── AGENT-KERNEL.md        # This document (architecture overview)
├── commands/              # Slash command definitions
│   ├── README.md          # Command index
│   ├── explore.md
│   ├── validate.md
│   └── ...
├── skills/                # Domain expertise modules
│   ├── README.md          # Skill index
│   ├── deployment/
│   ├── testing-workflow/
│   └── ...
├── principles/            # Decision-making rules (Tier-1/2/3)
│   ├── README.md          # Principle index
│   ├── index.md           # Routing index
│   ├── deployment-principles.md
│   └── ...
├── specs/                 # Feature specifications
│   └── <feature>/
├── state/                 # Runtime state
│   ├── convergence/
│   └── checkpoints/
├── journals/              # Decision logs
├── observations/          # Runtime observations
├── evolution/             # /evolve reports
└── diagrams/              # Architecture diagrams

docs/
├── README.md              # Documentation index
├── guides/                # How-to guides
│   ├── README.md
│   ├── thinking-tuple-protocol.md
│   └── ...
├── adr/                   # Architecture Decision Records
└── deployment/            # Deployment documentation
```

---

## Glossary

### Core Terms

| Term | Definition |
|------|------------|
| **Agent Kernel** | The complete system of prompts, skills, commands, principles, and documentation that shapes Claude's reasoning |
| **Command** | Slash-invokable operation that triggers a specific reasoning mode (e.g., `/explore`, `/validate`) |
| **Skill** | Auto-discovered knowledge module for domain-specific expertise (e.g., `deployment`, `testing-workflow`) |
| **Principle** | Decision-making rule that guides trade-off reasoning (organized in Tiers 0-3) |
| **Spec** | Feature contract that defines acceptance criteria and invariants |
| **Guide** | How-to documentation that bridges abstract rules to concrete actions |
| **State** | Runtime tracking of verification status and convergence progress |

### Protocol Terms

| Term | Definition |
|------|------------|
| **Thinking Tuple** | 5-component reasoning structure: (Constraints, Invariant, Principles, Strategy, Check) |
| **Progressive Evidence** | 4-layer verification from surface (status codes) to ground truth (actual state) |
| **Strategy Mode** | Command as a mode within Strategy pipeline, not independent tool |
| **Invariant** | What must be true at the end of a task for it to be "done" |
| **Convergence** | Progress toward satisfying all invariants (delta = 0) |

### Structural Terms

| Term | Definition |
|------|------------|
| **Tier-0** | Core principles that apply to EVERY task (8 principles in CLAUDE.md) |
| **Tier-1/2/3** | Context-specific principles loaded dynamically by task type |
| **Progressive Disclosure** | Skill structure: SKILL.md (quick) → Supporting docs (detailed) |
| **Hub-Spoke** | Multi-project pattern: central repo (hub) + service-specific repos (spokes) |

---

## When to Reference the Agent Kernel

Use **"Agent Kernel"** when discussing:

1. **The system as a whole**: "The Agent Kernel includes 27 principles..."
2. **Architecture decisions**: "We should add this pattern to the Agent Kernel"
3. **Cross-component interactions**: "Commands and skills work together in the Agent Kernel"
4. **Evolution**: "The /evolve command updates the Agent Kernel based on practice"

Use **specific component names** when discussing:

1. **Individual commands**: "Use /explore to find alternatives"
2. **Individual skills**: "The deployment skill covers zero-downtime"
3. **Individual principles**: "Principle #1 (Defensive Programming) requires..."

---

## Maintaining the Agent Kernel

### Evolution Cycle

```
Practice → Observe → Abstract → Document → Practice
```

1. **Practice**: Execute tasks using the Agent Kernel
2. **Observe**: Notice patterns (via `/observe`, `/journal`)
3. **Abstract**: Extract reusable patterns (via `/abstract`)
4. **Document**: Update skills, principles, commands (via `/evolve`)
5. **Practice**: Apply updated Agent Kernel to new tasks

### /evolve Command

The `/evolve` command detects drift between documented principles and actual practices:

```bash
/evolve              # Review all areas
/evolve testing      # Focus on testing patterns
/evolve deployment   # Focus on deployment practices
```

**Output**: Evolution report with proposed updates to skills, principles, commands.

---

## See Also

- **Ground Truth**: `CLAUDE.md` - The contract for how we work
- **Commands**: `.claude/commands/README.md` - Command index
- **Skills**: `.claude/skills/README.md` - Skill index
- **Principles**: `.claude/principles/index.md` - Principle routing
- **Guides**: `docs/guides/README.md` - How-to documentation
- **Architecture**: `.claude/diagrams/thinking-process-architecture.md` - Full architecture diagram
