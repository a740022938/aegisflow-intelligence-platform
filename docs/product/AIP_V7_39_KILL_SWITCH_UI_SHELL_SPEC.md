# Stage C Kill Switch UI Shell Spec (v7.39)

**Status:** Readonly shell
**Kill Switch:** `emergency_stage_c_disable`
**Default:** not_triggered
**Executable from UI:** false

## UI Behavior

- Kill switch displayed as inactive toggle
- No click handler or onChange mutation
- State shown from status API: not_triggered
- Cannot execute kill switch from this UI

## Safety

- No POST endpoint for kill switch
- No DB write on kill switch activation
- Kill switch execution requires separate implementation
- First slice only shows readiness preview
