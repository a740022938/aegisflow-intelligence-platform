# AIP v7.45 — Restore Point Exclusions

**Status:** P2 Policy
**Date:** 2026-05-20

---

## Files and Directories to Exclude

```text
# Environment
.env
.env.*

# Secrets
*.key
*.pem
*.token
credentials.json
secrets.json

# Dependencies
node_modules/
.pnp/
.pnp.js

# Build output
dist/
build/
.cache/
out/

# Logs
logs/
*.log
npm-debug.log*

# Database
*.db
*.sqlite
*.sqlite3

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# Temp
tmp/
temp/
```

## Policy

- Exclusions are defined in `restore-exclusions.txt`
- Exclusions are applied when generating manifest
- Excluded files are NOT captured in restore point
- Excluded files are NOT restored during recovery
- The exclusion list itself is included in the restore point
