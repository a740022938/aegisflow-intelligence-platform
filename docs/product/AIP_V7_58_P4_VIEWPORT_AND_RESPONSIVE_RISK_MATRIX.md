# AIP v7.58-P4 Viewport and Responsive Risk Matrix

**Phase:** v7.58-P4
**Status:** COMPLETED

---

## Risk Matrix

| # | Item | Current Evidence | Likely Risk | Implementation Complexity | Source Change Allowed Now | Future Phase | No-Go Conditions |
|---|---|---|---|---|---|---|---|
| 1 | Desktop sidebar open/closed | Layout.tsx handles toggle; width persisted | Low | Low | NO | Post-adapter migration | Must preserve sidebarWidth persistence |
| 2 | Tablet width (768-1024px) | Breakpoint `md`; CSS media query at 900px switches to overlay | Medium | Medium | NO | v7.58-P5 or D2 | Sidebar must not disappear unexpectedly |
| 3 | Mobile width (< 768px) | Breakpoint `sm`; sidebar is overlay; hamburger toggle | Medium | Medium | NO | v7.58-P5 or D2 | Overlay must not break navigation |
| 4 | Touch drag/resizer | Mouse events only — no touch/pointer handler | Medium | Low-Medium | NO | v7.58-P5 or D2 | Must preserve mouse-based behavior |
| 5 | Content overflow | Not verified (UI not running) | Medium | Medium | NO | Post-adapter migration | Must not introduce horizontal scroll |
| 6 | Fixed/sticky headers | Layout.tsx has topbar; CSS positions verified | Low | Low | NO | Deferred | Must not overlap content |
| 7 | Horizontal scroll risk | Not verified | Medium | Medium | NO | Post-adapter migration | Must be ≤ 0px at all viewports |
| 8 | PageShell pages (Datasets, GovernanceCenter) | Already shell-wrapped | Low | Low | NO | Already done | Must not break PageShell wrapping |
| 9 | Non-adapter legacy pages (Dashboard, AssistantCenter, etc.) | No PageShell; raw layout | Medium-High | High | NO | Post-adapter migration | Must not partially migrate |
| 10 | Hidden previews | Navigation registry validates; 17 deferred items | Low (documented) | Low | NO | Deferred | Must not expose hidden routes |
| 11 | Stage C related pages | Route-only; not in sidebar | Low | Low | NO | Deferred | Must not appear in sidebar |
| 12 | GovernanceCenter | PageShell applied; readonly | Low | Low | NO | Already done | Must not change safety boundary |
| 13 | GovernanceHub | Not shell-wrapped; mutation pages | Medium-High | High | NO | Post-adapter no-go review | Must not migrate without no-go review |
| 14 | WorkflowComposer | Canvas/state-machine; NO-GO for adapter | High | Very High | NO | Separate D1 inventory | Must not partially migrate |
| 15 | PluginPool / AuthRequiredState | Non-adapter; PLAN_ONLY | Medium | Medium | NO | Post-adapter re-eval | Must not migrate without evidence |

---

## Summary

| Risk Level | Count | Items |
|---|---|---|
| Low | 6 | Desktop sidebar, sticky headers, PageShell pages, hidden previews, Stage C, GovernanceCenter |
| Medium | 7 | Tablet width, mobile width, touch resizer, content overflow, horizontal scroll, non-adapter pages, PluginPool |
| Medium-High | 1 | GovernanceHub |
| High | 1 | WorkflowComposer |
