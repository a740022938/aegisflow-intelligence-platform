# OPENAIP_V8_V7_TO_V8_MIGRATION_STRATEGY

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

Migration strategy:
- Keep v7 stable baseline intact.
- Build v8 by controlled readonly slices.
- Promote only after contract tests + audit receipts.
- No forced runtime or DB migration in early phases.

Track:
- Phase 1: CLI identity and readonly command foundation
- Phase 2+: readonly centers then dry-run gateway
