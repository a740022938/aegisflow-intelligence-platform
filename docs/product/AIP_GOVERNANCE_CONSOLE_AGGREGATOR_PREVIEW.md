# Governance Console Aggregator Preview

> **v7.29.0-P1** · Readonly Aggregation Preview  
> **Route:** `/governance-console-preview`  
> **Sidebar:** Not in sidebar (hidden direct)  
> **Core Tenet:** Aggregation view. No registry mutation. No execution. No DB write. No Stage C.

---

## Overview

The Governance Console Aggregator Preview is the v7.29.0-P1 implementation of the Governance Console Master Blueprint. It provides a single read-only aggregation view across all AIP governance registries, consolidating the state of:

- Permission Evaluator
- Runtime Registry
- Dry-run Plan
- Audit Log
- Governance State Machine
- Human Approval Workflow
- Evidence Schema
- Rollback Preview
- Navigation Exposure Registry
- Center Access Registry

## What It Does

| Capability | Status |
|------------|--------|
| Aggregates registry data | ✓ Readonly display |
| Shows risk aggregation | ✓ Readonly display |
| Shows decision panel | ✓ Readonly recommendations |
| Shows sidebar exposure | ✓ Readonly display |
| Shows validator summary | ✓ Readonly display |
| Shows traceability | ✓ Readonly display |
| Modifies registries | ✗ |
| Executes actions | ✗ |
| Writes to database | ✗ |
| Controls external tools | ✗ |
| Enables Stage C | ✗ |

## Architecture

The Governance Console Aggregator Preview uses:

- **Registry:** `governance-console-registry.ts` — 18 items covering all domains
- **Validator:** `governance-console-validator.ts` — 13+ blocking checks
- **Page:** `GovernanceConsolePreview.tsx` — 8 sections

### Registry Domains

| Domain | Items | Description |
|--------|-------|-------------|
| `permission` | 1 | Permission Evaluator |
| `runtime` | 1 | Runtime Registry |
| `dry_run` | 1 | Dry-run Plan |
| `audit` | 1 | Audit Log |
| `governance_state` | 1 | Governance State Machine |
| `human_approval` | 1 | Human Approval Workflow |
| `evidence` | 1 | Evidence Schema |
| `rollback` | 1 | Rollback Preview |
| `navigation` | 2 | Navigation Exposure + Navigation Preview |
| `center_access` | 7 | Advanced, Connector, Lab, Governance, Stage C, DB Write, External Control |

### Page Sections

| Section | Content |
|---------|---------|
| A. Overview Dashboard | Total items, ready, blocked, high/critical, sidebar, hidden, requires Stage C/DB/Ext, supports execution, writes data |
| B. Registry Chain Board | Full table with ID, label, risk, readiness, exposure, sidebar status, preview link |
| C. Risk Aggregation Board | Risk level counts + blocked/Stage C/DB/Ext gated counts |
| D. Sidebar / Exposure Board | Center access and navigation exposure details |
| E. Decision Panel | Recommended next step, blocked items, cannot-execute notice, readonly preview links, human approval requirement, rollback requirement |
| F. Traceability Board | Source registry, validator, preview route, summary fields per item |
| G. Validator Summary | Blocking/warning/info counts + pass/fail status |
| H. Forbidden Console Notice | Explicit list of what this console does NOT do |

## Safety

| Constraint | Status |
|------------|--------|
| Sidebar entry | Not in sidebar |
| Registry mutation | Not implemented |
| Execution | Not implemented |
| DB write | Not implemented |
| External control | Not implemented |
| Stage C | Disabled |
| Approve/Reject/Execute buttons | None |
| Token/API key inputs | None |

## Related

- [Governance Console Master Blueprint](AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md)
- [Governance Console Information Architecture](AIP_GOVERNANCE_CONSOLE_INFORMATION_ARCHITECTURE.md)
- [Governance Console Decision Panel Spec](AIP_GOVERNANCE_CONSOLE_DECISION_PANEL_SPEC.md)
- [Governance Console Risk Aggregation Spec](AIP_GOVERNANCE_CONSOLE_RISK_AGGREGATION_SPEC.md)
- [Governance Console Registry Map](AIP_GOVERNANCE_CONSOLE_REGISTRY_MAP.md)
- [Runtime Implementation Readiness Audit](AIP_RUNTIME_IMPLEMENTATION_READINESS_AUDIT.md)
- [v7.29 Roadmap](AIP_V7_29_ROADMAP.md)
