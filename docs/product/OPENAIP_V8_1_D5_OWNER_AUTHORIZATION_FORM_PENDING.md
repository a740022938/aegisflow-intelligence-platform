# OpenAIP v8.1 — Owner Authorization Form (PENDING)

*This form must be filled and signed by the human product owner before any tag, release, or deployment action is performed. This document is currently PENDING owner signature.*

---

## Authorization Record

| Field | Value |
|-------|-------|
| **Release** | OpenAIP v8.1 Readonly Control Plane |
| **Release version** | `v8.1.0` |
| **Git tag** | `v8.1.0` |
| **GitHub Release title** | `OpenAIP v8.1 Readonly Control Plane` |
| **Core baseline** | Core v7.62.0 |
| **D5 HEAD** | `29f6ca1` |
| **Authorized by (human owner)** | ⏳ _________________________ |
| **Date of authorization** | ⏳ _________________________ |

---

## Authorization Text

The human product owner must provide the following exact text (or equivalent unambiguous statement):

```text
I authorize OpenAIP v8.1.0 release.
Tag: v8.1.0
Release title: OpenAIP v8.1 Readonly Control Plane
Core baseline: v7.62.0

I authorize creating the git tag v8.1.0.
I authorize pushing the git tag to origin.
I authorize creating the GitHub Release for v8.1.0.

Gate remains CLOSED.
Stage C remains disabled.
Execution remains disabled.
No DB / Memory DB / Vector DB writes are authorized.
No indexing is authorized.
No provider / local-app / connector actions are authorized.
No restore is authorized.

I acknowledge the rollback/recovery plan.
I acknowledge that visual screenshots must be captured or explicitly waived before the actual release execution.
```

---

## Screenshot Gate Decision

| Item | Decision |
|------|----------|
| Visual screenshots (D2 gap) | ☐ Waived — I accept proceeding without browser screenshots |
| | ☐ Must capture before release execution |
| Owner initials | ⏳ _________________________ |

---

## Additional Directives

(Optional: any additional conditions or constraints from the product owner.)

```text
⏳ ________________________________________________________________
⏳ ________________________________________________________________
⏳ ________________________________________________________________
```

---

## Signature

```text
⏳ ________________________________________
    Human Product Owner

⏳ Date: _________________________
```

---

## Audit Trail

| Action | By | Date |
|--------|----|------|
| D5 authorization pack prepared | opencode pipeline | 2026-05-24 |
| Authorization form status | PENDING | 2026-05-24 |
| Authorization signed | (pending) | (pending) |
| D6 Release Execution Pack initiated | (pending) | (pending) |

---

*This document is currently PENDING owner signature. No tag, release, or runtime action is authorized until the human product owner signs this form. This is a planning artifact — do not forge signatures.*
