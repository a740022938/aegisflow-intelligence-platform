// Dataset Viewer Plugin - 数据集预览
// Phase 1A: P0 新插件接入
// AGI Model Factory v6.5.0

import type { PluginManifest } from '@agi-factory/plugin-sdk';

export const manifest: PluginManifest = {
  plugin_id: 'dataset-viewer',
  name: 'Dataset Viewer',
  version: '1.0.0',
  category: 'data/view',
  status: 'active',
  execution_mode: 'readonly',
  risk_level: 'LOW',
  enabled: true,
  requires_approval: false,
  dry_run_supported: true,
  ui_node_type: 'transform',
  capabilities: ['read', 'data'],
  permissions: ['read:datasets'],
  description: '数据集预览插件，返回数据集摘要和样本记录',
  author: 'AGI Factory Team',
  tags: ['dataset', 'view', 'builtin'],
  icon: 'database',
  color: '#10b981',
  allowed_upstream: ['system-info'],
  allowed_downstream: ['export-csv'],
  input_schema: {
    type: 'object',
    properties: {
      dataset_id: { type: 'string' },
      sample_count: { type: 'number', default: 10, maximum: 100 },
    },
    required: ['dataset_id'],
  },
  output_schema: {
    type: 'object',
    properties: {
      dataset_id: { type: 'string' },
      dataset_name: { type: 'string' },
      total_records: { type: 'number' },
      sample_records: { type: 'array' },
      columns: { type: 'array' },
    },
  },
};

export async function execute(action: string, params: any, context?: any): Promise<any> {
  const { dataset_id, sample_count = 10 } = params;

  if (!dataset_id) {
    throw new Error('dataset_id is required');
  }

  // 从 context 获取 db 实例
  const db = context?.db;

  if (!db) {
    // 无 db 连接时返回占位数据
    return {
      dataset_id,
      dataset_name: `[Preview] ${dataset_id}`,
      description: 'Database connection not available in plugin context',
      total_records: 0,
      sample_records: [],
      columns: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
      ],
    };
  }

  // 有 db 连接时查询实际数据
  try {
    const dataset = db
      .prepare('SELECT id, name, description, created_at FROM datasets WHERE id = ?')
      .get(dataset_id);

    if (!dataset) {
      throw new Error(`Dataset not found: ${dataset_id}`);
    }

    return {
      dataset_id: dataset.id,
      dataset_name: dataset.name,
      description: dataset.description,
      total_records: 0, // 实际实现时查询记录数
      sample_records: [], // 实际实现时查询样本
      columns: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'created_at', type: 'datetime' },
      ],
    };
  } catch (e) {
    throw new Error(`Failed to query dataset: ${e}`);
  }
}

export default { manifest, execute };
