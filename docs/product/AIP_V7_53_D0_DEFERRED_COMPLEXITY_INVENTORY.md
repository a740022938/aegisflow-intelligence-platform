# AIP v7.53-D0 Deferred Complexity Inventory

**Date:** 2026-05-21  
**Baseline:** v7.52 Final Verdict (`V7_52_PAGE_TYPE_TAXONOMY_AND_CANONICAL_LAYOUT_READY_WITH_STAGE_C_DISABLED`)  
**Baseline HEAD:** `ff894b6`  

## Reviewed Pages

| Page | Lines | Shell | contentRef | WkspcGrid | Mutation | Recommended |
|---|---|---|---|---|---|---|
| GovernanceHub | 991 | `page-root` + PageHeader | NO | NO | YES (6 POST) | **plan-only** |
| WorkflowComposer | 11,417 (27 files) | Custom canvas | NO | NO (React Flow) | NO | **no-go** |
| WorkflowJobs | 1,232 | `page-root` + PageHeader | NO | NO | YES (learned rules) | **pilot candidate** |
| Tasks | 822 | `page-root` + PageHeader | YES | YES | YES (task create) | **plan-only** |
| Models | 1,273 | `page-root` + PageHeader (custom summaryStrip) | YES | YES | YES (model create) | **defer** |
| Datasets | 687 | `page-root` + PageHeader | YES | YES | YES (dataset create) | **plan-only** |
| PluginPool | 842 | `page-root` + PageHeader | YES | YES | YES (plugin toggle) | **plan-only** |
| scheduler | 676 | ModulePage stub (shared) | NO | NO | NO | **classify only** |

## Key Finding

**contentRef + WorkspaceGrid** blocks 4 of 5 entity/management pages. A ShellAdapter strategy is needed to convert `page-root` to `PageShell` while preserving `contentRef` measurement and WorkspaceGrid layout.

## D1 Priority

Blueprint the ShellAdapter approach so v7.53-P4 can pilot WorkflowJobs (no contentRef, no WorkspaceGrid) and potentially Datasets (smallest entity page with contentRef).

## Safety

No source code modified. All safety boundaries confirmed.
