# AIP Local Model Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an additive AIP-managed local model gateway path for Claude, DeepSeek, and Ollama E4B without disturbing the existing Claude proxy on `127.0.0.1:15721`.

**Architecture:** Keep the current Claude proxy intact and add a sidecar gateway on `127.0.0.1:15722`. AIP exposes authenticated read-only status APIs and a console page that show gateway, Claude proxy, Ollama, DeepSeek-key readiness, and route policy state.

**Formalization update (v7.64):** this plan is historical implementation context. The hardened path is: no public detailed status endpoint, no raw process command lines, sidebar hidden by default behind `VITE_AIP_MODELGATEWAY_NAV_VISIBLE=1`, and no start/stop/restart/provider-switching behavior in the first shipped slice.

**Tech Stack:** Node.js HTTP sidecar, Fastify local-api route, React/Vite console page.

---

### Task 1: Sidecar Gateway

**Files:**
- Create: `E:\_AIP_TOOLS\aip-model-gateway\gateway.js`
- Create: `E:\_AIP_TOOLS\aip-model-gateway\StartAipModelGateway.bat`

- [ ] Add an Anthropic-compatible `/v1/models`, `/health`, `/v1/messages/count_tokens`, and `/v1/messages` server on port `15722`.
- [ ] Route `ollama-gemma4-e4b` to `http://127.0.0.1:11434/api/chat`.
- [ ] Route Claude-like models to DeepSeek only when `DEEPSEEK_API_KEY` is present in the environment.
- [ ] Verify `/health`, `/v1/models`, non-streaming Ollama messages, and count-tokens.

### Task 2: AIP Readonly API

**Files:**
- Create: `E:\AIP\apps\local-api\src\model-gateway\index.ts`
- Modify: `E:\AIP\apps\local-api\src\index.ts`

- [ ] Add `GET /api/model-gateway/status`.
- [ ] Probe `15721`, `15722`, and `11434` without stopping or starting services.
- [x] Return redacted readiness data only; never expose API keys or raw process command lines.
- [x] Keep the detailed status endpoint authenticated; do not add it to the public read-only path allowlist.

### Task 3: AIP Console Page

**Files:**
- Create: `E:\AIP\apps\web-ui\src\pages\ModelGateway.tsx`
- Create: `E:\AIP\apps\web-ui\src\pages\ModelGateway.css`
- Modify: `E:\AIP\apps\web-ui\src\App.tsx`
- Modify: `E:\AIP\apps\web-ui\src\components\Layout.tsx`

- [ ] Add `/model-gateway` route.
- [x] Add sidebar entry under model/release, hidden by default behind `VITE_AIP_MODELGATEWAY_NAV_VISIBLE=1`.
- [ ] Display status cards, route table, and safety notes.
- [ ] Keep the page read-only.

### Task 4: Validation

**Commands:**
- Sidecar startup and live sidecar probes require a separate explicit authorization.
- `Invoke-RestMethod http://127.0.0.1:15722/health` only when that sidecar is already running or explicitly authorized.
- `Invoke-RestMethod http://127.0.0.1:15722/v1/models` only when that sidecar is already running or explicitly authorized.
- `npm --prefix apps/local-api run typecheck`
- `npm --prefix apps/web-ui run typecheck`
- `npm run build`

Expected for the safe first slice: AIP typecheck/build/test pass; status API remains read-only and authenticated; sidecar health/model probes degrade cleanly when the sidecar is offline.
