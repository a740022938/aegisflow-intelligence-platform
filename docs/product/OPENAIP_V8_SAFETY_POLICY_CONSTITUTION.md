# OPENAIP_V8_SAFETY_POLICY_CONSTITUTION

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

Safety baseline:
- Gate CLOSED by default
- Stage C disabled by default
- Policy-before-actions
- Readonly preview before mutating steps
- Audit/Receipt required for every promotion

Explicit separations:
- configured != online
- enabled != authorized
- authorized != gateOpen
- gateOpen != stageCEnabled
- capability != permission
- local app launch != execution permission
