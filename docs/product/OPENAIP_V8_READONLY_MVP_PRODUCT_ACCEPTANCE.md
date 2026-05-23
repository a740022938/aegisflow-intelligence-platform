# OpenAIP v8 Readonly MVP Product Acceptance

## Product Name

OpenAIP v8 Readonly Agent Control Plane MVP

## Product Principle

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

## What This MVP Is

OpenAIP v8 Readonly MVP is a readonly command center and first sealed Agent Control Plane skeleton. It organizes governance around agents, tasks, providers, integrations, local apps, memory and knowledge, policy and capability, audit evidence, and execution boundaries.

Current product shape:

- Readonly command center with hidden direct preview routes.
- Nine-center governance skeleton plus Execution Gateway boundary page.
- CLI readonly support for v8 route/status and center inventories.
- Registry-backed static/example data surface.
- Safety-first route surface with Gate CLOSED and Stage C disabled.

## What This MVP Is Not

This MVP is not:

- an executor
- a Gate opener
- Stage C
- an agent launcher
- a provider switcher that writes config
- a DB, memory DB, or vector DB writer
- an indexing job runner
- a release, tag, restore, or deploy system

## Target Users And Use Cases

- Human owner: inspect the whole AI control plane without triggering execution.
- Engineering agent supervision: see agent roles, limits, and future handoff surfaces.
- AI tool governance: classify providers, integrations, local apps, and execution boundaries.
- Local AI workflow planning: prepare future orchestration while keeping runtime mutation blocked.
- Task, receipt, and audit discipline: keep acceptance evidence tied to routes, CLI commands, and safety boundaries.
- Future execution governance planning: define policy-before-buttons and dry-run-before-execution sequencing before any live runner exists.

## Current Product Maturity

- Maturity: Readonly MVP.
- Route exposure: hidden/direct preview routes.
- Gate: CLOSED.
- Stage C: disabled.
- Runtime posture: safety-first, no execution controls.
- Sidebar posture: v8 pages remain hidden from sidebar unless separately approved and verified.

## Acceptance Verdict

Target verdict for this product acceptance pack after verification:

`OPENAIP_V8_READONLY_MVP_PRODUCT_ACCEPTANCE_PACK_READY_WITH_GATE_CLOSED`

Evidence status:

- Baseline final seal verdict: `OPENAIP_V8_NINE_CENTER_READONLY_MVP_FINAL_SEAL_PASS_WITH_GATE_CLOSED`.
- Baseline final seal HEAD: `5b631fa`.
- This pack consolidates acceptance, inventory, safety, validation, visual checklist, and next-roadmap documents.
- This pack does not add product features or mutate runtime behavior.
- Lifecycle contract blocker resolved: `planned` is accepted as a valid v8 agent lifecycle because it is used by the Web v8 registry, Agent Center UI, CLI agents summary, and route smoke expectations.
