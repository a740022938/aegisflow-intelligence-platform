# AIP v7.60-D1 GovernanceCenter Lazy Load Implementation Blueprint

**Phase:** v7.60-D1
**Status:** BLUEPRINT DEFINED — no implementation

---

## 1. Target

| Field | Value |
|---|---|
| Target | Registry + Validator lazy loading (Category D from P2) |
| Why selected | Smallest change, lowest risk, validates the lazy-loading pattern |
| Source file | `apps/web-ui/src/pages/GovernanceCenter.tsx` |
| Import targets | `GOVERNANCE_REGISTRY` and `validateGovernanceRegistry` |
| Approach | Replace eager `import { ... }` with `React.lazy(() => import(...))` or dynamic `await import(...)` in `useMemo` |
| Estimated reduction | ~10-30 kB |
| ManualChunks | ❌ NOT authorized without separate evidence |

---

## 2. Implementation Authorization Required

| Requirement | Detail |
|---|---|
| Authorization form | Must be filled, signed, filed before implementation |
| Approved scope | Registry+Validator lazy load only — no broad component splitting |
| Forbidden | manualChunks, build config changes, route changes, Stage C, feature flags, release/restore |
| Future receipt | Must list exact changed files and before/after chunk sizes |

---

## 3. Pre-Change Baseline

| Item | Current value |
|---|---|
| Build warning | `GovernanceCenter-Dl3qqZfx.js: 930.88 kB` |
| Pre-change HEAD | Must be captured at implementation time |
| `pnpm run typecheck` | ✅ Passing |
| `pnpm run build` | ✅ Exit 0 |
| `pnpm run lint` | ✅ 0 warnings |

---

## 4. Before/After Evidence

| Before | After (expected) |
|---|---|
| 930.88 kB (68.67 kB gzip) | ~900-920 kB (reduced by 10-30 kB) |
| Single chunk with all ~142 components | Chunk split — validator/registry in separate chunk |
| Non-blocking warning | Warning reduced or removed |

---

## 5. Visual QA Requirements

| Route | Before | After |
|---|---|---|
| `/governance-center` | Full page renders | Full page renders (may see brief Suspense fallback for lazy-loaded section) |
| Sidebar navigation | Unchanged | Unchanged |
| No hidden previews | Unchanged | Unchanged |

---

## 6. Rollback Plan

```bash
git revert <commit-hash> --no-edit
pnpm run typecheck && pnpm run build && pnpm run lint
# Verify chunk returns to 930.88 kB
```

---

## 7. No-Go Conditions

| Condition | Severity |
|---|---|
| Authorization form unfiled | HARD NO-GO |
| Pre-change baseline not captured | HARD NO-GO |
| Build fails after change | HARD NO-GO |
| Typecheck fails after change | HARD NO-GO |
| Route behavior changes | HARD NO-GO |
| Stage C / feature flag / release /restore coupling | HARD NO-GO |
| Visual QA not performed | HARD NO-GO |
| manualChunks added without authorization | HARD NO-GO |
