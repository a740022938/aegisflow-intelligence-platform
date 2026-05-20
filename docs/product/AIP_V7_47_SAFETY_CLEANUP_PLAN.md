# AIP v7.47 — Safety Cleanup Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P4

---

## 1. Objective

Fix 4 medium-severity findings (M3, M4, M5, M6), 1 low-severity finding (L2), and the rollback script safety issue (L4). These are safety/polish items that reduce risk surface for local RC.

## 2. Current State

| Issue | Severity | File | Detail |
|-------|----------|------|--------|
| M3 | MEDIUM | `.env.local:44-45` | Telegram bot token (`8702696207:AAEJXxkbeFvo0oVGKZrreahPVu311-tbugo`) and chat ID (`6930053241`) stored in plaintext |
| M4 | MEDIUM | `navigation-exposure-registry.ts:394-627` | 17 entries have `currentExposure: 'primary_nav'` but `recommendedExposure` says different (advanced_mode, governance_center, etc.) |
| M5 | MEDIUM | `safe-status.ts:6` | `cwd: 'E:\\AIP'` hardcoded — breaks if project moved |
| L2 | LOW | `apps/aip-cli/tsconfig.json` | Missing `"types": ["node"]` — no Node.js type safety |
| L4 | LOW | `scripts/rollback_pre_seal_repair.cmd` | No confirmation prompt before destructive `git restore` |

## 3. Deliverables

### 3.1 Handle .env.local Credential Risk (M3)

**Constraints:**
- `.env.local` is already gitignored (line 16 in `.gitignore`)
- The Telegram token and chat ID appear to be real credentials
- Full rotation is out of scope — this is documentation/hygiene only

**Actions:**

1. **Create `.env.example`** if not present (currently missing — `.env.*` is gitignored with `!.env.example` exception):
   ```
   # AIP — Environment Variables Example
   # Copy to .env.local and fill in your values.
   # NEVER commit .env.local to git.
   
   # Telegram notifications (optional)
   # TELEGRAM_BOT_TOKEN=
   # TELEGRAM_CHAT_ID=
   
   # JWT secret (REQUIRED in production — change this!)
   JWT_SECRET=change-this-to-a-secret-value
   
   # Ports
   LOCAL_API_PORT=8787
   
   # Safety
   ALLOW_DELETE=false
   ALLOW_OVERWRITE=false
   APPROVAL_REQUIRED=true
   ```

2. **Add documentation note** in `START_HERE.md` or `README.md`:
   - `.env.local` may contain real credentials — handle with care
   - Do not share `.env.local` contents
   - Run `pnpm run secret:scan` to check for credential leaks

3. **Verify `secret:scan` script** handles `.env.local` patterns — check `scripts/secret-scan.mjs`

### 3.2 Fix Sidebar Exposure Misconfigurations (M4)

**Current state:** 17 entries in `navigation-exposure-registry.ts` have `currentExposure: 'primary_nav'` but their own `recommendedExposure` says they should NOT be in the primary sidebar (e.g., `advanced_mode`, `governance_center`, `connector_center`).

**Important constraint:** This P4 task is about **documentation and acknowledgment**, not full sidebar migration. Full migration is deferred to post-RC.

**Actions:**

1. **Add a registry-level comment** explaining the mismatch and its deferral:
   ```typescript
   // ── DEFERRED: Sidebar exposure cleanup ──
   // The 17 entries below have currentExposure: 'primary_nav' but their
   // recommendedExposure differs (advanced_mode, governance_center, etc.).
   // Full migration deferred to post-v7.47-RC. See AIP_V7_47_SIDEBAR_MIGRATION_TICKET.
   // Status: acknowledged, blocking pre-RC.
   // ─────────────────────────────────────────
   ```

2. **Add risk assessment** to each of the 17 entries — confirm they are `allowedNow: true` (readonly, non-destructive) or `allowedNow: false` (safety-gated). From review:
   - `inference`: `allowedNow: false` (scheduler, deploy-v2 are also false)
   - `backflow-v2`, `scheduler`, `alerting`, `model-monitor`, `deploy-v2`: various gates
   - Most are placeholder pages with no real functionality

3. **Create a tracking ticket** in docs: `docs/product/AIP_V7_47_SIDEBAR_MIGRATION_TICKET.md`

4. **Do NOT change sidebar behavior** — only documentation and comments.

### 3.3 Remove Hardcoded Path in safe-status.ts (M5)

**Current (safe-status.ts:6):**
```typescript
return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: 'E:\\AIP' }).trim();
```

**Options (pick one):**

**Option A (recommended):** Use `process.cwd()` (working directory):
```typescript
return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: process.cwd() }).trim();
```

**Option B:** Use `import.meta.url` to derive project root relative to the file:
```typescript
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..'); // from commands/safe-status.ts up to repo root
return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: projectRoot }).trim();
```

**Option C:** Add `import.meta.url` + `fileURLToPath` + `path` imports:
```typescript
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
```

**Note:** Also check `apps/aip-cli/src/commands/where.ts` for similar hardcoded paths.

### 3.4 Fix aip-cli tsconfig (L2)

**Add to `apps/aip-cli/tsconfig.json`:**
```json
"types": ["node"]
```

Without this, VS Code / tsc does not have type definitions for Node.js builtins (Buffer, process, setTimeout types, etc.).

Full tsconfig after fix:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": false,
    "sourceMap": false,
    "types": ["node"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.5 Add Confirmation to rollback Script (L4)

**Current** (`rollback_pre_seal_repair.cmd`): Runs `git restore --worktree --staged` on 13 files with no warning.

**Fix — Add confirmation prompt:**
```batch
@echo off
setlocal

echo ╔══════════════════════════════════════════════════════════════╗
echo ║   WARNING: This script will revert staged/worktree changes  ║
echo ║   on 13 pre-seal repair files via 'git restore'.            ║
echo ║   Unsaved changes will be LOST.                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set /p CONFIRM=Type CONFIRM to proceed: 
if not "%CONFIRM%"=="CONFIRM" (
  echo [rollback] Cancelled.
  exit /b 0
)

set "REPO_ROOT=%~dp0.."
cd /d "%REPO_ROOT%"

echo [rollback] Reverting P4 pre-seal repair files...
...
```

## 4. Verification

```powershell
# 3.1 - .env.example exists
Test-Path E:\AIP\.env.example

# 3.3 - safe-status no longer has hardcoded E:\AIP
Select-String -Path E:\AIP\apps\aip-cli\src\commands\safe-status.ts -Pattern "E:\\\\AIP"
# Should return no matches

# 3.4 - tsconfig has node types
Select-String -Path E:\AIP\apps\aip-cli\tsconfig.json -Pattern "node"

# 3.5 - rollback script has confirmation
Select-String -Path E:\AIP\scripts\rollback_pre_seal_repair.cmd -Pattern "CONFIRM"
```

## 5. Safety

- No stage-c enablement
- No feature flag toggle
- No DB write
- No service restart
- No sidebar behavior changes (documentation only)
- No credential rotation (documentation only)
