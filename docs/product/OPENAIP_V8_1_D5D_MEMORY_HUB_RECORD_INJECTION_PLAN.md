# OpenAIP v8.1 — D5D Memory Hub Record Injection Plan

| Field | Value |
|-------|-------|
| **Phase** | D5D Memory Hub Record Injection Plan |
| **D5D HEAD** | `8376934` (docs-only — no source changes) |
| **Date** | 2026-05-24 |
| **Nature** | Injection plan — draft records design, SQLite schema survey, authorization template, injection runbook. No DB write, no record injection executed. |
| **Final Verdict** | `OPENAIP_V8_1_D5D_MEMORY_HUB_RECORD_INJECTION_PLAN_READY_AWAITING_OWNER_AUTHORIZATION` |

---

## 1. Memory Hub SQLite Schema (Read-Only Survey)

### Database File

`E:\_AIP_MEMORY_HUB\memory_hub.sqlite` (131072 bytes, 62 memory records)

### Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `memories` | **62** | Main memory records store |
| `audit_log` | 105 | Audit trail of all operations |
| `decisions` | 1 | Decision records (approve/reject/archive) |
| `exports` | 19 | Export audit log |
| `projects` | 6 | Project registry |
| `secret_log` | 2 | Sensitive content detection log |
| `assistant_notes` | 0 | Assistant annotations |
| `events` | 0 | Event log |
| `memory_versions` | 0 | Version history |
| `sources` | 0 | Source registry |
| `tasks` | 0 | Task registry |

### `memories` Table Schema (21 columns)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `project` | TEXT | NOT NULL |
| `level` | TEXT | NOT NULL, CHECK IN ('L0_safety','L1_current','L2_project','L3_history','L4_reference') |
| `category` | TEXT | nullable |
| `title` | TEXT | NOT NULL |
| `content` | TEXT | NOT NULL |
| `summary` | TEXT | nullable |
| `status` | TEXT | DEFAULT 'candidate', CHECK IN ('candidate','approved','published','rejected','archived','superseded') |
| `confidence` | TEXT | DEFAULT 'unknown', CHECK IN ('verified','high','medium','low','unknown') |
| `source` | TEXT | nullable |
| `source_type` | TEXT | DEFAULT 'manual', CHECK IN ('manual','auto','import') |
| `tags` | TEXT | nullable (comma-separated) |
| `sensitive` | INTEGER | DEFAULT 0 |
| `expires_at` | TEXT | nullable |
| `created_at` | TEXT | DEFAULT datetime('now','localtime') |
| `updated_at` | TEXT | DEFAULT datetime('now','localtime') |
| `approved_at` | TEXT | nullable |
| `approved_by` | TEXT | nullable |
| `supersedes_id` | INTEGER | FOREIGN KEY → memories(id) |
| `checksum` | TEXT | SHA256(title + content) |

### Current Memory Distribution

| Level | Count | Status |
|-------|-------|--------|
| L0_safety | 15 | All published |
| L1_current | 4 | All published |
| L2_project | 25 | All published |
| L3_history | 10 | All published |
| L4_reference | 8 | 7 published, 1 archived |
| **Total** | **62** | **61 published, 1 archived** |

---

## 2. Injection Tooling

### CLI Commands Available

| Command | Usage | Description |
|---------|-------|-------------|
| `add-candidate` | `python memory_cli.py add-candidate --project AIP --level L2_project --title "..." --content "..." --source manual` | Inserts a memory record with status='candidate' |
| `approve` | `python memory_cli.py approve --id N` | Changes status from 'candidate' to 'published' |
| `export` | `python memory_cli.py export` | Regenerates export files from DB |
| `backup` | `python memory_cli.py backup` | Creates timestamped backup of SQLite |
| `check` | `python memory_cli.py check` | Integrity check |
| `status` | `python memory_cli.py status` | Database status overview |

### Injection Flow

```
1. python memory_cli.py backup
2. python memory_cli.py add-candidate --project AIP --level ... --title ... --content ...
   [repeat for each record]
3. python memory_cli.py approve --id N
   [repeat for each candidate]
4. python memory_cli.py export
```

### Dry-Run Capability

There is **no built-in dry-run** mode in the CLI. Dry-run is achieved by:
1. Backing up the DB first (`backup`)
2. Reviewing the draft JSON records before executing any commands
3. Manually verifying each `INSERT` command against the schema

---

## 3. Draft Records Summary

**15 records** designed covering the OpenAIP v8.1 D1-D5C journey:

