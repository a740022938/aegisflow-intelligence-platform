# AIP v7.45 — Restore Point Hash Policy

**Status:** P2 Policy
**Date:** 2026-05-20

---

## Algorithm

SHA256 is used for all restore point hashing.

## Hash File Format

```
<hash> *<relative-path>
```

Example:
```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 *package.json
```

## Verification

Before any restore operation:

1. Generate SHA256 for each file in the restore target
2. Compare against `source-sha256.txt` from the restore point
3. All hashes must match
4. If any hash mismatches, restore is BLOCKED
5. Operator must investigate the mismatch before retrying

## Integrity

- SHA256 provides collision resistance
- Binary mode (`*` prefix) ensures consistent hashing across platforms
- Hash file is included in the restore point
- Hash file itself is not hashed (chicken-and-egg avoided)
