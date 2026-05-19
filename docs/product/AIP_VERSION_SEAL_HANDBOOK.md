# AIP Version Seal Handbook

## Seal Types

### Final Seal

A Final Seal is the primary readiness checkpoint before considering a phase complete. It includes:

- 15-point criteria checklist
- Full validation gate pass (lint, typecheck, build, db:doctor, secret:scan)
- Cross-registry consistency verification
- Sidebar boundary audit
- Safety search
- Report + receipt generation

**Commit message:**
```
feat(product): <description>

Seal: <phase>
Blocking: 0  Warning: 0  Info: 0
```

### Final Seal Recheck

A Final Seal Recheck is a lightweight verification that a previously sealed state remains valid after minor changes. It includes:

- Working tree clean verification
- HEAD hash confirmation
- Gate re-check
- Boundary re-audit
- Blocking = 0 verification

---

## Tag / Release Policy

### Default: No Tag, No Release

By default, AI assistants must NOT create git tags or GitHub Releases. Tags and releases require explicit human approval.

### When Tag is Allowed

A git tag may be created ONLY when:

1. Explicitly requested by the user/human
2. The seal verdict is blocking = 0, warning = 0, info = 0
3. All validation gates pass
4. The working tree is clean

Tag format: `vX.Y.Z-build.YYYYMMDD`

### When Release is Allowed

A GitHub Release may be created ONLY when:

1. Explicitly requested by the user/human
2. A git tag exists for this version
3. Release notes have been drafted
4. Assets have been prepared

---

## Rollback Plan

If a commit introduces a blocking issue:

1. Revert the commit: `git revert <hash>`
2. Verify revert is clean: `git status --short` should be empty
3. Re-run all validation gates
4. Report the revert in the next seal receipt

### Center Rollback Plans

| Center | Rollback Action |
|--------|----------------|
| Advanced Mode Preview | Remove NavItem from Layout.tsx, update 4 registry files |
| Connector Center | Revert commit that added NavItem to Layout.tsx |
| Lab Center | No sidebar entry to revert. Remove from launchpad if needed. |
| Governance Center | No sidebar entry to revert. Remove from launchpad if needed. |
| Navigation Preview | No sidebar entry to revert. Remove from launchpad if needed. |
| Permission Evaluator Preview | Remove route from App.tsx, delete page file |

---

## Version Metadata

| Field | Value |
|-------|-------|
| Product Name | AegisFlow |
| Current Version | v7.25.2 |
| Build Date | 2026.05.19 |
| Seal Status | Final Seal Candidate |
| Safety Mode | Readonly-first |
| Stage C | Disabled |

The product metadata is defined in `apps/web-ui/src/registry/product-metadata-registry.ts`.

---

## Receipt Template

```
[AIP v<version> Seal Receipt]
Date: <date>
HEAD: <hash>
Deliverables: <summary>
Blocking: 0  Warning: 0  Info: 0
Verdict: READY_FOR_COMMIT / FINAL_SEAL_READY
```
