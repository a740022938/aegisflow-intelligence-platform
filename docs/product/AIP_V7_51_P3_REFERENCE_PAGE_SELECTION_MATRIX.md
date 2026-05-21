# AIP V7.51-P3 — Reference Page Selection Matrix

- **Version:** AIP V7.51
- **Status:** Decision record for page migration sequencing

---

## Matrix

| Criterion | ConnectorCenter Readonly | AssistantCenter | FactoryStatus | Dashboard | CostRouting | PluginPool |
|---|---|---|---|---|---|---|
| **Lines of code** | 356 ✅ | 397 ✅ | 688 ⚠️ | 686 ⚠️ | 2247 ❌ | 841 ⚠️ |
| **Dedicated CSS file** | No ✅ | Yes ⚠️ | Yes ⚠️ | Yes ⚠️ | Yes ❌ | No ✅ |
| **Uses WorkspaceGrid** | No ✅ | No ✅ | Yes ❌ | Yes ❌ | No ✅ | Yes ❌ |
| **Already imports PageShell** | Yes ✅ | Yes ✅ | No ⚠️ | No ❌ | Yes ✅ | No ❌ |
| **Already imports SectionCard** | Yes ✅ | No ⚠️ | Yes ✅ | No ❌ | Yes ✅ | Yes ✅ |
| **Readonly only** | Yes ✅ | Yes ✅ | Yes ✅ | Mixed ⚠️ | Mixed ⚠️ | Mixed ⚠️ |
| **Inline custom badge components** | 2 (Badge, KpiCard) ✅ | 3 (RiskBadge, StatusPill, CopyButton) ⚠️ | Many (SectionCard sub-cards) ❌ | Many widget cards ❌ | Heavy chart components ❌ | Custom AuthInstructionCard ⚠️ |
| **i18n dependency** | No ✅ | No ✅ | No ✅ | Yes ❌ | No ✅ | No ✅ |
| **Chart / visualization libs** | No ✅ | No ✅ | Yes ⚠️ | Yes ⚠️ | Yes ❌ | No ✅ |
| **Auth error state** | No ✅ | No ✅ | No ✅ | No ✅ | No ✅ | Yes ⚠️ |

## Scoring

| Criterion | Weight | ConnectorCenter Readonly | AssistantCenter | FactoryStatus | Dashboard | CostRouting | PluginPool |
|---|---|---|---|---|---|---|---|
| Small LOC | 20% | 20 | 20 | 10 | 10 | 0 | 10 |
| No dedicated CSS | 15% | 15 | 5 | 5 | 5 | 0 | 15 |
| No WorkspaceGrid | 20% | 20 | 20 | 0 | 0 | 20 | 0 |
| Already imports PageShell | 10% | 10 | 10 | 5 | 0 | 10 | 0 |
| Already imports SectionCard | 10% | 10 | 5 | 10 | 0 | 10 | 10 |
| Readonly only | 10% | 10 | 10 | 10 | 5 | 5 | 5 |
| No custom badge components | 5% | 5 | 3 | 0 | 0 | 0 | 3 |
| No i18n | 5% | 5 | 5 | 5 | 0 | 5 | 5 |
| No chart libs | 5% | 5 | 5 | 3 | 3 | 0 | 5 |
| **Total** | **100%** | **100** | **83** | **48** | **23** | **50** | **53** |

## Ranking

| Rank | Page | Score | Recommendation |
|---|---|---|---|
| **1** | **ConnectorCenterReadonly** | **100** | **First migration target** |
| 2 | AssistantCenter | 83 | Second migration target |
| 3 | PluginPool | 53 | Defer until ErrorState/AuthRequiredState built |
| 4 | CostRouting | 50 | Defer — high CSS/chart risk |
| 5 | FactoryStatus | 48 | Defer — WorkspaceGrid coupling |
| 6 | Dashboard | 23 | Excluded per P2 constraint |

## Decision

| Order | Page | Phase | Notes |
|---|---|---|---|
| 1st | ConnectorCenterReadonly | P3B | Safest, smallest, no CSS file |
| 2nd | AssistantCenter | P3B | Already PageShell-ready, bounded CSS |
| — | All others | P3C+ | Deferred to later phases |
