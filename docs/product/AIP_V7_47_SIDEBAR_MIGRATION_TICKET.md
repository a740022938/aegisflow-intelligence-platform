# AIP v7.47 — Sidebar Exposure Migration Ticket

**Status:** Deferred (post-v7.47-RC)
**Date:** 2026-05-20
**Source:** AIP v7.47-D0 Missing-Risk Sweep finding M4

---

## 1. Problem

17 entries in `navigation-exposure-registry.ts` have `currentExposure: 'primary_nav'` but their own `recommendedExposure` says they should NOT be in the primary sidebar. This is a documentation/spec mismatch that should be resolved before any sidebar exposure changes.

## 2. Affected Entries

### From 能力与模块 / Capabilities (7 items)
| ID | currentExposure | recommendedExposure | allowedNow |
|----|----------------|-------------------|------------|
| cost-routing | primary_nav | governance_center | true |
| openaxiom-readonly | primary_nav | connector_center | true |
| memory-hub | primary_nav | connector_center | true |

### From 智能增强 / Intelligence (8 items)
| ID | currentExposure | recommendedExposure | allowedNow |
|----|----------------|-------------------|------------|
| digital-employee | primary_nav | advanced_mode | true |
| training-v2 | primary_nav | advanced_mode | true |
| hpo | primary_nav | advanced_mode | true |
| distill | primary_nav | advanced_mode | true |
| model-merge | primary_nav | advanced_mode | true |
| inference | primary_nav | advanced_mode | **false** |
| annotation | primary_nav | advanced_mode | true |
| huggingface | primary_nav | advanced_mode | true |

### From 自动化 / Automation (5 items)
| ID | currentExposure | recommendedExposure | allowedNow |
|----|----------------|-------------------|------------|
| backflow-v2 | primary_nav | advanced_mode | true |
| scheduler | primary_nav | advanced_mode | **false** |
| alerting | primary_nav | advanced_mode | true |
| model-monitor | primary_nav | advanced_mode | true |
| deploy-v2 | primary_nav | advanced_mode | **false** |

### From 视觉实验室 / Lab (1 item)
| ID | currentExposure | recommendedExposure | allowedNow |
|----|----------------|-------------------|------------|
| mahjong-debug | primary_nav | lab_mode | true |

## 3. Risk Assessment

- 3 entries have `allowedNow: false` (inference, scheduler, deploy-v2) — already safety-gated
- 14 entries have `allowedNow: true` — placeholder pages, no real functionality
- All entries are readonly (gated by `readonly_only` or similar)
- No entry has mutation capability in current state

## 4. Migration Not Required For Pre-RC

Full sidebar migration is deferred to post-v7.47-RC because:
1. The registry is shadow data only (not consumed by Layout or runtime)
2. No runtime behavior is affected by the exposure mismatch
3. Pre-RC focus is on install flow, version consistency, restore readiness, and safety cleanup
4. Sidebar re-organization requires UX design and user testing

## 5. Prerequisites for Migration

- [ ] Resolve recommendedExposure for all 17 entries with product owner
- [ ] Implement center-specific pages (Governance Center, Connector Center, Lab Center)
- [ ] Implement Advanced Mode gate
- [ ] Move entries from primary_nav to correct sections
- [ ] Update all registry metadata
- [ ] Test sidebar behavior after migration