| # | ID | Type | Title | Level |
|---|-----|------|-------|-------|
| 1 | `openaip-v8-1-d1-d5c-journey` | project_milestone | OpenAIP v8.1 Release Readiness Journey D1-D5C | L2_project |
| 2 | `openaip-v8-1-nav-finalized` | ui_product_decision | Product Navigation Finalized | L2_project |
| 3 | `openaip-v8-1-copy-hotfix` | ui_copy_decision | Navigation Copy and Footer Hotfix | L2_project |
| 4 | `openaip-v8-1-visual-gate-passed` | visual_acceptance | Human Visual Gate Passed | L2_project |
| 5 | `openaip-v8-1-release-workflow` | release_process | Release Workflow Readiness Planned | L2_project |
| 6 | `openaip-v8-1-owner-review` | product_owner_decision | Product Owner Release Review Ready | L2_project |
| 7 | `openaip-v8-1-auth-unsigned` | authorization_state | Release Authorization Remains Unsigned | L1_current |
| 8 | `openaip-v8-1-safety-boundary` | safety_boundary | Safety Boundary Preserved | L0_safety |
| 9 | `memory-hub-freshness-gap` | memory_hub_finding | Export Timestamp Refreshed but Content Stale | L2_project |
| 10 | `openaip-v8-1-d6-no-go` | release_blocker | D6 Release Execution Remains NO-GO | L1_current |
| 11 | `openaip-product-positioning` | product_principle | Must Present as Real Local AI Console | L0_safety |
| 12 | `memory-hub-purpose` | product_principle | Memory Hub is Traceable Decision Layer | L3_history |
| 13 | `openaip-v8-i18n-sealed` | ui_completion | Bilingual i18n Sealed | L2_project |
| 14 | `openaip-v8-execution-gateway` | ui_safety_feature | Execution Gateway Shows Closed Gate | L2_project |
| 15 | `memory-hub-d5d-plan-status` | plan_status | D5D Injection Plan Completed | L2_project |

See `OPENAIP_V8_1_D5D_MEMORY_HUB_RECORDS_DRAFT.json` for full detail including evidence commits, docs, tags, and safety state.

---

## 4. Injection Runbook (D5E Draft)

### Pre-Execution

1. **Precheck**: Verify git working tree clean (branch=main, HEAD at current)
2. **Authorize**: Owner signs `OPENAIP_V8_1_D5D_MEMORY_HUB_RECORD_INJECTION_AUTHORIZATION_TEMPLATE.md`
3. **Backup**: `python E:\_AIP_MEMORY_HUB\memory_cli.py backup`
4. **Verify backup**: Check backup file created in `E:\_AIP_MEMORY_HUB\backups\manual\`

### Record Insertion

5. **For each draft record** (15 total):
   - Extract title, content, project, level, confidence, source, source_type, tags from draft JSON
   - Map to SQLite `memories` columns
   - Insert via `add-candidate`:
     ```
     python E:\_AIP_MEMORY_HUB\memory_cli.py add-candidate \
       --project AIP \
       --level L2_project \
       --title "Record Title" \
       --content "Content with details" \
       --source opencode_automated_pipeline
     ```
   - Record the returned candidate ID

### Approve Records

6. **For each candidate**:
   ```
   python E:\_AIP_MEMORY_HUB\memory_cli.py approve --id N
   ```

### Export and Verify

7. **Export**: `python E:\_AIP_MEMORY_HUB\memory_cli.py export`
8. **Verify**:
   - `context_manifest.json` `generated_at` updated
   - `generated_at` for each file updated
   - Export file count increased (new v8.1 records)
   - Memory Hub page shows new records and updated timestamp
   - SQLite file size changed (new records added)
   - Git working tree still clean

### Post-Execution

9. **Safety check**: Gate CLOSED, Stage C disabled, Execution disabled confirmed
10. **No release/tag**: Confirmed not performed
11. **Generate D5E report**: Document all changes

### Rollback

If injection fails or produces errors:
- Restore from backup: `copy E:\_AIP_MEMORY_HUB\backups\manual\memory_hub_backup_*.sqlite E:\_AIP_MEMORY_HUB\memory_hub.sqlite`
- Run export: `python memory_cli.py export`
- Verify original state restored

---

## 5. Safety Confirmation

| Item | Status |
|------|--------|
| Memory Hub SQLite written | **NO** (draft only) |
| AIP DB written | NO |
| Vector DB written | NO |
| Indexing performed | NO |
| Memory candidates generated | NO (drafted) |
| Export executed | NO |
| Gate CLOSED | ✅ Unchanged |
| Stage C disabled | ✅ Unchanged |
| Execution disabled | ✅ Unchanged |
| Release/tag performed | NO |
| Git working tree clean | ✅ |

---

## 6. Recommended Next Step

1. Human owner reviews the 15 draft records in `OPENAIP_V8_1_D5D_MEMORY_HUB_RECORDS_DRAFT.json`
2. If approved, owner signs `OPENAIP_V8_1_D5D_MEMORY_HUB_RECORD_INJECTION_AUTHORIZATION_TEMPLATE.md`
3. Execute D5E Memory Hub Record Injection following the runbook above
4. D6 remains NO-GO until both Memory Hub record injection AND release authorization are resolved

---

*Generated by opencode automated pipeline — 2026-05-24*
