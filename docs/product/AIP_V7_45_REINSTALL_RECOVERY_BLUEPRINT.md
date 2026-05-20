# AIP v7.45 — Reinstall / Recovery Blueprint

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.44 Final Seal

---

## 1. Purpose

Design a guide for reinstalling and recovering the AIP project environment. This is documentation-only — no actual reinstall or recovery is executed.

## 2. Key Sections

### Reinstall
1. Prerequisites (Node, npm, Git, PowerShell)
2. Clone from GitHub
3. Install dependencies (`npm install`)
4. Verify installation (`npm run typecheck`, `npm test`, `npm run build`)
5. Start services (if allowed)
6. Verify Stage C disabled

### Recovery
1. Check git status
2. Save current diff if dirty
3. Run `aip repair plan` for diagnosis
4. Check restore point registry
5. Do NOT run source restore unless authorized
6. Use Git before zip restore
7. Never restore secrets from package
8. Generate repair receipt

## 3. Safety

All guides are informational. No commands are executed automatically.
