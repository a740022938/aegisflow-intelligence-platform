# OPENAIP_V8_ANTI_REWORK_ARCHITECTURE

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

Anti-rework principles:
- Core light, external tools replaceable
- Contract-first
- Registry-first
- One source of truth
- Policy-before-buttons
- Preview/read-only first
- Screenshot gate for UI truth
- Audit receipt required
- No enabled=execution confusion
- No config=permission confusion

Architecture notes:
- Core orchestration and policy stay minimal.
- Tool-specific adapters remain replaceable modules.
- New centers must launch readonly first before execution capability.
