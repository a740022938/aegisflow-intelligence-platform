# AIP Assistant Construction Protocol

This document defines the operating protocol for AI assistants working on the AIP codebase. Following these rules prevents unsafe modifications, boundary violations, and unauthorized execution.

---

## 1. Preconditions: Evidence First

Before any modification, the assistant must:

1. Verify the current branch (`git branch --show-current`)
2. Verify the current HEAD (`git rev-parse HEAD`)
3. Verify working tree is clean (`git status --short`)
4. Read the relevant files to understand the full context
5. Check the most recent seal receipt for current phase/state

If any precondition fails, the assistant must **stop and report** — not proceed with modifications.

---

## 2. Construction Rules

### 2.1 File Precision

- Use `git add <file1> <file2>` — never `git add .` or `git add -A`
- Only add files that were explicitly modified for the current task
- Verify the diff before committing (`git diff --stat`)

### 2.2 Version Bumping

- Do not bump version numbers without explicit instruction
- The version is managed by the product metadata registry (`product-metadata-registry.ts`)
- Version changes require human approval

### 2.3 Red Line Boundaries

The following are **permanently forbidden** for AI assistants to modify or enable:

| Forbidden Action | Rationale |
|-----------------|-----------|
| Enable Stage C | Permanently disabled by policy |
| Write to database | Readonly-first mode |
| Process Memory Hub candidates | Requires DB write |
| Control external tools (OpenClaw, ComfyUI, etc.) | No runtime authorization |
| Call external APIs | No network control |
| Modify backend (`apps/local-api/**`) | Backend is out of scope |
| Modify database schema | Schema frozen |
| Create git tags | No tag/release without human approval |
| Create GitHub Releases | No release without human approval |
| `git add .` or `git add -A` | Must be precise |
| Taskkill / restart services | Would disrupt running AIP |

### 2.4 Sidebar Invariant

| Center | Sidebar State |
|--------|---------------|
| Advanced Mode Preview | In sidebar |
| Connector Center | In sidebar |
| Lab Center | NOT in sidebar |
| Governance Center | NOT in sidebar |
| Navigation Preview | NOT in sidebar |
| Permission Evaluator Preview | NOT in sidebar |

---

## 3. Validation Gates

Before any commit, ALL gates must pass:

| Gate | Command |
|------|---------|
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| DB Doctor | `npm run db:doctor` |
| Secret Scan | Manual check for tokens |

---

## 4. Commit Convention

```
feat(scope): description

<optional body with details>

Gates: lint:pass typecheck:pass build:pass db:doctor:pass secret:clean
Blocking: 0  Warning: 0  Info: 0
```

---

## 5. Seal Receipt

After completing a phase, the assistant must generate a seal receipt with:

- Phase identifier
- Git branch and HEAD (before and after)
- All modified files (new + changed)
- Validation results
- Blocking/warning/info counts
- Next step recommendation

---

## 6. Report Paths

| Artifact | Location |
|----------|----------|
| Seal Reports | `E:\_AIP_REPORTS\` |
| Seal Receipts | `E:\_AIP_RECEIPTS\` |
| Product Docs | `docs/product/` |
| Registries | `apps/web-ui/src/registry/` |
