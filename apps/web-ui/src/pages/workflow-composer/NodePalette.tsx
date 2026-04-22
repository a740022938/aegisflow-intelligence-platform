// ============================================================
// NodePalette.tsx — 左侧节点面板
// ============================================================
import React, { useState, useEffect, useMemo } from "react";
import { NODE_REGISTRY, type NodeType } from "./workflowSchema";
import {
  getMergedNodes,
  hardcodedNodeToComposerEntry,
  type ComposerNodeEntry,
} from "./CapabilityAdapter";

interface NodePaletteProps {
  onDragStart: (type: string) => void;
}

// 构建 hardcoded fallback 数据
const HARDCODED_ENTRIES: ComposerNodeEntry[] = (
  Object.entries(NODE_REGISTRY) as [NodeType, (typeof NODE_REGISTRY)[NodeType]][]
).map(([type, config]) => hardcodedNodeToComposerEntry(config, type));

const CATEGORY_LABELS: Record<string, string> = {
  input: "📥 输入",
  process: "⚙️ 处理",
  output: "📤 输出",
  utility: "🛠️ 工具",
};

const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart }) => {
  const [search, setSearch] = useState("");
  const [nodes, setNodes] = useState<ComposerNodeEntry[]>(HARDCODED_ENTRIES);
  const [registryInfo, setRegistryInfo] = useState<{
    registry: number;
    hardcoded: number;
    source: "registry" | "hardcoded";
  } | null>(null);

  // 启动时加载 registry
  useEffect(() => {
    let cancelled = false;
    getMergedNodes(HARDCODED_ENTRIES).then((result) => {
      if (cancelled) return;
      setNodes(result.allNodes);
      setRegistryInfo({
        registry: result.registryCount,
        hardcoded: result.hardcodedCount,
        source: result.registryLoaded ? "registry" : "hardcoded",
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 过滤结果
  const filtered = useMemo(() => {
    if (!search.trim()) return nodes;
    const q = search.toLowerCase();
    return nodes.filter(
      (n) =>
        n.labelZh.includes(q) ||
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [nodes, search]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    type: string
  ) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(type);
  };

  return (
    <div className="wf-composer-palette">
      {/* 搜索框 */}
      <div className="wf-palette-search">
        <input
          type="text"
          placeholder="搜索节点..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="wf-input"
        />
      </div>

      {/* 节点卡片列表 */}
      <div className="wf-palette-list">
        {filtered.length === 0 ? (
          <div className="wf-palette-empty">没有匹配的节点</div>
        ) : (
          filtered.map((config) => (
            <div
              key={config.type}
              className="wf-palette-card"
              draggable
              onDragStart={(e) => handleDragStart(e, config.type)}
              style={{
                borderColor: config.color,
                background: config.bgColor,
              }}
              title={
                config.description +
                (config.frozenHint ? "\n" + config.frozenHint : "")
              }
            >
              <span className="wf-palette-icon">{config.icon}</span>
              <div className="wf-palette-info">
                <div className="wf-palette-label">{config.labelZh}</div>
                <div className="wf-palette-desc">{config.description}</div>
              </div>
              <div
                className="wf-palette-badge"
                style={{ background: config.color }}
              />
            </div>
          ))
        )}
      </div>

      {/* 底部提示 + 来源信息 */}
      <div className="wf-palette-footer">
        {registryInfo ? (
          <span>
            {registryInfo.source === "registry"
              ? `✓ registry: ${registryInfo.registry} + hardcoded: ${registryInfo.hardcoded}`
              : `⚠ registry 加载失败，使用 ${registryInfo.hardcoded} hardcoded`}
          </span>
        ) : (
          <span>💡 拖拽节点到画布，即可开始编排</span>
        )}
      </div>
    </div>
  );
};

export default NodePalette;
