# AIP v7.57-D1 Hold Mode Operating Model

**Date:** 2026-05-21
**Phase:** D1
**Status:** Operating model for safe product hardening while release/restore are on hold

---

## 1. Purpose

Define what work is allowed, forbidden, and conditionally permitted while
release and restore are blocked by unfiled human authorizations.

---

## 2. Allowed Work While Release Is Blocked

| # | Work Type | Description | Source Code? | Auth Required? |
|---|---|---|---|---|
| A1 | Documentation clarity | Improve README, START_HERE, docs/product | No | No |
| A2 | Installer/readme refinement | Polish install instructions, env examples | No | No |
| A3 | Safe validation (plan-only) | Run typecheck, build, lint, plan-only scripts | No | No |
| A4 | UX polish plans | Document planned UI improvements | No | No |
| A5 | Repo hygiene plans | Plan handling of untracked/stale docs | No | No |
| A6 | Build warning review plans | Document and assess build warnings | No | No |
| A7 | Test evidence refresh | Run tests if services already running | No | No |
| A8 | Backlog prioritization | Order and refine product backlog | No | No |
| A9 | Task pack desktop archive | Save task packs per fixed workflow rule | No | No |

---

## 3. Forbidden Work Until Release Authorization

| # | Forbidden Action | Risk if Performed |
|---|---|---|
| F1 | Create Git tag | Premature release marker without consent |
| F2 | Create GitHub Release | Published release without authorization |
| F3 | Publish release notes | Public announcement without authorization |
| F4 | Enable Stage C | Safety boundary violation |
| F5 | Toggle feature flag on | Unauthorized feature exposure |
| F6 | Execute restore | Data integrity risk |
| F7 | Write to DB | Data mutation without consent |
| F8 | Restart services | Service disruption without notice |

---

## 4. Forbidden Work Until Restore Authorization

| # | Forbidden Action | Risk if Performed |
|---|---|---|
| R1 | Execute restore extraction | Workspace overwrite without consent |
| R2 | Overwrite `E:\AIP` with backup | Data loss risk |
| R3 | Restore DB snapshot | Data mutation without consent |
| R4 | Modify `.env.local` | Secret/credential risk |
| R5 | Run migrations | Schema change without consent |

---

## 5. Future Task Pack Desktop Archive Discipline

| Rule | Detail |
|---|---|
| Every task pack must include Phase -1 | Save full task pack to `C:\Users\74002\Desktop\AIP_TASK_PACKS` |
| Before project file changes | Task pack must be archived first |
| Overwrite protection | Timestamped backup if file exists |
| No git commit | Desktop task pack is never staged or committed |
| Receipt must mention path | Final receipt includes the saved path |

---

## 6. Anti-Accidental Tag/Release/Restore Rules

| # | Rule | Mechanism |
|---|---|---|
| 1 | No `git tag` without explicit authorization | Human auth form + pre-tag checklist |
| 2 | No `git push --tags` without authorization | Blocked by rule 1 |
| 3 | No `gh release create` without authorization | Requires human auth form |
| 4 | No `node scripts/restore.mjs --execute` | Requires restore auth form + precheck |
| 5 | Never use `--execute` or `--force` flags unless explicitly authorized | Safety invariant |
| 6 | All dangerous commands marked `FUTURE AUTHORIZED ONLY` | Documented in restore verification plan |

---

## 7. Anti-Accidental v7.52 Staging Rules

| # | Rule |
|---|---|
| 1 | `git add` must only target `docs/product/AIP_V7_57_*` files |
| 2 | Never `git add docs/product/AIP_V7_52_*` |
| 3 | If `git add .` is used, verify with `git status --short` before commit |
| 4 | Unrelated v7.52 docs remain untracked — no action in D1 |
