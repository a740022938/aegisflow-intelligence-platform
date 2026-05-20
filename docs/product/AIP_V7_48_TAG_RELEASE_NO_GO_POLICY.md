# AIP v7.48 — Tag / Release No-Go Policy

**Date:** 2026-05-20
**Phase:** P4
**Baseline HEAD:** `3d25af5`

---

## 1. Policy Statement

During v7.48 phases D1 through P5:

- **No git tag may be created**
- **No GitHub Release may be created**
- **Stage C must remain DISABLED**

These restrictions are enforced by policy, not by technical gate. All team members and automated agents must comply.

## 2. Tag No-Go

- `git tag` is a manual action — NOT automated in any script or command
- No commit in v7.48 creates a tag
- `aip next` and `aip release-status` are readonly — they do not create tags
- Any tag found at HEAD during a phase check must be reported as a violation
- Accidental tags must be deleted immediately

### Tag Policy for Future Release

When v7.48 progresses to a real GitHub Release (post-v7.48), tag policy will be:

- Tag format: `v7.48.0` (semver)
- Tag must be signed
- Tag must be created ONLY after:
  - Human owner authorization
  - Final release notes
  - Final package check
  - Secrets scan
  - Rollback/restore evidence

## 3. GitHub Release No-Go

- `gh release create` is NOT called in any script or automated process
- No commit in v7.48 creates a GitHub Release
- `aip release-status` reports `GitHub Release: NOT CREATED`
- An existing GitHub Release page must not be edited/published during v7.48

### GitHub Release Gate

To proceed from Local RC to GitHub Release, ALL of the following are required:

1. Explicit human owner authorization (written or verbal)
2. Final release notes drafted and reviewed
3. Final package integrity check
4. Tag policy applied (semver)
5. Secrets scan passed
6. Rollback / restore evidence attached
7. Release receipt generated
8. Stage C remains DISABLED (separate authorization required for Stage C enablement)

## 4. Verification

Each phase must verify:

```powershell
git tag --points-at HEAD          # Must be empty
gh release list -L 1              # Must show only pre-v7.48 releases
aip release-status                # Must show NOT CREATED
```

## 5. Violation Handling

If a tag or GitHub Release is detected:

1. STOP all work immediately
2. Report the violation with evidence (hash, tag name, release URL)
3. Do not proceed until resolved
4. Tag must be deleted (`git tag -d <tagname> && git push origin :refs/tags/<tagname>`)
5. Release must be deleted or converted to draft (`gh release delete <tagname>`)
6. Incident must be documented in phase report

## 6. Post-v7.48

After v7.48 P5 completes and human owner authorizes a real release:

- Create a new blueprint for the release process
- Apply tag policy
- Generate release notes
- Create GitHub Release
- Generate release receipt
