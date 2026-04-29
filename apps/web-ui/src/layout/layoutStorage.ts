/**
 * Layout Storage - 工作台布局持久化工具
 * @version 1.0.0
 */

export type LayoutBreakpoint = 'lg' | 'md' | 'sm';

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface LayoutConfig {
  lg: LayoutItem[];
  md: LayoutItem[];
  sm: LayoutItem[];
}

// Storage key prefix and version — v7.2.1 bumps prefix to invalidate old bad layouts
const KEY_PREFIX = 'agi_layout_v2';
const LAYOUT_VERSION = '7.2.1';

/**
 * Generate storage key for a page
 * Format: agi_layout_v1:{pageKey}
 */
function getStorageKey(pageKey: string): string {
  return `${KEY_PREFIX}:${pageKey}`;
}

/**
 * Validate and clamp a layout item (v7.2.1 responsive hotfix)
 */
function isValidLayoutItem(item: unknown): item is LayoutItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  if (
    typeof i.i !== 'string' ||
    typeof i.x !== 'number' ||
    typeof i.y !== 'number' ||
    typeof i.w !== 'number' ||
    typeof i.h !== 'number'
  ) return false;
  // Clamp to safe bounds
  i.x = Math.max(0, i.x);
  i.y = Math.max(0, i.y);
  i.w = Math.max(1, i.w);
  i.h = Math.max(1, i.h);
  return true;
}

/**
 * Validate with min-size clamp for responsive safety (v7.2.1 engine fix)
 * Desktop: w≥4, minW≥4, h≥3, minH≥3
 * Tablet:  w≥3, minW≥3, h≥3, minH≥3
 * Mobile:  w=1 (single column)
 */
function clampLayoutItem(item: LayoutItem, cols: number = 12): LayoutItem {
  const minW = cols >= 12 ? 4 : cols >= 8 ? 3 : 1;
  const minH = 3;
  return {
    ...item,
    w: Math.max(minW, Math.min(item.w, cols)),
    h: Math.max(minH, item.h),
    x: Math.max(0, Math.min(item.x, cols - minW)),
    y: Math.max(0, item.y),
    minW: Math.max(minW, item.minW || minW),
    minH: Math.max(minH, item.minH || minH),
  };
}

/**
 * Clamp all items in a layout config with column-aware safety
 */
function clampLayoutConfig(config: LayoutConfig, cols?: { lg?: number; md?: number; sm?: number }): LayoutConfig {
  return {
    lg: config.lg.map(i => clampLayoutItem(i, cols?.lg ?? 12)),
    md: config.md.map(i => clampLayoutItem(i, cols?.md ?? 8)),
    sm: config.sm.map(i => clampLayoutItem(i, cols?.sm ?? 1)),
  };
}

/**
 * Validate if a layout config is valid
 */
function isValidLayoutConfig(config: unknown): config is LayoutConfig {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;
  if (!Array.isArray(c.lg) || !Array.isArray(c.md) || !Array.isArray(c.sm)) {
    return false;
  }
  return c.lg.every(isValidLayoutItem) && c.md.every(isValidLayoutItem) && c.sm.every(isValidLayoutItem);
}

/**
 * Load layout from localStorage
 * @param pageKey - Page identifier (e.g., 'models-detail')
 * @returns LayoutConfig or null if not found/invalid
 */
export function loadLayout(pageKey: string): LayoutConfig | null {
  try {
    const raw = localStorage.getItem(getStorageKey(pageKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;

    // Handle legacy format (direct LayoutConfig)
    if (isValidLayoutConfig(parsed)) {
      return clampLayoutConfig(parsed);
    }

    // Handle versioned format
    if (
      parsed &&
      typeof parsed === 'object' &&
      'version' in parsed &&
      'data' in parsed
    ) {
      const versioned = parsed as { version: string; data: unknown };
      if (isValidLayoutConfig(versioned.data)) {
        return versioned.data;
      }
    }

    // Invalid or corrupted data
    console.warn(`[layoutStorage] Invalid layout data for ${pageKey}, resetting`);
    clearLayout(pageKey);
    return null;
  } catch (e) {
    console.warn(`[layoutStorage] Failed to load layout for ${pageKey}:`, e);
    return null;
  }
}

/**
 * Save layout to localStorage
 * @param pageKey - Page identifier
 * @param layout - Layout configuration
 */
export function saveLayout(pageKey: string, layout: LayoutConfig): void {
  try {
    const data = {
      version: LAYOUT_VERSION,
      data: layout,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(pageKey), JSON.stringify(data));
  } catch (e) {
    console.warn(`[layoutStorage] Failed to save layout for ${pageKey}:`, e);
  }
}

/**
 * Clear saved layout from localStorage
 * @param pageKey - Page identifier
 */
export function clearLayout(pageKey: string): void {
  try {
    localStorage.removeItem(getStorageKey(pageKey));
  } catch (e) {
    console.warn(`[layoutStorage] Failed to clear layout for ${pageKey}:`, e);
  }
}

/**
 * Load sidebar width from localStorage
 * @param defaultWidth - Default width if not found
 * @returns Width in pixels
 */
export function loadSidebarWidth(defaultWidth: number): number {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}:global:sidebar_width`);
    const n = Number(raw);
    if (!Number.isFinite(n)) return defaultWidth;
    return Math.max(220, Math.min(460, Math.round(n)));
  } catch {
    return defaultWidth;
  }
}

/**
 * Save sidebar width to localStorage
 * @param width - Width in pixels
 */
export function saveSidebarWidth(width: number): void {
  try {
    const safe = Math.max(220, Math.min(460, Math.round(width)));
    localStorage.setItem(`${KEY_PREFIX}:global:sidebar_width`, String(safe));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get all saved layout keys
 * @returns Array of page keys with saved layouts
 */
export function getSavedLayoutKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${KEY_PREFIX}:`) && !key.includes(':global:')) {
        keys.push(key.slice(`${KEY_PREFIX}:`.length));
      }
    }
    return keys;
  } catch {
    return [];
  }
}

/**
 * Clear all saved layouts
 */
export function clearAllLayouts(): void {
  try {
    const keys = getSavedLayoutKeys();
    keys.forEach(clearLayout);
    localStorage.removeItem(`${KEY_PREFIX}:global:sidebar_width`);
  } catch {
    // Ignore errors
  }
}
