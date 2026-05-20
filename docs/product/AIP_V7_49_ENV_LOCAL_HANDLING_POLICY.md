# AIP v7.49 — .env.local Handling Policy

**Date:** 2026-05-20
**Phase:** P2
**Baseline HEAD:** `724c5c2`

---

## 1. Purpose

Define how `.env.local` (which may contain real credentials) must be handled during development, review, and release.

## 2. Rules

| Action | Rule |
|--------|------|
| **Create** | Copy from `.env.example`, fill in real values locally only |
| **Read** | Permitted by owner only. Never printed to console, logs, or CI output |
| **Commit** | ❌ NEVER. `.env.local` is in `.gitignore` and must stay there |
| **Share** | ❌ NEVER. Do not paste contents in chat, email, or issue tracker |
| **Backup** | ⚠️ Only to encrypted storage. Never to git or cloud sync |
| **Delete** | Safe to delete. Recopy from `.env.example` and re-fill |
| **Review** | Only check existence and git-tracking status. Do NOT read values |

## 3. What To Do If .env.local Is Accidentally Committed

1. **Immediately** remove the secret from the file and commit a fix
2. **Rotate** the compromised credential (change the token/secret)
3. **Audit** git history — assume the secret is public once pushed
4. **Document** the incident

## 4. Pre-Release Checks

Before any release:
- [ ] `.env.local` is NOT tracked by git
- [ ] No `.env*` files (except `.env.example`) appear in `git ls-files`
- [ ] `.env.example` contains zero real secrets
- [ ] Hardcoded secret scan passes (run `rg` for known patterns)

## 5. Safety

- `.env.local` content is never read, printed, or committed by automation
- All reviews check only file presence and git tracking status
- No credential rotation is performed automatically
