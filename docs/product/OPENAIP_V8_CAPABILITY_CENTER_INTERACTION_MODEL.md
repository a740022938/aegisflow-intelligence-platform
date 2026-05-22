# OPENAIP_V8_CAPABILITY_CENTER_INTERACTION_MODEL

- capability != permission
- capability can be visible but blocked
- capability status must include readonly block reason
- capability events must be auditable

Examples:
- runtime.status.read (visible, allowed at L1)
- runtime.execute (visible, blocked unless Gate + Stage C + L5)
