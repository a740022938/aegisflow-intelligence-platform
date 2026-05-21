# AIP v7.61-D1 Prechange Baseline and Metrics Plan

**Phase:** v7.61-D1
**Status:** DEFINED

---

## Baseline (v7.61-D1)

| Metric | Value |
|---|---|
| `git status` | Clean of source changes (doc-only receipt edits + taskpacks) |
| HEAD | `044c53e7ede3a9374ee4a0c008a046adc2b42d70` |
| GovernanceCenter chunk | 930.88 kB |
| Build warnings | 1 (GovernanceCenter > 500 kB) |
| Build modules | 740 |
| Route behavior | GovernanceCenter renders via React.lazy at route level |
| Validation status | typecheck ✅, build ✅, lint ✅, diff-check ✅ |

## Source File List (Identified)

| File | Path | Role |
|---|---|---|
| GovernanceCenter | `apps/web-ui/src/pages/GovernanceCenter.tsx` | Entry point (1231 lines) |
| governance-registry | `apps/web-ui/src/registry/governance-registry` | Static data (GOVERNANCE_REGISTRY) |
| governance-registry-validator | `apps/web-ui/src/registry/governance-registry-validator` | Validation logic |

## Rollback Command (Documented)

```bash
git revert <implementation-commit> --no-edit
pnpm run typecheck && pnpm run build && pnpm run lint && git diff --check
```

---

## Required Before/After Metrics

| Metric | Before | After | Measurement Method |
|---|---|---|---|
| GovernanceCenter chunk size | ✓ | ✓ | `pnpm run build` output |
| Build warning count | ✓ | ✓ | `pnpm run build` output |
| Total build modules | ✓ | ✓ | `pnpm run build` output |
| Typecheck exit code | ✓ | ✓ | `pnpm run typecheck` |
| Lint exit code | ✓ | ✓ | `pnpm run lint` |
| Route render: GovernanceCenter loads | ✓ | ✓ | Playwright / manual |
| Console errors | ✓ | ✓ | Playwright / browser console |
| Viewport screenshots (5 viewports) | ✓ | ✓ | Playwright |
| Source files changed | 0 | ✓ | `git diff --stat` |
| Build config changed | No | No | `git diff --stat` |
