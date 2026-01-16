# Configuration Principles Cluster

**Load when**: Managing secrets, environment variables, external service credentials (Meta API, Google Sheets)

**Principles**: #13, #24 (both applicable)

**Related**: [google-sheets skill](../skills/google-sheets/)

---

## Principle #13: Secret Management Discipline (APPLICABLE)

Centralize secrets and validate at application startup (fail-fast). For ss-automation, critical secrets include Meta API credentials and Google Sheets service account.

**ss-automation secrets**:
```
META_ACCESS_TOKEN      # Meta Ads API access token
META_APP_ID            # Meta App ID
META_APP_SECRET        # Meta App Secret
META_ACCOUNT_ID        # Ad account ID(s)
GOOGLE_CREDENTIALS     # Service account JSON (base64 or file path)
SPREADSHEET_ID         # Target Google Sheet ID
```

**Configuration options** (choose one):
1. **Environment variables** (simple, local)
2. **Doppler** (team, multi-environment)
3. **`.env` file** (local development only)

**Startup validation pattern**:
```python
# src/config.py
import os

def validate_config():
    required = [
        'META_ACCESS_TOKEN',
        'SPREADSHEET_ID',
    ]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        raise RuntimeError(f"Missing required config: {missing}")

# Call at startup
validate_config()
```

**Anti-patterns**:
- Hardcoding secrets in code
- Committing `.env` to git
- Silently using defaults when secrets missing

---

## Principle #24: External Service Credential Isolation (APPLICABLE)

External services require careful credential management. For ss-automation:

**Meta Ads API**:
- Access tokens are user/app specific
- Tokens expire and need refresh
- Different accounts may need different tokens
- Sandbox vs production modes

**Google Sheets**:
- Service account per project/environment
- Sheet must be shared with service account email
- Different sheets for dev vs production data

**Isolation checklist for ss-automation**:
1. Create Google Cloud project
2. Enable Google Sheets API
3. Create service account
4. Download JSON key
5. Share target sheet with service account email
6. Configure Meta app (if using app-based auth)
7. Verify end-to-end: fetch → process → write → **data appears in sheet**

**Verification**: API success is Layer 1 evidence. Ground truth = data actually appears in Google Sheet with correct values.

**Anti-patterns**:
- Sharing service account across unrelated projects
- Using personal Google account for automation
- Assuming API 200 = data written correctly

---

## Quick Checklist (ss-automation specific)

Initial setup:
- [ ] Meta access token obtained and stored securely
- [ ] Google Cloud project created
- [ ] Service account created with Sheets API access
- [ ] Service account JSON key downloaded
- [ ] Target spreadsheet shared with service account
- [ ] Credentials stored (env vars, Doppler, or .env)

Startup validation:
- [ ] All required secrets validated at startup
- [ ] Clear error message if secrets missing
- [ ] No silent fallbacks to default values

Credential maintenance:
- [ ] Meta token refresh process documented
- [ ] Service account key rotation process (if needed)
- [ ] Credentials not committed to git

---

*Cluster: configuration-principles*
