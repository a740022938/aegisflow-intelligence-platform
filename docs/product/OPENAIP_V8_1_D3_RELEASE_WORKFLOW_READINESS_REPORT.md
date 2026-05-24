# OpenAIP v8.1 — D3 Release Workflow Readiness Report

| Field | Value |
|-------|-------|
| **Phase** | D3 — Release Workflow Readiness Plan |
| **D3 HEAD** | `00b452f` |
| **Date** | 2026-05-24 |
| **Nature** | Planning and docs-only. No tag, release, Gate, or execution changes. |
| **Final Verdict (target)** | `OPENAIP_V8_1_D3_RELEASE_WORKFLOW_READINESS_PLAN_READY_WITH_GATE_CLOSED` |

---

## 1. Evidence Chain

```
v8 readonly product shell                    → OPENAIP_V8_READONLY_MVP_PRODUCT_ACCEPTANCE (5b631fa)
  → visible readonly center suite            → WAVE1_COMMAND_CENTER_SIDEBAR_PROMOTION
  → sidebar promotion                        → OPENAIP_V8_WAVE2_ALL_CENTERS_SIDEBAR_PROMOTION
  → brand/i18n clean                         → OPENAIP_V8_SIDEBAR_BRAND_I18N_MEGA_POLISH
  → i18n final gap fix + product shell seal  → b04f35f (i18n final seal)
  → product navigation finalized             → c9f48dd (D1)
  → navigation copy/footer hotfix            → 1ef8015 (D1A)
  → visual acceptance sealed                 → 00b452f (D2)
  → release workflow readiness planning      → THIS DOCUMENT (D3)
```

All prior phases passed with Gate CLOSED, Stage C disabled, execution disabled. No safety boundary was crossed.

---

## 2. Version Strategy

| Concern | Decision |
|---------|----------|
| Product line identity | OpenAIP v8 is the product shell / control-plane identity |
| Core engine version | `agi-model-factory` / Core v7.62.0 |
| Recommended release tag | `v8.1.0` |
| Release title | OpenAIP v8.1 Readonly Control Plane |
| Core baseline | v7.62.0 |
| Gate state at release | CLOSED |
| Stage C at release | disabled |
| Execution at release | disabled |
| Tag convention | `v8.1.0` to avoid confusion with Core v7.x tags |
| Release notes must clarify | Core baseline version, safety state, what is readonly |

---

## 3. Validation Results

| Validator | Result |
|-----------|--------|
| `npm run typecheck` | PASS (0 errors) |
| `npm run lint` | PASS (0 warnings) |
| `npm run build` | PASS (758 modules; chunk-size warning non-blocking) |
| `npm test --silent` | PASS (9/9) |
| `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` | PASS (108/108) |

---

## 4. D3 Documents Produced

| Document | Purpose |
|----------|---------|
| `OPENAIP_V8_1_D3_RELEASE_WORKFLOW_READINESS_REPORT.md` | This report — full evidence chain, version strategy, release notes draft plan, validation results |
| `OPENAIP_V8_1_D3_RELEASE_WORKFLOW_READINESS_RECEIPT.md` | Short receipt for D3 phase |
| `OPENAIP_V8_1_D3_RELEASE_GATE_CHECKLIST.md` | 6-gate release checklist (Source, Validation, Visual, Product, Safety, Authorization) |
| `OPENAIP_V8_1_D3_RELEASE_AUTHORIZATION_TEMPLATE.md` | Human owner authorization template |
| `OPENAIP_V8_1_D3_ROLLBACK_RECOVERY_PLAN.md` | Rollback and recovery plan |

---

## 5. Release Notes Draft Outline (to be filled at actual release)

```
# OpenAIP v8.1 Readonly Control Plane — Release Notes

## 1. Summary
OpenAIP v8.1 is a readonly control-plane shell for the AIP platform.
Gate: CLOSED. Stage C: disabled. Execution: disabled.

## 2. What Changed
- v8 sidebar restructured into 5 product-grade sections
- 11 semantic icons assigned
- Short bilingual labels (zh 2-4 chars / en 9-20 chars)
- Footer uses i18n keys with mature product language
- All MVP/preview/experiment wording removed from primary navigation
- Brand and i18n final polish applied

## 3. OpenAIP v8 Readonly Centers
All 9 readonly centers navigable via sidebar: Command, Agent, Task, Provider,
Integration, Local Apps, Memory+Knowledge, Policy+Capability, Audit.
Execution Gateway present but Gate CLOSED.

## 4. Product Navigation Finalization
5 sections with weighted visual hierarchy: primary → tools → services → governance → subtle.

## 5. i18n / Brand Polish
Full EN/CH localization for all nav labels, section headers, footer.
Chrome auto-translate must be OFF during visual acceptance.

## 6. Safety State
Gate: CLOSED | Stage C: disabled | Execution: disabled | No DB writes | No indexing

## 7. Validation Results
typecheck ✅ lint ✅ build ✅ tests 9/9 ✅ route smoke 108/108 ✅

## 8. Known Limitations
- Execution Gateway requires separate human authorization to open
- Screenshot evidence gap: D2 skipped due to no GUI browser in pipeline; owner must confirm or re-run
- Build chunk-size warning for openAipv8-tsx (>500 KiB) — non-blocking

## 9. Install / Run Notes
Standard `npm install && npm run dev`. Vite dev server on localhost:5173.

## 10. Upgrade Notes
No DB migration. No config changes. Drop-in replacement for prior v8 shell.

## 11. Rollback Notes
See OPENAIP_V8_1_D3_ROLLBACK_RECOVERY_PLAN.md
```

---

## 6. Screenshot Gap

D2 visual acceptance skipped screenshots because no GUI browser is available in the CLI pipeline. This does not block D3 planning. Before an actual release, the human owner must either:

- Provide browser screenshots of zh/en sidebar (command center, footer, top, advanced tools), OR
- Explicitly waive the screenshot requirement in the release authorization.

---

## 7. Release Readiness Conditions

| Condition | Status |
|-----------|--------|
| Release checklist defined | ✓ (see gate checklist) |
| Authorization template defined | ✓ (see authorization template) |
| Rollback plan defined | ✓ (see rollback plan) |
| Version strategy clear | ✓ (v8.1.0 tag recommended) |
| Validation commands identified | ✓ (5 commands listed above) |
| Safety state documented | ✓ (Gate CLOSED, Stage C disabled, execution disabled) |
| Screenshot gap documented | ✓ |
| Release notes draft prepared | ✓ (outline above) |

---

## 8. No-Action Confirmation

| Action | Performed? |
|--------|-----------|
| Tag created | NO |
| GitHub Release created | NO |
| Release branch pushed | NO |
| Gate opened | NO |
| Stage C enabled | NO |
| Execution enabled | NO |
| Auth/Gate logic changed | NO |
| DB/Memory DB/Vector DB written | NO |
| Indexing job run | NO |
| Provider/local-app/connector action executed | NO |
| Service restarted | NO |
| Dangerous sidebar entry added | NO |
| Hidden dangerous page exposed | NO |
| Runtime config modified | NO |

---

## 9. Verdict

```
OPENAIP_V8_1_D3_RELEASE_WORKFLOW_READINESS_PLAN_READY_WITH_GATE_CLOSED
```

OpenAIP v8.1 now has a defined release workflow readiness plan including gate checklist, authorization template, rollback plan, version strategy, and release notes draft. Actual release/tag requires explicit human owner authorization in a separate pack.

---

*Generated by opencode automated pipeline — 2026-05-24*
