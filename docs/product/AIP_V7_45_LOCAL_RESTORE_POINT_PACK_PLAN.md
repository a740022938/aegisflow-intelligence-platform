# AIP v7.45 — Local Restore Point Pack Plan

**Status:** P2 Plan-only
**Date:** 2026-05-20
**Baseline:** AIP v7.44 Final Seal

---

## 1. Purpose

Design a local restore point pack system for plan-only recovery snapshots. No actual restore is executed.

## 2. Directory Structure

```
E:\_AIP_RESTORE_POINTS\
  └── AIP_v7.45_<commit>_<YYYYMMDD>\
        ├── source-manifest.json
        ├── source-sha256.txt
        ├── restore-policy.md
        ├── restore-exclusions.txt
        └── operator-readme.md
```

## 3. Manifest Format (`source-manifest.json`)

```json
{
  "version": "v7.45",
  "commit": "<hash>",
  "date": "2026-05-20",
  "files": [
    {"path": "src/file.ts", "sha256": "<hash>", "size": 1234}
  ],
  "excluded": [
    "node_modules/", ".env", "dist/"
  ],
  "totalFiles": 0,
  "totalSize": 0
}
```

## 4. Process

1. Generate manifest (list all tracked files with SHA256)
2. Generate SHA256 checksum file
3. Generate restore policy
4. Generate exclusion list
5. Generate operator readme
6. (Future) Package into zip if authorized

## 5. Safety

- Plan-only: no files are modified
- Source restore: blocked unless explicitly authorized
- Full restore: forbidden by default
- SHA256 verification required before any restore
- Human confirmation text required before any restore
- Receipt required after any restore
- No secrets captured in restore point
