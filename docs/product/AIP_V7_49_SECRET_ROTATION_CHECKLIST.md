# AIP v7.49 — Secret Rotation Pre-Release Checklist

**Date:** 2026-05-20
**Phase:** P2
**Baseline HEAD:** `724c5c2`

---

## 1. Required (Must Pass Before Release)

- [x] `.env.example` contains safe placeholder values only
- [x] `.env.local` is NOT tracked by git (`git ls-files .env.local` returns nothing)
- [x] No `.env*` files other than `.env.example` are tracked
- [x] `.gitignore` covers `.env`, `.env.local`, `.env.*`
- [x] Hardcoded secret scan: no `sk-...`, `ghp_...`, `xox[baprs]-...` in tracked files
- [x] Telegram tokens exist as placeholders only (commented out in `.env.example`)
- [x] `JWT_SECRET` uses placeholder `replace-with-local-dev-secret`
- [x] `OPENCLAW_HEARTBEAT_TOKEN` uses placeholder `replace-with-strong-token`
- [x] `OPENCLAW_ADMIN_TOKEN` uses placeholder `replace-with-admin-token`

## 2. Pre-Rotation Steps (Before Updating Live Secrets)

- [ ] Identify which secrets are deployed (JWT, OpenClaw tokens, Telegram tokens)
- [ ] Generate new values using secure random generator (`openssl rand -hex 32`)
- [ ] Update deployment environment variables (not `.env.local`)
- [ ] Update `.env.example` with new placeholder pattern if format changed
- [ ] Verify new tokens work via smoke test
- [ ] Revoke old tokens after verification

## 3. Rotation Schedule

| Secret | Rotation Cadence | Last Rotated | Notes |
|--------|-----------------|--------------|-------|
| `JWT_SECRET` | Per release or incident | N/A | Local dev only |
| `OPENCLAW_HEARTBEAT_TOKEN` | Per release or incident | N/A | Shared with OpenClaw |
| `OPENCLAW_ADMIN_TOKEN` | Per release or incident | N/A | Shared with OpenClaw |
| `TELEGRAM_BOT_TOKEN` | Per incident only | N/A | Optional |

## 4. Incident-Driven Rotation

If a secret is suspected compromised:
1. Rotate immediately — do not wait for release
2. Update deployment config
3. Update `.env.example` if placeholder format changed
4. Document the incident
5. Verify all services after rotation

## 5. Safety

- No automated rotation executed by this checklist
- All rotation is manual, authorized, and documented
- No real secret values are stored in this document
