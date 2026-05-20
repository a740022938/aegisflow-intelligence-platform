# AIP v7.46 — Auth Review Page Canonical Map

**Status:** P4 Final
**Date:** 2026-05-20

---

## 1. The Problem

There are 4 page files with "Authorization Review" in their name. An operator cannot distinguish them.

## 2. Current Pages

| # | Route | Lines | Phase | Focus |
|---|-------|-------|-------|-------|
| 1 | `/stage-c-authorization-review-console-preview` | 362 | v7.43-P1 | Dashboard of authorization contracts + validation |
| 2 | `/stage-c-authorization-artifact-review-preview` | 234 | v7.43-P2 | Validates 32 artifact review items |
| 3 | `/stage-c-authorization-gate-seal-preview` | 205 | v7.43-P4 | Gate seal state + validator |
| 4 | `/stage-c-authorization-review-pack-preview` | 205 | v7.43-P3 | Review pack registry + summary |

## 3. Canonical Map

| Role | Page | Rationale |
|------|------|-----------|
| **Canonical entry point** | `/stage-c-authorization-review-console-preview` | Most comprehensive (362 lines). Dashboard + contracts + validation. |
| **Artifact review** | `/stage-c-authorization-artifact-review-preview` | Specialized for artifact checklist (32 items). Supplementary. |
| **Gate seal** | `/stage-c-authorization-gate-seal-preview` | Specialized for gate seal state. Supplementary. |
| **Review pack** | `/stage-c-authorization-review-pack-preview` | Specialized for pack registry. Supplementary. |

## 4. Labels for Clarity

If labels are updated in the future:

```
Authorization Review Console   [CURRENT]  ← entry point
Authorization Artifact Review  [REFERENCE]
Authorization Gate Seal        [REFERENCE]
Authorization Review Pack      [REFERENCE]
```

## 5. Important Note

All 4 pages are **preview/design only**. None of them enable Stage C. None of them trigger real operations. They are readonly references.

## 6. Duplicate Risk

The 4 pages are not strict duplicates — they cover different facets (contracts, artifacts, gate seal, pack). However, the naming is confusing. A single "Authorization Review" page that aggregates all 4 facets would be cleaner but is out of scope for v7.46.
