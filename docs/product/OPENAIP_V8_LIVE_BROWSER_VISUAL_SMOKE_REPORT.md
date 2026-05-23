# OpenAIP v8 Live Browser Visual Smoke Report

Date: 2026-05-23

Final verdict: OPENAIP_V8_LIVE_BROWSER_VISUAL_SMOKE_PASS_WITH_GATE_CLOSED

## Scope

This report records a controlled live browser visual smoke for the Legacy Connector Center wording cleanup and linked OpenAIP v8 hidden direct preview routes. No product logic, source behavior, Auth/Gate implementation, connector logic, route path, sidebar exposure, execution control, launch control, config-write control, deployment, release, tag, restore, DB migration, indexing job, connector action, provider call, external API call, or Stage C/Gate state was changed.

The Codex Browser plugin could not be used because the current session did not expose the required Node REPL execution tool. The live browser pass was performed with the repository-local Playwright package and the installed local Chrome executable. Browser routing aborted non-local requests; checked pages were opened only under `http://127.0.0.1:5173`.

## Baseline

- Branch: main
- Baseline HEAD: 00bb035
- Baseline commit: docs(product): record legacy connector visual smoke
- Working tree before this report: clean
- Latest accepted source-level visual smoke commit before this task: 00bb035

## Runtime Before And After

Before startup:
- `aip status`: API/Web pid files existed, but API port 8787 and Web port 5173 were free; health offline; DB unknown.
- `aip health`: API offline.
- `Get-NetTCPConnection` found no listening sockets on 5173 or 8787.

Authorized startup:
- Standard `aip start` was used because 5173/8787 were unavailable and the task explicitly allowed it.
- No restart command was used.
- No taskkill or Stop-Process was used.
- No process was stopped or killed.

After startup:
- `aip start`: API online at `http://127.0.0.1:8787`, Web online at `http://127.0.0.1:5173`, DB ok, version 7.62.0.
- `aip status`: Health online, DB ok, API/Web ports in use.
- `aip health`: healthy, DB ok, version 7.62.0.
- `/api/health`: `ok: true`, `service: local-api`, version 7.62.0.

Runtime changed: yes, due only to authorized standard `aip start`.

## Live Routes Checked

Base URL: `http://127.0.0.1:5173`

| Route | HTTP | Visual result | Screenshot |
| --- | ---: | --- | --- |
| `/connector-center-readonly` | 200 | PASS: page rendered, title/version strip visible, legacy migration panel visible, sidebar legacy label visible, no blank screen | `docs/product/screenshots/connector-center-readonly.png` |
| `/openaip-v8-integration-center-preview` | 200 | PASS: title visible, Integration Matrix visible, Provider/Center and legacy connector migration content visible | `docs/product/screenshots/openaip-v8-integration-center-preview.png` |
| `/openaip-v8-local-apps-center-preview` | 200 | PASS: title visible, OpenAxiom positioning visible, Local Apps matrix and no-launch safety text visible | `docs/product/screenshots/openaip-v8-local-apps-center-preview.png` |
| `/openaip-v8-provider-manager-preview` | 200 | PASS: title visible, Provider Profile Matrix, CC Switch-like wording, secret safety, and no-provider-switching text visible | `docs/product/screenshots/openaip-v8-provider-manager-preview.png` |
| `/openaip-v8-command-center-preview` | 200 | PASS: title visible, links to nine centers visible, Readonly/Gate/Stage C status visible, no execution controls | `docs/product/screenshots/openaip-v8-command-center-preview.png` |

Structured browser evidence:
- `docs/product/screenshots/live-browser-visual-smoke-results.json`

## Legacy Connector Center Visual Acceptance

PASS: sidebar shows the legacy marker.

Evidence:
- Live `/connector-center-readonly` screenshot shows sidebar entry `连接器中心（旧）`.

PASS: page title and version label make the surface legacy/readonly.

Evidence:
- Live page shows `Legacy Connector Center`.
- Live page shows `Legacy v7 Readonly View`.
- Live page safety strip shows `Readonly · No external writes · No connector control · No API calls`.

PASS: migration note is visible and clear.

Evidence:
- Live migration bridge states that the legacy Connector Center is a v7 readonly view.
- Live copy says OpenAIP v8 consolidates external tools under Integration Center, Local Apps Center, and Provider Manager.

PASS: safe internal migration links are visible.

Confirmed live links:
- `/openaip-v8-integration-center-preview`
- `/openaip-v8-local-apps-center-preview`
- `/openaip-v8-provider-manager-preview`
- `/openaip-v8-command-center-preview`

PASS: no action UI was present on the Legacy Connector Center.

Evidence:
- Live control scan found zero risky visible controls on `/connector-center-readonly`.

## Linked v8 Route Visual Acceptance

PASS: Integration Center loaded and showed Integration Matrix, Provider/Center handshake matrix, Legacy Connector migration content, and no connector action/external-call controls.

PASS: Local Apps Center loaded and showed OpenAxiom positioning, Local Apps matrix, and no local app launch/local API call controls.

PASS: Provider Manager loaded and showed Provider Profile Matrix, CC Switch-like strengths, secret safety, and no provider switching/model-call controls.

PASS: Command Center loaded and showed nine center links plus Readonly/Gate CLOSED/Stage C disabled status. The live scan saw two text matches containing `No agent launch` and `No app launch`; both are readonly safety text inside center navigation cards, not execution buttons.

## Sidebar Exposure Result

PASS: v8 hidden preview routes were not exposed in the visible sidebar.

Evidence:
- Live screenshots show the normal sidebar with the old visible legacy Connector Center entry only.
- Source route smoke confirmed `no v8 routes are exposed in sidebar Layout.tsx`.
- Visible v8 links found by the browser scan were page body navigation links on hidden direct preview pages, not sidebar entries.

## No-Action UI Result

PASS: no actionable controls were found for Execute, Launch, Start, Stop, Restart, Enable Gate, Enable Stage C, Open master-switch, Write config, Run connector, Call provider, Call API, Release, Restore, Write memory, or Run indexing.

Words such as `launch`, `Gate`, `Stage C`, `release`, `restore`, `DB write`, and `external call` appeared only as readonly safety text, blocked-boundary copy, source-test assertions, or report text.

## Verification Results

- `git diff --check`: PASS
- `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`: PASS, 99/99 assertions
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS, with existing Vite chunk-size warning only
- `npm test --silent`: PASS, 9/9 smoke tests
- `aip status`: PASS, Health online, DB ok, API/Web ports in use
- `aip health`: PASS, healthy, DB ok, version 7.62.0

## Safety Grep Result

Safety grep was run against the new report/receipt/screenshot JSON and relevant legacy/v8 source files. Hits were classified as:

- readonly safety text
- legacy wording
- safe internal links
- docs/tests only
- existing safe implementation text
- report/receipt safety declarations

No risky behavior was introduced.

## Recommended Next Step

Keep v8 center pages hidden/direct until a separate human-approved navigation promotion task decides which routes should enter the sidebar. No product or runtime follow-up is required for this smoke pass.
