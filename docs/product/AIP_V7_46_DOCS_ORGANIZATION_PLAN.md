# AIP v7.46 — Docs Organization Plan

**Status:** P3 Final
**Date:** 2026-05-20

---

## 1. Current State

`docs/product/` contains 284+ files in a flat directory. v7.45 and v7.46 files follow a consistent naming convention (`AIP_V7_45_*`, `AIP_V7_46_*`) but are mixed with older version docs, blueprints, specs, architecture docs, and Chinese-language files.

## 2. Recommended Organization

In a future version (not v7.46, to avoid breaking existing links), reorganize into subdirectories:

```
docs/product/
  current-baseline/       # v7.46 docs (operator guides, blueprints, checklists)
  release-readiness/      # v7.45 release readiness docs
  operator-console/       # Operator console registries and specs
  cli-command-center/     # CLI command center blueprints and references
  repair-restore/         # Repair and restore point docs
  memory-baseline/        # Memory bridge and knowledge docs
  stage-c-safety/         # Stage C safety and authorization docs
  historical/             # Pre-v7.41 docs (archived, not actively maintained)
```

## 3. Naming Convention

All new docs should follow:

```
AIP_V7_<XX>_<TOPIC>_<TYPE>.md
```

Where `<TYPE>` is one of:
- `BLUEPRINT` — Design/specification document
- `PLAN` — Implementation plan
- `GUIDE` — User-facing guide
- `REFERENCE` — Reference material
- `INDEX` — Table of contents
- `PRIMER` — Explanatory document
- `CHECKLIST` — Checklist document
- `POLICY` — Policy/safety document
- `NOTICE` — Warning/notice document
- `ROADMAP` — Phase roadmap

## 4. What v7.46 Does

- Creates a docs index (`AIP_V7_46_DOCS_INDEX.md`) that groups docs by category
- Creates START_HERE.md at the project root
- Does NOT move or rename existing files (to avoid breaking links)

## 5. What v7.46 Does NOT Do

- Does NOT move 284 files into subdirectories
- Does NOT delete legacy files
- Does NOT rename existing docs
