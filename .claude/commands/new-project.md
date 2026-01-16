# New Project Command

**Purpose**: Initialize a new workflow project with Agent Kernel components.

**Category**: Utility
**When to use**: Starting a new automation workflow, website, or service

---

## Usage

```bash
/new-project "project-name"
/new-project "project-name" --type=website
/new-project "project-name" --type=python
/new-project "project-name" --spoke
```

### Arguments

- `project-name` (required): Name for the new project (kebab-case)
- `--type` (optional): Project type (website, python, lambda, api)
- `--spoke` (optional): Create as separate repo (spoke pattern)

---

## Project Types

| Type | Template | Service | Default Structure |
|------|----------|---------|-------------------|
| `website` | Vite + React | Vercel | `src/`, `public/`, `vercel.json` |
| `python` | Python script | None | `src/`, `tests/`, `requirements.txt` |
| `lambda` | AWS Lambda | Lambda | `src/`, `tests/`, `template.yaml` |
| `api` | FastAPI | Lambda/ECS | `app/`, `tests/`, `Dockerfile` |

---

## Execution Flow

### Step 1: Determine Project Location

```
Is --spoke flag set OR does type require repo root service?
│
├── YES (Spoke) → Create in parent directory as separate repo
│                  ../project-name/
│
└── NO (Hub subdirectory) → Create in workflows/ subdirectory
                            ./workflows/project-name/
```

### Step 2: Create Project Structure

**For Website (Spoke)**:
```bash
# Create separate repo
cd ..
gh repo create project-name --public
cd project-name

# Initialize with Vite + React
npm create vite@latest . -- --template react-ts

# Copy Agent Kernel from hub
mkdir -p .claude
rsync -av ../ss-automation/.claude/skills/ .claude/skills/
rsync -av ../ss-automation/.claude/commands/ .claude/commands/
rsync -av ../ss-automation/.claude/principles/ .claude/principles/
cp ../ss-automation/.claude/AGENT-KERNEL.md .claude/

# Add Vercel config
cat > vercel.json <<'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
EOF

# Initial commit
git add .
git commit -m "Initial project setup with Agent Kernel"
```

**For Python (Hub subdirectory)**:
```bash
# Create in workflows/
mkdir -p workflows/project-name
cd workflows/project-name

# Initialize Python structure
mkdir -p src tests
touch src/__init__.py
touch tests/__init__.py

# Create requirements.txt
cat > requirements.txt <<'EOF'
# Core dependencies
python-dotenv>=1.0.0

# Add project-specific dependencies below
EOF

# Create main entry point
cat > main.py <<'EOF'
"""
Project: project-name
Entry point for the workflow.
"""
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main entry point."""
    logger.info("Starting project-name workflow")
    # TODO: Implement workflow logic
    logger.info("Workflow complete")

if __name__ == "__main__":
    main()
EOF
```

### Step 3: Update Hub Index

Add entry to `WORKFLOWS.md`:

```markdown
| project-name | [location] | [service] | Active |
```

### Step 4: Link to Service (if spoke)

```bash
# For Vercel
npx vercel link

# For Netlify
npx netlify link
```

---

## Output

```markdown
## Project Created: project-name

**Type**: website
**Location**: ../project-name (spoke)
**Service**: Vercel

### Structure
```
project-name/
├── .claude/              # Agent Kernel (synced from hub)
├── src/                  # Source code
├── public/               # Static assets
├── package.json          # Dependencies
└── vercel.json           # Vercel config
```

### Next Steps

1. **Install dependencies**:
   ```bash
   cd ../project-name
   npm install
   ```

2. **Start development**:
   ```bash
   npm run dev
   ```

3. **Link to Vercel** (if not done):
   ```bash
   npx vercel link
   ```

4. **Deploy**:
   ```bash
   npx vercel --prod
   ```

### Agent Kernel Status

✅ Skills synced (12 skills)
✅ Commands synced (40+ commands)
✅ Principles synced (6 clusters)

### Sync Command

To update Agent Kernel from hub:
```bash
cd ../ss-automation
./scripts/sync-kernel.sh project-name
```
```

---

## Examples

### Example 1: New Landing Page (Website Spoke)

```bash
/new-project "client-landing" --type=website --spoke
```

**Result**:
- Creates `../client-landing/` as separate repo
- Initializes Vite + React + TypeScript
- Syncs Agent Kernel from hub
- Adds Vercel config
- Creates GitHub repo

### Example 2: New Python Automation (Hub Subdirectory)

```bash
/new-project "email-sync" --type=python
```

**Result**:
- Creates `./workflows/email-sync/`
- Initializes Python project structure
- Adds to WORKFLOWS.md
- No separate repo needed

### Example 3: New API Service (Lambda Spoke)

```bash
/new-project "payment-api" --type=api --spoke
```

**Result**:
- Creates `../payment-api/` as separate repo
- Initializes FastAPI structure
- Syncs Agent Kernel
- Adds Dockerfile and Lambda config

---

## Integration with Skills

The `/new-project` command integrates with:

- **template-cloning**: For website projects with design templates
- **deployment**: For service deployment configuration
- **sales-landing-page**: For landing pages with conversion optimization

### Combining with Template Cloning

```bash
# Create project
/new-project "jousef-landing" --type=website --spoke

# Then apply template and style
cd ../jousef-landing
# Use template-cloning skill for design extraction
```

---

## Checklist: New Project

- [ ] Determine project type (website, python, lambda, api)
- [ ] Determine location (spoke vs hub subdirectory)
- [ ] Run `/new-project` command
- [ ] Install dependencies
- [ ] Link to service (if applicable)
- [ ] Update WORKFLOWS.md in hub
- [ ] Add to sync-kernel.sh SPOKES array (if spoke)
- [ ] Initial commit and push

---

## See Also

- **Service Integration Principles**: `.claude/principles/service-integration-principles.md`
- **Multi-Project Orchestration**: `docs/guides/multi-project-orchestration.md`
- **Template Cloning Skill**: `.claude/skills/template-cloning/`
- **Agent Kernel**: `.claude/AGENT-KERNEL.md`
