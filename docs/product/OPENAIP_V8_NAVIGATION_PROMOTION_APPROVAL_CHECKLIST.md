# OpenAIP v8 Navigation Promotion Approval Checklist

Date: 2026-05-23

Use this checklist before any future task promotes a v8 hidden/direct route into visible sidebar navigation.

## Hard Preconditions

- [ ] Promotion task is explicitly authorized by a human owner.
- [ ] Exact route or routes to promote are named.
- [ ] Route paths will not be renamed.
- [ ] Legacy Connector Center will not be deleted unless separately approved.
- [ ] No Auth/Gate implementation changes are included.
- [ ] No DB writes, migrations, memory writes, vector writes, or indexing jobs are included.
- [ ] No runtime restart/stop/taskkill/Stop-Process is included unless separately authorized.
- [ ] No release, tag, restore, or deploy step is included.

## Visual Acceptance

- [ ] Live browser visual smoke PASS for every route being promoted.
- [ ] Screenshot evidence reviewed.
- [ ] First viewport shows a clear page title.
- [ ] First viewport shows readonly/preview status.
- [ ] Gate CLOSED text is visible where relevant.
- [ ] Stage C disabled text is visible where relevant.
- [ ] No blank screen, rendering crash, broken layout, or misleading empty state.
- [ ] Chinese/English naming is clear enough for normal users.
- [ ] Old/new naming is clear, especially around Legacy Connector Center.

## No-Action UI Check

- [ ] No Execute button.
- [ ] No Launch button.
- [ ] No Start/Stop/Restart button.
- [ ] No Enable Gate button.
- [ ] No Enable Stage C button.
- [ ] No Open master-switch button.
- [ ] No Write config button.
- [ ] No Run connector button.
- [ ] No Call provider button.
- [ ] No Call API button.
- [ ] No Release button.
- [ ] No Restore button.
- [ ] No Write memory button.
- [ ] No Run indexing button.
- [ ] Any risky words appear only as blocked/safety text, not as actionable controls.

## Route And Source Verification

- [ ] Route/source smoke PASS.
- [ ] `git diff --check` PASS.
- [ ] `npm run typecheck` PASS.
- [ ] `npm run lint` PASS.
- [ ] `npm run build` PASS.
- [ ] `npm test --silent` PASS if API 8787 is already available or startup is explicitly authorized.
- [ ] Source grep confirms no unapproved v8 routes were exposed.
- [ ] Sidebar/menu registry diff contains only the approved route or routes.

## Product Approval

- [ ] The route has an approved sidebar group.
- [ ] The route has an approved visible label.
- [ ] The route has a concise tooltip or supporting copy if the label may imply execution.
- [ ] The route does not duplicate or confuse an existing v7 entry.
- [ ] Legacy Connector Center coexistence copy remains correct.
- [ ] Human owner approval is recorded.

## Rollback

- [ ] Rollback plan removes only the new sidebar entry or entries.
- [ ] Rollback does not delete the hidden route.
- [ ] Rollback does not touch Auth/Gate/DB/runtime.
- [ ] Rollback verification includes route/source smoke, typecheck, lint, build, and sidebar source grep.

## Recommended Approval Outcome Values

- `APPROVED_PROMOTE_COMMAND_CENTER_ONLY`
- `APPROVED_PROMOTE_SECOND_WAVE_AFTER_COPY_POLISH`
- `APPROVED_KEEP_HIDDEN_DIRECT`
- `REJECTED_WITH_SAFETY_FINDINGS`
- `REJECTED_PENDING_VISUAL_SMOKE`
