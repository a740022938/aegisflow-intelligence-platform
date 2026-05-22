# OPENAIP_V8_CENTERS_AND_KERNELS_FOUNDATION

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

## Purpose
This document pins the stable v8 foundation map so implementation can advance with low rework and low human fatigue.

## Required Centers
- Agent Center
- Task Center
- Provider Manager
- Policy Router
- Capability Center
- Integration Center
- Local Apps Center
- Memory Center
- Knowledge Center
- Runtime Gateway
- Audit Center
- Execution Gateway

## Required Kernels
- Identity Kernel
- Runtime Kernel
- Registry Kernel
- Policy Kernel
- Task Kernel
- Audit Kernel

## Contract Rules
- Core light, external tools replaceable
- Contract-first
- Registry-first
- One source of truth
- Policy-before-buttons
- Preview/read-only first
- Screenshot gate for UI truth
- Audit receipt required
- Config != permission
- Enabled != execution
- Authorized != gateOpen
- gateOpen != stageCEnabled
- Capability != permission
- UI switch != backend truth
- Stop on Critical
- Human fatigue reduction is a product requirement

## Safety Defaults
- Gate CLOSED by default
- Stage C disabled by default
- Execution Gateway default closed
- v7 stable baseline preserved
- v8 built through readonly-first controlled phases

## Mapping Notes
- OpenClaw: optional but first-class runtime/agent gateway integration
- OpenAxiom: Local App / UI Lab / Vision Tool, not provider main class
- Provider Manager: absorbs CC Switch-like provider/config/router strengths
- Audit/Receipt: mandatory evidence chain for every phase

## Phase Discipline
- Low-risk docs/readonly CLI batches can proceed autonomously.
- Any Gate/Stage C/Auth/security/DB/restart/release/restore request is stop-and-report.
