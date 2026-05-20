export interface MemoryKnowledgeEntry {
  key: string;
  value: string;
  confidence: 'verified' | 'historical' | 'unverified';
  source: string;
  updatedAt: string;
}

export const MEMORY_KNOWLEDGE_REGISTRY: MemoryKnowledgeEntry[] = [
  { key: 'currentRoot', value: 'E:\\AIP', confidence: 'verified', source: 'git config + filesystem', updatedAt: '2026-05-20' },
  { key: 'currentBranch', value: 'main', confidence: 'verified', source: 'git branch --show-current', updatedAt: '2026-05-20' },
  { key: 'currentHeadAtD0', value: '27c8634', confidence: 'verified', source: 'git rev-parse --short HEAD', updatedAt: '2026-05-20' },
  { key: 'latestVerifiedBaseline', value: 'v7.40', confidence: 'verified', source: 'v7.40 Final Seal Ready with Stage C Disabled', updatedAt: '2026-05-20' },
  { key: 'verifiedSequence', value: 'v7.25-v7.40', confidence: 'verified', source: 'verified local development sequence', updatedAt: '2026-05-20' },
  { key: 'preV725Status', value: 'historical_with_confidence_labels', confidence: 'historical', source: 'pre-v7.25 historical context', updatedAt: '2026-05-20' },
  { key: 'v743Status', value: 'unverified_future_reference', confidence: 'unverified', source: 'v7.43 mentions in docs', updatedAt: '2026-05-20' },
  { key: 'stageC', value: 'disabled', confidence: 'verified', source: 'feature flag + code analysis', updatedAt: '2026-05-20' },
  { key: 'featureFlag', value: 'off', confidence: 'verified', source: 'feature flag control registry', updatedAt: '2026-05-20' },
  { key: 'memoryNormalizationRule', value: 'Desktop task packs are intent/input evidence only. They must be cross-checked against report + receipt + commit before being treated as completed work.', confidence: 'verified', source: 'D0/D0-b conclusion', updatedAt: '2026-05-20' },
];

export function getMemoryKnowledgeRegistry(): MemoryKnowledgeEntry[] {
  return MEMORY_KNOWLEDGE_REGISTRY;
}

export function getMemoryKnowledgeSummary() {
  return {
    total: MEMORY_KNOWLEDGE_REGISTRY.length,
    verified: MEMORY_KNOWLEDGE_REGISTRY.filter(e => e.confidence === 'verified').length,
    historical: MEMORY_KNOWLEDGE_REGISTRY.filter(e => e.confidence === 'historical').length,
    unverified: MEMORY_KNOWLEDGE_REGISTRY.filter(e => e.confidence === 'unverified').length,
  };
}
