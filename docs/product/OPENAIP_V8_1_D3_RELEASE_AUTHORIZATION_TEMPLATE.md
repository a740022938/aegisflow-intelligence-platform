# OpenAIP v8.1 — Release Authorization Template

*This template must be filled and acknowledged by the human product owner before any tag, release, or deployment action is performed.*

---

## Authorization Record

| Field | Value |
|-------|-------|
| **Release** | OpenAIP v8.1 Readonly Control Plane |
| **Release version** | `v8.1.0` |
| **Git tag** | `v8.1.0` |
| **GitHub Release title** | `OpenAIP v8.1 Readonly Control Plane` |
| **Core baseline** | Core v7.62.0 |
| **Authorized by (human owner)** | _________________________ |
| **Date of authorization** | _________________________ |

---

## Scope of Authorization

| Action | Authorized? | Notes |
|--------|-------------|-------|
| Create Git tag `v8.1.0` | ☐ Yes / ☐ No | |
| Push tag to `origin` | ☐ Yes / ☐ No | |
| Create GitHub Release with release notes | ☐ Yes / ☐ No | |
| Open Gate | ☐ Yes / ☐ No | Must remain CLOSED unless explicitly authorized below |
| Enable Stage C | ☐ Yes / ☐ No | Must remain disabled unless explicitly authorized below |
| Enable execution | ☐ Yes / ☐ No | Must remain disabled unless explicitly authorized below |

---

## Safety Confirmation

| Statement | Confirmed? |
|-----------|-----------|
| I confirm Gate will remain CLOSED after release | ☐ Yes / ☐ No |
| I confirm Stage C will remain disabled after release | ☐ Yes / ☐ No |
| I confirm execution will remain disabled after release | ☐ Yes / ☐ No |
| I confirm no DB/memory/indexing changes are expected | ☐ Yes / ☐ No |
| I confirm the rollback plan has been reviewed | ☐ Yes / ☐ No |
| I understand this release is a readonly control-plane shell, not an execution-enabled deployment | ☐ Yes / ☐ No |

---

## Visual Acceptance Waiver

| Item | Decision |
|------|----------|
| D2 screenshot gap (no GUI browser screenshots captured) | ☐ Waived / ☐ Must be re-run before release |
| If waived, owner initials | _________________________ |

---

## Checklist Verification

All items in the Release Gate Checklist (see `OPENAIP_V8_1_D3_RELEASE_GATE_CHECKLIST.md`) have been reviewed and confirmed:

☐ Source / Git Gate — PASS all
☐ Validation Gate — PASS all
☐ Visual Gate — PASS or WAIVED all
☐ Product Gate — PASS all
☐ Safety Gate — PASS all
☐ Authorization Gate — PASS all

---

## Signature

```
________________________________________
Human Product Owner

Date: _________________________
```

---

*This template is a planning artifact. It does not constitute an actual authorization until signed by the human product owner.*
