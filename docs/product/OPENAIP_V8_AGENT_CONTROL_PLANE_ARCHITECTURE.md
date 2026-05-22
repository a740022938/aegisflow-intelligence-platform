# OPENAIP_V8_AGENT_CONTROL_PLANE_ARCHITECTURE

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

OpenAIP v8 control plane layers:
1. Identity Kernel
2. Registry Kernel
3. Policy Center
4. Agent Center
5. Task Center
6. Provider Manager
7. Integration Center
8. Local Apps Center
9. Audit/Receipt Center

Key mappings:
- Agent Center: primary execution abstraction (readonly first)
- Task Center: human workload reduction and orchestration queues
- Provider Manager: model routing, health, and policy constraints
- OpenClaw: optional first-class gateway
- OpenAxiom: local app surface and vision toolkit
