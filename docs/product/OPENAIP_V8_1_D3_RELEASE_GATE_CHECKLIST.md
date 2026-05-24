# OpenAIP v8.1 — Release Gate Checklist

*This checklist must be completed before any tag/release can be created. All items must be PASS or explicitly WAIVED by human owner.*

## 6.1 Source / Git Gate

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1.1 | Working tree clean (`git status --short` shows nothing) | ☐ | |
| 1.2 | Branch is `main` | ☐ | |
| 1.3 | `origin/main` is up to date (`git status` says "up to date") | ☐ | |
| 1.4 | No untracked release artifacts (build output, node_modules, .env) | ☐ | |
| 1.5 | No unexpected modified files | ☐ | |
| 1.6 | Tag does not already exist (`git tag -l v8.1.0`) | ☐ | |
| 1.7 | Release version chosen and authorized | ☐ | Must match auth template |

---

## 6.2 Validation Gate

| # | Check | Command | Result | Notes |
|---|-------|---------|--------|-------|
| 2.1 | TypeScript check | `npm run typecheck` | ☐ | |
| 2.2 | Lint | `npm run lint` | ☐ | |
| 2.3 | Build | `npm run build` | ☐ | Chunk-size warning is non-blocking |
| 2.4 | v7 smoke tests | `npm test --silent` | ☐ | Expect 9/9 |
| 2.5 | v8 route smoke tests | `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` | ☐ | Expect 108/108 |
| 2.6 | v8 registry validators if present | e.g. `npm run validate-v8-registry` | ☐ | |

---

## 6.3 Visual Gate

| # | Check | Method | Result | Notes |
|---|-------|--------|--------|-------|
| 3.1 | zh command center sidebar | Browser screenshot of `/` or `/openaip-v8-command-center-preview` | ☐ | |
| 3.2 | zh sidebar top (OpenAIP section) | Browser screenshot | ☐ | |
| 3.3 | zh sidebar footer | Browser screenshot | ☐ | |
| 3.4 | zh Advanced Tools section (bottom) | Browser screenshot | ☐ | |
| 3.5 | en command center sidebar | Browser screenshot (switch to EN) | ☐ | |
| 3.6 | en footer | Browser screenshot | ☐ | |
| 3.7 | Chrome auto-translate disabled | Confirm in browser | ☐ | Must be OFF |
| 3.8 | Only OpenAIP internal EN/中文 language switch is used | Confirm no third-party translation interference | ☐ | |

> **Note:** D2 screenshots were skipped due to CLI environment limitations. This gate may require human re-run or owner waiver before actual release.

---

## 6.4 Product Gate

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 4.1 | Sidebar no longer presents MVP / preview / experiment wording | ☐ | |
| 4.2 | OpenAIP is the first/primary navigation section | ☐ | |
| 4.3 | Advanced Tools section is visually de-emphasized (last, subtle class) | ☐ | |
| 4.4 | Footer displays mature product status (no "MVP" wording) | ☐ | |
| 4.5 | Chinese and English navigation labels are consistent | ☐ | |
| 4.6 | No hidden dangerous pages exposed in sidebar | ☐ | |
| 4.7 | No debug/internal labels in primary navigation | ☐ | |

---

## 6.5 Safety Gate

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 5.1 | Gate remains CLOSED (unless separately authorized in this release) | ☐ | |
| 5.2 | Stage C remains disabled (unless separately authorized) | ☐ | |
| 5.3 | Execution remains disabled (unless separately authorized) | ☐ | |
| 5.4 | No DB writes are triggered by this release | ☐ | |
| 5.5 | No indexing jobs are triggered by this release | ☐ | |
| 5.6 | No provider / local-app / connector actions triggered | ☐ | |
| 5.7 | No master-switch behavior changed | ☐ | |
| 5.8 | No Auth / Gate logic changed | ☐ | |
| 5.9 | No service restart required | ☐ | |
| 5.10 | No runtime config mutation performed | ☐ | |

---

## 6.6 Release Authorization Gate

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 6.1 | Release version documented and approved | ☐ | |
| 6.2 | Tag name confirmed (e.g. `v8.1.0`) | ☐ | |
| 6.3 | GitHub release title confirmed | ☐ | |
| 6.4 | Permission to create tag granted | ☐ | |
| 6.5 | Permission to push tag granted | ☐ | |
| 6.6 | Permission to create GitHub Release granted | ☐ | |
| 6.7 | Confirmation that Gate / Stage C remain closed | ☐ | |
| 6.8 | Rollback plan acknowledged by owner | ☐ | |
| 6.9 | Screenshot gap waived or filled | ☐ | |
| 6.10 | Authorization recorded via template (see authorization template doc) | ☐ | |

---

*See OPENAIP_V8_1_D3_RELEASE_AUTHORIZATION_TEMPLATE.md for the authorization form.*
*See OPENAIP_V8_1_D3_ROLLBACK_RECOVERY_PLAN.md for the rollback plan.*
