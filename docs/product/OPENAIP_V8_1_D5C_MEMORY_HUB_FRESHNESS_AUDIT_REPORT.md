# OpenAIP v8.1 — D5C Memory Hub Freshness Audit Report

| Field | Value |
|-------|-------|
| **Phase** | D5C Memory Hub Freshness Audit |
| **D5C HEAD** | `314e836` (same as D5B — docs-only audit, no source changes) |
| **Date** | 2026-05-24 |
| **Nature** | Read-only diagnosis of Memory Hub data freshness. No DB write, no refresh executed without authorization. |
| **Final Verdict** | `OPENAIP_V8_1_D5C_MEMORY_HUB_FRESHNESS_AUDIT_READY_REFRESH_PENDING_AUTHORIZATION` |

---

## 1. Memory Hub Data Source Analysis

### Page Component

| Page | Route | Component | Data Source |
|------|-------|-----------|-------------|
| Memory Hub (Legacy) | `/memory-hub` | `apps/web-ui/src/pages/MemoryHubReadonly.tsx` | Backend API → `E:\_AIP_MEMORY_HUB` export files |
| Memory + Knowledge Center | `/openaip-v8-memory-knowledge-center-preview` | `apps/web-ui/src/pages/OpenAIPv8MemoryKnowledgeCenterPreview.tsx` | Static registry `openAipv8CenterData.ts` (git-tracked) |

The **freshness issue** is with the Legacy Memory Hub page (`/memory-hub`). The v8 Memory + Knowledge Center Preview page uses static registry data which was updated during D1 navigation finalization — that page is already current.

### Backend Data Source

- **Server route**: `apps/local-api/src/routes/memory-hub/index.ts` (668 lines)
- **Root directory**: `E:\_AIP_MEMORY_HUB` (note: underscore prefix, NOT `E:\AIP_MEMORY_HUB`)
- **Config mechanism**: `MEMORY_HUB_ROOT` env var, defaults to `E:\_AIP_MEMORY_HUB`
- **API endpoints**: `/api/memory-hub/{status,bootstrap,stats,manifest,profiles,profile/:name,candidates/*,...}`

### Directory Structure

```
E:\_AIP_MEMORY_HUB/
├── exports/
│   ├── assistant_bootstrap.md        (7151 bytes)
│   ├── latest_context.md             (26326 bytes)
│   ├── aip_context.md                (4074 bytes)
│   ├── safety_rules.md               (6741 bytes)
│   ├── active_projects.md            (301 bytes)
│   ├── openaxiom_context.md          (2494 bytes)
│   ├── openclaw_context.md           (34 bytes)
│   ├── mahjong_context.md            (3209 bytes)
│   ├── memory_dictionary.md          (16407 bytes)
│   ├── keyword_index.md              (9762 bytes)
│   ├── memory_index.md               (3306 bytes)
│   ├── profiles/                     (6 agent profile .md files)
│   └── machine/
│       ├── context_manifest.json     (manifest_version, generated_at, file list)
│       ├── memory_stats.json         (export_time, db memory counts)
│       ├── latest_context.json       (29995 bytes)
│       ├── active_projects.json
│       ├── safety_rules.json
│       ├── assistant_profiles.json
│       └── ... (search_index, alias_index, relation_index, etc.)
├── inbox/
│   ├── candidates/
│   ├── candidates_pending/
│   ├── candidates_test/
│   ├── candidates_approved/
│   ├── candidates_rejected/
│   ├── candidates_archived/
│   ├── candidates_imported/
│   └── ... 
├── config/                           (access, assistants, export, governance, profiles, projects, retrieval, rules .yaml)
├── backups/
├── blueprints/
├── data/
├── docs/
├── logs/
├── reports/
├── tests/
├── tools/
├── memory_hub.sqlite                 (131072 bytes — SQLite DB)
└── memory_cli.py                     (46657 bytes — Python export CLI)
```

### Generated Timestamp Origin

The `generated: 2026-05-14 ...` displayed on the Memory Hub page comes from:

1. **Primary source**: `E:\_AIP_MEMORY_HUB\exports\machine\context_manifest.json` → field `"generated_at": "2026-05-14 19:41:29"`
2. **Manifest endpoint**: `/api/memory-hub/manifest` returns `{ data: { generated_at: "2026-05-14 19:41:29", ... } }`
3. **Page display**: `MemoryHubReadonly.tsx` line 266: `<div>生成时间: {manifest.data.generated_at || '未知'}</div>`
4. **Bootstrap**: `assistant_bootstrap.md` line: `**Generated:** 2026-05-14 19:41:29`

---

## 2. Freshness Gap Analysis

### Memory Hub Content State (as of last export 2026-05-14 19:41:29)

| Area | Memory Hub Content | Actual Project State (2026-05-24) |
|------|-------------------|-----------------------------------|
| AIP version | v7.3.0-rc1 / v7.3.0-rc2 | v8.1 (readonly control-plane shell) |
| Navigation | Pre-D1 sidebar structure | D1 final: 9 readonly centers, bilingual, semantic icons |
| Visual acceptance | Not reflected | D2 sealed: all visual criteria PASS |
| Release workflow | Not reflected | D3 plan: 6-gate checklist, rollback, version strategy |
| Owner review | Not reflected | D4 Go: GO_TO_RELEASE_AUTHORIZATION_PACK |
| Authorization pack | Not reflected | D5: authorization form pending, runbook drafted |
| Screenshot gates | Not reflected | D5A CLI attempt, D5B human-reviewed PASS |
| Gate state | Not reflected | CLOSED |
| Stage C | Not reflected | disabled |
| Execution | Not reflected | disabled |
| Release/tag | Not reflected | not performed |
| D6 status | Not reflected | NO-GO (pending owner signature) |

