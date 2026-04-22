# AGI Model Factory P4 Stage1 Archive Index

## 1. Scope
- Archive range: v6.0.0 to v6.4.0
- Purpose: make Stage1 artifacts recoverable, reviewable, and handover-ready.

## 2. Version Delivery Matrix

| Version | Core Scope | Core Docs | Audit | Rollback | Backup |
|---|---|---|---|---|---|
| v6.0.0 | Plugin foundation | `docs/plugin_architecture.md` | `audit/v6.0.0_closure_report.md` | `scripts/rollback_v600.cmd` | `E:\AGI_Factory\backups\AGI_Model_Factory_v6.0.0_plugin_architecture_base_20260413_092301.zip` |
| v6.1.0 | Knowledge center | `docs/knowledge_center_architecture.md`, `docs/knowledge_entry_spec.md`, `docs/v6.1.0_scope_lock.md` | `audit/v6.1.0_closure_report.md` | `scripts/rollback_v610.cmd` | `E:\AGI_Factory\backups\AGI_Model_Factory_v6.1.0_knowledge_center_20260413_014916.zip` |
| v6.2.0 | Standard outputs | `docs/output_template_spec.md`, `docs/report_template_spec.md`, `docs/v620_scope_lock.md` | `audit/v6.2.0_closure_report.md` | `scripts/rollback_v620.cmd` | `E:\AGI_Factory\backups\AGI_Model_Factory_v6.2.0_20260413_103700.zip` |
| v6.3.0 | Auto feedback v1 | `docs/feedback_loop_spec.md`, `docs/feedback_item_spec.md`, `docs/v6.3.0_scope_lock.md` | `audit/v6.3.0_closure_report.md` | `scripts/rollback_v630.cmd` | `backups/v6.3.0/AGI_Model_Factory_v6.3.0_feedback_loop_closure_20260413_180844.zip` |
| v6.4.0 | Cost routing v1 | `docs/versions/v6.4.0_cost_routing_v1.md` | `audit/v6.4.0_closure_report.md` | `scripts/rollback_v640.cmd` | `backups/v6.4.0_cost_routing_v1_20260413/AGI_Model_Factory_v6.4.0_cost_routing_v1_20260413.zip` |

## 3. Commit Baseline (Recent Chain)
- `25ae7b9` v6.0.0 plugin foundation
- `d8587b4` v6.1.0 knowledge center
- `a325a0d` v6.2.0 standard output
- `60ecaed` v6.3.0 feedback loop v1
- `97af9d7` v6.4.0 cost routing v1

## 4. Historical Debt Ledger (Explicitly Out of Seal Scope)
- Historical typecheck debt.
- Historical Workflow routes duplicated-route error.
- Workspace non-round leftovers:
  - `apps/web-ui/package.json` (modified)
  - `apps/local-api/packages/storage/releases/ed135f5b-b76d-497f-ad84-3f6bc78555e0/` (untracked)
  - `outputs/feedback_exports/` (untracked)

## 5. Seal Note
- This index is for archive and handover only.
- It does not change feature scope and does not include debt remediation actions.

