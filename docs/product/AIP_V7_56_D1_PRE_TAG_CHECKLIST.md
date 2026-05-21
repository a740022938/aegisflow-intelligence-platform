# AIP v7.56-D1 Pre-Tag Checklist

**Date:** 2026-05-21
**Phase:** D1
**Status:** Template — execute only after human authorization is filed

---

## 1. Preconditions

All items below must be confirmed **PASS** before any tag/release action.

---

## 2. Checklist

| # | Check | Command / Method | Status |
|---|---|---|---|
| P1 | Working tree clean | `git status --short` | ⬜ |
| P2 | Branch is main | `git branch --show-current` | ⬜ |
| P3 | HEAD is approved commit | `git rev-parse HEAD` | ⬜ |
| P4 | No pre-existing tag at HEAD | `git tag --points-at HEAD` | ⬜ |
| P5 | Human authorization form exists and is filled | Check `AIP_V7_56_D1_HUMAN_AUTHORIZATION_FORM.md` | ⬜ |
| P6 | Tag name confirmed | Match form's Approved release version/tag | ⬜ |
| P7 | Release notes source confirmed | Match form's Approved release notes source | ⬜ |
| P8 | Typecheck passes | `pnpm run typecheck` | ⬜ |
| P9 | Build succeeds | `pnpm run build` | ⬜ |
| P10 | Lint passes | `pnpm run lint` | ⬜ |
| P11 | Smoke tests pass | `pnpm test` | ⬜ |
| P12 | No whitespace errors | `git diff --check` | ⬜ |
| P13 | No unrelated docs staged | Review staged files | ⬜ |
| P14 | GitHub remote confirmed | `git remote -v` | ⬜ |
| P15 | Rollback command documented | See below | ⬜ |

---

## 3. Execution Steps (After Checklist Passes)

```powershell
# 1. Create tag
git tag -a <approved-tag> -m "<approved-release-title>"

# 2. Push tag
git push origin <approved-tag>

# 3. Create GitHub Release (optional per authorization)
gh release create <approved-tag> --title "<approved-release-title>" --notes-file <release-notes-path>

# 4. File release receipt
# Place receipt in docs/product/ and E:\_AIP_RECEIPTS\
```

---

## 4. Rollback Commands

If tag needs to be removed (must be done quickly before others pull):

```powershell
# Delete local tag
git tag -d <approved-tag>

# Delete remote tag
git push origin :refs/tags/<approved-tag>
```

If GitHub Release needs to be deleted:

```powershell
gh release delete <approved-tag>
```
