# AIP v7.58-D1 UX Hardening Backlog

**Phase:** v7.58-D1
**Status:** Prioritized, not scheduled

---

## P1 (High Priority)

### 1. GovernanceCenter Performance Evidence Inventory
- **Description:** Collect full dependency tree, bundle analysis, screenshot/network baseline for GovernanceCenter. Docs and tooling analysis only — no source changes.
- **Priority:** P1
- **Risk:** Low (read-only)
- **Source code allowed now:** NO
- **Future authorization required:** YES (for implementation phase)
- **Suggested phase:** v7.58-P1
- **No-go conditions:** Bundle analysis tooling not yet installed

### 2. UX Consistency Sweep — High-Traffic Pages
- **Description:** Audit high-traffic pages (Dashboard, Datasets, MemoryHub, Models) for visual consistency: spacing, typography, color, alignment. Compare against design standards.
- **Priority:** P1
- **Risk:** Low (audit only)
- **Source code allowed now:** NO
- **Future authorization required:** NO for docs, YES for source changes
- **Suggested phase:** v7.58-P3
- **No-go conditions:** None for audit

### 3. Page Loading / Empty / Error State Consistency Review
- **Description:** Review all shell-adapter pages and non-adapter routes for consistent loading skeleton, empty state, and error state display.
- **Priority:** P1
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** YES (for source fixes)
- **Suggested phase:** v7.58-P3
- **No-go conditions:** None for review

### 4. Mobile / Sidebar Touch Resizer Review
- **Description:** Review sidebar resizer behavior on mobile/touch devices. Review existing responsive behavior.
- **Priority:** P1
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** YES (for source fixes)
- **Suggested phase:** v7.58-P4
- **No-go conditions:** None for review

### 5. Desktop Archive / Operator Handoff Visibility
- **Description:** Review documentation for clarity of desktop archive location, context recovery ledger, task pack standards. Ensure operators can find and use them.
- **Priority:** P1
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO
- **Suggested phase:** v7.58-D2 or P1
- **No-go conditions:** None

---

## P2 (Medium Priority)

### 6. Low-Risk Page Shell Alignment (Post-Adapter Gates)
- **Description:** Align remaining safe-reference pages (MemoryHubReadonly, OpenAxiomReadonly) to PageShell pattern if adapter gates pass.
- **Priority:** P2
- **Risk:** Medium
- **Source code allowed now:** NO
- **Future authorization required:** YES
- **Suggested phase:** After adapter re-evaluation
- **No-go conditions:** Adapter re-evaluation not passed

### 7. Validation Evidence Refresh with Screenshots
- **Description:** If UI is running at a future point, capture screenshots of validation evidence (loading, populated, error states) for each page.
- **Priority:** P2
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO
- **Suggested phase:** When UI is running
- **No-go conditions:** UI not running

### 8. Release / Restore Hold Banner Polish
- **Description:** Polish hold-mode banners or notices if docs indicate user confusion about release/restore status.
- **Priority:** P2
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO (docs only)
- **Suggested phase:** v7.58-D2
- **No-go conditions:** None

### 9. Install / Recovery Operator Checklist Polish
- **Description:** Review and polish operator checklists for install and recovery procedures.
- **Priority:** P2
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO
- **Suggested phase:** v7.58-D2
- **No-go conditions:** None

---

## P3 (Lower Priority)

### 10. WorkflowComposer / GovernanceHub No-Go Re-Evaluation (Docs Only)
- **Description:** Re-evaluate NO_GO status for WorkflowComposer and GovernanceHub shell adapter migration. Docs-only assessment.
- **Priority:** P3
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO for docs, YES for source
- **Suggested phase:** After P1/P2 evidence
- **No-go conditions:** None for docs

### 11. Bundle Optimization Implementation Plan
- **Description:** Create detailed implementation plan for bundle optimization (manualChunks, dynamic imports, route splitting).
- **Priority:** P3
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO for plan
- **Suggested phase:** v7.58-P2
- **No-go conditions:** GovernanceCenter evidence not collected

### 12. Route-Level Code Splitting Proposal
- **Description:** Propose specific routes for code splitting with risk assessment.
- **Priority:** P3
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO for proposal
- **Suggested phase:** v7.58-P2
- **No-go conditions:** Bundle analysis not done

### 13. Long-Term Performance Budget Policy
- **Description:** Draft a performance budget policy (max chunk size, max load time, max bundle size) for the platform.
- **Priority:** P3
- **Risk:** Low
- **Source code allowed now:** NO
- **Future authorization required:** NO
- **Suggested phase:** After optimization implementation
- **No-go conditions:** None
