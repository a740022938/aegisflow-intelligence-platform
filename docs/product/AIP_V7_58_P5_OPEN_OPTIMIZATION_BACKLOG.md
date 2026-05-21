# AIP v7.58-P5 Open Optimization Backlog

**Phase:** v7.58-P5
**Status:** DEFINED — no implementation in v7.58

---

## Backlog Items

### 1. GovernanceCenter Component-Level Splitting Feasibility

| Field | Value |
|---|---|
| Priority | P1 |
| Risk | Low-Medium |
| Implementation allowed now | NO |
| Required preconditions | Bundle analysis tooling installed, visual QA baseline captured, rollback plan defined, second-person review |
| Recommended future phase | v7.59-D1 or P1 |

### 2. GovernanceCenter ManualChunks Investigation

| Field | Value |
|---|---|
| Priority | P2 (lower than component-level split) |
| Risk | Medium |
| Implementation allowed now | NO |
| Required preconditions | Dependency impact analysis confirming governance components are not shared across routes |
| Recommended future phase | After component-level split is proven insufficient |

### 3. Sidebar Touch/Pointer Resizer Design

| Field | Value |
|---|---|
| Priority | P2 |
| Risk | Low |
| Implementation allowed now | NO |
| Required preconditions | Viewport QA baseline (desktop/tablet/mobile), pointer+mouse regression checks |
| Recommended future phase | v7.59-D1 or P2 |

### 4. Mobile Viewport Evidence Capture

| Field | Value |
|---|---|
| Priority | P1 |
| Risk | Low |
| Implementation allowed now | NO (UI not running) |
| Required preconditions | UI running (requires API restart or restore authorization) |
| Recommended future phase | When UI is running |

### 5. High-Traffic Non-Adapter Page Migration Triage

| Field | Value |
|---|---|
| Priority | P2 |
| Risk | Medium |
| Implementation allowed now | NO |
| Required preconditions | Adapter re-evaluation passed |
| Recommended future phase | After adapter gates |

### 6. GovernanceHub / WorkflowComposer No-Go Re-Evaluation (Docs Only)

| Field | Value |
|---|---|
| Priority | P3 |
| Risk | Low (docs only) |
| Implementation allowed now | NO |
| Required preconditions | None for docs review; implementation requires separate no-go review |
| Recommended future phase | v7.59-D1 or later |

### 7. Bundle Budget / Warning Monitoring Policy

| Field | Value |
|---|---|
| Priority | P3 |
| Risk | Low |
| Implementation allowed now | NO |
| Required preconditions | Organizational agreement on performance budget thresholds |
| Recommended future phase | After optimization implementation |
