# AIP v7.58-P1 GovernanceCenter Chunk Source Map

**Phase:** v7.58-P1
**Type:** Read-Only Source Map
**Status:** COMPLETED

---

## 1. Chunk Identity

| Field | Value |
|---|---|
| Chunk filename (build output) | `assets/GovernanceCenter-Dl3qqZfx.js` |
| Size | 930.88 kB (68.67 kB gzip) |
| Threshold | 500 kB |
| Bundle entry point | `apps/web-ui/src/pages/GovernanceCenter.tsx` |

---

## 2. Source File Map

The chunk is produced from a single entry point that imports ~145 modules:

```
apps/web-ui/src/pages/GovernanceCenter.tsx  (1231 lines)
├── imports from ../components/ui/
│   ├── PageShell             (3.19 kB in shared chunk)
│   └── SectionCard           (1.98 kB in shared chunk)
│
├── imports from ../components/governance/  (~142 files)
│   ├── Gate/Model design panels    (~40 components)
│   ├── P9/P1-P12 stage components   (~70 components)
│   ├── P7-P12 review components     (~30 components)
│   └── (most are 0.2–2 kB each)
│
├── imports from ../registry/
│   ├── governance-registry          (static data — GOVERNANCE_REGISTRY)
│   └── governance-registry-validator (validation logic)
│
└── inline code
    ├── useMemo self-check           (11 assertions on registry)
    ├── GoNoGoDecisionMatrix section (approx 50 lines)
    └── JSX rendering                 (~830 lines of JSX)
```

---

## 3. Component Breakdown Estimate

| Category | Approx count | Estimated contribution to chunk |
|---|---|---|
| PageShell + SectionCard | 2 | Shared (already in separate chunk) |
| Governance registry | 1 file | Medium (static data) |
| Registry validator | 1 file | Small (validation functions) |
| Gate/Model design panels | ~40 | ~200 kB |
| Stage components (P1-P12) | ~70 | ~350 kB |
| Review components (P7-P12) | ~30 | ~150 kB |
| Inline JSX + useMemo | — | ~100 kB |
| **Total** | **~145** | **~930 kB** |

---

## 4. Lazy Loading Status

| Check | Status |
|---|---|
| Route-level lazy loading (`React.lazy`) | ✅ YES — App.tsx:39 |
| Component-level lazy loading | ❌ NO — all 142 sub-components are eagerly imported |
| Dynamic imports within component | ❌ NO — no `import()` calls within GovernanceCenter.tsx |
| manualChunks config | ❌ NO — not present in Vite config |

---

## 5. Shared vs Local Dependencies

| Dependency | Shared with other routes? |
|---|---|
| PageShell | YES — shared across all PageShell-wrapped routes |
| SectionCard | YES — shared UI component |
| `../components/governance/*` | NO — local to GovernanceCenter |
| `../registry/governance-registry` | Likely local — governance-specific |
| `../registry/governance-registry-validator` | Likely local — governance-specific |

The 142 governance sub-components are **local to GovernanceCenter** — no other route imports them. This makes them a strong candidate for further code splitting or consolidation into a shared governance-vendor chunk.
