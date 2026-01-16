# Service Integration Principles

**When automation depends on external service features.**

---

## Core Principle: Service Boundary Determines Repository Structure

When a workflow requires external service features (Vercel auto-deploy, GitHub Actions, AWS Lambda triggers), the **service's constraints** determine whether the workflow needs its own repository.

---

## Decision Tree

```
Does workflow depend on external service features?
│
├── NO → Keep in main repo (subdirectory)
│        Example: Python script, cron job, internal automation
│
└── YES → Does service require repository root access?
          │
          ├── YES → Separate repo (spoke)
          │        Example: Vercel, Netlify, GitHub Pages
          │        These services link to repo root, not subdirectories
          │
          └── NO → Can be subdirectory with service config
                   Example: GitHub Actions (works in monorepo)
                   Use service-specific config to point to subdirectory
```

---

## Service Constraints Reference

| Service | Requires Repo Root? | Recommendation |
|---------|---------------------|----------------|
| **Vercel** | Yes (can configure root dir, but messy) | Separate repo |
| **Netlify** | Yes (similar to Vercel) | Separate repo |
| **GitHub Pages** | Yes | Separate repo |
| **GitHub Actions** | No (monorepo-friendly) | Subdirectory OK |
| **AWS Lambda** | No (deploys from any directory) | Subdirectory OK |
| **Docker** | No | Subdirectory OK |
| **Terraform** | No | Subdirectory OK |

---

## Hub-Spoke Pattern

When you need multiple service-specific repos but want shared Agent Kernel components:

```
ss-automation/                  # The "Hub"
├── .claude/                    # Source of truth for Agent Kernel
│   ├── skills/
│   ├── commands/
│   └── principles/
├── docs/
├── scripts/
│   └── sync-kernel.sh          # Sync Agent Kernel to spokes
├── meta_to_sheets.py           # Internal workflows (stay here)
└── WORKFLOWS.md                # Index of all spoke repos

jousef-landing/                 # "Spoke" - Vercel-deployed website
├── .claude/                    # Synced from hub
├── src/
└── vercel.json

future-workflow/                # Another "spoke"
├── .claude/                    # Synced from hub
└── ...
```

### Sync Script Pattern

```bash
#!/bin/bash
# sync-kernel.sh - Copy Agent Kernel components to spoke repos

SPOKE_REPOS=(
  "../jousef-landing"
  "../future-workflow"
)

KERNEL_DIRS=(
  ".claude/skills"
  ".claude/commands"
  ".claude/principles"
)

for repo in "${SPOKE_REPOS[@]}"; do
  echo "Syncing to $repo..."
  for dir in "${KERNEL_DIRS[@]}"; do
    rsync -av --delete "$dir/" "$repo/$dir/"
  done
done

echo "Agent Kernel synced to all spokes"
```

---

## Examples

### Example 1: Website with Vercel (Needs Separate Repo)

**Scenario**: Building a landing page that needs Vercel auto-deploy on git push.

**Why separate repo?**
- Vercel links to repository root
- Auto-deploy triggers on any push to repo
- Root directory config adds complexity

**Solution**:
```bash
# Create spoke repo
gh repo create jousef-landing --public
cd jousef-landing

# Copy Agent Kernel from hub
cp -r ../ss-automation/.claude ./

# Link Vercel
npx vercel link
```

---

### Example 2: Python Automation (Stays in Hub)

**Scenario**: Adding a new data pipeline that runs via cron.

**Why stay in hub?**
- No external service requiring repo root
- Benefits from shared Agent Kernel
- Part of the automation workflow collection

**Solution**:
```bash
# Create in hub subdirectory
mkdir -p ss-automation/workflows/new-pipeline
```

---

### Example 3: GitHub Actions Workflow (Monorepo OK)

**Scenario**: Adding CI/CD for a subproject.

**Why monorepo works?**
- GitHub Actions supports monorepo via `paths` filter
- Can target specific subdirectories
- No repo root requirement

**Solution**:
```yaml
# .github/workflows/landing-page.yml
name: Landing Page CI
on:
  push:
    paths:
      - 'landing-page/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd landing-page && npm run build
```

---

## Anti-Patterns

### ❌ Forcing Service into Subdirectory

```
ss-automation/
├── landing-page/     # Website
│   └── vercel.json   # Points to this subdirectory
```

**Problem**: Vercel's root directory setting works but:
- Pollutes git history with unrelated changes
- CI triggers on all changes, not just landing-page
- Complex Vercel configuration

**Solution**: Separate repo (spoke pattern)

---

### ❌ Duplicating Agent Kernel Manually

```
jousef-landing/
├── .claude/          # Manually copied, never updated
```

**Problem**: Agent Kernel drifts between hub and spokes.

**Solution**: Use sync script, run periodically or before major work.

---

### ❌ Forgetting Service Constraints

```
"Let's just add it to the monorepo"
→ Weeks later: "Why isn't Vercel auto-deploying correctly?"
```

**Problem**: Didn't consider service constraints upfront.

**Solution**: Always ask "Does this service require repo root?" before structuring.

---

## Checklist: Adding New Workflow

- [ ] Does workflow depend on external service?
- [ ] Does service require repo root access?
- [ ] If yes → Create spoke repo, sync Agent Kernel
- [ ] If no → Create subdirectory in hub
- [ ] Update `WORKFLOWS.md` in hub with link to new workflow
- [ ] Set up sync script if spoke repo created

---

## See Also

- **Agent Kernel**: `.claude/AGENT-KERNEL.md` - Architecture overview
- **Hub-Spoke Guide**: `docs/guides/multi-project-orchestration.md`
- **Template Cloning**: `.claude/skills/template-cloning/` - For website workflows
