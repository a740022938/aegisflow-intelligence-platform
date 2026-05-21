# AIP v7.55-D1 Release Gate Hardening Plan

**Date:** 2026-05-21
**Phase:** D1 Blueprint
**Status:** Plan only — no tag or release created

---

## 1. Objective

Define the release gate conditions and evidence requirements for the eventual
v7.55 release. This document does not create any tag or GitHub Release.

---

## 2. Current Release Status

| Property | Status |
|---|---|
| Last git tag | `v7.3.0` (historical) |
| Last GitHub Release | `v7.3.0` (historical) |
| Tag created in v7.55-D1 | ❌ NOT AUTHORIZED |
| GitHub Release in v7.55-D1 | ❌ NOT AUTHORIZED |

---

## 3. Tag Creation Conditions (Future Gate)

ALL must pass before a tag is created:

| # | Condition | Status (v7.55-D1) | Required For |
|---|---|---|---|
| T1 | Human owner written authorization | ❌ NOT OBTAINED | Tag |
| T2 | Final version number decided | ❌ NOT DECIDED | Tag |
| T3 | Release notes draft reviewed and approved | ❌ NOT DRAFTED | Tag |
| T4 | Secrets scan passed | ⏳ DEFERRED | Tag |
| T5 | Fresh install smoke test passed | ⏳ DEFERRED (P1) | Tag |
| T6 | Restore dry run passed | ⏳ DEFERRED (P2) | Tag |
| T7 | Evidence pack generated (typecheck/build/lint/test) | ⏳ DEFERRED (P3) | Tag |
| T8 | Rollback command documented | ⏳ DEFERRED (P3) | Tag |
| T9 | Stage C remains DISABLED | ✅ CONFIRMED | Tag |
| T10 | Authorization receipt filed | ❌ NOT FILED | Tag |

**Gate status: CLOSED** — 8 of 10 conditions unmet.

---

## 4. Release Notes Conditions

Release notes must include:
- Summary of changes since last tag (v7.3.0)
- Key features added (including v7.41–v7.55 work)
- Known issues / deferred items
- Install instructions
- Upgrade instructions (if applicable)
- Safety notices (Stage C, feature flag, etc.)

---

## 5. Evidence Pack Requirements

Before any tag/release, the following must be generated and filed:

```text
docs/product/AIP_V7_55_P4_EVIDENCE_PACK.md
```

Must include:
- `pnpm run typecheck` — output
- `pnpm run build` — output
- `pnpm run lint` — output
- `pnpm test` — output
- `pnpm run secret:scan` — output
- Fresh install dry run results
- Restore dry run results
- Authorization receipt reference

---

## 6. Human Authorization Template

See `AIP_V7_49_RELEASE_AUTHORIZATION_TEMPLATE.md` for the existing template.
Update for v7.55 version if needed.

---

## 7. Rollback Strategy

### Before Tag
```powershell
git reset --hard HEAD~1
```

### After Tag But Before Release
```powershell
git tag -d v7.55.0
git push origin :refs/tags/v7.55.0
```

### After GitHub Release
```powershell
git revert <release-commit> --no-edit
git push origin main
gh release delete v7.55.0
```

---

## 8. No Tag or Release in D1

```text
NO TAG OR GITHUB RELEASE IS AUTHORIZED IN v7.55-D1.

All tag/release work is deferred to v7.55-P5 (Final Release Decision Gate)
and requires explicit human owner authorization.
```
