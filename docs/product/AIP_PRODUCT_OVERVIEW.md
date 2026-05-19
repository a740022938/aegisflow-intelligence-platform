# AIP Product Overview

## Identity

- **Product Name:** AegisFlow (AIP)
- **Current Version:** v7.25.2
- **Build Date:** 2026.05.19
- **Seal Status:** Final Seal Candidate
- **Safety Mode:** Readonly-first
- **Stage C:** Disabled (permanently)

## Architecture

AIP is organized around centers, pages, and actions — all operating under readonly-first semantics:

| Layer | Description | Exposure |
|-------|-------------|----------|
| **Centers** | Capability domains (Advanced Mode, Connector, Lab, Governance, Navigation Preview) | Sidebar visible or hidden direct |
| **Pages** | Functional pages within centers | Primary nav or sidebar visible |
| **Actions** | Executable operations (inference, scheduler, deploy, etc.) | All blocked/denied in v7.x |

## Key Principles

1. **Readonly-first:** No real execution, DB write, external tool control, or Stage C operations in v7.x.
2. **Explicit gating:** Every exposure decision is recorded in registries with risk level and blocking conditions.
3. **No sidebar mutation:** Sidebar boundaries are invariant. Centers cannot add or remove themselves.
4. **No tag/release:** v7.x remains a preview seal candidate. No formal release tag is created.

## Registry Architecture

| Registry | Purpose |
|----------|---------|
| `navigation-exposure-registry.ts` | Exposure rules for all nav items |
| `center-access-registry.ts` | Center access definitions (5 centers, 2 visible, 3 hidden) |
| `permission-evaluator-registry.ts` | Static permission evaluation rules (17 rules, 4 decisions) |
| `product-metadata-registry.ts` | Unified product version metadata |

## Target Consumers

- Internal audits and seal reviews
- PL decision-making for exposure changes
- UI preview at Advanced Mode > Permission Evaluator Preview
