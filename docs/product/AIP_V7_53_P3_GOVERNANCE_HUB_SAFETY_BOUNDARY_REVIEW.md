# AIP v7.53-P3 GovernanceHub Safety Boundary Review

**Date:** 2026-05-21
**Baseline:** v7.53-P2 Workflow Complexity Split Plan (`ad04f2a`)
**Package:** v7.53-D0→P5 Engineering Total Pack

---

## 1. Overview

GovernanceHub (`GovernanceHub.tsx`, 991 lines) is the incident governance and operations hub
for the platform. It provides incident management, playbook execution, AI diagnostic collaboration,
system health monitoring, and operations analytics.

This review catalogs all operational actions and classifies them by safety boundary.

---

## 2. Action Inventory

### 2.1 Read-only Endpoints (GET, no state mutation)

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /api/incidents/summary` | Incident summary stats | Stats dashboard |
| `GET /api/incidents?limit=200` | Incident list | Filtered by status/severity/source |
| `GET /api/incidents/{id}` | Incident detail | Full incident + actions |
| `GET /api/governance/jobs/{id}/trace` | Workflow job trace | Read-only trace linkage |
| `GET /api/incidents/{id}/assistant-diagnostics?limit=20` | Assistant request history | Read-only diagnostic log |
| `GET /api/playbook-quality/overview` | Playbook quality metrics | Quality dashboard |
| `GET /api/governance/assistant-quality` | Assistant collaboration quality | Read-only aggregate |
| `GET /api/operations/overview?range=` | Operations aggregation | Read-only analytics |
| `GET /api/health` | API health check | Read-only status |
| `GET /api/openclaw/master-switch` | OpenClaw circuit state | Read-only status |
| `GET /api/db/ping` | Database connectivity | Read-only check |
| `GET /api/system/database/diagnostics` | Database worker diagnostics | Read-only diagnostics |

### 2.2 Mutation Actions — Requiring Explicit Human Authorization

These actions change incident state or trigger execution. They are invoked via POST endpoints
and require deliberate button click by a human operator.

| # | Callback | POST Endpoint | Action Types | Risk Level | Reason |
|---|---|---|---|---|---|
| M1 | `postAction('take_ownership')` | `POST /api/incidents/{id}/actions` | `take_ownership` | MEDIUM | Changes incident assignee and state |
| M2 | `postAction('mark_in_progress')` | `POST /api/incidents/{id}/actions` | `mark_in_progress` | MEDIUM | Transitions incident workflow state |
| M3 | `postAction('resolve')` | `POST /api/incidents/{id}/actions` | `resolve` | HIGH | Closes incident — no confirmation dialog |
| M4 | `postAction('ignore')` | `POST /api/incidents/{id}/actions` | `ignore` | HIGH | Dismisses incident — no confirmation dialog |
| M5 | `postAction('reopen')` | `POST /api/incidents/{id}/actions` | `reopen` | MEDIUM | Reopens resolved/ignored incident |
| M6 | `postPlaybookAction('playbook_start')` | `POST /api/incidents/{id}/playbook/actions` | `playbook_start` | HIGH | Starts automated playbook execution — no confirmation |
| M7 | `postPlaybookAction('playbook_step_complete')` | Same | `playbook_step_complete` | MEDIUM | Advances playbook state machine |
| M8 | `postPlaybookAction('playbook_complete')` | Same | `playbook_complete` | HIGH | Marks playbook as complete |
| M9 | `postPlaybookAction('playbook_abort')` | Same | `playbook_abort` | HIGH | Aborts running playbook — no confirmation |
| M10 | `submitAssistantManualDecision('confirm_request')` | `POST .../manual-confirmation` | `confirm_request` | HIGH | Confirms AI diagnostic — may trigger downstream actions |
| M11 | `submitAssistantManualDecision('reject_request')` | Same | `reject_request` | MEDIUM | Rejects AI diagnostic |
| M12 | `markAssistantAdoption('adopted')` | `POST .../adoption` | `adopted` | MEDIUM | Marks AI output as adopted |
| M13 | `markAssistantAdoption('rejected')` | Same | `rejected` | LOW | Marks AI output as rejected |
| M14 | `doSync('manual')` | `POST /api/incidents/sync` | manual trigger | LOW | Syncs incidents from source systems |
| M15 | `fetch('/api/openclaw/master-switch', POST)` | `POST /api/openclaw/master-switch` | `recover` | HIGH | Resets circuit breaker — system-level operation |

### 2.3 Mutation Actions — Informational / Low Risk

These POST actions record feedback or notes and do not change incident state.

| # | Callback | POST Endpoint | Action Types | Risk Level |
|---|---|---|---|---|
| F1 | `postAction('comment')` | `POST /api/incidents/{id}/actions` | `comment` | LOW |
| F2 | `postPlaybookAction('playbook_note')` | `POST /api/incidents/{id}/playbook/actions` | `playbook_note` | LOW |
| F3 | `postPlaybookFeedback('useful')` | `POST /api/incidents/{id}/playbook/feedback` | `useful` | LOW |
| F4 | `postPlaybookFeedback('useless')` | Same | `useless` | LOW |
| F5 | `postPlaybookFeedback('adopted')` | Same | `adopted` | LOW |
| F6 | `postPlaybookFeedback('needs_update')` | Same | `needs_update` | LOW |
| F7 | `requestAssistantDiagnostic()` | `POST .../assistant-diagnostics` | request | LOW (read-mostly) |

---

## 3. Actions Requiring Explicit Human Authorization

The following actions modify operational state or trigger execution paths and **must remain
unavailable in Local RC** and must require explicit human intent:

| Action | Why |
|---|---|
| `resolve` | Incident closure — irreversible state change |
| `ignore` | Incident dismissal — irreversible state change |
| `playbook_start` | Triggers automated execution |
| `playbook_complete` | Marks playbook done |
| `playbook_abort` | Stops running playbook |
| `openclaw recover` | Resets circuit breaker — system-level |
| `confirm_request` (assistant manual) | May authorize downstream execution |

---

## 4. Actions That Must Remain Unavailable in Local RC

In a Local RC deployment, the following must be blocked or require elevated authorization:

| Action | Reason |
|---|---|
| `resolve` / `ignore` | Incident lifecycle hooks may trigger external notifications |
| `playbook_start` / `playbook_abort` | Playbook execution may touch external systems |
| `openclaw recover` | Circuit breaker reset affects system-wide routing |
| `confirm_request` | AI diagnostic confirmation may enable auto-remediation |

---

## 5. No Confirmation Dialog — Safety Gap

The following HIGH risk actions have **no confirmation dialog** in the current UI:

- `resolve` (line 871)
- `ignore` (line 872)
- `playbook_start` (line 878)
- `playbook_abort` (line 882)
- OpenClaw recover (line 537)

These should be flagged for future UX improvement but are **not modified in P3**.

---

## 6. Auth/Actor Observations

- `operator` field at line 443 is a free-text `<input>` — no authentication validation in client
- No role-based access control (RBAC) checks visible in the client code
- All action buttons are visible if an incident is selected — no visibility gating by role
- `auto-sync` runs every 120 seconds via `setInterval` (lines 394-397)
- `doSync('governance_hub_open')` triggers on page load (line 393)

---

## 7. Safety Classification Summary

| Category | Count | Examples |
|---|---|---|
| Read-only (GET) | 12 | `GET /api/incidents`, `/health`, `/db/ping` |
| POST — explicit authorization required | 15 | `resolve`, `ignore`, `playbook_start`, `playbook_abort`, `confirm_request`, `recover` |
| POST — informational / low risk | 7 | `comment`, `playbook_note`, `playbook_feedback`, `request_assistant_diagnostic` |
| Auto-triggered mutations | 1 | `doSync` on page load + every 120s |

---

## 8. GovernanceHubReadonly Split Assessment

A future `GovernanceHubReadonly` split is **potentially feasible but not urgent**:

- The page is 991 lines — manageable for a split
- Read-only panels (System Health, Events Overview, Quality, Incidents list) could be extracted
- The mutation-heavy sections are: incident detail actions, playbook controls, assistant diagnostic actions
- **Recommendation**: If a read-only view is needed for non-operator roles, create `GovernanceHubReadonly` in a future phase (v7.54+)
- The split is **not required for P3** — the action boundary is already clear

---

## 9. Safety Boundaries

| Concern | Status |
|---|---|
| No source code modified in P3 | Confirmed |
| No governance actions added | Confirmed |
| No approval/execute buttons added | Confirmed |
| No Stage C enabled | Confirmed |
| No feature flag toggled | Confirmed |
| No DB write | Confirmed |
| No operational behavior change | Confirmed |
| No hidden previews exposed | Confirmed |
| Action inventory complete | Confirmed |
| Auth gaps documented (not fixed) | Confirmed — documented for future |
