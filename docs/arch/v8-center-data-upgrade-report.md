# OpenAIP v8 Multi-Center Pages — Registry Data Upgrade Report

**Date:** 2026-05-23
**Author:** AI Agent (v8 center data upgrade task pack)
**Release:** v8.0.0

## Summary

Upgraded 9 v8 center preview pages from static skeleton configs to
registry-backed readonly pages, created a shared data layer, added a
connector-to-v8 migration bridge, and aligned CLI readonly commands.

## Files Created

| File | Description |
|------|-------------|
| `apps/web-ui/src/registry/openAipv8CenterData.ts` | Shared static data layer with typed entries and summary functions for all 9 centers + connector migrations |

## Files Modified

| File | Change |
|------|--------|
| `apps/web-ui/src/pages/OpenAIPv8ReadonlyCenterPreview.tsx` | Added `registryTables` support (columns + rows) alongside existing sections |
| `apps/web-ui/src/pages/OpenAIPv8CommandCenterPreview.tsx` | Added registry-backed item counts strip, migration status strip |
| `apps/web-ui/src/pages/OpenAIPv8AgentCenterPreview.tsx` | Uses V8_AGENTS + getV8AgentCenterSummary from shared data |
| `apps/web-ui/src/pages/OpenAIPv8TaskCenterPreview.tsx` | Uses V8_TASKS + getV8TaskSummary from shared data |
| `apps/web-ui/src/pages/OpenAIPv8ProviderManagerPreview.tsx` | Uses V8_PROVIDERS + getV8ProviderSummary from shared data |
| `apps/web-ui/src/pages/OpenAIPv8IntegrationCenterPreview.tsx` | Uses V8_INTEGRATIONS + migration registry table |
| `apps/web-ui/src/pages/OpenAIPv8LocalAppsCenterPreview.tsx` | Uses V8_LOCAL_APPS + summary |
| `apps/web-ui/src/pages/OpenAIPv8MemoryKnowledgeCenterPreview.tsx` | Uses V8_MEMORY_KNOWLEDGE + summary |
| `apps/web-ui/src/pages/OpenAIPv8PolicyCapabilityCenterPreview.tsx` | Uses V8_POLICIES + V8_CAPABILITIES + dual tables |
| `apps/web-ui/src/pages/OpenAIPv8AuditCenterPreview.tsx` | Uses V8_AUDITS + audit table |
| `apps/web-ui/src/pages/OpenAIPv8ExecutionGatewayPreview.tsx` | Uses V8_POLICIES + gate state table |
| `apps/web-ui/src/pages/ConnectorCenter.tsx` | Added migration bridge banner + Link import |
| `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx` | Added migration bridge banner |
| `apps/aip-cli/src/commands/agents.ts` | Added registry count line |
| `apps/aip-cli/src/commands/providers.ts` | Added registry count line |
| `apps/aip-cli/src/commands/integrations.ts` | Added registry count line |
| `apps/aip-cli/src/commands/apps.ts` | Added registry count line |
| `apps/aip-cli/src/commands/runtime.ts` | Added total runtime entries count |
| `apps/aip-cli/src/commands/task.ts` | Added registry count line |
| `apps/aip-cli/src/commands/audit.ts` | Added registry count line |
| `apps/aip-cli/src/commands/policy.ts` | Added registry count line |
| `apps/aip-cli/src/commands/v8.ts` | Shows registry data layer status + migration bridge info |
| `apps/aip-cli/tests/project-root-and-stubs.test.mjs` | 6 new test cases for registry data, migration bridge, counts |

## Registry Data Layer

The shared file `openAipv8CenterData.ts` contains:

- **10 typed registries**: V8_AGENTS, V8_PROVIDERS, V8_INTEGRATIONS, V8_LOCAL_APPS, V8_CAPABILITIES, V8_POLICIES, V8_TASKS, V8_AUDITS, V8_MEMORY_KNOWLEDGE, V8_CONNECTOR_MIGRATIONS
- **Named summary functions**: getV8AgentCenterSummary, getV8ProviderSummary, getV8IntegrationSummary, getV8LocalAppSummary, getV8CapabilitySummary, getV8PolicySummary, getV8TaskSummary, getV8AuditSummary, getV8MemoryKnowledgeSummary, getV8ConnectorMigrationSummary, getV8RegistryCounts
- **Total entries**: 66 (across all registries)

## Connector → v8 Migration Bridge

7 migration entries defined:

| Legacy Connector | v8 Center | Status |
|-----------------|-----------|--------|
| OpenAxiom | Local Apps Center | migrated |
| Memory Hub | Memory + Knowledge Center | migrated |
| Lab Center | Local Apps Center | migrated |
| Assistant Center | Agent Center | planned |
| Governance Hub | Policy Router + Capability Center | planned |
| Connector Center | Integration Center | in_progress |
| Model Gateway | Provider Manager | planned |

## Verification

- `aip-cli` build: passed
- `web-ui` TypeScript typecheck: passed (0 errors)
- `web-ui` vite build: passed
- CLI tests: **15/15 passed** (including 6 new registry/migration tests)

## Safety

All changes are readonly metadata. No runtime mutation, no DB write, no Gate
opening, no Stage C enablement.
