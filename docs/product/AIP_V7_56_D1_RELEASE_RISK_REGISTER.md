# AIP v7.56-D1 Release Risk Register

**Date:** 2026-05-21
**Phase:** D1

---

## 1. Risk Table

| # | Risk | Severity | Likelihood | Mitigation | Residual |
|---|---|---|---|---|---|
| R1 | Release executed without explicit human authorization | **Critical** | Low | Pre-tag checklist P5 requires signed form | Low |
| R2 | Real restore accidentally executed | **Critical** | Very Low | `restore.mjs` defaults to plan-only; `--execute` requires CONFIRM prompt | Low |
| R3 | Stage C accidentally enabled | **Critical** | Very Low | `product-metadata-registry.ts` has `AIP_STAGE_C = 'disabled'` constant; no runtime toggle exposed | Low |
| R4 | Tag points to wrong commit | **High** | Low | Pre-tag checklist P3 verifies HEAD against form's approved hash | Low |
| R5 | GitHub Release notes mismatch | **Medium** | Low | Release notes source confirmed in form P7 | Low |
| R6 | Smoke tests fail at tag time due to API unavailability | **Medium** | Low | P5 confirmed 9/9 pass; API may be unavailable on different machine | Low |
| R7 | Unrelated v7.52 docs accidentally committed | **Low/Medium** | Low | Pre-tag checklist P13; working tree is clean | Low |
| R8 | Rollback needed after tag push | **Low** | Very Low | Rollback commands documented in pre-tag checklist | Very Low |

---

## 2. Risk Acceptance

All risks are **accepted** under the following conditions:

1. Human authorization form is signed before any tag/release action
2. Pre-tag checklist is executed and all items pass
3. Rollback commands are available if needed

---

## 3. Unacceptable Risks

The following are **never acceptable** and must block release:

- Release without human authorization
- Stage C enabled
- Feature flag toggled on
- Real restore executed as part of release process
- DB write executed as part of release process
