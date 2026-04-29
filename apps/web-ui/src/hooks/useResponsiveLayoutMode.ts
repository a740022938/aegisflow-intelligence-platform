import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * v7.2.1: WorkspaceGrid responsive gate
 * - Uses ResizeObserver on a container ref
 * - Default view: CSS Grid (no saved layout, no react-grid-layout)
 * - Edit mode: only when user clicks AND contentWidth >= breakpoint
 */
export function useResponsiveLayoutMode(breakpoint: number = 1200) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number>(1200);
  const [layoutEdit, setLayoutEdit] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setContentWidth(w);
    });
    observer.observe(el);
    setContentWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const canUseLayoutEditor = contentWidth >= breakpoint;
  const shouldUseLayoutEditor = layoutEdit && canUseLayoutEditor;

  // Auto-exit edit mode when content shrinks below breakpoint
  useEffect(() => {
    if (!canUseLayoutEditor && layoutEdit) setLayoutEdit(false);
  }, [canUseLayoutEditor, layoutEdit]);

  const toggleEdit = useCallback(() => {
    setLayoutEdit((v) => (canUseLayoutEditor ? !v : false));
  }, [canUseLayoutEditor]);

  return {
    contentRef,
    contentWidth,
    canUseLayoutEditor,
    shouldUseLayoutEditor,
    layoutEdit,
    setLayoutEdit,
    toggleEdit,
    layoutMode: shouldUseLayoutEditor ? 'react-grid-edit' : 'css-grid',
  };
}
