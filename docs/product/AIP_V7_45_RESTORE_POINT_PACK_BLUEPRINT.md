# AIP v7.45 — Restore Point Pack Blueprint

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.44 Final Seal

---

## 1. Purpose

Design a local restore point pack system that can produce SHA256-verified, plan-only recovery snapshots. This is a **design and plan-only** package — no real source restore is executed.

## 2. Restore Point Directory

```
E:\_AIP_RESTORE_POINTS\
  └── AIP_v7.45_<commit>_<YYYYMMDD>\
        ├── source-manifest.json
        ├── source-sha256.txt
        ├── restore-policy.md
        ├── restore-exclusions.txt
        └── operator-readme.md
```

## 3. Exclusion List

```
.env
.env.*
*.key
*.pem
*.token
node_modules/
dist/
build/
.cache/
logs/
*.db
*.sqlite
```

## 4. Safety Rules

- Restore point is **plan-only** by default
- Source restore is **blocked** unless explicitly authorized
- Full restore is **forbidden** by default
- SHA256 verification required before any restore
- Human confirmation text required before any restore
- Receipt required after any restore
- No secrets captured in restore point

## 5. Delivery

- `docs/product/AIP_V7_45_LOCAL_RESTORE_POINT_PACK_PLAN.md`
- `docs/product/AIP_V7_45_RESTORE_POINT_MANIFEST_SPEC.md`
- `docs/product/AIP_V7_45_RESTORE_POINT_EXCLUSIONS.md`
- `docs/product/AIP_V7_45_RESTORE_POINT_HASH_POLICY.md`
- `apps/web-ui/src/pages/RestorePointPackPreview.tsx`
- `apps/web-ui/src/registry/restore-point-pack-registry.ts`
