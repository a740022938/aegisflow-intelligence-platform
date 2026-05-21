# AIP v7.55 Release Authorization Template

**Date:** 2026-05-21
**Phase:** P4
**Status:** Template only — no authorization has been filed

---

## 1. Purpose

This template defines the **human-owner authorization** required before any
AIP/OpenAIP v7.55 release gate execution. It must be filed, signed (or
equivalent consented), and stored in `docs/product/` before any tag or
GitHub Release is created.

---

## 2. Authorization Statement

```
I, [OWNER NAME], authorize AIP/OpenAIP v7.55 release gate execution.

Current HEAD: [commit hash to tag]
Proposed tag: v7.55.0-stable (or v7.55.0-rcN as applicable)

Allowed actions:
- create tag: [exact tag, e.g. v7.55.0-stable]                                  [yes/no]
- create GitHub Release: [yes/no]
- attach release notes: [yes/no]
- run restore verification: [yes/no]
- run tests requiring API/service start: [yes/no]

Forbidden unless separately authorized:
- Stage C enable
- DB write (beyond existing migration endpoints)
- production external control
- destructive restore (overwrite existing files)
- secret rotation by assistant

Authorization date: [YYYY-MM-DD]
Owner signature/consent: [manual consent record]
```

---

## 3. Safety Invariants (Do Not Modify)

The following remain disabled regardless of release authorization:

- Stage C
- Feature flag
- Automated restore without approval
- Sidebar/hidden preview exposure without separate authorization

---

## 4. Post-Authorization Checklist

After authorization is filed:

1. Owner verifies the tag command matches the authorized tag
2. `git tag -a <authorized-tag> -m "AIP v7.55 <description>"`
3. `git push origin <authorized-tag>`
4. `gh release create <authorized-tag> --title "AIP v7.55" --notes-file <release-notes>`
5. File release receipt to `docs/product/` and `E:\_AIP_RECEIPTS\`

---

## 5. Current Status

**No authorization has been filed.** This template is a prerequisite document,
not an authorization record.
