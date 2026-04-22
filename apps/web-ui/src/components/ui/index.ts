// ui/index.ts — shared component barrel export
export { default as StatusBadge, STATUS_COLORS } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

export { default as PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { default as StatsGrid } from './StatsGrid';
export type { StatsGridProps, StatItem } from './StatsGrid';

export { default as SectionCard } from './SectionCard';
export type { SectionCardProps } from './SectionCard';

export { default as ToolbarRow } from './ToolbarRow';
export type { ToolbarRowProps } from './ToolbarRow';

export { default as SidebarListPanel } from './SidebarListPanel';
export type { SidebarListPanelProps } from './SidebarListPanel';

export { default as DetailPanel } from './DetailPanel';
export type { DetailPanelProps, DetailTab } from './DetailPanel';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { default as ActionButtonGroup } from './ActionButtonGroup';
export type { ActionButtonGroupProps, ActionItem } from './ActionButtonGroup';

export { default as InfoTable } from './InfoTable';
export type { InfoTableProps, InfoRow } from './InfoTable';

export {
  default as VisionOpsConsole,
  PipelineOverviewCard,
  VisionSurfaceStrip,
  buildVisionSurfaceFromJobSteps,
} from './VisionPipelineConsole';
export type { VisionSurfaceItem, VisionSurfaceLink, VisionStageKey } from './VisionPipelineConsole';

export { default as MainlineChainStrip } from './MainlineChainStrip';
export type { ChainNode } from './MainlineChainStrip';

export { default as EntityLinkChips } from './EntityLinkChips';
export type { EntityChip } from './EntityLinkChips';

export { default as ReleaseReadinessCard } from './ReleaseReadinessCard';
export type { ReleaseReadinessData } from './ReleaseReadinessCard';

export { default as LineagePanel } from './LineagePanel';
export type { LineageNode } from './LineagePanel';

export { default as ReleaseManifestCard } from './ReleaseManifestCard';
export { default as ReleaseNotesPanel } from './ReleaseNotesPanel';
export { default as GateStatusCard } from './GateStatusCard';
export { default as DrilldownPanel } from './DrilldownPanel';
export { default as TimelinePanel } from './TimelinePanel';
export { default as IncidentDetail } from './IncidentDetail';
export { default as ReleaseGovernancePanel } from './ReleaseGovernancePanel';
export { default as ReleaseComparePanel } from './ReleaseComparePanel';
export { default as RollbackReadinessBadge } from './RollbackReadinessBadge';
export { default as HealthPatrolPanel } from './HealthPatrolPanel';
export { default as VerificationSummaryPanel } from './VerificationSummaryPanel';
export { default as TrendSummaryPanel } from './TrendSummaryPanel';
export { default as RiskSignalBadge } from './RiskSignalBadge';
