# AIP v7.47 — Restore Readiness Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P3

---

## 1. Objective

Fix the 1 high-severity finding (H1 — dual lock files), 1 high-severity finding (H3 — missing `restore-exclusions.txt`), and 1 medium-severity finding (M6 — restore.mjs extracts zip in plan-only mode).

## 2. Current State

| Issue | Severity | File | Detail |
|-------|----------|------|--------|
| H1 | HIGH | `package-lock.json`, `pnpm-lock.yaml` | Both tracked in git — project uses pnpm, npm lock file is stale/unused |
| H3 | HIGH | Referenced in 3 docs | `restore-exclusions.txt` expected but file does not exist |
| M6 | MEDIUM | `scripts/restore.mjs:64-72` | Temp dir creation + zip extraction happen before plan-only check — leaks secrets from zip |

## 3. Deliverables

### 3.1 Remove Dual Lock File Risk

The project uses `pnpm` (declared `"packageManager": "pnpm@9.15.0"` in root `package.json`). The `package-lock.json` is a leftover from `npm` usage and is:

- Stale (not updated with pnpm installs)
- Can cause confusion about which lock file is authoritative
- Creates risk of inconsistent dependency resolution

**Actions:**
1. Add `package-lock.json` to `.gitignore`
2. Remove `package-lock.json` from git tracking: `git rm --cached package-lock.json`
3. Add a comment in `.gitignore` noting why

### 3.2 Create `restore-exclusions.txt`

Create the missing exclusions file at `E:\AIP\restore-exclusions.txt`:

```
# AIP Restore Point Exclusions
# Files and patterns listed here are excluded from restore point backups.
# Lines starting with # are comments.

# Sensitive/secret files
.env
.env.*
*.key
*.token
*.pem

# Build artifacts
dist/
*.tsbuildinfo
.vite/

# Database files (will be restored separately via DB migration)
*.db
*.db-shm
*.db-wal
*.db.bak*

# OS artifacts
.DS_Store
Thumbs.db

# Large model weights
*.pt
*.pth
*.onnx
*.safetensors

# Archive/temp files
node_modules/
.pnpm-store/
__pycache__/
*.pyc

# Logs
*.log
logs/
_logs/

# Test output
coverage/
test-results/

# AIP internal directories
_AIP_BACKUPS/
_AIP_TEMP/
_TEMP/
_DELETE_CANDIDATES/
```

### 3.3 Fix `restore.mjs` Plan-Only Zip Extraction

**Current behavior (problematic):**
- Lines 53-57: Check `PLAN_ONLY` and print message
- Lines 64-72: Create temp dir, extract zip (happens regardless of PLAN_ONLY)
- Lines 81-86: If `dryRun`, print list then clean up and exit

**Problem:** Zip extraction (line 69) happens before the dry-run check on line 81. Even in plan-only mode, secrets inside the zip are extracted to temp dir.

**Fix:** Move plan-only early-exit BEFORE zip extraction:

```javascript
if (PLAN_ONLY) {
  console.log('\n⚠ Plan-only mode: no files will be modified.');
  console.log('  Pass --execute to perform a real restore (requires CONFIRM).');
  console.log('');
  // List what would be done by inspecting the zip without extracting
  console.log('Files in archive (would restore):');
  try {
    execSync('python -c "import zipfile; z=zipfile.ZipFile(r\'' + zipPath.replace(/'/g, "''") + '\'); [print(f\'  {f}\') for f in z.namelist()]"', {
      stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000,
    });
  } catch {
    console.log('  (could not list archive contents)');
  }
  console.log('\nDry run done.');
  process.exit(0);
}
```

This way, in plan-only mode:
- No temp directory is created
- No zip extraction occurs
- Only zip listing (readonly) occurs
- No file writes of any kind

The `dryRun` variable and its check on line 81 can then be consolidated — there's no need for separate `PLAN_ONLY` and `dryRun` paths.

## 4. Verification

```powershell
# Verify package-lock.json removed from git
git ls-files package-lock.json
# Should return nothing

# Verify restore.mjs plan-only safe
node scripts/restore.mjs some-backup.zip
# Output: Plan-only mode: no files will be modified.
# No temp directory created in %TEMP%

# Verify restore-exclusions.txt exists
Test-Path E:\AIP\restore-exclusions.txt
```

## 5. Safety

- No stage-c enablement
- No feature flag toggle
- No DB write
- No service restart
- No real restore execution
- No functional changes to restore.mjs live mode — only plan-only path made safer
