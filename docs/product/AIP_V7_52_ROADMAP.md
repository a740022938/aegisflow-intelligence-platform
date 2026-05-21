# AIP v7.52 Roadmap

**Date:** 2026-05-21  
**Status:** D1 — Blueprint  
**Source:** v7.52-D0 Visual QA + Page Type Taxonomy Sweep  
**Target Final Verdict:** `V7_52_PAGE_TYPE_TAXONOMY_AND_CANONICAL_LAYOUT_READY_WITH_STAGE_C_DISABLED`

---

## 1. Overview

v7.52 transitions OpenAIP from "per-page migration" to "page type taxonomy governance." The goal is not to migrate all 30 visible pages, but to establish clear type standards and migrate **one representative page per type**.

```
D0: Visual QA + Page Type Taxonomy Sweep ✅
D1: Page Type Taxonomy Blueprint 📝
P1: Dashboard + Operations Standardization
P2: Governance Page Standardization
P3: Workflow Tool Page Risk Split + Shell Alignment
P4: Entity Management Page Alignment
P5: Final Visual/Product Consistency Recheck
```

## 2. Phase Details

### D0 — Sweep (complete ✅)
- 30 visible sidebar pages inventoried
- 7 page types identified
- 4 modern, ~10 partial, ~6 legacy, 13 stub hidden, 44+ preview
- HIGH: Dashboard lacks shell
- MED: Operations split, Entity Mgmt inconsistency
- Verdict: `V7_52_D0_VISUAL_QA_PAGE_TYPE_TAXONOMY_SWEEP_COMPLETE_WITH_FINDINGS`

### D1 — Blueprint (current)
- 7 page types defined (Dashboard, Operations, Governance, Workflow Tool, Entity Management, Legacy, Stub)
- Shell variants designed for 5 active types
- Migration rules established
- Per-phase plans documented
- Verdict target: `V7_52_D1_PAGE_TYPE_TAXONOMY_BLUEPRINT_READY_WITH_STAGE_C_DISABLED`

### P1 — Dashboard + Operations Standardization
- Dashboard: PageShell + GlobalStatusStrip + NextStep + RecentEvidence
- FactoryStatus: PageShell + StatusStrip + SectionCard alignment
- Pages touched: 2
- Verdict target: `V7_52_P1_DASHBOARD_FACTORY_STATUS_STANDARDIZED_WITH_STAGE_C_DISABLED`

### P2 — Governance Standardization
- Approvals, GovernanceHub, Audit: PageShell + StatusStrip + EmptyState
- CostRouting, ConnectorCenterReadonly, AdvancedModeReadonly: reference, no change
- Pages touched: 3
- Verdict target: `V7_52_P2_GOVERNANCE_PAGE_STANDARDIZATION_READY_WITH_STAGE_C_DISABLED`

### P3 — Workflow Tool Risk Split
- WorkflowComposer: explicitly deferred
- WorkflowJobs, WorkflowCanvas, Tasks, Feedback: PageShell + StatusStrip + EmptyState
- WorkflowToolShell defined
- Pages touched: 4
- Verdict target: `V7_52_P3_WORKFLOW_TOOL_PAGE_RISK_SPLIT_READY_WITH_STAGE_C_DISABLED`

### P4 — Entity Management Alignment
- 14 entity pages migrated by subgroup (modern→partial→legacy)
- EntityManagementShell defined
- Pages touched: up to 14
- Verdict target: `V7_52_P4_ENTITY_MANAGEMENT_ALIGNMENT_READY_WITH_STAGE_C_DISABLED`

### P5 — Final Recheck
- All type standards verified
- Reference pages stable
- No hidden previews promoted
- No sidebar expansion
- Safety boundaries intact
- Verdict target: `V7_52_PAGE_TYPE_TAXONOMY_AND_CANONICAL_LAYOUT_READY_WITH_STAGE_C_DISABLED`

## 3. Deferred Items

These are explicitly NOT in v7.52 scope:

```
- WorkflowComposer full migration (→ v7.53+)
- AdvancedModeReadonly full redesign (→ v7.53+)
- All 44+ preview page migration (→ not planned)
- Full sidebar IA rewrite (→ v7.53+)
- ModulePage stub promotion (→ not planned)
- Tag/release (→ v7.52 seal only)
- Stage C enablement (→ permanently disabled for v7.52)
- Restore execution (→ not in v7.52)
```

## 4. Safety Boundaries (all phases)

```
- No GitHub Release
- No tags
- Stage C: disabled
- Feature flag: off
- No DB write
- No restore/rollback/source restore
- No new runtime mutation/executor
- No hidden preview promotion
- No sidebar expansion
- No restart/taskkill
```

## 5. Receipt Template

Each phase produces:
- `E:\_AIP_REPORTS\AIP_v7.52_P{X}_report_YYYYMMDD.md`
- `E:\_AIP_RECEIPTS\AIP_v7.52_P{X}_receipt_YYYYMMDD.md`
- `docs/product` update (if applicable)
- Commit (if code changed)
