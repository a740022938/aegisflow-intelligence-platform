// ============================================================
// ContextMenu.tsx — 右键画布弹出节点添加菜单
// Phase 2A + MVP v1: registry 节点自动接入
// ============================================================
import React, { useState, useEffect, useRef, useMemo } from "react";
import type { NodeType } from "./workflowSchema";
import { NODE_TYPE_CONFIGS, type NodeTypeConfig } from "./NodeTypes";
import {
  getMergedNodes,
  hardcodedNodeToComposerEntry,
  type ComposerNodeEntry,
} from "./CapabilityAdapter";
import "./ContextMenu.css";

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSelect: (type: NodeType | string) => void;
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
    frozen: false,
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

export function ContextMenu({
  isOpen,
  position,
  onClose,
  onSelect,
}: ContextMenuProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [nodes, setNodes] = useState<ComposerNodeEntry[]>(HARDCODED_ENTRIES);
  const [source, setSource] = useState<"registry" | "hardcoded">("hardcoded");
  const menuRef = useRef<HTMLDivElement>(null);

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

  // 打开时重置
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 自动聚焦搜索框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        menuRef.current
          ?.querySelector<HTMLInputElement>(".ctx-search-input")
          ?.focus();
      }, 10);
    }
  }, [isOpen]);

  // 点击菜单外关闭（不依赖 overlay 拦截点击，避免阻塞工具栏交互）
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      onClose();
    };
    window.addEventListener('mousedown', onPointerDown, true);
    return () => {
      window.removeEventListener('mousedown', onPointerDown, true);
    };
  }, [isOpen, onClose]);

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
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
            onSelect(filtered[selectedIndex].type as NodeType);
            onClose();
          }
          break;
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener("keydown", handleKeyDown, true);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, filtered, selectedIndex, onClose, onSelect]);

  if (!isOpen) return null;

  // 计算菜单位置 — 防溢出
  const menuWidth = 260;
  const menuMaxHeight = 380;
  const x = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const y = Math.min(position.y, window.innerHeight - menuMaxHeight - 10);

  let globalIndex = 0;

  return (
    <div
      className="ctx-overlay"
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        ref={menuRef}
        className="ctx-menu"
        onClick={(e) => e.stopPropagation()}
        style={{ left: x, top: y }}
      >
        {/* 搜索框 */}
        <div className="ctx-search">
          <span className="ctx-search-icon">🔍</span>
          <input
            type="text"
            className="ctx-search-input"
            placeholder="搜索节点..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="ctx-search-esc">ESC</span>
        </div>

        {/* 节点列表 */}
        <div className="ctx-list">
          {filtered.length === 0 ? (
            <div className="ctx-empty">未找到匹配的节点</div>
          ) : (
            Object.entries(grouped).map(([cat, catNodes]) => {
              if (catNodes.length === 0) return null;
              return (
                <div key={cat} className="ctx-category">
                  <div className="ctx-cat-label">
                    {CATEGORY_LABELS[cat] || cat}
                  </div>
                  {catNodes.map((node) => {
                    const isSelected = globalIndex === selectedIndex;
                    const idx = globalIndex++;
                    return (
                      <div
                        key={node.type}
                        className={`ctx-item ${
                          isSelected ? "ctx-item--selected" : ""
                        }`}
                        onClick={() => {
                          onSelect(node.type as NodeType);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{ borderLeftColor: node.color }}
                      >
                        <span className="ctx-item-icon">{node.icon}</span>
                        <span className="ctx-item-label">
                          {node.labelZh || node.label}
                        </span>
                        {node.frozenHint && <span className="ctx-item-frozen" title={node.frozenHint}>ℹ️</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* 底部 */}
        <div className="ctx-footer">
          <span>
            {source === "registry"
              ? `✓ ${filtered.length} 个节点（registry）`
              : `⚠ ${filtered.length} 个节点（hardcoded）`}
          </span>
          <span className="ctx-footer-hint">↑↓ 导航 · Enter 添加</span>
        </div>
      </div>
    </div>
  );
}
