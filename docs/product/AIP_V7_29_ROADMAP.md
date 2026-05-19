# AIP v7.29 Roadmap — Governance Console

> **Status:** Planned  
> **Core Tenet:** Console is design/aggregation, not executor. Stage C remains disabled. No DB writes. No external control.

---

## 1. Overview

v7.29 focuses on the Governance Console — a unified read-only aggregation view across all governance registries. The Console does not execute any action, write to any database, control any external tool, or enable Stage C.

## 2. Phase Plan

### v7.29.0-D1 Governance Console Master Blueprint
| Field | Value |
|-------|-------|
| Source code changes | No |
| DB write | No |
| External control | No |
| Stage C | No |
| Human review required | Yes |
| Risk level | Low |
| Commit policy | Docs-only |

**Deliverables:** Master Blueprint, Information Architecture, Decision Panel Spec, Risk Aggregation Spec, Registry Map, Readiness Audit, v7.29 Roadmap, updated existing docs.

### v7.29.0-P1 Governance Console Registry Aggregator Preview
| Field | Value |
|-------|-------|
| Source code changes | Yes (new preview page + route) |
| DB write | No |
| External control | No |
| Stage C | No |
| Human review required | Yes |
| Risk level | Low |
| Commit policy | Commit + push-only |

**Deliverables:** Console page with registry chain aggregation table. Readonly. No sidebar entry.

### v7.29.0-P2 Governance Console Risk Dashboard Preview
| Field | Value |
|-------|-------|
| Source code changes | Yes (new dashboard section) |
| DB write | No |
| External control | No |
| Stage C | No |
| Human review required | Yes |
| Risk level | Low |
| Commit policy | Commit + push-only |

**Deliverables:** Risk aggregation dashboard with cards, counts, color coding.

### v7.29.0-P3 Governance Console Decision Panel Preview
| Field | Value |
|-------|-------|
| Source code changes | Yes (new decision panel section) |
| DB write | No |
| External control | No |
| Stage C | No |
| Human review required | Yes |
| Risk level | Low |
| Commit policy | Commit + push-only |

**Deliverables:** Decision recommendation panel. Display-only. No execute/apply.

### v7.29.0-P4 Governance Console Report Pack Preview
| Field | Value |
|-------|-------|
| Source code changes | Yes (new report generation section) |
| DB write | No |
| External control | No |
| Stage C | No |
| Human review required | Yes |
| Risk level | Low |
| Commit policy | Commit + push-only |

**Deliverables:** Report generation UI. Generates Markdown/JSON from aggregated data.

### v7.29.0 Final Seal Recheck
| Field | Value |
|-------|-------|
| Source code changes | No |
| DB write | No |
| External control | No |
| Stage C | No |
| Human review required | Yes |
| Risk level | Low |
| Commit policy | Docs-only |

**Deliverables:** Full seal recheck, report, receipt.

## 3. Cross-Cutting Constraints

| Constraint | All Phases |
|------------|-----------|
| Stage C enabled | Never |
| DB write | Never |
| External control | Never |
| Sidebar entry | Never (until human decision) |
| Tag/Release | Never |
| `git add .`/`git add -A` | Never |
| Layout.tsx modification | Never |
| i18n.ts modification | Never |
| menu-registry.ts modification | Never |
| Backend modification | Never |
| Package.json modification | Never |

## 4. Risk Assessment

| Phase | Risk | Mitigation |
|-------|------|------------|
| D1 | Low | Docs-only, no code changes |
| P1 | Low | Readonly aggregation, no exec |
| P2 | Low | Readonly dashboard, no exec |
| P3 | Low | Display-only panel |
| P4 | Low | Report generation only |

## 5. Next Steps

After v7.29 Final Seal:
- Human decision on whether Console enters sidebar
- Human decision on whether to begin runtime implementation (v7.30+)
- Stage C remains disabled until explicit human decision after full governance review
