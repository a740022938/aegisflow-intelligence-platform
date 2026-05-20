# AIP v7.49 — Release Authorization Template

**Date:** 2026-05-20
**Phase:** P4
**Baseline HEAD:** `8296250`

---

## Instructions

This template MUST be filled out by the human owner and stored in `docs/product/` BEFORE a git tag or GitHub Release is created. The receipt reference must be included in the release description.

---

## Release Authorization

I, **[NAME]**, authorize the creation of the AIP **[VERSION]** GitHub Release.

| Field | Value |
|-------|-------|
| **Date** | |
| **Version** | |
| **Tag** | |
| **Authorized by** | |
| **Authorization type** | `[written / verbal]` |
| **Receipt reference** | |
| **Stage C enabled?** | `NO` (separate authorization required) |

## Conditions

By signing this authorization, I confirm:

1. The tag/release gate (`AIP_V7_49_TAG_RELEASE_GATE.md`) has been reviewed
2. All 9 gate conditions are satisfied
3. Release notes draft has been reviewed and approved
4. No real secrets are committed in tracked files
5. Stage C remains DISABLED
6. This authorization is for a one-time release only

## Signature

```
________________________________________
[NAME]
[Date]
```

---

## Example (Filled)

| Field | Example Value |
|-------|---------------|
| Date | 2026-05-25 |
| Version | v7.49.0 |
| Tag | v7.49.0 |
| Authorized by | Alice (Owner) |
| Authorization type | written |
| Receipt reference | docs/product/AIP_V7_49_RECEIPT_v7.49.0.md |
| Stage C enabled? | NO |

---

## Related Documents

- `AIP_V7_49_TAG_RELEASE_GATE.md` — gate conditions
- `AIP_V7_49_RELEASE_NOTES_DRAFT.md` — draft notes
- `AIP_V7_49_RELEASE_NO_GO_MATRIX.md` — no-go conditions
- `AIP_V7_49_LOCAL_RC_TO_RELEASE_CHECKLIST.md` — transition checklist
