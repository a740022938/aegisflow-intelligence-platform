# AIP v7.56-D1 Release Scope and Exclusions

**Date:** 2026-05-21
**Phase:** D1

---

## 1. Included Scope

The v7.55 release (if authorized) includes:

- **Product name:** OpenAIP (AIP)
- **Version metadata:** v7.55.0 aligned across 6 files
- **Documentation:** README, START_HERE, product docs (v7.55 series)
- **Engineering evidence:** P1–P5 hardening deliverables
- **Build artifacts:** Web UI production build (`vite build`)
- **Safety stance:** Stage C DISABLED, feature flag OFF, readonly-first

The release tag captures the engineering state after v7.55-P5, which includes:

1. Fresh install documentation consistency (P1)
2. Restore artifact dry-pack standards (P2)
3. Version metadata bump 7.46.0 → 7.55.0 (P3)
4. `.env.example` security hardening (P3)
5. Reading order restructuring (P3)
6. Release gate evidence pack (P4)
7. Human authorization template (P4)
8. Final readiness recheck with 9/9 smoke tests (P5)

---

## 2. Excluded Scope

The following are **not** part of the v7.55 release scope and remain
forbidden unless separately authorized:

| Area | Reason |
|---|---|
| Stage C enablement | Safety invariant — not authorized |
| Feature flag toggle | Safety invariant — not authorized |
| Real restore execution | Requires separate restore authorization |
| DB migration/write | Schema changes not part of this release |
| External control execution | No connector action authorized |
| Hidden preview/sidebar expansion | UI scope frozen since v7.54 |
| New runtime features | Feature-complete per v7.55 hardening scope |
| GitHub Release creation during D1 | Not authorized |
| Tag creation during D1 | Not authorized |
| Unrelated v7.52 docs | Not part of v7.55 scope |
