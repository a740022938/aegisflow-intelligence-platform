# Stage C Human Owner Final Confirmation Policy

## Purpose

Define how human owner final confirmation is obtained and recorded.

## Process

1. **Pre-authorization checklist** — human owner reviews all blockers, evidence, and contracts
2. **Authorization text** — human owner fills the template from AIP_STAGE_C_HUMAN_AUTHORIZATION_TEXT_SPEC.md
3. **Authorization commit** — authorization text is committed as a reviewed artifact in a later task (NOT this task)
4. **Cooldown period** — 24h minimum between authorization text preparation and final confirmation
5. **Final confirmation** — human owner re-confirms after cooldown
6. **Authorization record** — committed authorization text serves as the permanent record

## Rules

- AI (Assistant) cannot prepare authorization text on behalf of human owner
- AI (Assistant) cannot sign authorization
- AI (Assistant) cannot confirm authorization
- Authorization must be committed as a separate reviewed artifact
- Single-action authorization is prohibited — requires two separate steps (text preparation + final confirmation)
- Authorization expires after 7 days
- Human owner can revoke at any time before Stage C enablement

## Roles

| Role | Can Prepare Text | Can Sign | Can Confirm | Can Enable Stage C |
|---|---|---|---|---|
| Human Owner | Yes | Yes | Yes | No (separate task) |
| Senior Human Owner | Yes | Yes | Yes | No (separate task) |
| Operator | No | No | No | No |
| Assistant (AI) | No | No | No | No |
