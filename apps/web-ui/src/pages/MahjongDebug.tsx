import React from 'react';

const FEATURES = [
  { icon: '📷', label: '上传真实截图', desc: '从本地或 OpenClaw 导入麻将桌截图' },
  { icon: '🎛️', label: '调 conf', desc: '调整检测置信度阈值，过滤低质量预测' },
  { icon: '🎛️', label: '调 iou', desc: '调整 NMS IoU 阈值，控制重叠框合并' },
  { icon: '🖼️', label: '显示预测框', desc: '在截图标注可视化检测结果及置信度' },
  { icon: '🗑️', label: '删除误检', desc: '点击删除错误的预测框' },
  { icon: '🏷️', label: '修改类别', desc: '修改预测框的牌面类别' },
  { icon: '➕', label: '补漏检', desc: '手动框选未被检测到的牌' },
  { icon: '📦', label: '导出 YOLO label', desc: '导出为 YOLO 格式标注，供后续训练' },
];

const DIR_FLOW = [
  '📁 raw', '→', '📁 pseudo_v1', '→', '📁 review_preview', '→', '📁 corrected_v1',
];

const BOUNDARIES = [
  '❌ 不触发训练',
  '❌ 不修改数据集',
  '❌ 不调用外部仓库代码',
  '🔒 仅本地标注操作',
];

const MahjongDebug: React.FC = () => {
  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          🀄 麻将视觉调试台
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          Mahjong Vision Debug Console · v0.1 规划中
        </p>
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
        background: 'var(--warning-light)', color: 'var(--warning)',
        border: '1px solid var(--warning)', marginBottom: 24,
      }}>
        🚧 v0.1 规划中 — 界面交互待实现
      </div>

      {/* Feature Grid */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>📋 规划功能模块</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 10,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: '12px 14px', borderRadius: 8,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {f.icon} {f.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory Flow */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>📁 目录流转</h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          padding: '12px 16px', borderRadius: 8,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          fontSize: 13, color: 'var(--text-secondary)',
        }}>
          {DIR_FLOW.map((d, i) => (
            <span key={i} style={{ fontWeight: d === '→' ? 400 : 600 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Boundaries */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>🔒 当前边界</h2>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {BOUNDARIES.map((b, i) => (
            <span key={i} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 12,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MahjongDebug;
