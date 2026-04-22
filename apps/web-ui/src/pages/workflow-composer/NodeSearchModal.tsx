// ============================================================
// NodeSearchModal.tsx — 双击画布弹出的节点搜索添加框
// ComfyUI 风格快速搜索 + MVP v1: registry 节点自动接入
// ============================================================
import React, { useState, useEffect, useRef, useMemo } from "react";
import type { NodeType } from "./workflowSchema";
import { NODE_TYPE_CONFIGS, type NodeTypeConfig } from "./NodeTypes";
import {
  getMergedNodes,
  type ComposerNodeEntry,
} from "./CapabilityAdapter";
import "./NodeSearchModal.css";

interface NodeSearchModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSelect: (type: NodeType | string, position: { x: number; y: number }) => void;
}

// 从 NODE_TYPE_CONFIGS 映射为 ComposerNodeEntry（hardcoded fallback）
function buildHardcodedEntries(): ComposerNodeEntry[] {
  return Object.values(NODE_TYPE_CONFIGS).map((config: NodeTypeConfig) => ({
    type: config.type as string,
    label: config.label,
    labelZh: config.label,
    category: config.category,
    description: "",
    icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
    borderColor: config.borderColor,
    glowColor: config.glowColor,
    frozen: !!config.frozen,
    frozenHint: config.frozenHint,
    source: "hardcoded" as const,
  }));
}

const HARDCODED_ENTRIES = buildHardcodedEntries();

const CATEGORY_LABELS: Record<string, string> = {
  input: "📥 输入",
  process: "⚙️ 处理",
  output: "📤 输出",
  utility: "🛠️ 工具",
};

export function NodeSearchModal({
  isOpen,
  position,
  onClose,
  onSelect,
}: NodeSearchModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [nodes, setNodes] = useState<ComposerNodeEntry[]>(HARDCODED_ENTRIES);
  const [source, setSource] = useState<"registry" | "hardcoded">(
    "hardcoded"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // 启动时加载 registry
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getMergedNodes(HARDCODED_ENTRIES).then((result) => {
      if (cancelled) return;
      setNodes(result.allNodes);
      setSource(result.registryLoaded ? "registry" : "hardcoded");
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 所有可用节点
  const allNodes = nodes;

  // 过滤结果
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allNodes;
    return allNodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.labelZh.includes(q)
    );
  }, [allNodes, search]);

  // 分类分组
  const grouped = useMemo(() => {
    const cats: Record<string, ComposerNodeEntry[]> = {
      input: [],
      process: [],
      output: [],
      utility: [],
    };
    filtered.forEach((n) => {
      cats[n.category]?.push(n);
    });
    return cats;
  }, [filtered]);

  // 打开时聚焦 + 重置
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            onSelect(
              filtered[selectedIndex].type as NodeType,
              position
            );
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, position, onSelect, onClose]);

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div className="node-search-overlay" onClick={onClose}>
      <div
        className="node-search-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 400),
        }}
      >
        {/* 搜索框 */}
        <div className="node-search-header">
          <input
            ref={inputRef}
            type="text"
            className="node-search-input"
            placeholder="搜索节点... (支持类型/分类)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="node-search-hint">
            ESC 关闭 · ↑↓ 选择 · Enter 确认
          </span>
        </div>

        {/* 结果列表 */}
        <div className="node-search-results">
          {filtered.length === 0 ? (
            <div className="node-search-empty">未找到匹配的节点</div>
          ) : (
            Object.entries(grouped).map(([cat, nodes]) => {
              if (nodes.length === 0) return null;
              return (
                <div key={cat} className="node-search-category">
                  <div className="node-search-cat-header">
                    {CATEGORY_LABELS[cat] || cat}
                  </div>
                  {nodes.map((node) => {
                    const isSelected = globalIndex === selectedIndex;
                    const idx = globalIndex++;
                    return (
                      <div
                        key={node.type}
                        className={`node-search-item ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => {
                          onSelect(node.type as NodeType, position);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          borderLeftColor: node.color,
                        }}
                      >
                        <span className="node-search-icon">{node.icon}</span>
                        <div className="node-search-info">
                          <span className="node-search-label">
                            {node.labelZh || node.label}
                          </span>
                          <span className="node-search-type">{node.type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* 底部统计 */}
        <div className="node-search-footer">
          <span>
            {source === "registry"
              ? `✓ ${filtered.length} 个节点（registry）`
              : `⚠ ${filtered.length} 个节点（hardcoded）`}
          </span>
          {filtered[selectedIndex]?.frozenHint && (
            <span className="frozen-hint">ℹ️ {filtered[selectedIndex]?.frozenHint}</span>
          )}
        </div>
      </div>
    </div>
  );
}
