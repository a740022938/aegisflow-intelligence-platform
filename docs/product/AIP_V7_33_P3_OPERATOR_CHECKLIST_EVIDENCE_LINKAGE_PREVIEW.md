# AIP v7.33.0-P3 Operator Checklist + Evidence Linkage Preview

> **Date:** 2026-05-20
> **Status:** V7_33_P3_OPERATOR_CHECKLIST_EVIDENCE_LINKAGE_PREVIEW_READY

## Summary

v7.33.0-P3 adds a readonly operator checklist registry, evidence linkage registry, combined validator, and hidden direct preview page. No backend changes, no sidebar exposure, no Stage C, no POST, no DB write, no evidence write.

## Deliverables

### New Checklist Registry

- File: `apps/web-ui/src/registry/operator-checklist-registry.ts`
- 24 items across 8 categories: git, seal, validation, safety, evidence, operator, rollback, release
- All items: `readonly: true`
- 24 required items: 23 pass, 1 ready
- Status: pass=23, ready=1

### New Evidence Linkage Registry

- File: `apps/web-ui/src/registry/operator-evidence-linkage-registry.ts`
- 15 items across 7 types: report, receipt, json, doc, roadmap, rollback, smoke, validation
- All items: `readonly: true`
- Source of truth: 12 items

### New Validator

- File: `apps/web-ui/src/registry/operator-checklist-evidence-validator.ts`
- 19 validation checks covering: checklist non-empty, id unique, evidence non-empty, id unique, readonly constraints, evidenceRef presence, evidence path presence, forbiddenAction presence, Stage C/POST/DB/external/executor status checks, forbidden action words, source of truth coverage, category/type coverage
- Target: blocking=0, warning<=1, info<=6, pass=true

### New Preview Page

- File: `apps/web-ui/src/pages/OperatorChecklistEvidencePreview.tsx`
- Readonly PageShell page with 10 sections:
  - **1. Seal Chain**: 5 verdict cards (v7.32 P2, D1, P1, P2, P3)
  - **2. Checklist Summary**: 5 summary stats + category breakdown
  - **3. Required Checklist Matrix**: All 24 required items with status and evidence ref
  - **4. Evidence Linkage Panel**: Summary stats + first 10 items listing
  - **5. Source-of-Truth Evidence**: 12 authoritative evidence records
  - **6. Safety Boundary Confirmation**: 5 boundaries with red badges
  - **7. Forbidden Actions**: 10 forbidden actions listed
  - **8. Validator Summary**: Pass/blocking/warning/info
  - **9. Evidence Type Distribution**: 7 evidence types with counts
  - **10. Operator Next Step**: Ordered checklist + next phase recommendation
- No action buttons, no POST forms, no execute controls, no evidence capture/write, no mutation UI
- All data sourced from P3 registries (static, readonly)

### Route

- Path: `/operator-checklist-evidence-preview`
- Hidden direct route (not in sidebar, not in primary nav)
- Lazy loaded in App.tsx
- Linked from P2 Operator Console Readonly Preview (section 7)

### Registry Exposure

- `center-access-registry.ts`: entry added with `hidden_direct`, `visibleInSidebar: false`, `exposureRecommendation: keep_hidden_direct`
- `navigation-exposure-registry.ts`: entry added with `direct_route`, `keep_direct_route` recommendation

### P2 UI Preview Sync

- P2 page section 7 (Operator Next Step) updated to link to P3 preview at `/operator-checklist-evidence-preview`
- P3 adds 24-item checklist registry, 15-item evidence linkage registry, combined validator, and 10-section preview page

### P4 UI Preview Sync

- P3 page section 10 (Operator Next Step) updated to link to P4 seal candidate preview at `/operator-console-seal-candidate-preview`
- P4 adds 24-item seal candidate registry, 18-check validator, 10-section preview page

## Next Step Recommendation

```
v7.33.0-P3: Operator Checklist + Evidence Linkage Preview (COMPLETED)
v7.33.0-P4: Operator Console Seal Candidate (COMPLETED)
v7.33.0 Final Seal Recheck
Do not enter Stage C.
```
V7_33_P3_OPERATOR_CHECKLIST_EVIDENCE_LINKAGE_PREVIEW_READY
```

## Next Step Recommendation

```
v7.33.0-P4: Operator Console Seal Candidate
Do not enter Stage C.
```
