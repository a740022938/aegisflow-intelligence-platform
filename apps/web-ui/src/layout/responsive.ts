// Centralized responsive breakpoint utilities
// Aligns frontend breakpoints with CSS layout breakpoints (1024/768/480)

export type Breakpoint = 'lg' | 'md' | 'sm';

export const BREAKPOINTS = {
  lg: 1024,
  md: 768,
  sm: 0,
} as const;

export function getBp(width: number): Breakpoint {
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  return 'sm';
}
