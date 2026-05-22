# OPENAIP_V8_REGISTRY_AND_CONFIG_CONTRACT

Registry entity types:
- agent
- provider
- local_app
- workflow_engine
- memory_provider
- knowledge_provider
- code_host
- runtime_service
- internal_plugin
- unknown

Lifecycle states:
- registered
- enabled
- paused
- disabled
- quarantined

Permission levels:
- L0 Registered
- L1 Read-only
- L2 Suggest
- L3 Draft
- L4 Apply with approval
- L5 Gated execution

Field separation contracts:
- configured != online
- enabled != authorized
- authorized != gateOpen
- gateOpen != stageCEnabled
- capability != permission
- local app launch != execution permission
