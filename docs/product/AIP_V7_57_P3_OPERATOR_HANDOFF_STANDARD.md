# AIP v7.57-P3 Operator Handoff Standard

**Date:** 2026-05-21
**Phase:** P3
**Status:** Standard — applies to all future task packs

---

## 1. Required Task Pack Sections

Every task pack must include:

| Section | Required | Content |
|---|---|---|
| Phase -1 | ✅ Mandatory | Desktop task pack archive (see `AIP_V7_57_P3_DESKTOP_TASK_PACK_ARCHIVE_STANDARD.md`) |
| Baseline | ✅ Mandatory | Latest known phase, commit, verdict, working tree state |
| Forbidden actions | ✅ Mandatory | Explicit list of hard-forbidden actions |
| Allowed scope | ✅ Mandatory | Explicit list of permitted work |
| Mission statement | ✅ Mandatory | Clear one-line mission |
| Phase list | ✅ Mandatory | Numbered phases (0–8) |
| Receipt template | ✅ Mandatory | Required receipt fields in final phase |

---

## 2. Baseline Block

Every task pack should open with:

```
Known baseline:
- Latest completed phase: <phase>
- Latest known commit: <hash>
- Latest verdict: <verdict>
- Release decision: <HOLD/PROCEED>
- Restore decision: <HOLD/PROCEED>
- Stage C: <DISABLED/ENABLED>
- Feature flag: <OFF/ON>
- Key blockers: <list>
```

---

## 3. Forbidden Actions Block

Every task pack must list forbidden actions explicitly:

```
Hard forbidden actions:
- Do NOT create Git tag
- Do NOT create GitHub Release
- Do NOT execute restore
- Do NOT overwrite E:\AIP
- Do NOT write/restore DB
- Do NOT enable Stage C
- Do NOT toggle feature flag
- Do NOT modify source code
- Do NOT modify .env.local
- Do NOT treat this task as release or restore authorization
```

---

## 4. Allowed Scope Block

Every task pack must list allowed scope:

```
Allowed scope:
- Create <phase> docs under docs/product
- Optional external report/receipt
- Optional roadmap update
```

---

## 5. Receipt Requirements

Every phase receipt must include:

| Field | Required |
|---|---|
| Completion (是否完成) | ✅ |
| Final Verdict | ✅ |
| Pre-HEAD | ✅ |
| Post-HEAD | ✅ |
| Commit hash | ✅ |
| Push status | ✅ |
| Desktop task pack path | ✅ |
| Files created/modified | ✅ |
| Source code modified | ✅ |
| Authorization statuses | ✅ |
| Tag/release/restore status | ✅ |
| Safety invariants | ✅ |
| Validation results | ✅ |
| Recommended next step | ✅ |

---

## 6. Prohibition Notice

No tag, release, or restore action may be taken unless an explicit
human authorization form is filed. This prohibition applies to all
task packs regardless of their content.
