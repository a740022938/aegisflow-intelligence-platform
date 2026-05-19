# Stage C Feature Flag Contract

> **Phase:** v7.36.0-D2
> **Status:** FROZEN

## Terms
1. Feature flag must default to OFF
2. Feature flag cannot be toggled from any hidden preview page
3. Feature flag cannot be changed by AI assistant automatically
4. Feature flag must be stored and verified server-side
5. Feature flag must not control route visibility (separate from UI)
6. Feature flag toggle must create audit event

## Enforcement
- All terms are registered in safety harness contract registry
- Feature flag category exists with 5 items
- All terms are status=required

**This is a contract only. No feature flag code is implemented.**
