# OPENAIP_V8_AGENT_PROVIDER_INTEGRATION_TAXONOMY

Classification matrix defines how components map into control-plane registries.

Primary classes:
- agent: orchestration actors
- provider: model or inference backends
- integration: external systems/webhooks
- local_app: local UI/runtime tools

Cross-cutting metadata:
- ownership
- policy profile
- capability manifest
- permission ceiling
- audit requirements

OpenClaw is optional but first-class in runtime_service + integration taxonomy.
OpenAxiom is local_app first, not provider main class.
