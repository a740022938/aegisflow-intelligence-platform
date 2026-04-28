import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ReactGridLayout } from 'react-grid-layout';
import { type LayoutConfig, type LayoutBreakpoint } from './layoutStorage';
import { getBp } from './responsive';
import './workspace-grid.css';

const GridLayout = ReactGridLayout as React.ComponentType<any>;

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

// breakpoint resolution centralized in responsive.ts (getBp)

function colsFor(bp: LayoutBreakpoint) {
  if (bp === 'lg') return 12;
  if (bp === 'md') return 8;
  return 1;
}

export default function WorkspaceGrid({ editable, layouts, cards, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [bp, setBp] = useState<LayoutBreakpoint>(getBp(width));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  // bp is now tracked in state to react to container/window size changes
  const cols = colsFor(bp);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    const apply = () => {
      // Use container width to drive layout; fallback to viewport if container width not yet available
      const containerW = target?.clientWidth ?? 0;
      const w = Math.max(320, Math.floor(containerW > 0 ? containerW : (typeof window !== 'undefined' ? window.innerWidth : 1024)));
      const newBp = getBp(w);
      setWidth(w);
      setBp(newBp);
      // Debug helper for responsive debugging (remove in production)
      // console.debug('[AIP] WorkspaceGrid updated', { w, newBp });
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(target);
    // Optional: also respond to window resize to keep breakpoint aligned if layout causes width drift
    const onWinResize = () => {
      const containerW = containerRef.current?.clientWidth ?? 0;
      const w = Math.max(320, Math.floor(containerW > 0 ? containerW : (typeof window !== 'undefined' ? window.innerWidth : 1024)));
      setWidth(w);
      setBp(getBp(w));
    };
    window.addEventListener('resize', onWinResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
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
      <GridLayout
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
      </GridLayout>
    </div>
  );
}
