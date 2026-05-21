# AIP v7.54-P4 Migration Readiness Gates

**Date:** 2026-05-21

---

## 1. Purpose

Before any future page shell migration pilot, all gates below must pass.
This checklist is derived from the Datasets D1→P1→P2→P3 workflow.

---

## 2. Gate Checklist (15 Gates)

| # | Gate | Verification Method | Required Before |
|---|---|---|---|
| G1 | Page line count / dependency inventory complete | Manual audit of source file; record imports, components, hooks | D1 sign-off |
| G2 | Mutation count known and documented | Count `apiService.*` POST/PUT/DELETE calls; list each with signature | D1 sign-off |
| G3 | GET API count known and documented | Count `apiService.*` GET calls; verify all via `apiService` abstraction | D1 sign-off |
| G4 | `contentRef` presence and location known | Search `ref={contentRef}` in source; verify it is on a width-measurable element | D1 sign-off |
| G5 | WorkspaceGrid usage confirmed | Search `<WorkspaceGrid` in source; record props: `editable`, `layouts`, `cards`, `onChange` | D1 sign-off |
| G6 | Layout editor presence confirmed | Search `toggleEdit`, `layoutEdit`, `setLayoutEdit`; verify layout storage mechanism | D1 sign-off |
| G7 | Loading/error/empty states inventoried | Search `loading`, `error`, `EmptyState`, `successMsg`; verify all states have corresponding UI | D1 sign-off |
| G8 | No sidebar exposure planned | Verify no sidebar file changes in the migration plan | D1 sign-off |
| G9 | No hidden preview exposure planned | Verify no hidden route becomes visible | D1 sign-off |
| G10 | Rollback command documented for all 3 states | Uncommitted: `git checkout -- <file>`; committed: `git revert`; pushed: `git revert + push` | D1 sign-off |
| G11 | Visual QA matrix prepared with viewport list | 5 required viewports (1440×900, 1280×720, 1024×768, 768×1024, 390×844) | P1 sign-off |
| G12 | Validation commands pass before commit | `pnpm run typecheck`, `build`, `lint`, `git diff --check` — all PASS | P1 sign-off |
| G13 | Stage C remains disabled | Confirm no Stage C files changed in migration | P1 sign-off |
| G14 | Feature flag remains off (unless separately authorized) | Confirm no feature flag toggle files changed | P1 sign-off |
| G15 | No tag/release created in migration phase | Confirm no `git tag` or GitHub Release executed | P1 sign-off |

---

## 3. Gate Enforcement Rules

- Gates G1–G10 must be documented in the D1 readiness pack before any P1 code change.
- Gates G11–G15 must be verified during P1 implementation and before commit.
- If any gate fails, the migration must stop and the gate must be resolved before proceeding.
- Gate failures must be documented in the phase report with the remediation.
