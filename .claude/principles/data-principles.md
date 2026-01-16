# Data Principles Cluster

**Load when**: Timezone handling, data processing, ETL operations

**Principles**: #16 (applicable), #3, #5, #14 (not applicable - no database)

**Note**: ss-automation uses Google Sheets as data destination, not a traditional database. Database-related principles (#3, #5, #14) are documented here for reference but not applicable to this project.

---

## Principle #16: Timezone Discipline (APPLICABLE)

Use consistent timezone across all system components. Single-timezone standardization eliminates mental conversion overhead and prevents date boundary bugs.

**For ss-automation**:
- Meta Ads API returns data in account timezone
- Google Sheets stores dates as entered
- Script processing should use explicit timezone

**Code pattern**:
```python
from zoneinfo import ZoneInfo

# ALWAYS explicit timezone for business dates
local_tz = ZoneInfo("Asia/Bangkok")  # Adjust to your timezone
today = datetime.now(local_tz).date()
```

**Anti-patterns**:
- Using `datetime.utcnow()` (implicit UTC)
- Using `datetime.now()` without explicit timezone
- Mixing timezones in date comparisons

---

## Principle #3: Database-First Data Architecture (NOT APPLICABLE)

> **Note**: ss-automation has no database. Data flows: Meta Ads API → Python → Google Sheets.

This principle applies to projects with database as source of truth. For ss-automation, the "source of truth" is the Meta Ads API, and Google Sheets is the output destination.

---

## Principle #5: Database Migrations Immutability (NOT APPLICABLE)

> **Note**: ss-automation has no database schema to migrate.

This principle applies to projects with database migrations. For ss-automation, schema changes would be Google Sheets column changes, which don't require migrations.

---

## Principle #14: Database Resource Naming Centralization (NOT APPLICABLE)

> **Note**: ss-automation has no database tables.

This principle applies to projects with database tables. For ss-automation, consider centralizing Google Sheets identifiers (spreadsheet IDs, sheet names) in config.

---

## Quick Checklist (ss-automation specific)

Before data processing:
- [ ] Explicit timezone in datetime operations
- [ ] Meta Ads API date parameters in expected format
- [ ] Google Sheets date formats consistent

Data freshness checks:
- [ ] Meta Ads API returning expected date range
- [ ] Google Sheets updated with latest data

---

*Cluster: data-principles*
