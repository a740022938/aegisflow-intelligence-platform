# AIP v7.49 — Env / Secret Rotation Readiness Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P2

---

## 1. Objective

Review `.env.local` credential handling readiness. Do NOT rotate secrets. Do NOT read, print, or commit real secret values. Produce documentation and a readiness checklist.

## 2. Scope

- `.env.example` — safe placeholder values only
- `.env.local` — verify NOT tracked by git
- Secret rotation readiness — checklist only, no actual rotation
- Handling policy — document how `.env.local` should be managed

## 3. Rules

| Action | Permitted? |
|--------|-----------|
| Read `.env.local` contents | ❌ NO |
| Print `.env.local` to console | ❌ NO |
| Commit `.env.local` | ❌ NO |
| Commit `.env.example` with placeholders | ✅ YES |
| Create rotation readiness checklist | ✅ YES |
| Create handling policy doc | ✅ YES |
| Search for `TELEGRAM` or `TOKEN` in tracked files (excluding `.env.local`) | ✅ YES |

## 4. .env.example Requirements

Must contain safe placeholder values:

```
OPENCLAW_ADMIN_TOKEN=replace_me
AIP_API_BASE_URL=http://127.0.0.1:8787
STAGE_C_ENABLED=false
TELEGRAM_BOT_TOKEN=replace_me
TELEGRAM_CHAT_ID=replace_me
```

Must NOT contain real tokens, API keys, or personal information.

## 5. Deliverables

- `.env.example` — updated with safe placeholders if missing
- `docs/product/AIP_V7_49_ENV_SECRET_ROTATION_READINESS_REVIEW.md` — review findings
- `docs/product/AIP_V7_49_ENV_LOCAL_HANDLING_POLICY.md` — handling guidelines
- `docs/product/AIP_V7_49_SECRET_ROTATION_CHECKLIST.md` — pre-release checklist

## 6. Safety

- No real secrets captured, printed, or committed
- No credential rotation executed
- No service changes
