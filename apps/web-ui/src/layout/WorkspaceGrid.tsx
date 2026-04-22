import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ReactGridLayout } from 'react-grid-layout';
import { type LayoutConfig, type LayoutBreakpoint } from './layoutStorage';
import './workspace-grid.css';

type GridCard = {
  id: string;
  content: React.ReactNode;
};

type Props = {
  editable: boolean;
  layouts: LayoutConfig;
  cards: GridCard[];
  onChange: (next: LayoutConfig) => void;
};

function pickBreakpoint(width: number): LayoutBreakpoint {
  if (width >= 1200) return 'lg';
  if (width >= 900) return 'md';
  return 'sm';
}

function colsFor(bp: LayoutBreakpoint) {
  if (bp === 'lg') return 12;
  if (bp === 'md') return 8;
  return 1;
}

export default function WorkspaceGrid({ editable, layouts, cards, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1200);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const bp = pickBreakpoint(width);
  const cols = colsFor(bp);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    const apply = () => setWidth(Math.max(320, Math.floor(target.clientWidth)));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const activeLayout = useMemo(() => {
    return (layouts[bp] || []).map((x) => ({ ...x }));
  }, [layouts, bp]);

  const handleLayoutChange = useCallback((nextLayout: any) => {
    onChange({
      ...layouts,
      [bp]: nextLayout.map((x: any) => ({ ...x })),
    });
  }, [layouts, bp, onChange]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeStop = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`workspace-grid-wrap ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReactGridLayout
        className="workspace-grid"
        width={width}
        cols={cols}
        rowHeight={40}
        layout={activeLayout as any}
        isDraggable={editable}
        isResizable={editable}
        resizeHandles={['se']}
        draggableHandle=".workspace-drag-handle"
        compactType="vertical"
        margin={[12, 12]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
      >
        {cards.map((card) => (
          <div key={card.id} className="workspace-grid-item">
            <div className={`workspace-grid-card ${editable ? 'editing' : ''}`}>
              {editable && (
                <div className="workspace-drag-handle" title="拖拽以移动位置">
                  <span className="drag-icon">⋮⋮</span>
                  <span className="drag-text">拖拽移动</span>
                </div>
              )}
              <div className="workspace-grid-body">{card.content}</div>
              {editable && (
                <div className="workspace-resize-hint" title="拖拽右下角以调整大小">
                  <span>↘</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
}
