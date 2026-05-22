# OPENAIP_V8_POLICY_ROUTER_INTERACTION_MODEL

Task risk: low / medium / high / critical.
Capability risk: low / medium / high / critical.

Rules:
- dry-run-first
- permission levels L0-L5 gate what can be proposed/applied
- human approval boundary at L4+
- Gate boundary: execution blocked when gateOpen=false
- Stage C boundary: no Stage C actions when stageCEnabled=false
