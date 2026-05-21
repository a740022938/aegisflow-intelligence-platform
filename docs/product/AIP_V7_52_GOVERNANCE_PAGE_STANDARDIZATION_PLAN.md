# AIP v7.52 Governance Page Standardization Plan

**Date:** 2026-05-21  
**Status:** D1 — Blueprint  
**Target Phase:** P2  
**Baseline Finding:** `MEDIUM — Governance pages use partial DS but lack PageShell`

---

## 1. Scope

| Page | Current | Target |
|---|---|---|
| `/approvals` | Partial (PageHeader + SectionCard + StatusBadge) | GovernanceShell |
| `/governance-hub` | Partial (PageHeader + SectionCard + StatusBadge) | GovernanceShell |
| `/audit` | Partial (PageHeader + SectionCard + StatusBadge) | GovernanceShell |
| `/cost-routing` | Modern (PageShell + SectionCard) | No change (reference) |
| `/connector-center-readonly` | Modern (PageShell + SectionCard + StatusStrip) | No change (reference) |
| `/advanced-mode-readonly` | Modern (PageShell + SectionCard) | No change (deferred) |

## 2. GovernanceShell Standard

All governance pages should share:

```
PageShell
  PageHeader (title + subtitle)
  ReadonlyBanner (yellow: "Read-only preview. No mutation." — for readonly pages)
  StatusStrip (governance state flags)
  SectionCard-based content sections
  SafetyBoundaryFooter
```

## 3. Per-Page Migration Scope

### Approvals `/approvals`
- Add PageShell wrapper
- Add ReadonlyBanner (if no mutation is expected)
- Add StatusStrip (approval status summary)
- Keep existing SectionCard + StatusBadge structure
- Add EmptyState for no approvals

### GovernanceHub `/governance-hub`
- Add PageShell wrapper
- Add ReadonlyBanner
- Add StatusStrip (governance overview status)
- Keep existing SectionCard + StatusBadge structure
- Add EmptyState for no policies

### Audit `/audit`
- Add PageShell wrapper
- Add StatusStrip (audit log summary stats)
- Keep existing SectionCard + InfoTable structure
- Add EmptyState for no audit entries

## 4. Not In Scope

```
- CostRouting: reference page, no changes
- ConnectorCenterReadonly: reference page, no changes
- AdvancedModeReadonly: deferred (high density, complex)
- Governance page behavior changes
- Sidebar group relocation of pages
```

## 5. Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| PageShell wraps incorrectly | LOW | PageShell is a flex wrapper; existing content renders inside |
| ReadonlyBanner redundant | LOW | Banner is informational; existing readonly pages benefit |
| Accidental behavior change | LOW | No logic touched, only layout wrapping |

## 6. Acceptance Criteria

```
Approvals:
- PageShell: YES
- ReadonlyBanner: YES
- StatusStrip: YES
- EmptyState for no approvals: YES

GovernanceHub:
- PageShell: YES
- ReadonlyBanner: YES
- StatusStrip: YES
- EmptyState for no policies: YES

Audit:
- PageShell: YES
- StatusStrip: YES
- EmptyState for no entries: YES
```
