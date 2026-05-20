import { getMemoryKnowledgeRegistry } from './aip-memory-knowledge-registry';

export interface MemoryKnowledgeValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateMemoryKnowledgeRegistry(): MemoryKnowledgeValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];
  const entries = getMemoryKnowledgeRegistry();

  for (const entry of entries) {
    if (!entry.key) {
      blocking.push('Entry with empty key');
    }
    if (!entry.value) {
      blocking.push(`${entry.key}: value is empty`);
    }
    if (!entry.confidence) {
      blocking.push(`${entry.key}: confidence is missing`);
    }
    if (!entry.source) {
      warning.push(`${entry.key}: source is missing — consider documenting the source`);
    }
    if (!entry.updatedAt) {
      warning.push(`${entry.key}: updatedAt is missing — consider adding a date`);
    }
  }

  return { blocking, warning, info };
}

export function getMemoryKnowledgeValidationSummary(): { blocking: number; warning: number; info: number; pass: boolean } {
  const result = validateMemoryKnowledgeRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
