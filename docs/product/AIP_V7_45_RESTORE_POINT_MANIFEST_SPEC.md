# AIP v7.45 — Restore Point Manifest Spec

**Status:** P2 Spec
**Date:** 2026-05-20

---

## Manifest File: `source-manifest.json`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | AIP version (e.g., v7.45) |
| `commit` | string | Yes | Git commit hash |
| `date` | string | Yes | ISO date (YYYY-MM-DD) |
| `files` | array | Yes | Array of file entries |
| `excluded` | array | Yes | Array of excluded patterns |
| `totalFiles` | number | Yes | Total file count |
| `totalSize` | number | Yes | Total size in bytes |

### File Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | Relative path from repo root |
| `sha256` | string | Yes | SHA256 hex digest |
| `size` | number | Yes | File size in bytes |

### Example

```json
{
  "version": "v7.45",
  "commit": "a91eceb",
  "date": "2026-05-20",
  "files": [
    {"path": "package.json", "sha256": "abc123...", "size": 2048}
  ],
  "excluded": ["node_modules/", ".env", "dist/"],
  "totalFiles": 1,
  "totalSize": 2048
}
```

## Checksum File: `source-sha256.txt`

Format: SHA256 digest per line, one per file:

```
abc123... *path/to/file.ts
def456... *path/to/other.ts
```

Uses `*` prefix (binary mode) for consistent hashing.