### Commit Gap

Memory Hub last generated while project was at approximately commit range **May 13-14** (v7.3.0 era). Current HEAD is `314e836` (D5B, May 24). The gap covers all 9 D1–D5B commits:

```
c9f48dd  D1 navigation finalization
1ef8015  D1A copy/footer hotfix
00b452f  D2 visual acceptance seal
0f90f22  D3 release workflow readiness
29f6ca1  D4 product owner release review
29a053f  D5 release authorization pack
ddff846  D5A screenshot gate CLI attempt
314e836  D5B human visual gate archive
```

**Freshness Gap Duration: ~10 days (2026-05-14 → 2026-05-24)**

---

## 3. Refresh Mechanism

### Export Pipeline

The `memory_cli.py` script at `E:\_AIP_MEMORY_HUB\memory_cli.py` (46KB) provides an `export` command:

```
python memory_cli.py export
```

This is called after candidate approval (line 546 of memory-hub/index.ts):
```typescript
execFileSync('python', [hubPath('memory_cli.py'), 'export'], ...);
```

The export process:
1. Reads from `memory_hub.sqlite` (memories table)
2. Generates export files: `exports/*.md`, `exports/machine/*.json`
3. Updates `context_manifest.json` with new `generated_at` timestamp
4. All exports are timestamped with the current time

### Safety Assessment

| Action | Required? | Safety |
|--------|-----------|--------|
| SQLite DB read | Yes (export reads DB) | ✅ Safe — read-only |
| SQLite DB write | No (export is read-only from DB) | ✅ Safe |
| Export file write (JSON/MD) | Yes (regenerates exports) | ⚠️ External file write |
| Config file write | No | ✅ Safe |
| Candidate file write | No (unless approve/reject) | ✅ Safe |
| Git-tracked file write | No (`E:\_AIP_MEMORY_HUB` not in git repo) | N/A |
| Indexing | No | ✅ Safe |
| Vector DB write | No | ✅ Safe |
| External/Provider action | No | ✅ Safe |

---

## 4. Route Decision

| Route | Condition | Verdict |
|-------|-----------|---------|
| **Route A** — Static tracked refresh allowed | Data from git-tracked static files | ❌ NOT applicable — Memory Hub data is in `E:\_AIP_MEMORY_HUB`, not git-tracked |
| **Route B** — External file refresh requires authorization | Data in non-git-tracked external files, no DB write | ✅ MATCH — Export writes to `E:\_AIP_MEMORY_HUB/exports/*.{md,json}` |
| **Route C** — DB/sqlite/indexing refresh requires explicit authorization | Requires SQLite/vector/indexing write | ⚠️ PARTIAL — Export reads SQLite but does NOT write to it. However, the Memory Hub ecosystem includes `memory_hub.sqlite` which COULD be affected by future candidate operations |

### Final Route: **Route B**

> Refresh of Memory Hub export files (`E:\_AIP_MEMORY_HUB/exports/`) requires human owner authorization because the target directory is outside the git repo.

**Refresh would NOT:**
- Write to SQLite DB (read-only for export)
- Write to git-tracked files
- Open Gate, enable Stage C, enable execution
- Create tag/release
- Modify auth/gate logic
- Index or write to vector DB
- Run provider/local-app/connector actions

**Refresh WOULD:**
- `python memory_cli.py export` — regenerate export JSON/MD files
- Update `context_manifest.json` `generated_at` timestamp
- Update export file contents to reflect current project state
- Modify files in `E:\_AIP_MEMORY_HUB/exports/`

---

## 5. Safety Confirmation

| Safety Item | Status |
|-------------|--------|
| Gate CLOSED | ✅ Unchanged |
| Stage C disabled | ✅ Unchanged |
| Execution disabled | ✅ Unchanged |
| No release/tag performed | ✅ Confirmed |
| No auth/gate logic change | ✅ Confirmed |
| No DB write | ✅ Confirmed (export is read-only from DB) |
| No SQLite write | ✅ Confirmed |
| No indexing/vector DB | ✅ Confirmed |
| No provider/connector action | ✅ Confirmed |
| No candidate processing | ✅ Confirmed |
| Working tree clean | ✅ Confirmed |
| HEAD unchanged | ✅ `314e836` |
| No git config changes | ✅ Confirmed |

---

## 6. Recommended Verdict

```
OPENAIP_V8_1_D5C_MEMORY_HUB_FRESHNESS_AUDIT_READY_REFRESH_PENDING_AUTHORIZATION
```

The Memory Hub export data (`E:\_AIP_MEMORY_HUB/exports/`) is stale by ~10 days and does not reflect OpenAIP v8.1 D1–D5B project state. A refresh via `python memory_cli.py export` would regenerate the exports without writing to SQLite or making git-tracked changes.

However, because `E:\_AIP_MEMORY_HUB` is outside the git repository, any file writes there require **human owner authorization**. A refresh authorization request template has been generated alongside this report.

**Next step**: Await human owner to sign `OPENAIP_V8_1_D5C_MEMORY_HUB_REFRESH_AUTHORIZATION_TEMPLATE.md`. Once signed, execute `python memory_cli.py export` to refresh Memory Hub content. If denied, no action is taken.

---

*Generated by opencode automated pipeline — 2026-05-24*
