# OpenAIP v8 Safety Boundary Inventory

## Gate State

Gate: CLOSED.

## Stage C State

Stage C: disabled.

## No-Go Categories

The OpenAIP v8 Readonly MVP acceptance boundary blocks:

- deploy
- release/tag
- restore
- restart/taskkill/Stop-Process
- DB writes
- memory DB writes
- vector DB writes
- indexing jobs
- Auth/Gate mutation
- connector actions
- provider calls
- local app launches
- external API calls
- secrets, tokens, JWTs, or API keys exposure

## Key Safety Rules

- config != permission
- enabled != execution
- authorized != gateOpen
- gateOpen != stageCEnabled
- capability != permission
- UI switch != backend truth
- policy before buttons
- dry-run before execution
- audit before acceptance
- human authorization for high-risk actions

## Current Route Safety

- v8 pages are hidden/direct preview routes.
- v8 pages are not exposed in the sidebar according to the route smoke test.
- No execution buttons are allowed.
- No launch buttons are allowed.
- No config write buttons are allowed.
- Gate CLOSED and Stage C disabled must stay visible.
- Readonly status and no runtime mutation must stay visible.

## Known Pitfalls

- Stale runtime: built source and live browser can differ.
- False ON UI: a visual enabled state must not imply backend permission.
- Root/cwd bug: CLI commands must resolve the project root correctly.
- All-done without evidence: acceptance requires commands, route inventory, and safety proof.
- Overlarge task packs: broad scopes increase accidental mutation risk.
- User fatigue: receipts should be concrete and short enough to verify.

## Safety Grep Classification Rule

Safety-sensitive terms in this acceptance pack are expected to appear as readonly safety text, blocked/rule text, or docs-only inventory text. They must not introduce implementation risk, executable code, event handlers, API calls, config writers, or runtime mutation paths.
