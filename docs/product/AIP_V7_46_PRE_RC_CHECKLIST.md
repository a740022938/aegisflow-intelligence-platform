# AIP v7.46 — Pre-RC Checklist

**Status:** P3 Final
**Date:** 2026-05-20

---

## CLI

- [ ] `aip where` exists and works
- [ ] `aip safe-status` exists and works
- [ ] `aip receipt template` exists and works
- [ ] No ghost commands in help text
- [ ] `aip help <cmd>` works for all real commands

## Security

- [ ] master-switch POST returns 403 (no DB write)
- [ ] token bootstrap bypass removed
- [ ] JWT_SECRET hardcoded fallback removed (fail-closed unless AIP_ALLOW_DEV_JWT=1)
- [ ] restore.mjs default mode is plan-only

## Documentation

- [ ] START_HERE.md exists at project root
- [ ] README no longer claims v7.3.0 as current version
- [ ] Docs index exists
- [ ] Stage C primer exists
- [ ] Version baseline document exists

## Web UI

- [ ] Preview inventory exists
- [ ] Auth Review canonical map exists
- [ ] Feature Flag canonical map exists
- [ ] No hidden pages exposed in sidebar
- [ ] No mutation buttons added

## Safety

- [ ] Stage C: DISABLED
- [ ] Feature flag: OFF
- [ ] POST runtime: BLOCKED / PROTECTED
- [ ] DB write: BLOCKED (no public POST writes DB)
- [ ] Executor: ABSENT
- [ ] External control: BLOCKED
- [ ] Connector action: BLOCKED
- [ ] Repair: PLAN-ONLY
- [ ] Memory: READONLY
- [ ] Authorization: PREVIEW-ONLY
- [ ] Sidebar exposure: NONE
- [ ] No tag
- [ ] No GitHub Release

## Validation

- [ ] Typecheck: PASS
- [ ] Tests: 9/9 PASS
- [ ] Build: PASS
- [ ] Diff check: PASS
- [ ] Working tree: CLEAN
