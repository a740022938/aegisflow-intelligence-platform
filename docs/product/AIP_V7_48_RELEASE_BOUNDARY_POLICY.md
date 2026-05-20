# AIP v7.48 — Release Boundary Policy

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P4

---

## 1. What Local RC Means

**Local RC** (Local Release Candidate) is an intermediate packaging state:

- The codebase is in a self-consistent, evaluable state
- A human operator can clone, install, build, and verify locally
- The operator can run dry-run restore, check safety status, and validate readiness
- **This is NOT a GitHub Release**
- **No git tag is created**
- **No GitHub Release artifact is published**
- **Stage C remains DISABLED**

## 2. Local RC vs GitHub Release

| Criterion | Local RC | GitHub Release |
|-----------|----------|----------------|
| Tag | No tag | Tag required (semver) |
| GitHub Release page | Not created | Created with release notes |
| Stage C | DISABLED | Remains DISABLED until explicit authorization |
| Distribution | Local clone only | Published to GitHub |
| Installer | None (pnpm from source) | TBD |
| Rollback support | Plan-only | Full rollback available |
| Human authorization | Implicit (clone = opt-in) | Explicit authorization required |

## 3. What Local RC Enables

- Run `pnpm install && pnpm run build` from fresh clone
- Run `aip` CLI with OpenAIP banner
- Run `aip where`, `aip safe-status`, `aip receipt template`
- Run `aip next`, `aip release-status`
- Run dry-run restore (`restore.mjs` without `--execute`)
- Generate evidence packs and reports to `E:\_AIP_REPORTS`
- Generate receipts to `E:\_AIP_RECEIPTS`

## 4. What Local RC Does NOT Enable

- `restore.mjs --execute` (still requires CONFIRM + separate authorization)
- `aip repair source` (still blocked by default)
- Stage C feature flag toggle
- POST endpoints that write to DB
- Executor code
- External tool control
- Connector actions
- New sidebar pages
- Real restore or rollback execution

## 5. GitHub Release Gate

To proceed from Local RC to GitHub Release, ALL of the following are required:

1. Explicit human owner authorization (verbal or written)
2. Final release notes drafted and reviewed
3. Final package integrity check
4. Tag policy applied (semver)
5. Secrets scan passed
6. Rollback / restore evidence attached
7. Release receipt generated
8. Stage C remains DISABLED (separate authorization required for Stage C)

## 6. Tag No-Go Policy

- **No tag** may be created during v7.48 phases D1–P5
- Tag creation requires explicit authorization outside of this phase plan
- `git tag` is a manual action, NOT automated in any script or command
- `aip release-status` must report `Tag: NOT CREATED`
- Any tag found during recheck must be reported as a violation

## 7. GitHub Release No-Go Policy

- **No GitHub Release** may be created during v7.48 phases D1–P5
- GitHub Release creation requires:
  - Separate blueprint
  - Human owner approval
  - Tag policy review
  - Final security review
- `aip release-status` must report `GitHub Release: NOT CREATED`

## 8. Violation Handling

If a tag or GitHub Release is detected during any phase:

1. Stop all work immediately
2. Report the violation with evidence
3. Do not proceed until resolved
4. Tag must be deleted (if accidental)
5. Release must be deleted/drafted (if accidental)
6. Incident must be documented in phase report
