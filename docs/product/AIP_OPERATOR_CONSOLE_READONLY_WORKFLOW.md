# AIP Operator Console Readonly Workflow

> **Date:** 2026-05-20
> **Phase:** v7.33.0-D1 (blueprint)

## Workflow

### Step 1: Open Console
- Operator opens the Operator Console at `/operator-console-registry-preview` (P1 hidden direct route)
- Console displays registry summary, validator result, and domain coverage
- Console loads readonly state from runtime GET endpoints (via linked preview routes)
- No authentication required for public runtime endpoints

### Step 2: View Seal Baseline
- Console displays current seal verdict
- Shows latest commit hash
- Shows productization seal chain

### Step 3: View Health / Readiness
- Console displays system health (from /api/health)
- Console displays runtime readiness (from /api/runtime/readiness)
- All fields are read-only, no mutation available

### Step 4: View Blockers
- Console displays blocker matrix (from /api/runtime/blockers)
- Each blocker shows severity and status
- No bypass mechanism

### Step 5: View Smoke Evidence
- Console displays latest smoke report link
- Shows smoke results summary
- Shows validation status

### Step 6: View Rollback / Recovery
- Console displays links to rollback and recovery guides
- Shows known safe commit
- Shows latest sealed commit

### Step 7: Decision Support
- Console generates a checklist based on current state
- Operator uses checklist to determine next action
- Console does NOT execute any action

## Workflow Constraints

| Constraint | Enforcement |
|------------|-------------|
| No mutation | All displays are read-only |
| No POST | No POST API calls from console |
| No executor | No runtime execution triggered |
| No DB write | No database mutations |
| No Stage C | Stage C remains disabled |
| No automatic action | All decisions are manual |

## Decision Matrix

| Current State | Recommended Action |
|---------------|-------------------|
| All gates pass, no blockers | Ready for next phase |
| Blockers present | Review blockers, resolve before proceeding |
| Smoke failed | Investigate, rerun smoke |
| Seal not ready | Complete current phase requirements |
| Stale server detected | Follow restart policy |
